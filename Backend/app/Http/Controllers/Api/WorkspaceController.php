<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\WorkspaceRequest;
use App\Http\Resources\BoardResource;
use App\Http\Resources\WorkspaceResource;
use App\Models\User;
use App\Models\Workspace;
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

    public function showDetailWorkspace($display_name)
    {
        try {
            // Tìm workspace theo display_name
            $workspace = Workspace::where('display_name', $display_name)->firstOrFail();

            // Trả về dữ liệu workspace nếu tìm thấy
            return new WorkspaceResource($workspace);
        } catch (ModelNotFoundException $e) {
            // Xử lý khi không tìm thấy workspace
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy workspace.',
            ], 404);
        } catch (\Throwable $th) {
            // Ghi log lỗi
            Log::error('Lỗi khi lấy chi tiết workspace: ' . $th->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi lấy chi tiết workspace.',
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            // Kiểm tra xem người dùng đã đăng nhập hay chưa
            if (!auth()->check()) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $user = auth()->user();

            // Lấy workspace của người dùng theo ID
            $workspace = $user->workspaces->findOrFail($id);

            return response()->json([
                'workspaces' => new WorkspaceResource($workspace),
                'boards' => BoardResource::collection($workspace->boards),
                // 'workspaces' => WorkspaceResource::collection($workspace),
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'Workspace not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Something went wrong', 'message' => $e->getMessage()], 500);
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
