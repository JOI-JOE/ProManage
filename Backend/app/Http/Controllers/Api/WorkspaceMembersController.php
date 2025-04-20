<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\WorkspaceMembersResource;
use App\Mail\WorkspaceInvitation;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMembers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class WorkspaceMembersController extends Controller
{
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

        // Gửi email thông báo cho user
        try {
            Mail::to($user->email)
                ->queue(new WorkspaceInvitation($workspace->display_name, $user->full_name));
        } catch (\Exception $e) {
            // Ghi log lỗi nếu gửi email thất bại, nhưng không làm gián đoạn phản hồi
            Log::error('Failed to send workspace invitation email: ' . $e->getMessage());
        }

        return response()->json(['message' => 'User added to workspace successfully'], 201);
    }

    public function getUserWorkspaces()
    {
        $user = Auth::user();

        // Lấy tất cả workspace_id mà user là thành viên
        $workspaceIds = WorkspaceMembers::where('user_id', $user->id)
            ->where('is_deactivated', false) // bỏ qua workspace đã deactivate nếu cần
            ->where('member_type', '!=', 'pending')
            ->pluck('workspace_id');

        // Truy vấn danh sách workspace
        $workspaces = Workspace::whereIn('id', $workspaceIds)->get();

        return response()->json($workspaces);
    }
}
