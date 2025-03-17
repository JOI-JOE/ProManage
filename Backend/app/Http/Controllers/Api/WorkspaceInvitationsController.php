<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendWorkspaceEmailJob;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitations;
use App\Models\WorkspaceMembers;
use App\Services\GoogleService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WorkspaceInvitationsController extends Controller
{

    protected $googleService;

    public function __construct(GoogleService $googleService)
    {
        $this->googleService = $googleService;
    }

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
            $user = Auth::user(); // Lấy ID của người dùng hiện tại

            // Lấy lời mời do người dùng hiện tại tạo
            $invitation = WorkspaceInvitations::where('workspace_id', $workspaceId)
                ->where('invited_by_member_id', $user->id)
                ->first();

            if ($invitation) {
                return response()->json([
                    'invitationSecret'  => $invitation->invite_token,
                    'invitedByMemberId' => $invitation->invited_by_member_id,
                    'type'              => 'normal',
                ], 200);
            } else {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'No invitation secret found for this workspace or you do not have permission.',
                ], 404);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to retrieve invitation secret.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function createInvitationSecret($workspaceId, $acceptUnconfirmed = false)
    {
        try {
            $user = Auth::user();

            $invitation = WorkspaceInvitations::create([
                'invited_by_member_id' => $user->id,
                'workspace_id'         => $workspaceId,
                'invite_token'         => Str::uuid()->toString(),
                'accept_unconfirmed'   => $acceptUnconfirmed,
            ]);

            return response()->json([
                'secret' => $invitation->invite_token,
                'type'   => 'normal'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi tạo lời mời: ' . $e->getMessage(),
            ], 500);
        }
    }
    public function cancelInvitationSecret($workspaceId)
    {
        try {
            $user = Auth::user(); // Lấy thông tin người dùng hiện tại

            $invitation = WorkspaceInvitations::where('workspace_id', $workspaceId)
                ->where('invited_by_member_id', $user->id) // Chỉ xóa nếu là người tạo
                ->firstOrFail();

            $invitation->delete();

            return response()->json([
                'status'  => 'success',
                'message' => 'Lời mời đã bị hủy!',
            ], Response::HTTP_OK);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Bạn không có quyền hủy lời mời này!',
            ], Response::HTTP_FORBIDDEN); // 403: Forbidden
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Lỗi khi hủy lời mời: ' . $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function getInvitationSecretByReferrer($workspaceId, $inviteToken)
    {
        try {
            // Lấy lời mời cùng workspace liên quan
            $invitation = WorkspaceInvitations::where('workspace_id', $workspaceId)
                ->where('invite_token', $inviteToken)
                ->firstOrFail();


            return response()->json([
                'invite' => $invitation,
                'type'          => "normal"
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'isValid' => false,
                'message' => 'Workspace hoặc lời mời không tồn tại!',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'isValid' => false,
                'message' => 'Đã xảy ra lỗi khi xác thực lời mời!',
            ], 500);
        }
    }
    // Sử lý function tìm kiếm - hậu làm
    public function searchMembers(Request $request)
    {
        $queryText   = $request->input('query', '');
        $idWorkspace = (string) $request->input('idWorkspace');

        // 🔍 Truy vấn User dựa trên điều kiện tìm kiếm
        $users = User::select(['id', 'user_name', 'full_name', 'image', 'email'])
            ->where(function ($query) use ($queryText) {
                $query->where('user_name', 'LIKE', "$queryText%")
                    ->orWhere('full_name', 'LIKE', "$queryText%")
                    ->orWhere('email', 'LIKE', "$queryText%");
            })
            ->with([
                'workspaceMember:workspace_id,user_id,joined,member_type',
                'boardMember:board_id,user_id,joined'
            ])
            ->orderBy('id') // Tối ưu index
            ->limit(7) // 🔥 Giới hạn chỉ lấy 7 user
            ->get();

        // ✅ Xử lý dữ liệu
        $users = $users->map(function ($user) use ($queryText, $idWorkspace) {
            // Ép kiểu workspace ID thành chuỗi UTF-8
            $workspaceIds = $user->workspaceMember->pluck('workspace_id')
                ->map(fn($id) => (string) $id)
                ->toArray();

            // 🔥 Lọc những workspace có ID gần giống với `$idWorkspace`
            $filteredWorkspaces = array_values(array_filter($workspaceIds, function ($workspaceId) use ($idWorkspace) {
                $workspaceId = trim($workspaceId);
                $idWorkspace = trim($idWorkspace);

                if (!mb_check_encoding($workspaceId, 'UTF-8') || !mb_check_encoding($idWorkspace, 'UTF-8')) {
                    return false; // Bỏ qua nếu dữ liệu không hợp lệ
                }

                if ($workspaceId === $idWorkspace) {
                    return true; // Nếu ID trùng khớp hoàn toàn
                }

                if (is_numeric($workspaceId) && is_numeric($idWorkspace)) {
                    return abs((int) $workspaceId - (int) $idWorkspace) <= 1; // Nếu chênh lệch nhỏ
                }

                similar_text($workspaceId, $idWorkspace, $percent);
                return $percent > 80 || levenshtein($workspaceId, $idWorkspace) <= 2;
            }));

            // 🔹 Lấy loại thành viên (member_type)
            $memberType = optional($user->workspaceMember->firstWhere('workspace_id', $idWorkspace))->member_type;

            // 🔹 Dữ liệu trả về
            $data = [
                'id'          => $user->id,
                'user_name'   => $user->user_name,
                'full_name'   => $user->full_name,
                'initials'    => strtoupper(substr($user->full_name, 0, 1)), // Chữ cái đầu tiên
                'image'       => $user->image ?? null,
                'email'       => $user->email,
                'idBoards'    => $user->boardMember->pluck('board_id')->toArray(),
                'idWorkspace' => $filteredWorkspaces, // Lọc những workspace gần giống
                'memberType'  => $memberType,
                'similarity'  => $this->calculateSimilarityScore($user, $queryText, $idWorkspace),
                'joined'      => $user->workspaceMember->where('workspace_id', $idWorkspace)->where('joined', true)->isNotEmpty(),
            ];

            // 🔥 Đảm bảo UTF-8 hợp lệ trước khi trả về JSON
            array_walk_recursive($data, function (&$value) {
                if (is_string($value)) {
                    $value = mb_convert_encoding($value, 'UTF-8', 'UTF-8');
                }
            });

            return $data;
        });

        return response()->json($users, 200, [], JSON_UNESCAPED_UNICODE);
    }

    public function calculateSimilarityScore(User $user, $queryText, $idWorkspace)
    {
        $score = 0;

        // 🔍 Tính similarity giữa queryText và các trường của User
        $score += max(
            $this->calculateSimilarity($queryText, $user->user_name),
            $this->calculateSimilarity($queryText, $user->full_name),
            $this->calculateSimilarity($queryText, $user->email ?? '')
        );

        // ✅ Kiểm tra nếu User đã tham gia workspace
        $isJoinedWorkspace = $user->workspaceMember
            ->where('workspace_id', $idWorkspace)
            ->where('joined', true)
            ->isNotEmpty();

        if ($isJoinedWorkspace) {
            $score += 0.2; // Đã tham gia workspace
        }

        // ✅ Kiểm tra similarity giữa ID Workspace của User với $idWorkspace
        foreach ($user->workspaceMember as $workspace) {
            $workspaceSimilarity = $this->calculateSimilarity($idWorkspace, $workspace->workspace_id);
            if ($workspaceSimilarity > 0.7) { // Nếu ID khá giống nhau
                $score += 0.1;
            }
            // Nếu workspace_id khớp hoàn toàn và User đã tham gia workspace
            if ($isJoinedWorkspace && $workspace->workspace_id == $idWorkspace) {
                $score += 0.1;
            }
            //  Nếu user có role là admin hoặc normal thì tăng thêm điểm
            $isAdminOrNormal = $user->workspaceMember->contains(function ($workspace) {
                return in_array(optional($workspace)->member_type, ['admin', 'normal']);
            });

            if ($isAdminOrNormal) {
                $score += 0.2;
            }
        }

        //  Kiểm tra nếu User đã tham gia ít nhất một Board trong workspace hiện tại
        $isInBoard = $user->boardMember->contains(
            fn($boardMember) =>
            optional($boardMember->board)->workspace_id === $idWorkspace && $boardMember->joined
        );

        if ($isInBoard) {
            $score += 0.1;
        }

        return $score;
    }

    private function calculateSimilarity($query, $text)
    {
        if (!$text) return 0;
        similar_text(strtolower($query), strtolower($text), $percent);
        return $percent / 100;
    }
    // End

    public function confirmWorkspaceMembers($workspaceId, $memberId, Request $request)
    {
        // Lấy thông tin workspace và thành viên
        $workspace = Workspace::where('id', $workspaceId)->first(['display_name']);
        $member = WorkspaceMembers::where('workspace_id', $workspaceId)
            ->where('user_id', $memberId)
            ->first();

        if (!$member) {
            return response()->json(['message' => 'Member not found in workspace'], 404);
        }

        if ($member->joined) {
            return response()->json([
                'message' => 'Member already confirmed',
                'updated_member' => $member
            ], 200);
        }

        WorkspaceMembers::where('user_id', $memberId) // Sử dụng $memberId
            ->where('workspace_id', $workspaceId)
            ->update([
                'joined' => true,
                'member_type' => $member->member_type === 'pending' ? 'normal' : $member->member_type
            ]);
        // Gửi email xác nhận nếu có thông tin email
        $user = User::find($memberId);
        if ($user && $user->email) {
            $data = [
                'inviter_name' => $user->full_name,
                'workspace_name' => $workspace->display_name,
                'invite_link' => 'test',
                'invitationMessage' => $request->input('invitationMessage', '') ?? '' // Gộp message vào data
            ];
            $this->sendConfirmationEmail($user, $data);
        }
        return response()->json([
            'message' => 'Member confirmed successfully',
            'updated_member' => $member
        ], 200);
    }

    /**
     * Gửi email xác nhận cho thành viên mới
     */
    private function sendConfirmationEmail(User $user, array $data): void
    {
        try {
            // Lấy user đang xác nhận (admin hoặc người mời)
            /** @var \App\Models\User $adminUser */
            $adminUser = Auth::user();

            if (!$adminUser) {
                throw new \Exception("Admin user not authenticated");
            }

            // Kiểm tra token Google của admin
            if (!$adminUser->google_access_token) {
                throw new \Exception("Admin Google Access Token not found");
            }

            // Kiểm tra & làm mới token nếu cần
            $accessToken = $this->refreshTokenIfNeeded($adminUser);

            $recipientEmails = $user->email ? [$user->email] : [];

            // Gửi email bất đồng bộ thông qua queue
            dispatch(new SendWorkspaceEmailJob(
                $accessToken,
                $adminUser->full_name, // Tên hiển thị của người gửi (Admin)
                $adminUser->email,
                $recipientEmails, // Danh sách email người nhận
                "{$adminUser->full_name} đã mời bạn tham gia vào Không gian làm việc Promanage", // Tiêu đề email
                $data,
                'emails.invite' // Blade template của email
            ));
        } catch (\Exception $e) {
            Log::error("Gửi email xác nhận thất bại: " . $e->getMessage(), [
                'user_id' => $user->id,
                'admin_user_id' => $adminUser->id ?? null,
            ]);
        }
    }
    /**
     * Kiểm tra và làm mới access token nếu cần
     */
    private function refreshTokenIfNeeded(User $user): string
    {
        try {
            // Kiểm tra xem token có hết hạn không
            if ($this->googleService->isAccessTokenExpired($user->google_access_token)) {
                if (!$user->google_refresh_token) {
                    throw new \Exception('Access token expired and no refresh token available. Please re-authenticate.');
                }

                // Làm mới token
                $newToken = $this->googleService->refreshAccessToken($user->google_refresh_token, $user);

                // Cập nhật vào database
                $user->update([
                    'google_access_token' => $newToken['access_token'],
                    'google_refresh_token' => $newToken['refresh_token'] ?? $user->google_refresh_token,
                ]);

                return $newToken['access_token'];
            }

            return $user->google_access_token;
        } catch (\Exception $e) {
            Log::error("Lỗi khi refresh token: " . $e->getMessage(), [
                'user_id' => $user->id,
            ]);
            throw new \Exception("Không thể refresh token: " . $e->getMessage());
        }
    }
    // public function confirmWorkspaceMembers($workspaceId, $memberId, Request $request)
    // {
    //     // Tìm thành viên trong workspace
    //     $member = WorkspaceMembers::where('workspace_id', $workspaceId)
    //         ->where('user_id', $memberId)
    //         ->first();

    //     // Kiểm tra nếu không tìm thấy thành viên
    //     if (!$member) {
    //         return response()->json([
    //             'message' => 'Member not found in workspace'
    //         ], 404);
    //     }

    //     // Kiểm tra nếu thành viên đã xác nhận trước đó
    //     if ($member->joined) {
    //         return response()->json([
    //             'message' => 'Member already confirmed',
    //             'updated_member' => $member
    //         ], 200);
    //     }

    //     // Cập nhật trạng thái của thành viên
    //     WorkspaceMembers::where('workspace_id', $workspaceId)
    //         ->where('user_id', $memberId)
    //         ->update([
    //             'joined' => true,
    //             'member_type' => $member->member_type === 'pending' ? 'normal' : $member->member_type
    //         ]);

    //     // Gửi email xác nhận nếu có thông tin email
    //     $user = User::find($memberId);
    //     if ($user && $user->email) {
    //         $invitationMessage = $request->input('invitationMessage', '') ?? ''; // Đảm bảo luôn là chuỗi
    //         $this->sendConfirmationEmail($user, $invitationMessage);
    //     }

    //     return response()->json([
    //         'message' => 'Member confirmed successfully',
    //         'updated_member' => WorkspaceMembers::where('workspace_id', $workspaceId)
    //             ->where('user_id', $memberId)
    //             ->first()
    //     ], 200);
    // }

    // /**
    //  * Gửi email xác nhận cho thành viên mới
    //  */
    // private function sendConfirmationEmail(User $user, $invitationMessage = '')
    // {
    //     try {
    //         // Lấy user đang xác nhận (admin hoặc người mời)
    //         $adminUser = Auth::user();
    //         if (!$adminUser) {
    //             throw new \Exception("Admin user not authenticated");
    //         }

    //         // Kiểm tra token Google của admin
    //         if (!$adminUser->google_access_token) {
    //             throw new \Exception("Admin Google Access Token not found");
    //         }

    //         // Kiểm tra & làm mới token nếu cần
    //         $accessToken = $this->refreshTokenIfNeeded($adminUser, $adminUser->google_access_token, $adminUser->google_refresh_token);

    //         // Tạo nội dung email
    //         $emailBody = "Chào {$user->full_name}, bạn đã được xác nhận tham gia vào workspace!";
    //         if (!empty($invitationMessage)) {
    //             $emailBody .= "\n\n📩 Lời nhắn từ người mời:\n\"$invitationMessage\"";
    //         }

    //         // Gửi email bất đồng bộ
    //         dispatch(new SendWorkspaceEmailJob(
    //             $accessToken,
    //             $adminUser->full_name,
    //             [$user->email],
    //             "Xác nhận tham gia workspace",
    //             $emailBody
    //         ));
    //     } catch (\Exception $e) {
    //         Log::error("Gửi email xác nhận thất bại: " . $e->getMessage());
    //     }
    // }


    // /**
    //  * Kiểm tra và làm mới access token nếu cần
    //  */
    // private function refreshTokenIfNeeded($user, $accessToken, $refreshToken)
    // {
    //     if ($this->googleService->isAccessTokenExpired($accessToken)) {
    //         if (!$refreshToken) {
    //             throw new \Exception('Access token expired and no refresh token available. Please re-authenticate.');
    //         }

    //         // Làm mới token
    //         $newToken = $this->googleService->refreshAccessToken($refreshToken, $user);
    //         $accessToken = $newToken['access_token'];

    //         // Cập nhật vào database
    //         $user->update([
    //             'google_access_token' => $accessToken,
    //             'google_refresh_token' => $newToken['refresh_token'] ?? $user->google_refresh_token,
    //         ]);
    //     }

    //     return $accessToken;
    // }
}
