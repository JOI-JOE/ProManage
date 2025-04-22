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

        // Find user by email first
        $user = User::where('email', $validated['email'])->first();

        $invitation = WorkspaceInvitations::create([
            'id' => Str::uuid(),
            'invited_member_id' => $member->id,
            'email' => $validated['email'],
            'accept_unconfirmed' => true,
            'workspace_id' => $workspaceId,
            'invite_token' => Str::uuid()->toString(),
        ]);

        if ($user) {
            // Check if user is already a member
            $isAlreadyMember = DB::table('workspace_members')
                ->where('workspace_id', $workspaceId)
                ->where('user_id', $user->id)
                ->exists();

            if ($isAlreadyMember) {
                return response()->json(['message' => 'User is already a member of this workspace'], 200);
            }

            // Add to workspace_members
            DB::table('workspace_members')->insert([
                'id' => Str::uuid(),
                'workspace_id' => $workspaceId,
                'user_id' => $user->id,
                'member_type' => WorkspaceMembers::$NORMAL,
                'joined' => true,
            ]);

            $link = env('FRONTEND_URL') . '/invite/' . $workspaceId . '/' . $invitation->invite_token;

            try {
                Mail::to($user->email)->queue(
                    new WorkspaceInvitation(
                        $workspace->display_name,
                        $member->full_name,
                        $validated['message'] ?? null,
                        $link
                    )
                );
            } catch (\Exception $e) {
                Log::error('Failed to send invitation email: ' . $e->getMessage());
            }

            return response()->json(['message' => 'User added and invited successfully'], 201);
        } else {
            // Handle non-existing user
            $link = env('FRONTEND_URL') . '/invite/' . $workspaceId . '/' . $invitation->invite_token;

            try {
                Mail::to($validated['email'])->queue(
                    new WorkspaceInvitation(
                        $workspace->display_name,
                        $member->full_name,
                        $validated['message'] ?? null,
                        $link
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

    public function changeType(Request $request, string $workspaceId, string $userId)
    {
        try {

            $validated = $request->validate([
                'member_type' => 'required|string|in:admin,normal',
            ]);
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
                throw new Exception('User is <n></n>ot a member of this workspace.');
            }

            // Update the member type
            $workspaceMember->member_type = $validated['member_type'];
            $workspaceMember->save();

            return response()->json(['data' => $workspace], 201);
        } catch (Exception $e) {
            throw new Exception('Failed to change member type: ' . $e->getMessage());
        }
    }

    public function joinWorkspace($workspaceId, $token)
    {
        // Tìm workspace invitation với token hợp lệ
        $invitation = WorkspaceInvitations::where('workspace_id', $workspaceId)
            ->where('invite_token', $token)
            ->first();

        if (!$invitation) {
            return response()->json([
                'message' => 'Liên kết không hợp lệ hoặc đã hết hạn.'
            ], 404);
        }

        // Kiểm tra workspace tồn tại
        $workspace = Workspace::find($workspaceId);
        if (!$workspace) {
            return response()->json([
                'message' => 'Workspace không tồn tại.'
            ], 404);
        }

        // Nếu chưa đăng nhập thì yêu cầu đăng nhập
        if (!auth()->check()) {
            return response()->json([
                'message' => 'Vui lòng đăng nhập để tham gia workspace.',
                'requires_login' => true
            ], 401);
        }

        $user = auth()->user();

        // Kiểm tra xem đã có trong workspace_members hay chưa
        $existingMember = WorkspaceMembers::where('workspace_id', $workspaceId)
            ->where('user_id', $user->id)
            ->first();

        if ($existingMember) {
            // Nếu đang là pending thì cập nhật thành normal + joined = true
            if ($existingMember->member_type === 'pending') {
                $existingMember->update([
                    'member_type' => 'normal',
                    'joined' => true,
                    'is_unconfirmed' => $invitation->accept_unconfirmed,
                    'last_active' => now(),
                    'is_deactivated' => false,
                ]);
            } else {
                return response()->json([
                    'message' => 'Bạn đã là thành viên của workspace này.'
                ], 400);
            }
        } else {
            // Nếu chưa có thì tạo mới
            WorkspaceMembers::create([
                'id' => Str::uuid(),
                'workspace_id' => $workspaceId,
                'user_id' => $user->id,
                'member_type' => 'normal',
                'is_unconfirmed' => $invitation->accept_unconfirmed,
                'joined' => true,
                'is_deactivated' => false,
                'last_active' => now(),
            ]);
        }

        // Cập nhật invitation nếu cần
        if ($invitation->invited_member_id === null) {
            $invitation->invited_member_id = $user->id;
            $invitation->save();
        }

        return response()->json([
            'message' => 'Tham gia workspace thành công!',
            'workspace_id' => $workspaceId,
        ]);
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
