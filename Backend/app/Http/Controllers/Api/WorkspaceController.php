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
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class WorkspaceController extends Controller
{

    public function index()
    {
        try {
            $user = Auth::user(); // Lấy user hiện tại

            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Lấy tất cả workspace mà user này đã tạo
            $workspaces = $user->workspaces_2;

            return WorkspaceResource::collection($workspaces);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Something went wrong', 'message' => $e->getMessage()], 500);
        }
    }

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
        $userId = $request->user()->id;

        $guestWorkspaces = DB::table('workspaces')
            ->join('boards', 'workspaces.id', '=', 'boards.workspace_id')
            ->join('board_members', function ($join) use ($userId) {
                $join->on('boards.id', '=', 'board_members.board_id')
                    ->where('board_members.user_id', '=', $userId);
            })
            ->where('workspaces.id_member_creator', '!=', $userId) // Loại bỏ workspace do user sở hữu
            ->distinct()
            ->select('workspaces.id', 'workspaces.name')
            ->get();

        return response()->json([
            'message' => 'Lấy thành công không gian làm việc khách',
            'data' => $guestWorkspaces,
        ]);
    }

    public function getUserWorkspaces(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Lấy tất cả workspace mà user đã tạo (kèm theo board, list, card)
            $ownedWorkspaces = Workspace::where('id_member_creator', $user->id)
                ->with([
                    'boards' => function ($query) {
                        $query->select('id', 'workspace_id', 'name', 'closed')
                            ->with([
                                'lists' => function ($listQuery) {
                                    $listQuery->select('id', 'board_id', 'name', 'closed')
                                        ->with([
                                            'cards' => function ($cardQuery) {
                                                $cardQuery->select('id', 'list_board_id', 'title', 'position', 'is_archived'); // Thêm các field nếu cần
                                            }
                                        ]);
                                }
                            ]);
                    }
                ])
                ->get();

            // Lấy tất cả workspace mà user tham gia nhưng không phải là chủ sở hữu
            $guestWorkspaces = Workspace::whereHas('boards.boardMembers', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
                ->where('id_member_creator', '!=', $user->id)
                ->with([
                    'boards' => function ($query) use ($user) {
                        $query->whereHas('boardMembers', function ($q) use ($user) {
                            $q->where('user_id', $user->id);
                        })
                            ->select('id', 'workspace_id', 'name', 'closed')
                            ->with([
                                'lists' => function ($listQuery) {
                                    $listQuery->select('id', 'board_id', 'name', 'closed')
                                        ->with([
                                            'cards' => function ($cardQuery) {
                                                $cardQuery->select('id', 'list_board_id', 'title', 'position', 'is_archived');
                                            }
                                        ]);
                                }
                            ]);
                    }
                ])
                ->distinct()
                ->get();

            return response()->json([
                'message' => 'Lấy danh sách không gian làm việc thành công',
                'owned_workspaces' => $ownedWorkspaces,
                'guest_workspaces' => $guestWorkspaces,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Something went wrong',
                'message' => $e->getMessage(),
                'line' => $e->getLine(), // tiện debug
            ], 500);
        }
    }


}
