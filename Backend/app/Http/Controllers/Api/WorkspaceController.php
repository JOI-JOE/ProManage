<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\WorkspaceRequest;
use App\Http\Resources\BoardResource;
use App\Http\Resources\WorkspaceResource;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;


class WorkspaceController extends Controller
{

    public function index()
    {
        try {
            $user = Auth::user(); // Lấy user hiện tại

            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $workspaces = $user->workspaces;

            return response()->json([
                'success' => true,
                'data' => $workspaces,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Something went wrong', 'message' => $e->getMessage()], 500);
        }
    }

    public function show_deltail_workspace($id)
    {
        try {
            $workspace = Workspace::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $workspace,
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,

            ]);
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
        // Dữ liệu đã được validate trong WorkspaceRequest
        $validatedData = $request->validated();

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
    public function updateWorkspaceInfo(WorkspaceRequest $request, Workspace $workspace)
    {
        if ($workspace) {

            $validatedData = $request->validated();

            // Cập nhật organization với dữ liệu đã được validate
            $workspace->update($validatedData);


            return response()->json([
                'message' => 'Workspace updated successfully',
                'data' => new WorkspaceResource($workspace),
            ], 200); // 200 OK

        } else {
            return response()->json(['error' => 'Workspace not found'], 404);
        }
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
