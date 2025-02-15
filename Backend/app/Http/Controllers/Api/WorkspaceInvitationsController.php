<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitations;
use Illuminate\Http\Request;

class WorkspaceInvitationsController extends Controller
{
    // có gửi email
    // có gửi thông báo
    public function searchNewMembersToWorkspace(Request $request)
    {

        $queryText = $request->input('query');  // Từ khóa tìm kiếm (tên hoặc email)
        $workspaceId = $request->input('workspace_id'); // ID của workspace

        $members = User::where(function ($queryBuilder) use ($queryText) {
            $queryBuilder->where('user_name', 'LIKE', "%{$queryText}%")
                ->orWhere('full_name', 'LIKE', "%{$queryText}%")
                ->orWhere('email', 'LIKE', "%{$queryText}%");
        })
            ->limit(7)  // 🔹 Chỉ lấy tối đa 7 user
            ->get();



        return response()->json([
            'message' => 'Members retrieved successfully',
            'members' => $members
        ]);
    }

    public function inviteMemberToWorkspace(Request $request, $idWorkspace)
    {
        $workspace = Workspace::find($idWorkspace);
        if (!$workspace) {
            return response()->json(['message' => 'Workspace not found'], 404);
        }

        // 📌 nếu trường hợp truyền bằng email thì sau khi bấm entern sẽ được vào thẳng input luôn
        // 📌 nếu trường hợp display_name, user_name thì sẽ hiện ra một danh sách các người có thể mời và bạn phải bấm chọn
        /*📝 
            - nếu chọn tên có tồn tại thì nó sẽ trích xuất từ user_name đó sang -> id và từ đó ta có email để gửi cho member
            - nếu lấy email thì nó sẽ lấy luôn đường dẫn email -> khi bấm gửi thì nó sẽ gửi email mời người dùng vào trello
            */

        $memberInputs = $request->input('members', []); // Lấy danh sách nhập vào
        // ⚠️ => sẽ có 3 trường hợp input nhận vào 
        // Ngo Dang Hau    -> full_name
        // @haungodang2003 -> user_name
        // haungoadang2003@gmail.com ->email

        // 
        $members = [];
        foreach ($memberInputs as $member) {

            if (filter_var($member, FILTER_VALIDATE_EMAIL)) {
                // case 1: email 
                $result_member = User::where('email', $member)->first();
                if ($result_member) {
                    // case 1.1 : email exists in database, use user ID
                    $query = $result_member->id;
                } else {
                    // case 1.2: email does not exist in database
                    $query = $member;
                }
            } else {
                // case 2: @user_name or full_name
                $query = User::where('user_name', $member)
                    ->orWhere('full_name', $member)->pluck('id')
                    ->first();
            }

            if (!in_array($query, $members)) {
                $members[] = $query;
            }
        }


        return response()->json([
            'members' => $members
        ]);
    }

    // public function  addMemberDirect(Request $request, $idMember, $idWorkspace) {}
}
