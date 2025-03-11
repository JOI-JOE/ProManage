<?php

namespace App\Http\Controllers\Api;

use App\Events\CardUpdated;
use App\Events\ListUpdated;
use Illuminate\Http\Request;
use App\Models\Card;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\ListBoard;
use Illuminate\Support\Facades\Cache;

class DragDropController extends Controller
{
    // Dành cho card trong cùng một column
    public function updateCardPositionsSameColumn(Request $request)
    {
        $validatedData = $request->validate([
            'cards' => 'required|array',
            'cards.*.id' => 'required|exists:cards,id',
            'cards.*.list_board_id' => 'required|exists:list_boards,id',
            'cards.*.position' => 'required|min:0',
        ]);

        $cardIds = collect($validatedData['cards'])->pluck('id');
        $existingCards = Card::whereIn('id', $cardIds)->get()->keyBy('id');

        DB::transaction(function () use ($validatedData, $existingCards) {
            $cardsToUpdate = [];

            foreach ($validatedData['cards'] as $card) {
                if (!isset($existingCards[$card['id']])) {
                    throw new \Exception("Card not found: {$card['id']}");
                }

                $cardsToUpdate[] = [
                    'id' => $card['id'],
                    'list_board_id' => $card['list_board_id'],
                    'position' => $card['position'],
                    'title' => $existingCards[$card['id']]->title,
                ];
            }

            // Cập nhật card
            Card::upsert($cardsToUpdate, ['id'], ['list_board_id', 'position', 'title']);

            // Broadcast event
            broadcast(new CardUpdated($cardsToUpdate, 'card.reordered'));
        });

        return response()->json([
            'message' => 'Cards reordered successfully!',
            'cards' => Card::whereIn('id', $cardIds)->get(['id', 'list_board_id', 'position', 'title']),
        ], 200);
    }



    // Dành cho card khác column 
    public function updateCardPositionsDifferentColumn(Request $request)
    {
        $validatedData = $request->validate([
            'cards' => 'required|array',
            'cards.*.id' => 'required|exists:cards,id',
            'cards.*.list_board_id' => 'required|exists:list_boards,id',
            'cards.*.position' => 'required|min:0',
        ]);

        $cardIds = collect($validatedData['cards'])->pluck('id');
        $existingCards = Card::whereIn('id', $cardIds)->get()->keyBy('id');

        $affectedColumnIds = collect();

        DB::transaction(function () use ($validatedData, $existingCards, &$affectedColumnIds) {
            $cardsToUpdate = [];

            foreach ($validatedData['cards'] as $card) {
                if (!isset($existingCards[$card['id']])) {
                    throw new \Exception("Card not found: {$card['id']}");
                }

                $originalColumnId = $existingCards[$card['id']]->list_board_id;
                if ($originalColumnId !== $card['list_board_id']) {
                    $affectedColumnIds->push($originalColumnId);
                }
                $affectedColumnIds->push($card['list_board_id']);

                $cardsToUpdate[] = [
                    'id' => $card['id'],
                    'list_board_id' => $card['list_board_id'],
                    'position' => $card['position'],
                    'title' => $existingCards[$card['id']]->title,
                ];
            }

            // Cập nhật card
            Card::upsert($cardsToUpdate, ['id'], ['list_board_id', 'position', 'title']);

            // Sắp xếp lại vị trí trong các column bị ảnh hưởng
            $affectedColumnIds->unique()->each(function ($columnId) {
                $cards = Card::where('list_board_id', $columnId)
                    ->orderBy('position')
                    ->get();

                foreach ($cards as $index => $card) {
                    $card->update(['position' => $index + 1]);
                }
            });

            // Broadcast event
            broadcast(new CardUpdated($cardsToUpdate, 'card.moved'));
        });

        return response()->json(['message' => 'Cards updated successfully!'], 200);
    }


    public function updateListPosition(Request $request)
    {
        try {
            // Validate dữ liệu đầu vào
            $validatedData = $request->validate([
                'columns' => 'required|array|min:1',
                'columns.*.id' => 'required|exists:list_boards,id',
                'columns.*.position' => 'required|min:0',
                'columns.*.boardId' => 'required|exists:boards,id',
                'columns.*.title' => 'required|string',
            ]);

            // Lấy danh sách ID của các cột để kiểm tra thay đổi
            $columnIds = collect($validatedData['columns'])->pluck('id')->toArray();

            // Cache key cho danh sách cột của board
            $cacheKey = "board_columns_" . $validatedData['columns'][0]['boardId'];

            // Lấy dữ liệu cũ từ cache (hoặc database nếu cache không có)
            $oldColumns = Cache::remember($cacheKey, 60, function () use ($columnIds) {
                return ListBoard::whereIn('id', $columnIds)->get()->keyBy('id');
            });

            // Bắt đầu transaction
            DB::transaction(function () use ($validatedData, $oldColumns) {
                // Chuẩn bị dữ liệu để upsert
                $columnsToUpdate = collect($validatedData['columns'])->map(function ($column) {
                    return [
                        'id' => $column['id'],
                        'board_id' => $column['boardId'],
                        'position' => $column['position'],
                        'name' => $column['title'],
                    ];
                })->toArray();

                // Cập nhật dữ liệu
                ListBoard::upsert($columnsToUpdate, ['id'], ['position', 'name']);

                // Broadcast chỉ khi có thay đổi
                foreach ($validatedData['columns'] as $column) {
                    $oldColumn = $oldColumns[$column['id']] ?? null;

                    if (!$oldColumn || $oldColumn->position != $column['position'] || $oldColumn->name != $column['title']) {
                        $updatedList = ListBoard::find($column['id']); // Lấy dữ liệu mới nhất từ DB
                        broadcast(new ListUpdated($updatedList))->toOthers(); // Gửi event
                    }
                }
            });

            // Cập nhật cache
            Cache::put($cacheKey, ListBoard::whereIn('id', $columnIds)->get()->keyBy('id'), 60);

            return response()->json(['message' => 'Cập nhật vị trí thành công!'], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => 'Dữ liệu không hợp lệ', 'details' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Lỗi cập nhật: ' . $e->getMessage()], 500);
        }
    }
}
