<?php

namespace App\Http\Controllers\Api;

use App\Events\BoardMemberRoleUpdated;
use App\Events\MemberJoinedBoard;
use App\Events\MemberRemovedFromBoard;
use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\BoardInvitation;
use App\Models\BoardMember;
use App\Models\Card;
use App\Models\ChecklistItem;
use App\Models\User;
use App\Notifications\BoardInvitationReceivedNotification;
use App\Notifications\BoardMemberRoleUpdatedNotification;
use App\Notifications\MemberRemovedNotification;
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
                'data' => $board->members

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

        return response()->json([
            'success' => true,
            'message' => 'Tạo liên kết mời thành công!',
            'invite_link' => "http://localhost:5173/invite-board/{$inviteToken}",
        ]);
    }

    public function removeInviteLink($token)
    {
        $invitation = BoardInvitation::where('invite_token', $token)->first();

        if (!$invitation) {
            return response()->json(['message' => 'Liên kết không tồn tại'], 404);
        }

        $invitation->delete(); // Xóa khỏi DB

        return response()->json(['message' => 'Liên kết đã bị hủy']);
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
        $board->members()->attach($user->id, [
            'id' => Str::uuid(),
            'role' => 'member'
        ]);

        $user->notify(new BoardInvitationReceivedNotification($board, $inviter));
        // Gửi event tới chủ bảng
        event(new MemberJoinedBoard($board->created_by, $board->id, $user->full_name));

        // Xóa invite token sau khi sử dụng (tùy chọn)
        // $invite->delete();

        return response()->json(['message' => 'Successfully joined the board', 'board' => $board]);
    }

    public function updateRoleMemberInBoard(Request $request)
    {
        $request->validate([
            'board_id' => 'required|exists:boards,id',
            'user_id' => 'required|exists:users,id',
            'role' => 'required|string|in:admin,member',
        ]);

        try {
            $board = Board::findOrFail($request->board_id);
            $currentUser = auth()->user();

            // Kiểm tra quyền admin
            if (
                !$board->members()->where('board_members.user_id', $currentUser->id)
                    ->where('board_members.role', 'admin')
                    ->exists()
            ) {
                return response()->json(['success' => false, 'message' => 'Permission denied'], 403);
            }

            // Kiểm tra nếu hạ cấp admin cuối cùng
            if (
                $request->role === 'member' &&
                $board->countAdmins() === 1 &&
                $board->members()->where('board_members.user_id', $request->user_id)
                    ->where('board_members.role', 'admin')
                    ->exists()
            ) {
                return response()->json(['success' => false, 'message' => 'Cannot downgrade the last admin'], 400);
            }

            $board->members()->updateExistingPivot($request->user_id, ['role' => $request->role]);

            $targetUser = User::find($request->user_id);

            $targetUser->notify(new BoardMemberRoleUpdatedNotification($board, $request->role, $currentUser));

            broadcast(new BoardMemberRoleUpdated($board->id, $request->user_id, $request->role))->toOthers();

            // Trả thêm thông tin để client biết có mở menu rời bảng không
            $isCreator = $board->isCreator($currentUser->id);
            $canLeave = $isCreator && $board->countAdmins() > 1;
            return response()->json([
                'success' => true,
                'message' => 'Role updated successfully',
                'can_leave' => $canLeave,
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function removeMemberFromBoard(Request $request, $boardId)
    {
        // Validate dữ liệu đầu vào
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        try {
            $board = Board::findOrFail($boardId);
            $currentUser = auth()->user();
            $removeUser = User::findOrFail($request->user_id);

            // Kiểm tra quyền admin
            if (
                !$board->members()->where('board_members.user_id', $currentUser->id)
                    ->where('board_members.role', 'admin')
                    ->exists()
            ) {
                return response()->json(['success' => false, 'message' => 'Permission denied'], 403);
            }

            // Kiểm tra nếu xóa admin cuối cùng
            if (
                $board->countAdmins() === 1 &&
                $board->members()->where('board_members.user_id', $request->user_id)
                    ->where('board_members.role', 'admin')
                    ->exists()
            ) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot remove the last admin. Please assign another admin first.',
                ], 400);
            }

            DB::transaction(function () use ($board, $request) {
                // Xóa thành viên khỏi bảng
                $board->members()->detach($request->user_id);

                // Xóa thành viên khỏi tất cả card trong bảng
                DB::table('card_user')->whereIn('card_id', function ($query) use ($board) {
                    $query->select('id')->from('cards')->whereIn('list_board_id', function ($subQuery) use ($board) {
                        $subQuery->select('id')->from('list_boards')->where('board_id', $board->id);
                    });
                })->where('user_id', $request->user_id)->delete();

                // Xóa thành viên khỏi tất cả checklist_item_user
                DB::table('checklist_item_user')->whereIn('checklist_item_id', function ($query) use ($board) {
                    $query->select('id')->from('checklist_items')->whereIn('checklist_id', function ($subQuery) use ($board) {
                        $subQuery->select('id')->from('checklists')->whereIn('card_id', function ($subSubQuery) use ($board) {
                            $subSubQuery->select('id')->from('cards')->whereIn('list_board_id', function ($subSubSubQuery) use ($board) {
                                $subSubSubQuery->select('id')->from('list_boards')->where('board_id', $board->id);
                            });
                        });
                    });
                })->where('user_id', $request->user_id)->delete();
            });

            // Gửi thông báo lưu vào database
            $removeUser->notify(new MemberRemovedNotification($board->id, $board->name));

            // Gửi event realtime
            event(new MemberRemovedFromBoard($request->user_id, $boardId));

            return response()->json(['success' => true, 'message' => 'Member removed successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }


    public function getGuestBoards()
    {
        $userId = auth()->id();

        $boards = DB::table('board_members')
            ->join('boards', 'board_members.board_id', '=', 'boards.id')
            ->join('workspaces', 'boards.workspace_id', '=', 'workspaces.id')
            ->where('board_members.user_id', $userId)
            ->where('workspaces.id_member_creator', '!=', $userId) // Loại bỏ các bảng trong workspace mà user là chủ
            ->orderBy('workspaces.id') // Sắp xếp theo workspace
            ->orderBy('boards.updated_at', 'desc') // Sắp xếp theo thời gian truy cập gần nhất
            ->select(
                'boards.id',
                'boards.name',
                'boards.workspace_id',
                'workspaces.name as workspace_name',
                'board_members.role' // Lấy quyền của user (admin/member)
            )
            ->get();

        // Nhóm các bảng theo workspace
        $groupedBoards = $boards->groupBy('workspace_id')->map(function ($boards, $workspaceId) {
            return [
                'workspace_id' => $workspaceId,
                'workspace_name' => $boards->first()->workspace_name, // Lấy tên workspace từ bản ghi đầu tiên
                'boards' => $boards->map(function ($board) {
                    return [
                        'id' => $board->id,
                        'name' => $board->name,
                        'role' => $board->role,
                    ];
                })->values(),
            ];
        })->values();

        return response()->json($groupedBoards);
    }

    public function getMemberCards($boardId, $userId)
    {
        try {
            // Lấy danh sách thẻ mà user này là thành viên trong bảng
            $cards = Card::whereHas('list', function ($query) use ($boardId) {
                $query->where('board_id', $boardId);
            })
            ->whereHas('members', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->get();

            return response()->json([
                'success' => true,
                'message' => "Lấy danh sách thẻ của thành viên thành công",
                'data' => $cards
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => "Lấy danh sách thẻ của thành viên không thành công",
            ]);
        }
    }

    public function getMemberCheckListItems($boardId, $userId)
{
    try {
        $items = ChecklistItem::whereHas('checklist.card.list', function ($query) use ($boardId) {
                        $query->where('board_id', $boardId);
                    })
                    ->whereHas('members', function ($query) use ($userId) {
                        $query->where('user_id', $userId);
                    })
                    ->get();

        return response()->json([
            'success' => true,
            'message' => "Lấy danh sách mục checklist của thành viên thành công",
            'data' => $items
        ]);
    } catch (\Throwable $th) {
        return response()->json([
            'success' => false,
            'message' => "Lấy danh sách mục checklist của thành viên không thành công",
        ]);
    }
}


}
