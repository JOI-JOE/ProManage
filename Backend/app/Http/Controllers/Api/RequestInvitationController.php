<?php

namespace App\Http\Controllers\Api;

use App\Events\AcceptRequest;
use App\Events\CreatorComeBackBoard;
use App\Events\RequestJoinBoard;
use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\RequestInvitation;
use App\Models\User;
use App\Notifications\AcceptRequestJoinBoard;
use App\Notifications\JoinBoardRequestNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class RequestInvitationController extends Controller
{
    public function requestJoinBoard(Request $request, $boardId)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        try {
            $board = Board::findOrFail($boardId);
            $user = User::findOrFail($request->user_id);
            $currentUser = auth()->user();

            // Kiểm tra xem người yêu cầu có phải là người dùng hiện tại không
            if ($currentUser->id !== $user->id) {
                return response()->json(['success' => false, 'message' => 'Permission denied'], 403);
            }

            // Kiểm tra xem đã là thành viên chưa
            if ($board->members()->where('user_id', $user->id)->exists()) {
                return response()->json(['success' => false, 'message' => 'Bạn đã là thành viên'], 400);
            }

            // Kiểm tra xem đã có yêu cầu đang chờ chưa
            if (DB::table('request_invitation')
                ->where('board_id', $boardId)
                ->where('user_id', $user->id)
                ->where('status', 'pending')
                ->exists()
            ) {
                return response()->json(['success' => false, 'message' => 'Yêu cầu của bạn đã được gửi trước đó và đang chờ duyệt'], 400);
            }

            $isCreator = $board->isCreator($user->id);

            if ($isCreator) {
                // Nếu là creator, thêm ngay vào bảng với vai trò admin
                $board->members()->attach($user->id, [
                    'id' => Str::uuid(),
                    'role' => 'admin',

                ]);
                $memberIds = $board->members()->pluck('users.id')->toArray();
                // Broadcast event tới các thành viên khác
                broadcast(new CreatorComeBackBoard(
                    $boardId,
                    $user->id,
                    $user->full_name,
                    array_diff($memberIds, [$user->id]) // Loại creator khỏi danh sách nhận
                ))->toOthers();
                
                Log::info("Broadcasting CreatorRejoinedBoard", [
                    'boardId' => $boardId,
                    'userId' => $user->id,
                    'memberIds' => $memberIds,
                ]);
                return response()->json([
                    'success' => true,
                    'message' => 'Bạn đã tham gia lại bảng với vai trò quản trị viên!',
                    'is_member' => true,
                ], 200);
            }
            // Tạo yêu cầu tham gia với UUID
            $requestId = Str::uuid();
            // Nếu không phải creator, gửi yêu cầu và lưu vào board_requests
            DB::table('request_invitation')->insert([
                'id' => $requestId,
                'board_id' => $boardId,
                'user_id' => $user->id,
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Gửi thông báo cho tất cả admin của bảng
            // Lấy danh sách admin
            // Lấy danh sách admin
            $admins = $board->members()->wherePivot('role', 'admin')->pluck('users.id')->toArray();

            // Gửi thông báo cho tất cả admin của bảng qua notification
            foreach ($admins as $adminId) {
                $admin = User::find($adminId);
                if ($admin) {
                    $admin->notify(
                        (new JoinBoardRequestNotification($board->id, $board->name, $user->full_name, $requestId))
                        // ->delay(now()->addSeconds(5)) // Tùy chọn: delay để xử lý queue
                    );
                }
            }

            // Broadcast event realtime tới các admin
            broadcast(new RequestJoinBoard($boardId, $user->id, $user->full_name, $requestId, $admins))->toOthers();
            Log::info("Broadcasting to admins", ['admins' => $admins]);
            return response()->json([
                'success' => true,
                'message' => 'Yêu cầu tham gia bảng đã được gửi và đang chờ quản trị viên duyệt!',
                'is_member' => false,
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function getRequestsForBoard($boardId)
    {
        $board = Board::findOrFail($boardId);
        $requests = DB::table('request_invitation')
            ->where('board_id', $boardId)
            ->where('status', 'pending')
            ->join('users', 'request_invitation.user_id', '=', 'users.id')
            ->select('request_invitation.*', 'users.full_name', 'users.email')
            ->get();
        return response()->json(['success' => true, 'data' => $requests], 200);
    }

    public function acceptRequest($request_id)
    {
        try {
            $requestInvitation = RequestInvitation::find($request_id);

            if (!$requestInvitation) {
                return response()->json(['message' => 'Yêu cầu không tồn tại.'], 404);
            }

            // Kiểm tra xem yêu cầu đã được duyệt chưa
            if ($requestInvitation->status === 'accepted') {
                return response()->json(['message' => 'Yêu cầu đã được duyệt trước đó.'], 400);
            }


            // Lấy thông tin board và user
            $board = Board::find($requestInvitation->board_id);
            $user = User::find($requestInvitation->user_id);

            if (!$board || !$user) {
                return response()->json(['message' => 'Bảng hoặc người dùng không tồn tại.'], 404);
            }

            // Thêm người dùng vào bảng board_members với role là 'user'
            $board->members()->attach($user->id, [
                'id' => Str::uuid(), // Đảm bảo bảng board_members có cột id kiểu uuid
                'role' => 'member',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Gửi email thông báo cho người dùng
            $user->notify(new AcceptRequestJoinBoard($board->id, $board->name));
            
            // Phát event thời gian thực để thông báo cho người dùng
            event(new AcceptRequest($user->id, $board->id, $board->name));
            // Xóa bản ghi yêu cầu tham gia sau khi xử lý thành công
            $requestInvitation->delete();

            return response()->json([
                'success' => true,
                'board_id' => $board->id,
                'message' => 'Yêu cầu đã được duyệt và thành viên đã được thêm vào bảng.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function rejectRequest($requestId)
    {
        try {
            $requestInvitation = DB::table('request_invitation')->where('id', $requestId)->first();

            if (!$requestInvitation) {
                return response()->json(['message' => 'Yêu cầu không tồn tại.'], 404);
            }

            if ($requestInvitation->status !== 'pending') {
                return response()->json(['message' => 'Yêu cầu đã được xử lý trước đó.'], 400);
            }
            // Lấy board_id trước khi xóa
            $boardId = $requestInvitation->board_id;
            // Xóa yêu cầu
            DB::table('request_invitation')->where('id', $requestId)->delete();

            return response()->json([
                'success' => true,
                'board_id' => $boardId,
                'message' => 'Yêu cầu đã bị từ chối và xóa thành công.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage(),
            ], 500);
        }
    }
}
