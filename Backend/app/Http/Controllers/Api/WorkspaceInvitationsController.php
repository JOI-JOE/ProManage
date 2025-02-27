<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitations;
use App\Models\WorkspaceMembers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;


class WorkspaceInvitationsController extends Controller
{
    // protected $emailController;

    // public function __construct(EmailController $emailController)
    // {
    //     $this->emailController = $emailController;
    // }

    public function acceptInvitation($workspaceId, $inviteToken)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized: User not authenticated.',
                ], 401);
            }

            // Lấy thông tin workspace
            $workspace = Workspace::find($workspaceId);
            if (!$workspace) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Workspace not found.',
                ], 404);
            }

            // Kiểm tra nếu workspace ở chế độ private
            if ($workspace->permission_level === 'private') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'This workspace is private. Invitations are not allowed.',
                ], 403);
            }

            $invitation = WorkspaceInvitations::where('workspace_id', $workspaceId)
                ->where('invite_token', $inviteToken)
                ->first();

            if (!$invitation) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid or expired invitation.',
                ], 404);
            }
            // Kiểm tra user đã là thành viên chưa
            $isMember = WorkspaceMembers::where('workspace_id', $workspaceId)
                ->where('user_id', $user->id)
                ->exists();

            if ($isMember) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'User is already a member of this workspace.',
                ], 200);
            }

            return response()->json([
                'status' => 'pending',
                'message' => 'Bạn có muốn tham gia không?',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to accept invitation: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function createInvitationSecret($workspaceId, $acceptUnconfirmed = false)
    {
        try {
            // Kiểm tra xem workspace có tồn tại không
            $workspace = Workspace::findOrFail($workspaceId);

            // Kiểm tra người dùng đã đăng nhập chưa
            if (!Auth::check()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized: User not authenticated.',
                ], 401);
            }

            $invitedByMember = Auth::user();

            $inviteToken = Str::uuid()->toString();

            $invitation = WorkspaceInvitations::create([
                'workspace_id' => $workspace->id,
                'invite_token' => $inviteToken,
                'accept_unconfirmed' => $acceptUnconfirmed,
                'invited_by_member_id' => $invitedByMember->id,
                'email' => $invitedByMember->email, // Lưu email người mời nếu cần
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Invitation created successfully.',
                'secret' => $invitation->invite_token,
                'workspace_id' => $workspace->id,
                'invited_by' => $invitedByMember->id,
            ], 201);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Workspace not found.',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create invitation: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Function tắt (hủy) liên kết lời mời
    public function cancelInvitationSecret($workspaceId)
    {
        try {
            // Tìm lời mời còn hiệu lực
            $invitation = WorkspaceInvitations::where('workspace_id', $workspaceId)
                ->where('is_active', true)
                ->first();

            if (!$invitation) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Không tìm thấy lời mời hợp lệ để hủy!',
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Lời mời đã bị hủy!',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi hủy lời mời: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function validateInvitation($workspaceId)
    {
        try {
            // Kiểm tra workspace có tồn tại không
            $workspace = Workspace::find($workspaceId);
            if (!$workspace) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Workspace không tồn tại!'
                ], 404);
            }

            // Kiểm tra xem lời mời có hợp lệ không
            $invitation = WorkspaceInvitations::where('workspace_id', $workspaceId)
                ->first();

            if (!$invitation) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Lời mời không hợp lệ hoặc đã hết hạn!'
                ], 400);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Lời mời hợp lệ!',
                'workspace' => $workspace->name
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Đã xảy ra lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    // public function searchNewMembersToWorkspace(Request $request)
    // {

    //     $queryText = $request->input('query');  // Từ khóa tìm kiếm (tên hoặc email)
    //     $workspaceId = $request->input('workspace_id'); // ID của workspace

    //     $members = User::where(function ($queryBuilder) use ($queryText) {
    //         $queryBuilder->where('user_name', 'LIKE', "%{$queryText}%")
    //             ->orWhere('full_name', 'LIKE', "%{$queryText}%")
    //             ->orWhere('email', 'LIKE', "%{$queryText}%");
    //     })
    //         ->limit(7)  // 🔹 Chỉ lấy tối đa 7 user
    //         ->get();



    //     return response()->json([
    //         'message' => 'Members retrieved successfully',
    //         'members' => $members
    //     ]);
    // }


    // public function inviteMemberToWorkspace(Request $request, $idWorkspace)
    // {


    //     // 📌 nếu trường hợp truyền bằng email thì sau khi bấm entern sẽ được vào thẳng input luôn
    //     // 📌 nếu trường hợp display_name, user_name thì sẽ hiện ra một danh sách các người có thể mời và bạn phải bấm chọn
    //     /*📝 
    //         - nếu chọn tên có tồn tại thì nó sẽ trích xuất từ user_name đó sang -> id và từ đó ta có email để gửi cho member
    //         - nếu lấy email thì nó sẽ lấy luôn đường dẫn email -> khi bấm gửi thì nó sẽ gửi email mời người dùng vào trello
    //         */

    //     $memberInputs = $request->input('members', []); // Lấy danh sách nhập vào
    //     // ⚠️ => sẽ có 3 trường hợp input nhận vào 
    //     // Ngo Dang Hau    -> full_name
    //     // @haungodang2003 -> user_name
    //     // haungoadang2003@gmail.com ->email

    //     $total_member = []; // Mảng lưu danh sách thành viên hợp lệ

    //     foreach ($memberInputs as $member) {
    //         $isEmail = filter_var($member, FILTER_VALIDATE_EMAIL); // Kiểm tra có phải email không

    //         if ($isEmail) {

    //             if (!isset($total_members[$member])) { // Tránh trùng lặp email
    //                 $total_members[$member] = [
    //                     'workspace_id'      => $idWorkspace,
    //                     'invited_member_id' => null,
    //                     'email'             => $member,
    //                 ];
    //             }
    //         } else {
    //             // 📌 Tìm ID của người dùng dựa vào username hoặc full_name
    //             $userId = User::where('user_name', $member)
    //                 ->orWhere('full_name', $member)
    //                 ->value('id');

    //             $idToStore = $userId ?: $member;

    //             if (!isset($total_members[$idToStore])) { // Tránh trùng lặp ID
    //                 $total_members[$idToStore] = [
    //                     'workspace_id'      => $idWorkspace,
    //                     'invited_member_id' => $idToStore,
    //                     'email'             => null,
    //                 ];
    //             }
    //         }
    //     }

    //     // 📌 Lưu tất cả lời mời vào database một lần
    //     foreach ($total_members as $invitationData) {
    //         WorkspaceInvitations::firstOrCreate($invitationData);
    //     }

    //     // 📌 Trả về danh sách ID hoặc email
    //     return response()->json([
    //         'members' => array_keys($total_members), // Chỉ trả về danh sách ID hoặc email
    //     ]);
    // }

    // public function sendInvitationById(Request $request, $idWorkspace, $idMember)
    // {
    //     $member_invitation = WorkspaceInvitations::where('workspace_id', $idWorkspace)
    //         ->where('invited_member_id', $idMember)->first();


    //     if ($member_invitation) {
    //         $member_invitation->update([
    //             'accept_unconfirmed' => true,
    //             'invitation_message' => $request->input('invitationMessage'),
    //             'type' => 'normal'
    //         ]);

    //         return response()->json([
    //             'invitation' => $member_invitation
    //         ], 200);
    //     }
    //     return response()->json([
    //         'message' => 'Invitation not found'
    //     ], 404);
    // }
    // public function sendInvitationByEmail(Request $request, $idWorkspace)
    // {
    //     $member_invitations = WorkspaceInvitations::where('workspace_id', $idWorkspace)
    //         ->whereNotNull('email') // Chỉ lấy các lời mời có email
    //         ->get();

    //     if ($member_invitations->isNotEmpty()) {
    //         foreach ($member_invitations as $invitation) {
    //             $invitation->update([
    //                 'accept_unconfirmed' => false,
    //                 'invitation_message' => $request->input('invitationMessage'),
    //                 'type' => 'normal'
    //             ]);
    //         }

    //         return response()->json([
    //             'message' => 'Invitations sent successfully',
    //             // 'member'  => ''
    //         ], 200);
    //     }

    //     return response()->json([
    //         'message' => 'Invitation not found'
    //     ], 404);
    // }
}
