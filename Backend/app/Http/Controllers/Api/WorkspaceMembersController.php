<?php

namespace App\Http\Controllers\Api;

use App\Events\SendRequestJoinWorkspace;
use App\Events\WorkspaceMemberUpdated;
use App\Http\Controllers\Controller;
use App\Http\Resources\WorkspaceMembersResource;
use App\Mail\WorkspaceInvitation;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitations;
use App\Models\WorkspaceMembers;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
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
            return response()->json(['error' => 'Không tìm thấy không gian làm việc'], 404);
        }

        // Find user by email
        $user = User::where('email', $validated['email'])->first();

        // Function to send notification
        $sendNotification = function ($recipient, $link) use ($workspace, $member, $validated) {
            try {
                $recipient->notify(new \App\Notifications\WorkspaceInvitationNotification(
                    $workspace->display_name,
                    $member->full_name,
                    $validated['message'] ?? null,
                    $link
                ));
            } catch (\Exception $e) {
                Log::error('Không thể gửi thông báo: ' . $e->getMessage());
            }
        };

        if ($user) {
            $existingMember = DB::table('workspace_members')
                ->where('workspace_id', $workspaceId)
                ->where('user_id', $user->id)
                ->first();

            if ($existingMember) {
                // If user is already a member
                if ($existingMember->member_type === 'pending' && !$existingMember->joined) {
                    // Update pending member to joined
                    DB::table('workspace_members')
                        ->where('id', $existingMember->id)
                        ->update([
                            'joined' => true,
                            'member_type' => WorkspaceMembers::$NORMAL,
                        ]);
                }

                // For existing members, use direct workspace link
                $link = env('FRONTEND_URL') . '/w/' . $workspaceId;

                // Send notification with direct link
                $sendNotification($user, $link);
                event(new \App\Events\MemberInvitedToWorkspace($workspaceId, $user));

                return response()->json([
                    'message' => $existingMember->joined
                        ? 'Người dùng đã là thành viên, đã gửi thông báo với đường dẫn trực tiếp'
                        : 'Trạng thái người dùng đã được cập nhật và gửi thông báo với đường dẫn trực tiếp'
                ], 200);
            }

            // New member: generate invite token and add to workspace_members
            $inviteToken = Str::uuid()->toString();
            $link = env('FRONTEND_URL') . '/invite/' . $workspaceId . '/' . $inviteToken;

            DB::table('workspace_members')->insert([
                'id' => Str::uuid(),
                'workspace_id' => $workspaceId,
                'user_id' => $user->id,
                'member_type' => WorkspaceMembers::$NORMAL,
                'joined' => true,
            ]);

            // Send notification with invite link
            $sendNotification($user, $link);
            event(new \App\Events\MemberInvitedToWorkspace($workspaceId, $user));

            return response()->json(['message' => 'Người dùng đã được thêm và gửi lời mời thành công'], 201);
        } else {
            // Non-existing user: create invitation with token
            $inviteToken = Str::uuid()->toString();
            $link = env('FRONTEND_URL') . '/invite/' . $workspaceId . '/' . $inviteToken;

            // Check for existing invitation
            $existingInvitation = WorkspaceInvitations::where('workspace_id', $workspaceId)
                ->where('email', $validated['email'])
                ->first();

            if ($existingInvitation) {
                // Update existing invitation
                $existingInvitation->update([
                    'invited_member_id' => $member->id,
                    'accept_unconfirmed' => true,
                    'invite_token' => $inviteToken,
                    'updated_at' => now(),
                ]);
            } else {
                // Create new invitation
                WorkspaceInvitations::create([
                    'id' => Str::uuid(),
                    'invited_member_id' => $member->id,
                    'email' => $validated['email'],
                    'accept_unconfirmed' => true,
                    'workspace_id' => $workspaceId,
                    'invite_token' => $inviteToken,
                ]);
            }

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
                Log::error('Không thể gửi email lời mời: ' . $e->getMessage());
            }

            return response()->json(['message' => 'Lời mời đã được gửi đến email mới'], 201);
        }
    }

    public function removeMemberFromWorkspace($workspaceId, $memberId, Request $request)
    {
        try {
            // Validate input parameters
            if (empty($workspaceId) || (!is_numeric($workspaceId) && !Str::isUuid($workspaceId))) {
                throw ValidationException::withMessages([
                    'workspace_id' => 'ID Không gian làm việc không hợp lệ.'
                ]);
            }

            if (empty($memberId)) {
                throw ValidationException::withMessages([
                    'member_id' => 'ID Người dùng không hợp lệ.'
                ]);
            }

            // Validate move_type if provided
            $moveType = $request->input('move_type');
            $allowedMoveTypes = ['request', 'guest', 'member', null];
            if (!in_array($moveType, $allowedMoveTypes, true)) {
                throw ValidationException::withMessages([
                    'move_type' => 'Loại chuyển động không hợp lệ. Phải là "request", "guest", "member" hoặc không được cung cấp.'
                ]);
            }

            // Check if user exists
            $user = User::find($memberId);
            if (!$user) {
                throw ValidationException::withMessages([
                    'member_id' => 'Người dùng không tồn tại.'
                ]);
            }

            // Check if workspace exists
            $workspace = Workspace::findOrFail($workspaceId);

            // Get current user
            $currentUser = Auth::user();
            $isSelfRemoval = $currentUser->id === $memberId;
            $isAdmin = WorkspaceMembers::where('workspace_id', $workspaceId)
                ->where('user_id', $currentUser->id)
                ->where('member_type', 'admin')
                ->exists();

            // Check permissions: either admin or self-removal
            if (!$isAdmin && !$isSelfRemoval) {
                return response()->json([
                    'message' => 'Bạn không có quyền thực hiện hành động này.'
                ], 403);
            }

            DB::beginTransaction();

            $results = [];
            $actionMessage = $isSelfRemoval ? 'rời khỏi' : 'loại bỏ';

            // Handle specific move_type if provided
            if ($moveType) {
                if ($moveType === 'member') {
                    // Case 1: Remove workspace member (normal or admin)
                    $workspaceMember = WorkspaceMembers::where('workspace_id', $workspaceId)
                        ->where('user_id', $memberId)
                        ->whereIn('member_type', ['normal', 'admin'])
                        ->first();

                    if ($workspaceMember) {
                        // Check if the user is the last admin
                        if ($workspaceMember->member_type === 'admin') {
                            $adminCount = WorkspaceMembers::where('workspace_id', $workspaceId)
                                ->where('member_type', 'admin')
                                ->count();

                            if ($adminCount <= 1) {
                                DB::rollBack();
                                return response()->json([
                                    'message' => 'Không thể xóa hoặc rời khỏi với tư cách admin cuối cùng của Không gian làm việc.'
                                ], 422);
                            }
                        }
                        $workspaceMember->delete();
                        $results[] = $isSelfRemoval
                            ? 'Bạn đã rời khỏi Không gian làm việc.'
                            : 'Đã loại bỏ thành viên khỏi Không gian làm việc.';
                        Log::info("Thành viên {$user->full_name} đã {$actionMessage} workspace {$workspace->name} bởi {$currentUser->full_name}.");
                        event(new WorkspaceMemberUpdated($workspaceId, $user, 'removed', null));
                    }
                } elseif ($moveType === 'guest') {
                    // Case 2: Remove guest (board member but not workspace member)
                    $isGuest = DB::table('board_members')
                        ->join('boards', 'board_members.board_id', '=', 'boards.id')
                        ->where('board_members.user_id', $memberId)
                        ->where('boards.workspace_id', $workspaceId)
                        ->whereNotExists(function ($query) use ($workspaceId, $memberId) {
                            $query->select(DB::raw(1))
                                ->from('workspace_members')
                                ->where('workspace_members.user_id', $memberId)
                                ->where('workspace_members.workspace_id', $workspaceId)
                                ->whereIn('member_type', ['normal', 'admin']);
                        })
                        ->exists();

                    if ($isGuest) {
                        $guestRemoved = DB::table('board_members')
                            ->join('boards', 'board_members.board_id', '=', 'boards.id')
                            ->where('board_members.user_id', $memberId)
                            ->where('boards.workspace_id', $workspaceId)
                            ->delete();

                        if ($guestRemoved) {
                            $results[] = $isSelfRemoval
                                ? 'Bạn đã rời khỏi các bảng trong workspace.'
                                : 'Đã loại bỏ thành viên guest khỏi workspace.';
                            Log::info("Guest {$user->full_name} đã {$actionMessage} các bảng trong workspace {$workspace->name} bởi {$currentUser->full_name}.");
                        }
                    }
                } elseif ($moveType === 'request') {
                    // Case 3: Remove pending request
                    $pendingRequest = WorkspaceMembers::where('workspace_id', $workspaceId)
                        ->where('user_id', $memberId)
                        ->where('member_type', 'pending')
                        ->where('joined', false)
                        ->first();

                    if ($pendingRequest) {
                        $pendingRequest->delete();
                        $results[] = $isSelfRemoval
                            ? 'Đã hủy yêu cầu tham gia workspace.'
                            : 'Đã hủy yêu cầu tham gia workspace.';
                        Log::info("Yêu cầu tham gia của {$user->full_name} đã bị hủy khỏi workspace {$workspace->name} bởi {$currentUser->full_name}.");
                    }
                }

                // If no results and a specific move_type was requested, return an error
                if (empty($results)) {
                    DB::rollBack();
                    return response()->json([
                        'message' => "Người dùng không có vai trò {$moveType} trong workspace."
                    ], 404);
                }
            } else {
                // No move_type specified, check all cases
                // Case 1: Remove workspace member (normal or admin)
                $workspaceMember = WorkspaceMembers::where('workspace_id', $workspaceId)
                    ->where('user_id', $memberId)
                    ->whereIn('member_type', ['normal', 'admin'])
                    ->first();

                if ($workspaceMember) {
                    // Check if the user is the last admin
                    if ($workspaceMember->member_type === 'admin') {
                        $adminCount = WorkspaceMembers::where('workspace_id', $workspaceId)
                            ->where('member_type', 'admin')
                            ->count();

                        if ($adminCount <= 1) {
                            DB::rollBack();
                            return response()->json([
                                'message' => 'Không thể xóa hoặc rời khỏi với tư cách admin cuối cùng của Không gian làm việc.'
                            ], 422);
                        }
                    }

                    $workspaceMember->delete();
                    $results[] = $isSelfRemoval
                        ? 'Bạn đã rời khỏi Không gian làm việc.'
                        : 'Đã loại bỏ thành viên khỏi Không gian làm việc.';
                    Log::info("Thành viên {$user->full_name} đã {$actionMessage} workspace {$workspace->name} bởi {$currentUser->full_name}.");
                    event(new WorkspaceMemberUpdated($workspaceId, $user, 'removed', null));
                }

                // Case 2: Remove guest (board member but not workspace member)
                $isGuest = DB::table('board_members')
                    ->join('boards', 'board_members.board_id', '=', 'boards.id')
                    ->where('board_members.user_id', $memberId)
                    ->where('boards.workspace_id', $workspaceId)
                    ->whereNotExists(function ($query) use ($workspaceId, $memberId) {
                        $query->select(DB::raw(1))
                            ->from('workspace_members')
                            ->where('workspace_members.user_id', $memberId)
                            ->where('workspace_members.workspace_id', $workspaceId)
                            ->whereIn('member_type', ['normal', 'admin']);
                    })
                    ->exists();

                if ($isGuest) {
                    $guestRemoved = DB::table('board_members')
                        ->join('boards', 'board_members.board_id', '=', 'boards.id')
                        ->where('board_members.user_id', $memberId)
                        ->where('boards.workspace_id', $workspaceId)
                        ->delete();

                    if ($guestRemoved) {
                        $results[] = $isSelfRemoval
                            ? 'Bạn đã rời khỏi các bảng trong workspace.'
                            : 'Đã loại bỏ thành viên guest khỏi workspace.';
                        Log::info("Guest {$user->full_name} đã {$actionMessage} các bảng trong workspace {$workspace->name} bởi {$currentUser->full_name}.");
                    }
                }

                // Case 3: Remove pending request
                $pendingRequest = WorkspaceMembers::where('workspace_id', $workspaceId)
                    ->where('user_id', $memberId)
                    ->where('member_type', 'pending')
                    ->where('joined', false)
                    ->first();

                if ($pendingRequest) {
                    $pendingRequest->delete();
                    $results[] = $isSelfRemoval
                        ? 'Đã hủy yêu cầu tham gia workspace.'
                        : 'Đã hủy yêu cầu tham gia workspace.';
                    Log::info("Yêu cầu tham gia của {$user->full_name} đã bị hủy khỏi workspace {$workspace->name} bởi {$currentUser->full_name}.");
                }

                if (empty($results)) {
                    DB::rollBack();
                    return response()->json([
                        'message' => 'Người dùng không phải là thành viên, guest, hoặc không có yêu cầu tham gia.'
                    ], 404);
                }
            }

            DB::commit();

            return response()->json([
                'message' => implode(' ', $results),
                'removed_user' => $user->full_name
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Dữ liệu đầu vào không hợp lệ.',
                'errors' => $e->errors()
            ], 422);
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            Log::error("Không tìm thấy Không gian làm việc với ID: {$workspaceId}");

            return response()->json([
                'message' => 'Không gian làm việc không tồn tại.',
                'error' => 'Workspace not found.'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Lỗi khi xóa thành viên khỏi workspace: {$e->getMessage()}");

            return response()->json([
                'message' => 'Đã xảy ra lỗi.',
                'error' => $e->getMessage()
            ], 500);
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
    // Thành viên là khách
    // case 1 - là ta có thể thêm họ vào workspace là cho họ lên normal và joined = true
    public function addNewMemberToWorkspace($workspaceId, $memberId)
    {
        try {
            // Validate input parameters
            if (empty($workspaceId) || (!is_numeric($workspaceId) && !Str::isUuid($workspaceId))) {
                throw ValidationException::withMessages([
                    'workspace_id' => 'ID Không gian làm việc không hợp lệ.'
                ]);
            }

            if (empty($memberId)) {
                throw ValidationException::withMessages([
                    'member_id' => 'ID Người dùng không hợp lệ.'
                ]);
            }

            // Check if user exists
            $user = User::find($memberId);
            if (!$user) {
                throw ValidationException::withMessages([
                    'member_id' => 'Người dùng không tồn tại.'
                ]);
            }

            // Check if workspace exists
            $workspace = Workspace::findOrFail($workspaceId);

            // Check admin permissions
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

            DB::beginTransaction();

            // Case 1: Check if user is a guest (board member but not workspace member)
            $isGuest = DB::table('board_members')
                ->join('boards', 'board_members.board_id', '=', 'boards.id')
                ->where('board_members.user_id', $memberId)
                ->where('boards.workspace_id', $workspaceId)
                ->whereNotExists(function ($query) use ($workspaceId, $memberId) {
                    $query->select(DB::raw(1))
                        ->from('workspace_members')
                        ->where('workspace_members.user_id', $memberId)
                        ->where('workspace_members.workspace_id', $workspaceId);
                })
                ->exists();

            if ($isGuest) {
                WorkspaceMembers::create([
                    'id' => Str::uuid(),
                    'workspace_id' => $workspaceId,
                    'user_id' => $memberId,
                    'member_type' => 'normal',
                    'is_unconfirmed' => 0,
                    'joined' => 1,
                    'is_deactivated' => 0,
                    'last_active' => now(),
                ]);

                Log::info("Guest {$user->full_name} đã được thêm vào workspace {$workspace->name} bởi {$currentUser->full_name}.");

                DB::commit();

                return response()->json([
                    'message' => 'Đã thêm thành viên guest vào workspace.',
                    'added_user' => $user->full_name
                ]);
            }

            // Case 2: Check if user has a pending request
            $pendingMember = WorkspaceMembers::where('workspace_id', $workspaceId)
                ->where('user_id', $memberId)
                ->where('member_type', 'pending')
                ->where('joined', false)
                ->first();

            if ($pendingMember) {
                $pendingMember->update([
                    'member_type' => 'normal',
                    'joined' => true,
                    'is_unconfirmed' => 0,
                    'last_active' => now(),
                ]);

                Log::info("Yêu cầu của {$user->full_name} đã được chấp thuận bởi {$currentUser->full_name}.");

                DB::commit();

                return response()->json([
                    'message' => 'Đã chấp thuận yêu cầu tham gia workspace.',
                    'added_user' => $user->full_name
                ]);
            }

            DB::rollBack();

            return response()->json([
                'message' => 'Người dùng không phải là guest hoặc chưa gửi yêu cầu tham gia.'
            ], 404);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Dữ liệu đầu vào không hợp lệ.',
                'errors' => $e->errors()
            ], 422);
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            Log::error("Không tìm thấy Không gian làm việc với ID: {$workspaceId}");

            return response()->json([
                'message' => 'Không gian làm việc không tồn tại.',
                'error' => 'Workspace not found.'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Lỗi khi thêm thành viên vào workspace: {$e->getMessage()}");

            return response()->json([
                'message' => 'Đã xảy ra lỗi.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    // case 2 - là họ đang là khác thì chúng ta có thể đuổi cố họ khỏi bảng đó là xóa họ khỏi board member luôn


    // Yêu cầu tham gia
    // Đây là những người member_type trong workspace_member là pending và chưa joined 
    // case 1 - cho họ vào workspace đay có thể là những thành vưa có thê là chưa tham gia vào workspace và cả board 
    // case 2 - là họ có thể là tham gia board rồi nhưng đang đợi để được tham gia workspace 
    // vậy khi ta sẽ xóa sổ họ trong workspace-member 
    public function sendJoinRequest($workspaceId)
    {
        try {
            // Lấy thông tin user đã xác thực
            $user = Auth::user();

            if (!$user instanceof \App\Models\User) {
                throw new \Exception('User không hợp lệ');
            }
            // Tìm workspace hoặc trả về lỗi nếu không tồn tại
            $workspace = Workspace::findOrFail($workspaceId);

            // Kiểm tra xem user đã là thành viên hoặc đã gửi yêu cầu chưa
            $existingMember = WorkspaceMembers::where('workspace_id', $workspaceId)
                ->where('user_id', $user->id)
                ->first();

            if ($existingMember) {
                return response()->json([
                    'message' => 'Người dùng đã là thành viên của workspace hoặc yêu cầu đã được gửi.'
                ], 400);
            }

            // Thêm vào workspace_members với trạng thái "pending"
            WorkspaceMembers::create([
                'id' => Str::uuid(),
                'workspace_id' => $workspaceId,
                'user_id' => $user->id,
                'member_type' => 'pending',
                'joined' => 0,
                'last_active' => now(),
            ]);

            // Gửi sự kiện broadcast đến các thành viên trong workspace
            event(new SendRequestJoinWorkspace($user, $workspace));

            // Log lại hành động
            Log::info("Người dùng {$user->name} ({$user->id}) đã gửi yêu cầu tham gia workspace {$workspace->name} ({$workspace->id}).");

            return response()->json([
                'message' => 'Yêu cầu tham gia workspace đã được gửi thành công.',
                'user_id' => $user->id,
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Dữ liệu đầu vào không hợp lệ.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error("Lỗi khi gửi yêu cầu tham gia workspace: {$e->getMessage()}");

            return response()->json([
                'message' => 'Đã xảy ra lỗi khi gửi yêu cầu tham gia workspace.',
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
