<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\WorkspaceRequest;
use App\Http\Resources\WorkspaceResource;
use App\Models\Workspace;
use App\Models\WorkspaceMembers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class WorkspaceController extends Controller
{
    // 1 Workspace - N Board
    // 
    /// Tối ưu cách lấy dữ liệu trong workspace
    public function index()
    {
        $userId = Auth::id();

        if (!$userId) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 401);
        }

        // Lấy danh sách workspaces mà user tham gia hoặc tạo
        $workspaces = DB::table('workspaces')
            ->leftJoin('workspace_members', function ($join) use ($userId) {
                $join->on('workspace_members.workspace_id', '=', 'workspaces.id')
                    ->where('workspace_members.user_id', '=', $userId)
                    ->where('workspace_members.joined', '=', 1) // Chỉ lấy workspace mà user đã tham gia
                    ->where('workspace_members.is_deactivated', '=', 0); // Không lấy thành viên bị vô hiệu hóa
            })
            ->select(
                'workspaces.id',
                'workspaces.name',
                'workspaces.display_name',
                'workspaces.id_member_creator',
                'workspaces.permission_level',
                'workspace_members.member_type', // Quyền của user (admin hoặc normal)
                'workspace_members.joined', // Trạng thái tham gia (luôn là 1)
                DB::raw('(SELECT COUNT(*) FROM workspace_members wm WHERE wm.workspace_id = workspaces.id) AS member_count'),
                DB::raw("IF(workspaces.id_member_creator = '$userId', TRUE, FALSE) AS is_creator")
            )
            ->where(function ($query) use ($userId) {
                $query->whereNotNull('workspace_members.user_id') // User đã tham gia
                    ->orWhere('workspaces.id_member_creator', '=', $userId); // Hoặc user là người tạo
            })
            ->distinct()
            ->get();

        if ($workspaces->isEmpty()) {
            // Nếu không có workspace, vẫn lấy các bảng cá nhân (Personal Boards)
            $personalBoards = DB::table('boards')
                ->leftJoin('board_members', function ($join) use ($userId) {
                    $join->on('board_members.board_id', '=', 'boards.id')
                        ->where('board_members.user_id', '=', $userId);
                })
                ->select(
                    'boards.id',
                    'boards.name',
                    'boards.workspace_id',
                    'boards.thumbnail',
                    'boards.visibility',
                    'boards.created_by',
                    'boards.created_at',
                    DB::raw("EXISTS (SELECT 1 FROM board_stars bs WHERE bs.board_id = boards.id AND bs.user_id = '$userId') AS starred"),
                    DB::raw('(SELECT COUNT(*) FROM board_members bm WHERE bm.board_id = boards.id) AS member_count')
                )
                ->where(function ($query) use ($userId) {
                    $query->where('boards.created_by', '=', $userId) // User là người tạo
                        ->orWhereNotNull('board_members.user_id'); // User là thành viên bảng
                })
                ->where('boards.closed', '=', 0)
                ->whereNull('boards.workspace_id') // Chỉ lấy bảng không thuộc workspace
                ->orderByRaw('starred DESC')
                ->orderBy('boards.created_at', 'desc')
                ->get();

            return response()->json([
                'workspaces' => [],
                'personal_boards' => $personalBoards,
                'id' => $userId
            ], 200);
        }

        // Lấy danh sách ID của workspaces
        $workspaceIds = $workspaces->pluck('id')->toArray();

        // Lấy tất cả boards mà user tham gia hoặc tạo (bao gồm cả Personal Boards)
        $boards = DB::table('boards')
            ->leftJoin('board_members', function ($join) use ($userId) {
                $join->on('board_members.board_id', '=', 'boards.id')
                    ->where('board_members.user_id', '=', $userId);
            })
            ->select(
                'boards.id',
                'boards.name',
                'boards.workspace_id',
                'boards.thumbnail',
                'boards.visibility',
                'boards.created_by',
                'boards.created_at',
                DB::raw("EXISTS (SELECT 1 FROM board_stars bs WHERE bs.board_id = boards.id AND bs.user_id = '$userId') AS starred"),
                DB::raw('(SELECT COUNT(*) FROM board_members bm WHERE bm.board_id = boards.id) AS member_count'),
                DB::raw("IF(boards.workspace_id IN ('" . implode("','", $workspaceIds) . "'), TRUE, FALSE) AS in_workspace")
            )
            ->where(function ($query) use ($userId) {
                $query->where('boards.created_by', '=', $userId) // User là người tạo
                    ->orWhereNotNull('board_members.user_id'); // User là thành viên bảng
            })
            ->where('boards.closed', '=', 0)
            ->orderByRaw('starred DESC')
            ->orderBy('boards.created_at', 'desc')
            ->get();

        // Phân loại boards
        $groupedBoards = [
            'in_workspace' => [],
            'personal' => []
        ];

        foreach ($boards as $board) {
            if ($board->in_workspace) {
                // Bảng thuộc workspace
                $groupedBoards['in_workspace'][$board->workspace_id][] = $board;
            } else {
                // Bảng không thuộc workspace (Personal Boards)
                $groupedBoards['personal'][] = $board;
            }
        }

        // Gắn boards vào workspaces
        $workspaces->transform(function ($workspace) use ($groupedBoards) {
            $workspace->boards = collect($groupedBoards['in_workspace'][$workspace->id] ?? []);
            return $workspace;
        });

        return response()->json([
            'workspaces' => $workspaces,
            'personal_boards' => $groupedBoards['personal'],
            'id' => $userId
        ], 200);
    }

    //-----------------------------------------------------------

    // public function index()
    // {
    //     try {
    //         $user = Auth::user(); // Lấy user hiện tại

    //         if (!$user) {
    //             return response()->json(['error' => 'Unauthorized'], 401);
    //         }

    //         // Lấy tất cả workspace mà user này đã tạo
    //         $workspaces = $user->workspaces;

    //         return WorkspaceResource::collection($workspaces);
    //     } catch (\Exception $e) {
    //         return response()->json(['error' => 'Something went wrong', 'message' => $e->getMessage()], 500);
    //     }
    // }
    public function showWorkspaceByName($workspaceName)
    {
        try {
            // Kiểm tra nếu tên workspace không hợp lệ
            if (!$workspaceName) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tên workspace không được để trống.',
                ], 400);
            }

            // Tìm workspace theo tên
            $workspace = Workspace::where('name', $workspaceName)
                ->with('markedBoards')
                ->first();
            // if ($workspace) {
            //     $markedBoards = $workspace->markedBoards(); // Lấy danh sách board có is_marked = 1
            // } else {
            //     $markedBoards = [];
            // }

            // Nếu không tìm thấy
            if (!$workspace) {
                Log::error("Không tìm thấy workspace: $workspaceName");
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy workspace.',
                ], 404);
            }

            // Trả về dữ liệu workspace
            return new WorkspaceResource($workspace);
        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy chi tiết workspace: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi lấy chi tiết workspace.',
            ], 500);
        }
    }
    public function getBoardMarkedByWorkspace($workspaceName)
    {
        try {
            $workspace = Workspace::where('name', $workspaceName)->first();
            $boardMarked = $workspace->boards()->where('is_marked', 1)->get();
            return response()->json([
                'success' => true,
                'data' => $boardMarked,
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi lấy danh sách board.',
            ]);
        }
    }
    public function showWorkspaceById($workspaceId)
    {
        try {
            $workspace = Workspace::findOrFail($workspaceId);
            return new WorkspaceResource($workspace);
        } catch (ModelNotFoundException $e) {
            Log::error("Không tìm thấy workspace ID: $workspaceId");
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy workspace.',
            ], 404);
        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy workspace: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi lấy workspace.',
            ], 500);
        }
    }
    public function store(WorkspaceRequest $request)
    {
        $user = Auth::user();
        $validatedData = $request->validated();

        // Bắt đầu transaction
        DB::beginTransaction();

        try {
            // Tạo workspace
            $workspace = Workspace::create([
                'name' => Workspace::generateUniqueName($validatedData['display_name']),
                'id_member_creator' => $user->id,
                'board_delete_restrict' => json_encode([
                    'private' => 'org',
                    'org' => 'org',
                    'enterprise' => 'org',
                    'public' => 'org',
                ]),
                'board_visibility_restrict' => json_encode([
                    'private' => 'org',
                    'org' => 'org',
                    'enterprise' => 'org',
                    'public' => 'org',
                ]),
                'display_name' => $validatedData['display_name'],
                ...Arr::except($validatedData, ['display_name']),
            ]);

            // Tạo workspace member
            WorkspaceMembers::create([
                'workspace_id' => $workspace->id,
                'user_id' => $user->id,
                'member_type' => WorkspaceMembers::$ADMIN,
                'joined' => true,
                'last_active' => now(),
            ]);

            // Commit transaction nếu mọi thứ thành công
            DB::commit();

            return response()->json([
                'message' => 'Workspace created successfully',
                'data' => new WorkspaceResource($workspace),
            ], 201);
        } catch (\Exception $e) {
            // Rollback transaction nếu có lỗi
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to create workspace',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function destroy(Workspace $workspace)
    {
        if ($workspace) {
            // Xóa tất cả các board liên quan trước khi xóa workspace
            $workspace->boards()->delete();

            $workspace->delete();
        } else {
            return response()->json(['error' => 'Workspace not found'], 404);
        }
    }
    public function updateWorkspaceInfo(Request $request, $id)
    {
        // Tìm workspace dựa trên ID
        $workspace = Workspace::find($id);

        // Nếu không tìm thấy workspace, trả về lỗi 404
        if (!$workspace) {
            return response()->json([
                'message' => 'Workspace not found.',
            ], 404);
        }

        // Validate dữ liệu đầu vào
        $validatedData = $request->validate([
            'name' => 'sometimes|string|max:255', // 'sometimes' để cho phép trường này không bắt buộc
            'display_name' => 'required|string|max:50|unique:workspaces,display_name,' . $id,
            'desc' => 'nullable|string|max:1000',
        ]);

        // Cập nhật workspace với dữ liệu đã validate
        $workspace->update($validatedData);

        return response()->json([
            'message' => 'Workspace updated successfully',
            'data' => new WorkspaceResource($workspace->fresh()), // Sử dụng fresh() để tải lại dữ liệu mới nhất
        ], 200);
    }
    public function permissionLevel(Request $request)
    {
        $validatedData = $request->validate([
            'private' => 'required|string',
            'public' => 'required|string',
        ]);

        $permissionLevels = [
            'private' => $validatedData['private'],
            'public' => $validatedData['public'],
        ];

        return response()->json([
            'data' => $permissionLevels,
        ]);
    }
    public function getWorkspaceInPulic(Request $request, $workspaceId)
    {
        try {
            // 🔹 Tìm workspace theo ID
            $workspace = Workspace::findOrFail($workspaceId);

            // 🔹 Kiểm tra tham số query
            $includeEnterprise = filter_var($request->query('enterprise', false), FILTER_VALIDATE_BOOLEAN);
            $fields = $request->query('fields', 'basic');
            $includeMembers = $request->query('members', false);
            $memberFields = $request->query('member_fields', '');

            // 🔹 Danh sách trường hợp lệ của thành viên
            $defaultMemberFields = [
                // 'workspace_members.user_id as id',  // 🔹 Sử dụng `user_id` thay vì `id`
                // 'users.full_name as fullName',
                'users.user_name'
            ];

            // 🔹 Nếu có member_fields, lọc các trường hợp lệ
            $selectedFields = [];
            if (!empty($memberFields)) {
                $allowedFields = array_map('trim', explode(',', $memberFields));
                $mappedFields = array_intersect_key(array_flip($allowedFields), array_flip($defaultMemberFields));
                $selectedFields = array_values(array_intersect($defaultMemberFields, array_keys($mappedFields)));
            }

            if (empty($selectedFields)) {
                $selectedFields = $defaultMemberFields;
            }

            // 🔹 Chuẩn bị response
            $response = [
                'id' => $workspace->id,
                'name' => $workspace->name,
                'enterprise' => $includeEnterprise,
            ];

            if ($fields === 'all') {
                $response['details'] = $workspace;
            }

            if ($includeMembers === 'all') {
                $response['members'] = DB::table('workspace_members')
                    ->join('users', 'workspace_members.user_id', '=', 'users.id')
                    ->where('workspace_members.workspace_id', $workspaceId)
                    ->select($selectedFields)
                    ->get();
            }

            return response()->json($response, 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Workspace không tồn tại!',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi lấy thông tin workspace!',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function getGuestWorkspaces(Request $request)
    {
        $user = $request->user();
        $guestWorkspaces = $user->guestWorkspaces()->get();

        return response()->json([
            'message' => 'Lấy thành công',
            'data' => $guestWorkspaces,
        ]);
    }
}
