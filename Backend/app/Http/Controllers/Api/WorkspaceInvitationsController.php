<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\Request;

class WorkspaceInvitationsController extends Controller
{
    // có gửi email
    // có gửi thông báo
    public function addMemberDirect(Request $request, $idMember, $idWorkspace)
    {
        // Thêm một thành viên vào tổ chức
        // thêm một thành viên vào workspace
        // tìm kiếm người dùng vào trong workspace
        // tìm kiếm xong thì post nó vào một trang chờ để được xác nhận
        // tiếp theo đó là bấm vào gửi lời mời
        // không cần người nhận chập nhận
        // ta có thêm thành viên mới




        // $validated['id_workspace'] = $idWorkspace;
        // $validated['id_member'] = $idMember;
        // $validated['is_unconfirmed'] = false;
        // $validated['joined'] = true;
        // $validated['is_deactivated'] = false;
        // $validated['activity_blocked'] = false;

        // $wks_membership = WorkspaceMembers::create($validated);

        return response()->json([
            'message' => 'Member added successfully',
        ]);
    }
}
