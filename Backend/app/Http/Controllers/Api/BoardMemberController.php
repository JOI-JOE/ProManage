<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\BoardInvitation;
use App\Models\BoardMember;
use App\Models\User;
use App\Notifications\BoardInvitationReceivedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;

class BoardMemberController extends Controller
{

    // public function getUserBoards(Request $request)
    // {
    //     $userId = auth()->id(); // Lấy ID của user đang đăng nhập

    //     $boards = Board::with('members:id,user_name,email') // Lấy cả thông tin thành viên nhưng chỉ cần ID, Name, Email
    //         ->whereHas('members', function ($query) use ($userId) {
    //             $query->where('user_id', $userId);
    //         })
    //         ->select('id', 'name', 'description', 'created_at') // Chỉ lấy các cột cần thiết
    //         ->get();

    //     return response()->json([
    //         'success' => true,
    //         'message' => 'Danh sách bảng của bạn',
    //         'data' => $boards
    //     ]);
    // }/////////////   CHƯA DÙNG////////////////

    public function getBoardMembers($boardId)
    {

        try {
            $board = Board::with('members:id,full_name,email')->find($boardId);
            return response()->json([
                'success' => true,
                'message' => 'lấy thành viên của bảng thành công',
                'data' =>  $board->members

            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => 'lấy thành viên của bảng khoong thành công',

            ]);
        }
    }

    public function generateInviteLink(Request $request, $boardId)
    {
        $user = auth()->user(); // Lấy user hiện tại
        $board = Board::findOrFail($boardId); // Lấy thông tin bảng

        // Kiểm tra quyền: chỉ Admin hoặc thành viên có quyền mời mới được tạo link
        // if (!$board->members()->where('user_id', $user->id)->exists()) {
        //     return response()->json([
        //         'success' => false,
        //         'message' => 'Bạn không có quyền tạo liên kết mời vào bảng này.'
        //     ], 403);
        // }

        // Tạo mã token duy nhất
        $inviteToken = Str::random(16); // Chỉ chứa chữ và số

        // $hashToken = hash('sha256', $inviteToken); // Hash token

        // Lưu vào bảng invite_boards
        $invite = BoardInvitation::create([
            'board_id' => $board->id,
            'status' => 'pending',
            // 'email' => $email, // Nếu không có tài khoản
            'invitation_message' => 'Mời bạn tham gia bảng!',
            'invited_by' => auth()->id(),
            'invite_token' => $inviteToken,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tạo liên kết mời thành công!',
            'invite_link' => "http://localhost:5173/invite-board/{$inviteToken}",
        ]);
    }

    // 📍 Khi user click vào link mời
    public function handleInvite($token)
    {
        $invite = BoardInvitation::where('invite_token', $token)->first();

        if (!$invite) {
            return response()->json(['message' => 'Invalid or expired invite link'], 404);
        }

        $board = Board::find($invite->board_id);
        return response()->json([
            'board' => $board,
            'token' => $token,
        ]);
    }


    public function join(Request $request, $token)
    {
        $invite = BoardInvitation::where('invite_token', $token)->first();

        if (!$invite) {
            return response()->json(['message' => 'Invalid or expired invite link'], 404);
        }

        $user = $request->user(); // Người dùng đã đăng nhập (qua Sanctum)
        $board = Board::find($invite->board_id);
        $inviter = User::findOrFail($invite->invited_by); // Lấy người mời

        // Kiểm tra xem user đã là thành viên chưa để tránh trùng lặp
        if ($board->members()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'You are already a member of this board'], 400);
        }

        // Thêm user vào board với role mặc định là 'member'
        $board->members()->attach($user->id, ['role' => 'member']);

        $user->notify(new BoardInvitationReceivedNotification($board, $inviter));

        // Xóa invite token sau khi sử dụng (tùy chọn)
        $invite->delete();

        return response()->json(['message' => 'Successfully joined the board', 'board' => $board]);
    }
}