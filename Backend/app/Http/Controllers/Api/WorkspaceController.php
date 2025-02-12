<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\WorkspaceRequest;
use App\Http\Resources\BoardResource;
use App\Http\Resources\WorkspaceResource;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;


class WorkspaceController extends Controller
{
    public function index()
    {
        $workspaces = Workspace::all();

        return response()->json([
            'data' => WorkspaceResource::collection($workspaces)
        ]);
    }

    public function show($id)
    {
        try {
            $workspace = Workspace::findOrFail($id);

            return response()->json([
                'data' => new WorkspaceResource($workspace),
                'boards' => BoardResource::collection($workspace->boards),
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'Workspace not found'], 404);
        }
    }

    public function store(WorkspaceRequest $request)
    {
        // Dữ liệu đã được validate trong WorkspaceRequest
        $validatedData = $request->validated();

        $validatedData['board_delete_restrict'] = json_encode($validatedData['board_delete_restrict'] ?? [
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
}
