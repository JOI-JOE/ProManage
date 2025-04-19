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
    public function updatePositionCard(Request $request, $cardId)
    {
        try {
            // Validate dữ liệu đầu vào
            $validated = $request->validate([
                'position' => 'required',  // Kiểm tra vị trí mới phải là một số nguyên
                'listId'   => 'required|exists:list_boards,id',
            ]);

            // Cập nhật vị trí card dựa theo id và listId
            $updated = Card::where('id', $cardId)
                ->update([
                    'position' => $validated['position'],
                    'list_board_id' => $validated['listId']
                ]);

            if ($updated) {
                return response()->json([
                    'card'    => $updated, // Lưu ý: $updated chỉ trả về số bản ghi cập nhật
                ]);
            } else {
                return response()->json(['message' => 'Card not found or no changes made'], 404);
            }
        } catch (\Exception $e) {
            // Log lỗi nếu cần, ví dụ: Log::error($e);
            return response()->json([
                'message' => 'An error occurred while updating card position.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
