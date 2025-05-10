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
    public function updatePositionList(Request $request, $listId)
    {
        // Lấy thông tin từ request và validate
        $validated = $request->validate([
            'position' => 'required',  // Kiểm tra vị trí mới phải là số nguyên
        ]);

        // Tìm list cần cập nhật
        $list = ListBoard::find($listId);

        // Nếu không tìm thấy list, trả về lỗi 404
        if (!$list) {
            return response()->json(['error' => 'List not found'], 404);
        }

        // Cập nhật vị trí mới
        $list->update(['position' => $validated['position']]);

        // Lấy lại thông tin sau khi cập nhật
        $list->refresh();

        // Gửi sự kiện broadcast đến các client khác
        broadcast(new ListUpdated($list))->toOthers();

        // Trả về kết quả sau khi cập nhật thành công
        return response()->json(['updatedList' => $list]);
    }

    public function updatePositionCard(Request $request, $cardId)
    {
        try {
            $validated = $request->validate([
                'position' => 'required',
                'listId' => 'required|exists:list_boards,id',
            ]);

            $card = Card::find($cardId);

            if (!$card) {
                return response()->json(['message' => 'Card not found'], 404);
            }

            $card->position = $validated['position'];
            $card->list_board_id = $validated['listId'];
            $card->save();

            broadcast(new CardUpdated($card))->toOthers();

            return response()->json([
                'card' => $card,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while updating card position.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    // public function updatePositionCard(Request $request, $cardId)
    // {
    //     try {
    //         // Validate dữ liệu đầu vào
    //         $validated = $request->validate([
    //             'position' => 'required',  // Kiểm tra vị trí mới phải là một số nguyên
    //             'listId'   => 'required|exists:list_boards,id',
    //         ]);

    //         // Cập nhật vị trí card dựa theo id và listId
    //         $updated = Card::where('id', $cardId)
    //             ->update([
    //                 'position' => $validated['position'],
    //                 'list_board_id' => $validated['listId']
    //             ]);

    //             // broadcast(new CardUpdated($updated))->toOthers();

    //         if ($updated) {
    //             return response()->json([
    //                 'card'    => $updated, // Lưu ý: $updated chỉ trả về số bản ghi cập nhật
    //             ]);
    //         } else {
    //             return response()->json(['message' => 'Card not found or no changes made'], 404);
    //         }
    //     } catch (\Exception $e) {
    //         // Log lỗi nếu cần, ví dụ: Log::error($e);
    //         return response()->json([
    //             'message' => 'An error occurred while updating card position.',
    //             'error'   => $e->getMessage(),
    //         ], 500);
    //     }
    // }
}
