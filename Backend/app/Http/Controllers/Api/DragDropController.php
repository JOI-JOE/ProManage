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
    // Dành cho card
    public function updateCardPositionsSameCol(Request $request)
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
