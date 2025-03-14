<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\BoardMember;
use App\Models\BoardUserPermission;
use App\Models\User;
use Illuminate\Http\Request;

class BoardMemberController extends Controller
{
    public function index()
    {
        $board = Board::where('closed', 0)->get();
        return response()->json($board);
    }

    public function getBoardDetail($id)
    {
        $board = Board::with('lists.cards')->findOrFail($id);
        return response()->json($board);
    }

    public function showBoardById($boardId)
    {
        try {
            // Tìm board theo ID
            $board = Board::with('creator')->findOrFail($boardId);
            // $creator = $board->creator()->first(); // Lấy thông tin người tạo

            // Trả về kết quả nếu tìm thấy
            return response()->json([
                'result' => true,
                'data' => $board,
                // 'user'=> $board->creator,
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'result' => false,
                'message' => 'Board not found.'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'result' => false,
                'message' => 'Something went wrong',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    // public function addMember(Request $request, $boardId)
    // {
    //     // Xác nhận dữ liệu nhập vào
    //     $validated = $request->validate([
    //         'user_id' => 'required|exists:users,id', // Kiểm tra user có tồn tại không
    //         'role' => 'required|in:admin,member,viewer', // Kiểm tra vai trò hợp lệ
    //     ]);

    //     // Kiểm tra board có tồn tại không
    //     $board = Board::find($boardId);
    //     if (!$board) {
    //         return response()->json([
    //             'result' => false,
    //             'message' => 'Board not found'
    //         ], 404);
    //     }

    //     // Lấy user theo username
    //     $user = User::where('username', $validated['username'])->first();
    //     if (!$user) {
    //         return response()->json([
    //             'result' => false,
    //             'message' => 'User not found'
    //         ], 404);
    //     }

    //     // Kiểm tra nếu user đã có trong board rồi
    //     $existingMember = BoardUserPermission::where('board_id', $boardId)
    //         ->where('user_id', $validated['user_id'])
    //         ->first();
    //     if ($existingMember) {
    //         return response()->json([
    //             'result' => false,
    //             'message' => 'User is already a member of this board'
    //         ], 400);
    //     }

    //     // Tạo bản ghi mới trong bảng board_user_permissions
    //     $boardUserPermission = BoardUserPermission::create([
    //         'board_id' => $boardId,
    //         'user_id' => $user->id,
    //         'role' => $validated['role'],
    //     ]);

    //     return response()->json([
    //         'result' => true,
    //         'message' => 'Member added successfully',
    //         'data' => $boardUserPermission
    //     ]);
    // }


    // public function updateMemberRole(Request $request, $boardId, $userId)
    // {
    //     // Xác nhận dữ liệu nhập vào
    //     $validated = $request->validate([
    //         'role' => 'required|in:admin,member,viewer', // Kiểm tra vai trò hợp lệ
    //     ]);

    //     try {
    //         // Kiểm tra board có tồn tại không
    //         $board = Board::find($boardId);
    //         if (!$board) {
    //             return response()->json([
    //                 'result' => false,
    //                 'message' => 'Board not found'
    //             ], 404);
    //         }

    //         // Kiểm tra nếu user có tham gia board không
    //         $boardUser = BoardUserPermission::where('board_id', $boardId)
    //             ->where('user_id', $userId)
    //             ->first();

    //         if (!$boardUser) {
    //             return response()->json([
    //                 'result' => false,
    //                 'message' => 'Member not found in this board'
    //             ], 404);
    //         }

    //         // Cập nhật vai trò của thành viên
    //         $boardUser->role = $validated['role'];
    //         $boardUser->save();

    //         return response()->json([
    //             'result' => true,
    //             'message' => 'Member role updated successfully',
    //             'data' => $boardUser
    //         ]);
    //     } catch (\Exception $e) {
    //         // Nếu có lỗi bất ngờ, bắt lỗi và trả về thông báo lỗi chi tiết
    //         return response()->json([
    //             'result' => false,
    //             'message' => 'An error occurred: ' . $e->getMessage()
    //         ], 500);
    //     }
    // }

    public function leaveBoard($boardId, $userId)
    {
        try {
            // Kiểm tra board có tồn tại không
            $board = Board::find($boardId);
            if (!$board) {
                return response()->json([
                    'result' => false,
                    'message' => 'Board not found'
                ], 404);
            }

            // Kiểm tra nếu user có tham gia board không
            $boardUser = BoardMember::where('board_id', $boardId)
                ->where('user_id', $userId)
                ->first();

            if (!$boardUser) {
                return response()->json([
                    'result' => false,
                    'message' => 'Member not found in this board'
                ], 404);
            }

            // Xóa thành viên khỏi board
            $boardUser->delete();

            return response()->json([
                'result' => true,
                'message' => 'Member left the board successfully'
            ]);
        } catch (\Exception $e) {
            // Nếu có lỗi bất ngờ, bắt lỗi và trả về thông báo lỗi chi tiết
            return response()->json([
                'result' => false,
                'message' => 'An error occurred: ' . $e->getMessage()
            ], 500);
        }
    }
}
