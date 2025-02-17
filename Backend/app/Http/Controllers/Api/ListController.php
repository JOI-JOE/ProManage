<?php

namespace App\Http\Controllers\Api;


use App\Events\ListDragging;
use App\Events\ListReordered;
use App\Http\Requests\ListRequest;
use App\Http\Requests\ListUpdateNameRequest;
use App\Models\Board;
use App\Models\ListBoard;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

class ListController extends Controller
{

    public function index($boardId)
    {
        $lists = ListBoard::where('board_id', $boardId)
        ->where('closed', false)
        ->orderBy('position')->get();
        return response()->json($lists);
    }


    public function store(ListRequest $request)
    {
        try {
            $validated = $request->validated();

            $maxPosition = ListBoard::where('board_id', $validated['board_id'])->max('position');
            $newPosition = $maxPosition !== null ? $maxPosition + 1 : 1;

            $list = ListBoard::create([
                'name' => $validated['name'],
                'closed' => false,
                'position' => $newPosition,
                'board_id' => $validated['board_id'],
                'color_id' => $validated['color_id'] ?? null,
            ]);

            // Đảm bảo tất cả danh sách trong board có vị trí đúng
            $this->normalizePositions($validated['board_id']);
            return response()->json($list, 201);
        } catch (\Exception $e) {
            Log::error('Lỗi khi thêm mới danh sách: ' . $e->getMessage());
            return response()->json(['error' => 'Đã xảy ra lỗi khi thêm mới danh sách.'], 500);
        }
    }

    private function normalizePositions($boardId)
    {
        $lists = ListBoard::where('board_id', $boardId)->orderBy('position')->get();

        $position = 1;
        foreach ($lists as $list) {
            $list->update(['position' => $position]);
            $position++;
        }
    }



    public function updateName(ListUpdateNameRequest $request, string $id)
    {

        $validated = $request->validated();

        $list = ListBoard::find($id);

        if (!$list) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $list->name = $validated['name'];
        $list->save();

        return response()->json($list);
    }


    public function updateClosed($id)
    {
        $list = ListBoard::find($id);

        if (!$list) {
            return response()->json(['message' => 'Not found'], 404);
        }


        $list->closed = !$list->closed;
        $list->save();

        return response()->json([
            'message' => 'List archived successfully',
            'data' => $list
        ]);
    }

    public function dragging(Request $request)
    {
        broadcast(new ListDragging($request->board_id, $request->dragging_list_id, $request->position));
        return response()->json(['message' => 'Dragging event sent']);
    }

    public function reorder(Request $request)
    {

        $validatedData = $request->validate([
            'board_id' => 'required|exists:boards,id', // Đảm bảo board_id tồn tại
            'positions' => 'required|array',
            'positions.*.id' => 'required|exists:list_boards,id',
            'positions.*.position' => 'required|integer',
        ]);

        $boardId = $validatedData['board_id'];

        DB::transaction(function () use ($request) {
            foreach ($request->positions as $positionData) {
                ListBoard::where('id', $positionData['id'])->update(['position' => $positionData['position']]);
            }
        });

        $updatedLists = ListBoard::select('id', 'name', 'position')
            ->where('board_id', $boardId)
            ->where('closed', false)
            ->orderBy('position')
            ->get();


        broadcast(new ListReordered($request->board_id, $updatedLists));

        return response()->json(['message' => 'List positions updated successfully']);
    }


    public function updateColor(Request $request, string $id)
    {
        $request->validate([
            'color_id' => 'required|exists:colors,id'
        ]);

        $list = ListBoard::findOrFail($id);

        if (!$list) {
            return response()->json([
                'message' => 'khong thay id',
            ]);
        } else {
            $list->color_id = $request->color_id;
            $list->save();

            return response()->json([
                'message' => 'Color updated successfully!',
                'listBoard' => $list
            ]);
        }
    }

    public function getBoardsByWorkspace($id)
    {
        // Kiểm tra xem workspace có tồn tại không
        $workspace = Workspace::find($id);
        if (!$workspace) {
            return response()->json([
                'success' => false,
                'message' => 'Workspace không tồn tại'
            ], 404);
        }

        // Lấy danh sách boards của workspace
        $boards = Board::where('workspace_id', $id)->get();

        return response()->json([
            'success' => true,
            'workspace_id' => $id,
            'boards' => $boards
        ], 200);
    }
}
