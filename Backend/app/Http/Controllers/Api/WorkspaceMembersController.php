<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\WorkspaceMembersResource;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMembers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WorkspaceMembersController extends Controller
{
    public function addMembersToWorkspace(Request $request, $workspaceId)
    {
        $memberIds = $request->input('members', []); // Danh sách ID thành viên từ FE

        if (empty($memberIds)) {
            return response()->json(['message' => 'No members provided'], 400);
        }

        // 🔍 Lấy danh sách thành viên đã có trong workspace
        $existingMembers = WorkspaceMembers::where('workspace_id', $workspaceId)
            ->whereIn('user_id', $memberIds)
            ->pluck('user_id')
            ->toArray();

        // 🔥 Lọc ra những thành viên chưa có trong workspace
        $newMembers = array_diff($memberIds, $existingMembers);

        if (empty($newMembers)) {
            return response()->json(['message' => 'No new members to add'], 200);
        }

        $insertData = array_map(fn($userId) => [
            'id' => Str::uuid(), // Thêm UUID thủ công
            'workspace_id' => $workspaceId,
            'user_id' => $userId,
            'member_type' => WorkspaceMembers::$PENDING, // Dùng hằng số trong model
            'joined' => false,  // Chưa tham gia
        ], $newMembers);

        WorkspaceMembers::insert($insertData);

        return response()->json(['message' => 'Members added successfully', 'new_members' => $newMembers], 201);
    }

    public function addMemberToWorkspaceDirection($workspaceId, $userId)
    {
        // Kiểm tra workspace có tồn tại không
        $workspace = Workspace::find($workspaceId);
        if (!$workspace) {
            return response()->json(['error' => 'Workspace not found'], 404);
        }

        // Kiểm tra user có tồn tại không
        $user = User::find($userId);
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        // Kiểm tra xem user đã là thành viên chưa
        $isMember = DB::table('workspace_members')
            ->where('workspace_id', $workspaceId)
            ->where('user_id', $userId)
            ->exists();

        if ($isMember) {
            return response()->json(['message' => 'User is already a member'], 200);
        }

        // Thêm user vào workspace
        DB::table('workspace_members')->insert([
            'id'            => Str::uuid(), // Thêm UUID thủ công
            'workspace_id'  => $workspaceId,
            'user_id'       => $userId,
            'member_type'   => WorkspaceMembers::$NORMAL, // Dùng hằng số trong model
            'joined'        => true
        ]);

        return response()->json(['message' => 'User added to workspace successfully'], 201);
    }


    // // https://trello.com/1/organizations/678b57031faba8dd978f0dee/members/677ea51482b962a06bc469ac/deactivated
    // public function deactivateMember(Request $request, $idOrganization, $idMember)
    // {
    //     // Deactivate a member in the organization
    //     $org_membership = OrgMembership::where('id_organization', $idOrganization)
    //         ->where('id_member', $idMember)
    //         ->first();

    //     $validated = $request->validate([
    //         'value' => 'required|boolean',
    //     ]);

    //     if ($validated['value']) {
    //         $org_membership->update(['deactivated' => true]);
    //         $message = 'Member deactivated successfully';
    //     } else {
    //         $org_membership->update(['deactivated' => false]);
    //         $message = 'Member reactivated successfully';
    //     }

    //     return response()->json([
    //         'message' => $message,
    //         'value'   => $validated['value']
    //     ]);
    // }



    // // https: //trello.com/1/organizations/678b57031faba8dd978f0dee/members/677ea51482b962a06bc469ac
    //1 public function changeMemberType(Request $request, $idOrganization, $idMember)
    // {
    //     // Thay đổi loại thành viên trong tổ chức
    //     // thay đổi admin và nornal 
    //     // sử dụng path vì thay đổi một trường
    //     $org_membership = OrgMembership::where('id_organization', $idOrganization)
    //         ->where('id_member', $idMember)
    //         ->first();

    //     $validated = $request->validate([
    //         'member_type' => 'required|in:admin,normal',
    //     ]);

    //     $org_membership->update($validated);
    //     $members = $org_membership->organization->memberships()->get();

    //     return response()->json([
    //         'message' => 'Member type updated successfully',
    //         'members'      => MembersResource::collection($members),
    //         'memberships'  => MemberShipsResource::collection($members),
    //     ]);
    // }



    // //  PAGE : https://trello.com/w/lam9492/members/requests
    // public function requestAccess(Request $request, $idOrganization)
    // {
    //     // Thêm yêu cầu tham gia tổ chức
    //     // thêm một yêu cầu tham gia tổ chức
    //     $validated = $request->validate([
    //         'id_member' => 'required|exists:users,id',
    //     ]);

    //     $validated['id_organization'] = $idOrganization;
    //     $validated['is_unconfirmed'] = true;

    //     $org_membership = OrgMembership::create($validated);

    //     return response()->json([
    //         'message' => 'Member request added successfully',
    //         'data' => new OrgMembershipResource($org_membership),
    //     ]);
    // }

    // public function getMemberRequests($idOrganization)
    // {
    //     // Lấy ra danh sách các yêu cầu tham gia tổ chức
    //     // Trả về danh sách các member mà unconfirmed : true
    //     $members_requests = OrgMembership::where('id_organization', $idOrganization)
    //         ->where('is_unconfirmed', true)
    //         ->get();

    //     return response()->json([
    //         'message' => 'Member requests retrieved successfully',
    //         'data' => OrgMembershipResource::collection($members_requests),
    //     ]);
    // }

    // public function getAllWorkspaceMembersById($idWorkspace)
    // {
    //     // Lấy ra danh sách các thành viên của tổ chức có name là $displayName
    //     // Trả về danh sách các thành viên đó
    //     $wks_membership = WorkspaceMembers::where('id_workspace', $idWorkspace)->get();

    //     if ($wks_membership->isEmpty()) {
    //         return response()->json(['message' => 'Workspace not found'], 404);
    //     }

    //     $workspace = Workspace::find($idWorkspace);
    //     // trường hợp có members
    //     // có trường hợp không có members : điều này là không thể vì mỗi workspace được tạo ra thì nó sẽ có luôn một memeber là người tạo ra nó;
    //     // trello có trường hợp phải có ít nhất một người trong workspace\

    //     return response()->json([
    //         'message' => 'Members retrieved successfully',
    //         'data' => [
    //             'desc'         => Str::limit($workspace->desc, 50),
    //             'displayName'  => $workspace->display_name,
    //             'id'           => $workspace->id,
    //             // 'members'      => MembersResource::collection($members),
    //             'memberships'  => WorkspaceMembersResource::collection($wks_membership)
    //         ]
    //     ]);
    // }
    public function getUserWorkspaces(){
        $user = Auth::user();

    // Lấy tất cả workspace_id mà user là thành viên
    $workspaceIds = WorkspaceMembers::where('user_id', $user->id)
        ->where('is_deactivated', false) // bỏ qua workspace đã deactivate nếu cần
        ->where('member_type','!=','pending')
        ->pluck('workspace_id');

    // Truy vấn danh sách workspace
    $workspaces = Workspace::whereIn('id', $workspaceIds)->get();

    return response()->json($workspaces);
        
    }
}
