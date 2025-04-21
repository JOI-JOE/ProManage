<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\WorkspaceMembersResource;
use App\Mail\WorkspaceInvitation;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitations;
use App\Models\WorkspaceMembers;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class WorkspaceMembersController extends Controller
{
    public function sendMemberWorkspace($workspaceId, Request $request)
    {
        $member = Auth::user();

        $validated = $request->validate([
            'email' => 'required|email',
            'memberId' => 'nullable|uuid',
            'message' => 'nullable|string',
        ]);

        $workspace = Workspace::find($workspaceId);
        if (!$workspace) {
            return response()->json(['error' => 'Workspace not found'], 404);
        }
        // Tìm user theo email
        $user = User::where('email', $validated['email'])->first();

        if ($user) {
            // Kiểm tra nếu đã là thành viên
            $isAlreadyMember = DB::table('workspace_members')
                ->where('workspace_id', $workspaceId)
                ->where('user_id', $user->id)
                ->exists();

            if ($isAlreadyMember) {
                return response()->json(['message' => 'User is already a member of this workspace'], 200);
            }

            // Thêm vào workspace_members
            DB::table('workspace_members')->insert([
                'id' => Str::uuid(),
                'workspace_id' => $workspaceId,
                'user_id' => $user->id,
                'member_type' => WorkspaceMembers::$NORMAL,
                'joined' => true,
            ]);

            $link = env('FRONTEND_URL') . '/' . $workspace->name;

            try {
                Mail::to($user->email)->queue(
                    new WorkspaceInvitation(
                        $workspace->display_name,
                        $member->full_name,
                        $validated['message'] ?? null,
                        $link // Đảm bảo link được truyền đúng vào mailable
                    )
                );
            } catch (\Exception $e) {
                Log::error('Failed to send invitation email: ' . $e->getMessage());
            }

            return response()->json(['message' => 'User added and invited successfully'], 201);
        } else {
            // Tạo invitation mới
            $invitation = WorkspaceInvitations::create([
                'id' => Str::uuid(),
                'invited_member_id' => $member->id,
                'email' => $validated['email'],
                'accept_unconfirmed' => true,
                'workspace_id'         => $workspaceId,
                'invite_token'         => Str::uuid()->toString(),
            ]);

            // Tạo link mời với invite_token
            $link = env('FRONTEND_URL') . '/' .  'invite' . '/' .  $workspaceId . '/' . $invitation->invite_token;

            try {
                Mail::to($validated['email'])->queue(
                    new WorkspaceInvitation(
                        $workspace->display_name,
                        $member->full_name,
                        $validated['message'] ?? null,
                        $link // Thêm link với token vào mailing
                    )
                );
            } catch (\Exception $e) {
                Log::error('Failed to send invitation email: ' . $e->getMessage());
            }

            return response()->json(['message' => 'Invitation sent to new email'], 201);
        }
    }

    public function removeMember($workspaceId, $userId)
    {
        try {
            // Validate workspace existence
            $workspace = Workspace::find($workspaceId);
            if (!$workspace) {
                throw new Exception('Workspace not found.');
            }

            // Validate user existence
            $user = User::find($userId);
            if (!$user) {
                throw new Exception('User not found.');
            }

            // Check if the user is a member of the workspace
            $workspaceMember = WorkspaceMembers::where('workspace_id', $workspaceId)
                ->where('user_id', $userId)
                ->first();

            if (!$workspaceMember) {
                throw new Exception('User is not a member of this workspace.');
            }

            // Nếu là admin, kiểm tra xem có phải admin cuối cùng không
            if ($workspaceMember->member_type === WorkspaceMembers::$ADMIN) {
                $adminCount = WorkspaceMembers::where('workspace_id', $workspaceId)
                    ->where('member_type', WorkspaceMembers::$ADMIN)
                    ->count();

                if ($adminCount <= 1) {
                    throw new Exception('Cannot remove the last admin of the workspace.');
                }
            }

            // Delete the workspace member record
            $workspaceMember->delete();

            return true;
        } catch (Exception $e) {
            throw new Exception('Failed to remove member: ' . $e->getMessage());
        }
    }

    public function changeType($workspaceId, $userId, $newType = 'normal')
    {
        try {
            // Validate workspace existence
            $workspace = Workspace::find($workspaceId);
            if (!$workspace) {
                throw new Exception('Workspace not found.');
            }

            // Validate user existence
            $user = User::find($userId);
            if (!$user) {
                throw new Exception('User not found.');
            }

            // Validate new member type
            $validTypes = ['admin', 'normal', 'pending'];
            if (!in_array($newType, $validTypes)) {
                throw new Exception('Invalid member type. Must be one of: ' . implode(', ', $validTypes));
            }

            // Check if the user is a member of the workspace
            $workspaceMember = WorkspaceMembers::where('workspace_id', $workspaceId)
                ->where('user_id', $userId)
                ->first();

            if (!$workspaceMember) {
                throw new Exception('User is not a member of this workspace.');
            }

            // Prevent changing the type of the workspace creator
            if ($workspace->id_member_creator === $userId && $newType !== 'admin') {
                throw new Exception('Cannot change the type of the workspace creator to non-admin.');
            }

            // Update the member type
            $workspaceMember->member_type = $newType;
            $workspaceMember->save();

            return true;
        } catch (Exception $e) {
            throw new Exception('Failed to change member type: ' . $e->getMessage());
        }
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
