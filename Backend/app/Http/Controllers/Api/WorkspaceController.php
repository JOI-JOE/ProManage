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
            $workspaces = $user->workspaces;

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
            $workspace = Workspace::where('name', $workspaceName)->first();

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
        // Dữ liệu đã được validate trong WworkspaceRequest
        $user = Auth::user(); // Lấy user hiện tại


        $validatedData = $request->validated();

        $validatedData['name'] = Workspace::generateUniqueName($validatedData['display_name']);

        $validatedData['id_member_creator'] =  $user->id;

        $validatedData['board_delete_restrict'] = json_encode([
            'private' => 'org',
            'org' => 'org',
            'enterprise' => 'org',
            'public' => 'org',
        ]);

        $validatedData['board_visibility_restrict'] = json_encode([
            'private' => 'org',
            'org' => 'org',
            'enterprise' => 'org',
            'public' => 'org',
        ]);

        $workspace = Workspace::create($validatedData);

        return response()->json([
            'message' => 'Workspace created successfully',
            'data' => new WorkspaceResource($workspace),
        ], 201); // 201 Created
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

    /**
     * Summary of updateWorkspaceInfo
     * @param \App\Http\Requests\WorkspaceRequest $request
     * @param \App\Models\Workspace $workspace
     * @return mixed|\Illuminate\Http\JsonResponse
     * 
     * cập nhật các trường như name, display_name, desc
     * nó có sử dụng realtime event để cập nhật thông tin cho các thành viên trong workspace
     */
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
}
