<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Workspace;
use App\Models\WorkspaceInvitations;
use App\Models\WorkspaceMembers;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;


class WorkspaceInvitationsController extends Controller
{
    public function acceptInvitation($workspaceId, $inviteToken)
    {
        try {
            $user = Auth::user();
            // Lấy thông tin workspace
            $workspace = Workspace::find($workspaceId);
            if (!$workspace) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Workspace not found.',
                ], 404);
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

            // Nếu user chưa là thành viên, thêm họ vào workspace
            WorkspaceMembers::create([
                'workspace_id' => $workspaceId,
                'user_id' => $user->id,
                'member_type' => 'normal', // Hoặc loại thành viên khác tùy thuộc vào logic của bạn
                'is_unconfirmed' => false, // Đã xác nhận
                'joined' => true, // Ngày tham gia
                'is_deactivated' => false, // Không vô hiệu hóa
                'last_active' => now(), // Lần hoạt động cuối cùng
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'User has been successfully added to the workspace.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to accept invitation: ' . $e->getMessage(),
            ], 500);
        }
    }
    public function getInvitationSecret($workspaceId)
    {
        try {
            // Kiểm tra xem workspace có tồn tại hay không
            $workspace = Workspace::find($workspaceId);
            if (!$workspace) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Workspace not found.',
                ], 404);
            }

            // Lấy invitationSecret dựa trên workspaceId
            $invitation = WorkspaceInvitations::where('workspace_id', $workspaceId)->first();

            if ($invitation) {
                return response()->json([
                    'invitationSecret' => $invitation->invite_token,
                    'type' => 'normal'
                ], 200);
            } else {
                // Trả về thông báo nếu không tìm thấy invitationSecret
                return response()->json([
                    'status' => 'error',
                    'message' => 'No invitation secret found for this workspace.',
                ], 404);
            }
        } catch (\Exception $e) {
            // Xử lý các ngoại lệ khác
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve invitation secret.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function createInvitationSecret($workspaceId, $acceptUnconfirmed = false)
    {
        try {
            // Kiểm tra xem     workspace có tồn tại không
            $workspace = Workspace::findOrFail($workspaceId);

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
            ]);

            return response()->json([
                'secret' => $invitation->invite_token,
                'type' => 'normal'
            ], 201);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Workspace not found. Please check the workspace ID.',
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
            $invitation = WorkspaceInvitations::where('workspace_id', $workspaceId)->firstOrFail();

            $invitation->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Lời mời đã bị hủy!',
            ], Response::HTTP_OK);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không tìm thấy lời mời hợp lệ để hủy!',
            ], Response::HTTP_NOT_FOUND);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi hủy lời mời: ' . $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    public function getValidateInvitation($workspaceId, $inviteToken)
    {
        // ĐIỀU KIỆN
        // - kiểm tra token, workspaceID có tồn tại không
        // nếu tồn tại
        // - kiểm tra workspaceID đó ở chế độ private hay public
        //  -> private thì người dùng sẽ không được vào
        //  -> public thì cho vào

        // - trường hợp public thì phải hiện tên ra
        // - kiểm tra người dùng có trong workspace đó chưa
        //  -> nếu chưa có thì cho vào 
        //  -> còn nếu có rồi thì theo đường dẫn mà vào
        try {
            // Kiểm tra xem workspace và invitation có tồn tại không
            $invitation = WorkspaceInvitations::where('workspace_id', $workspaceId)
                ->where('invite_token', $inviteToken)
                ->whereHas('workspace', function ($query) use ($workspaceId) {
                    $query->where('id', $workspaceId)
                        ->where('permission_level', 'public');
                })
                ->with('workspace') // Eager load mối quan hệ workspace
                ->firstOrFail();

            // Truy cập dữ liệu của workspace
            $workspace = $invitation->workspace;
            $inventer = $workspace->user;
            // $memberInviter = [

            // ]

            $workspaceData = [
                'displayName' => $workspace->display_name,
                'id'          => $workspace->id,
                'name'        => $workspace->name,
            ];

            $memberInventer = [
                'fullName' => $inventer->full_name,
                'id'       => $inventer->id
            ];

            return response()->json([
                'workspace'     => $workspaceData,
                'memberInviter' => $memberInventer,
                'type'      => "normal"
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'isValid' => false,
                'message' => 'Workspace hoặc lời mời không tồn tại!',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'isValid' => false,
                'message' => 'Đã xảy ra lỗi khi xác thực lời mời: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function getValidateMemberInWorkspace($memberId)
    {
        // Tìm thành viên trong bảng workspace_members
        $member = WorkspaceMembers::where('user_id', $memberId);

        if (!$member) {
            // Nếu không tìm thấy thành viên
            return response()->json([
                'success' => false,
                'message' => 'Thành viên không tồn tại.',
            ], 404);
        }

        // Kiểm tra xem thành viên đã tham gia workspace hay chưa
        if ($member->joined) {
            return response()->json([
                'success' => true,
                'message' => 'Thành viên đã tham gia workspace.',
                'data' => $member,
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Thành viên chưa tham gia workspace.',
                'data' => $member,
            ]);
        }
    }
}

    // protected $emailController;

    // public function __construct(EmailController $emailController)
    // {
    //     $this->emailController = $emailController;
    // }



    // public function acceptInvitation($workspaceId, $inviteToken)
    // {
    //     try {
    //         $user = Auth::user();

    //         // Lấy thông tin workspace
    //         $workspace = Workspace::find($workspaceId);
    //         if (!$workspace) {
    //             return response()->json([
    //                 'status' => 'error',
    //                 'message' => 'Workspace not found.',
    //             ], 404);
    //         }

    //         $invitation = WorkspaceInvitations::where('workspace_id', $workspaceId)
    //             ->where('invite_token', $inviteToken)
    //             ->first();

    //         if (!$invitation) {
    //             return response()->json([
    //                 'status' => 'error',
    //                 'message' => 'Invalid or expired invitation.',
    //             ], 404);
    //         }

    //         // Kiểm tra user đã là thành viên chưa
    //         $isMember = WorkspaceMembers::where('id_workspace', $workspaceId)
    //             ->where('id_member', $user->id)
    //             ->exists();

    //         if ($isMember) {
    //             return response()->json([
    //                 'status' => 'success',
    //                 'message' => 'User is already a member of this workspace.',
    //             ], 200);
    //         }

    //         // Nếu user chưa là thành viên, thêm họ vào workspace
    //         WorkspaceMembers::create([
    //             'id_workspace' => $workspaceId,
    //             'id_member' => $user->id,
    //             'member_type' => 'normal', // Hoặc loại thành viên khác tùy thuộc vào logic của bạn
    //             'is_unconfirmed' => false, // Đã xác nhận
    //             'joined' => true, // Ngày tham gia
    //             'is_deactivated' => false, // Không vô hiệu hóa
    //             'last_active' => now(), // Lần hoạt động cuối cùng
    //         ]);

    //         return response()->json([
    //             'status' => 'success',
    //             'message' => 'User has been successfully added to the workspace.',
    //         ], 200);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'status' => 'error',
    //             'message' => 'Failed to accept invitation: ' . $e->getMessage(),
    //         ], 500);
    //     }
    // }
    // public function getInvitationSecret($workspaceId)
    // {
    //     try {
    //         // Kiểm tra xem workspaceId có hợp lệ không
    //         if (!is_numeric($workspaceId) || $workspaceId <= 0) {
    //             return response()->json([
    //                 'status' => 'error',
    //                 'message' => 'Invalid workspace ID.',
    //             ], 400);
    //         }

    //         // Kiểm tra xem workspace có tồn tại hay không
    //         $workspace = Workspace::find($workspaceId);
    //         if (!$workspace) {
    //             return response()->json([
    //                 'status' => 'error',
    //                 'message' => 'Workspace not found.',
    //             ], 404);
    //         }

    //         // Lấy invitationSecret dựa trên workspaceId
    //         $invitation = WorkspaceInvitations::where('workspace_id', $workspaceId)->first();

    //         if ($invitation) {
    //             return response()->json([
    //                 'invitationSecret' => $invitation->secret,
    //                 'type' => 'normal'
    //             ], 200);
    //         } else {
    //             // Trả về thông báo nếu không tìm thấy invitationSecret
    //             return response()->json([
    //                 'status' => 'error',
    //                 'message' => 'No invitation secret found for this workspace.',
    //             ], 404);
    //         }
    //     } catch (\Exception $e) {
    //         // Xử lý các ngoại lệ khác
    //         return response()->json([
    //             'status' => 'error',
    //             'message' => 'Failed to retrieve invitation secret.',
    //             'error' => $e->getMessage(),
    //         ], 500);
    //     }
    // }

    // public function createInvitationSecret($workspaceId, $acceptUnconfirmed = false)
    // {
    //     try {
    //         // Kiểm tra xem     workspace có tồn tại không
    //         $workspace = Workspace::findOrFail($workspaceId);

    //         if (!Auth::check()) {
    //             return response()->json([
    //                 'status' => 'error',
    //                 'message' => 'Unauthorized: User not authenticated.',
    //             ], 401);
    //         }

    //         $invitedByMember = Auth::user();

    //         $inviteToken = Str::uuid()->toString();

    //         $invitation = WorkspaceInvitations::create([
    //             'workspace_id' => $workspace->id,
    //             'invite_token' => $inviteToken,
    //             'accept_unconfirmed' => $acceptUnconfirmed,
    //             'invited_by_member_id' => $invitedByMember->id,
    //         ]);

    //         return response()->json([
    //             'secret' => $invitation->invite_token,
    //             'type' => 'normal'
    //         ], 201);
    //     } catch (ModelNotFoundException $e) {
    //         return response()->json([
    //             'status' => 'error',
    //             'message' => 'Workspace not found. Please check the workspace ID.',
    //         ], 404);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'status' => 'error',
    //             'message' => 'Failed to create invitation: ' . $e->getMessage(),
    //         ], 500);
    //     }
    // }

    // // Function tắt (hủy) liên kết lời mời
    // public function cancelInvitationSecret($workspaceId)
    // {
    //     try {
    //         // Tìm lời mời còn hiệu lực
    //         $invitation = WorkspaceInvitations::where('workspace_id', $workspaceId)
    //             ->first();

    //         if (!$invitation) {
    //             return response()->json([
    //                 'status' => 'error',
    //                 'message' => 'Không tìm thấy lời mời hợp lệ để hủy!',
    //             ], 404);
    //         }

    //         return response()->json([
    //             'status' => 'success',
    //             'message' => 'Lời mời đã bị hủy!',
    //         ], 200);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'status' => 'error',
    //             'message' => 'Lỗi khi hủy lời mời: ' . $e->getMessage(),
    //         ], 500);
    //     }
    // }

    // public function validateInvitation($workspaceId, $inviteToken)
    // {
    //     try {
    //         if (!Workspace::where('id', $workspaceId)->exists()) {
    //             return response()->json([
    //                 'isValid' => false,
    //                 'message' => 'Workspace không tồn tại!'
    //             ], 404);
    //         }

    //         // Kiểm tra lời mời có hợp lệ với token hay không
    //         $invitation = WorkspaceInvitations::where('workspace_id', $workspaceId)
    //             ->where('invite_token', $inviteToken)
    //             ->first();

    //         if (!$invitation) {
    //             return response()->json([
    //                 'isValid' => false,
    //                 'message' => 'Lời mời không hợp lệ hoặc đã hết hạn!'
    //             ], 400);
    //         }

    //         return response()->json([
    //             'displayName' => $invitation->workspace->display_name,
    //             'name' => $invitation->workspace->name,
    //             'id' => $invitation->workspace->id,
    //             'type' => 'normal'
    //         ], 200);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'isValid' => false,
    //             'error' => $e->getMessage()
    //         ], 500);
    //     }
    // }


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
