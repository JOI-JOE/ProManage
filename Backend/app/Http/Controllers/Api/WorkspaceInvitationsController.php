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
            ->get()
            ->append('similarity');

        $users = $users->map(function ($user) use ($queryText, $idWorkspace) {
            // Ép kiểu workspace ID thành chuỗi UTF-8
            $workspaceIds = $user->workspaceMember->pluck('workspace_id')
                ->map(fn($id) => (string) $id)
                ->toArray();

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
    public function getInvitationSecretByReferrer($workspaceId, $inviteToken)
    {
        try {
            $invitation = WorkspaceInvitations::where('workspace_id', $workspaceId)
                ->where('invite_token', $inviteToken)
                ->with([
                    'inviter:id,full_name,email,user_name', // Load thông tin người mời
                    'workspace:id,name,display_name' // Load thông tin workspace
                ])
                ->firstOrFail();

            return response()->json([
                'memberInviter' => $invitation->inviter, // Thông tin người mời
                'workspace'     => $invitation->workspace, // Thông tin workspace
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
}
