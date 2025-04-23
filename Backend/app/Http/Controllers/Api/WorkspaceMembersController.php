<?php

namespace App\Http\Controllers\Api;

use App\Events\WorkspaceMemberUpdated;
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
use Illuminate\Validation\ValidationException;

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

        $link = env('FRONTEND_URL') . '/invite/' . $workspaceId . '/' . $invitation->invite_token;


        $sendNotification = function ($recipient) use ($workspace, $member, $validated, $link) {
            try {
                $recipient->notify(new \App\Notifications\WorkspaceInvitationNotification(
                    $workspace->display_name,
                    $member->full_name,
                    $validated['message'] ?? null,
                    $link
                ));
            } catch (\Exception $e) {
                Log::error('Failed to send notification: ' . $e->getMessage());
            }
        };

        if ($user) {
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

            // Gửi notification cho user
            $sendNotification($user);

            event(new \App\Events\MemberInvitedToWorkspace($workspaceId, $user));

            return response()->json(['message' => 'User added and invited successfully'], 201);
        } else {
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

            // Gửi sự kiện cập nhật thành viên
            event(new WorkspaceMemberUpdated($workspaceId, $user, 'removed', null));

            return true;
        } catch (Exception $e) {
            throw new Exception('Failed to remove member: ' . $e->getMessage());
        }
    }

    public function changeType(Request $request, string $workspaceId, string $userId)
    {
        try {

            // Validate the request input
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
                throw new Exception('User is not a member of this workspace.');
            }

            // Update the member type
            $workspaceMember->member_type = $validated['member_type'];
            $workspaceMember->save();

            // Dispatch the event after the update
            event(new WorkspaceMemberUpdated(
                $workspaceId,
                $user,
                'updated', // The action here is 'updated'
                $validated['member_type']
            ));

            // Return success response
            return response()->json(['data' => $workspace], 201);
        } catch (Exception $e) {
            // Handle exceptions and return a failure response
            return response()->json(['error' => 'Failed to change member type: ' . $e->getMessage()], 500);
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

    public function addGuestToWorkspace($workspaceId, $memberId)
    {
        try {
            // Kiểm tra memberId tồn tại trong bảng users
            if (!User::where('id', $memberId)->exists()) {
                throw ValidationException::withMessages([
                    'member_id' => 'Người dùng không tồn tại.'
                ]);
            }

            // Kiểm tra workspace tồn tại
            $workspace = Workspace::findOrFail($workspaceId);

            // Kiểm tra quyền của người dùng (phải là admin của workspace)
            $currentUser = Auth::user();
            $isAdmin = WorkspaceMembers::where('workspace_id', $workspaceId)
                ->where('user_id', $currentUser->id)
                ->where('member_type', 'admin')
                ->exists();

            if (!$isAdmin) {
                return response()->json([
                    'message' => 'Bạn không có quyền thực hiện hành động này.'
                ], 403);
            }

            // DB::raw(1) chỉ là một giá trị "giả lập" (dummy value) dùng để biểu thị rằng chỉ cần có một dòng tồn tại trong truy vấn con (subquery)
            // Kiểm tra xem user có tồn tại trong board_members nhưng không có trong workspace_members
            $guest = User::where('id', $memberId)
                ->whereExists(function ($query) use ($workspaceId) {
                    $query->select(DB::raw(1))
                        ->from('board_members')
                        ->join('boards', 'board_members.board_id', '=', 'boards.id')
                        ->whereColumn('board_members.user_id', 'users.id')
                        ->where('boards.workspace_id', $workspaceId);
                })
                ->whereNotExists(function ($query) use ($workspaceId) {
                    $query->select(DB::raw(1))
                        ->from('workspace_members')
                        ->whereColumn('workspace_members.user_id', 'users.id')
                        ->where('workspace_members.workspace_id', $workspaceId);
                })
                ->first();

            if (!$guest) {
                return response()->json([
                    'message' => 'Người dùng không phải là guest hoặc đã là thành viên của workspace.'
                ], 404);
            }

            // Bắt đầu giao dịch để đảm bảo tính toàn vẹn dữ liệu
            DB::beginTransaction();

            // Thêm người dùng vào workspace_members
            WorkspaceMembers::create([
                'id' => Str::uuid(),
                'workspace_id' => $workspaceId,
                'user_id' => $guest->id,
                'member_type' => 'normal',
                'is_unconfirmed' => 0,
                'joined' => 1,
                'is_deactivated' => 0,
                'last_active' => now(),
            ]);

            // Ghi log hoạt động
            Log::info("Người dùng {$guest->full_name} đã được thêm vào workspace {$workspace->name} bởi {$currentUser->full_name}.");

            DB::commit();

            return response()->json([
                'message' => 'Đã thêm thành công thành viên guest vào workspace.',
                'added_user' => $guest->full_name
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Dữ liệu đầu vào không hợp lệ.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Lỗi khi thêm guest vào workspace: {$e->getMessage()}");
            return response()->json([
                'message' => 'Đã xảy ra lỗi khi thêm thành viên vào workspace.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /// -------------------------------------------------------------------------

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
