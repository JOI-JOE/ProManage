<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\Card;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use App\Events\CardPositionUpdated;
use App\Models\ListBoard;

class DragDropController extends Controller
{
    // Dành cho card trong cùng một column
    public function updateCardPositionsSameColumn(Request $request)
    {
        // Validate dữ liệu đầu vào
        $validatedData = $request->validate([
            'cards' => 'required|array',
            'cards.*.id' => 'required|integer|exists:cards,id',
            'cards.*.list_board_id' => 'required|integer|exists:list_boards,id',
            'cards.*.position' => 'required|integer|min:0',
        ]);

        $cardsToUpdate = collect();

        DB::transaction(function () use ($validatedData, &$cardsToUpdate) {
            foreach ($validatedData['cards'] as $card) {
                // Lấy giá trị title từ database
                $existingCard = Card::find($card['id']);
                if (!$existingCard) {
                    throw new \Exception("Card not found: " . $card['id']);
                }

                $cardsToUpdate->push([
                    'id' => $card['id'],
                    'list_board_id' => $card['list_board_id'],
                    'position' => $card['position'],
                    'title' => $existingCard->title, // Lấy giá trị title từ database
                ]);
            }

            // Batch update các card
            Card::upsert(
                $cardsToUpdate->toArray(),
                ['id'],
                ['list_board_id', 'position', 'title'] // Cập nhật cả title
            );
        });

        // Lấy dữ liệu sau khi cập nhật
        $updatedCards = Card::whereIn('id', $cardsToUpdate->pluck('id'))
            ->get(['id', 'list_board_id', 'position', 'title']);

        return response()->json([
            'message' => 'Cards reordered successfully!',
            'cards' => $updatedCards
        ], 200);
    }

    // Dành cho card khác column 
    public function updateCardPositionsDifferentColumn(Request $request)
    {
        $validatedData = $request->validate([
            'cards' => 'required|array',
            'cards.*.id' => 'required|integer|exists:cards,id',
            'cards.*.list_board_id' => 'required|integer|exists:list_boards,id',
            'cards.*.position' => 'required|integer|min:0',
        ]);

        $cardsToUpdate = collect();
        $affectedColumnIds = collect();

        DB::transaction(function () use ($validatedData, &$cardsToUpdate, &$affectedColumnIds) {
            foreach ($validatedData['cards'] as $card) {
                $originalColumnId = Card::where('id', $card['id'])->value('list_board_id');

                // Nếu card di chuyển sang column mới, lưu cả column cũ và column mới vào danh sách cần cập nhật
                if ($originalColumnId !== $card['list_board_id']) {
                    $affectedColumnIds->push($originalColumnId);
                }
                $affectedColumnIds->push($card['list_board_id']);

                $cardsToUpdate->push([
                    'id' => $card['id'],
                    'list_board_id' => $card['list_board_id'],
                    'position' => $card['position'],
                ]);
            }

            // Batch update các card được di chuyển
            Card::upsert(
                $cardsToUpdate->toArray(),
                ['id'],
                ['list_board_id', 'position']
            );

            // Cập nhật vị trí trong các column bị ảnh hưởng
            Card::whereIn('list_board_id', $affectedColumnIds->unique())
                ->orderBy('position')
                ->chunkById(100, function ($cards) {
                    foreach ($cards as $index => $card) {
                        $card->update(['position' => ($index + 1) * 1000]);
                    }
                });
        });

        return response()->json([
            'message' => 'Cards updated successfully!',
        ], 200);
    }

    // Dành cho column
    public function updateListPosition(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'board_id' => 'required|integer|exists:boards,id',
                'lists' => 'required|array|min:1',
                'lists.*.id' => 'required|integer|exists:list_boards,id', // Đổi `list_board` thành `list_boards`
                'lists.*.position' => 'required|integer|min:0',
            ]);

            DB::transaction(function () use ($validatedData) {
                foreach ($validatedData['lists'] as $list) {
                    ListBoard::where('id', $list['id'])
                        ->where('board_id', $validatedData['board_id'])
                        ->update(['position' => $list['position']]); // ❌ Bỏ dấu () trước update
                }
            });

            return response()->json(['message' => 'Cập nhật vị trí thành công!'], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => 'Dữ liệu không hợp lệ', 'details' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Lỗi cập nhật: ' . $e->getMessage()], 500);
        }
    }
}
