<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\BoardInvitation;
use App\Models\BoardMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;

class BoardMemberController extends Controller
{

    public function getUserBoards(Request $request)
    {
        $userId = auth()->id(); // Lấy ID của user đang đăng nhập

        $boards = Board::with('members:id,user_name,email') // Lấy cả thông tin thành viên nhưng chỉ cần ID, Name, Email
            ->whereHas('members', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->select('id', 'name', 'description', 'created_at') // Chỉ lấy các cột cần thiết
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Danh sách bảng của bạn',
            'data' => $boards
        ]);
    }

    public function generateInviteLink(Request $request, $boardId)
    {
        $user = auth()->user(); // Lấy user hiện tại
        $board = Board::findOrFail($boardId); // Lấy thông tin bảng

        // Kiểm tra quyền: chỉ Admin hoặc thành viên có quyền mời mới được tạo link
        if (!$board->members()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền tạo liên kết mời vào bảng này.'
            ], 403);
        }

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

        // Tạo liên kết mời
        // $inviteLink = url("api/invite-board/{$inviteToken}");
        // $inviteLink = url("api/invite-board/{$inviteToken}");

        return response()->json([
            'success' => true,
            'message' => 'Tạo liên kết mời thành công!',
           'invite_link' => "http://localhost:5173/invite-board/{$inviteToken}",
        ]);
    }


    public function inviteMemberToBoard(Request $request, $boardId)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $userId = $request->user_id;

        // Lấy board và kiểm tra
        $board = Board::with('workspace')->findOrFail($boardId);

        // Kiểm tra nếu user đã là thành viên của board chưa
        $isBoardMember = DB::table('board_members')
            ->where('board_id', $boardId)
            ->where('user_id', $userId)
            ->exists();

        if (!$isBoardMember) {
            // Thêm vào bảng board_members
            DB::table('board_members')->insert([
                'board_id' => $boardId,
                'user_id' => $userId,
                'role' => 'member',
                'joined' => now(),
            ]);
        }

        // Kiểm tra nếu user chưa có trong workspace thì thêm vào
        $workspaceId = $board->workspace->id;

        $isWorkspaceMember = DB::table('workspace_members')
            ->where('workspace_id', $workspaceId)
            ->where('user_id', $userId)
            ->exists();

        if (!$isWorkspaceMember) {
            DB::table('workspace_members')->insert([
                'workspace_id' => $workspaceId,
                'user_id' => $userId,
                'role' => 'member',
                'joined' => 1,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Thành viên đã được thêm vào bảng và không gian làm việc!',
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

        // Kiểm tra xem user đã là thành viên chưa để tránh trùng lặp
        if ($board->members()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'You are already a member of this board'], 400);
        }

        // Thêm user vào board với role mặc định là 'member'
        $board->members()->attach($user->id, ['role' => 'member']);

        // Xóa invite token sau khi sử dụng (tùy chọn)
        $invite->delete();

        return response()->json(['message' => 'Successfully joined the board', 'board' => $board]);
    }
}
