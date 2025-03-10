<?php

namespace App\Http\Controllers\Api;

use App\Events\ListArchived;
use App\Events\ListClosed;
use App\Events\ListCreated;
use App\Events\ListNameUpdated;
use App\Events\ListReordered;
use App\Http\Requests\ListUpdateNameRequest;
use App\Models\Board;
use App\Models\ListBoard;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

class ListController extends Controller
{

    public function index($boardId)
    {
        $board = Board::with([
            'listBoards' => function ($query) {
                $query->where('closed', false)
                    ->orderBy('position')
                    ->with(['cards' => function ($cardQuery) {
                        $cardQuery->orderBy('position');
                    }])
                    ->withCount('cards'); // Đếm số thẻ trong danh sách
            }
        ])->find($boardId);

        if (!$board) {
            return response()->json(['message' => 'Board not found'], 404);
        }
        $responseData = [
            'id' => $board->id,
            'title' => $board->name, // Tên bảng (board)
            'description' => $board->description ?? '', // Mô tả, mặc định là chuỗi rỗng nếu không có
            'visibility' => $board->visibility, // Public hoặc Private
            'workspaceId' => $board->workspace_id, // ID của workspace chứa board
            'isMarked' => (bool) $board->is_marked, // Đánh dấu boolean
            'thumbnail' => $board->thumbnail ?? null, // Ảnh thu nhỏ của board, mặc định là null nếu không có
            'columns' => $board->listBoards->map(function ($list) {
                return [
                    'id' => $list->id,
                    'boardId' => $list->board_id,
                    'title' => $list->name, // Tên danh sách (list_boards)
                    'position' => (int) $list->position, // Vị trí của danh sách, đảm bảo là số nguyên
                    'cards' => $list->cards->map(function ($card) {
                        return [
                            'id' => $card->id,
                            'columnId' => $card->list_board_id, // ID danh sách mà thẻ thuộc về
                            'title' => $card->title, // Tên thẻ
                            'description' => $card->description ?? '', // Mô tả, mặc định là chuỗi rỗng nếu không có
                            'position' => (int) $card->position, // Vị trí thẻ trong danh sách, đảm bảo là số nguyên
                            'comments_count' => $card->comments_count,
                        ];
                    })->toArray(),
                ];
            })->toArray(),
        ];

        return response()->json($responseData);

    }

    public function getListClosed($boardId){
        try {
            // Lấy tất cả danh sách thuộc board có closed = 1
            $listsClosed = ListBoard::where('board_id', $boardId)
                ->where('closed', 1)
                ->get();
    
            return response()->json([
                'success' => true,
                'message' => 'Lấy danh sách đóng thành công',
                'data' => $listsClosed,
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra',
                  
                ]);
        }
    }

    public function destroy($id){
        try {
            $list = ListBoard::findOrFail($id);
            if (!$list) {
                return response()->json([
                    'message' => 'List not found'
                ], 404);
            }
            $list->delete();
            return response()->json([
                'message' => 'List deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete list',
                'error' => $e->getMessage()
            ], 500);
            //throw $th;
        }
    }


    public function store(Request $request, ListBoard $listBoard)
    {
        $validated = $request->validate([
            'newColumn' => 'required|array',
            'newColumn.board_id' => 'required|exists:boards,id',
            'newColumn.title' => 'required|string',
            'newColumn.position' => 'nullable|integer',
        ]);

        $newColumn = $validated['newColumn'];
        $boardId = $newColumn['board_id'];

        $list = DB::transaction(function () use ($newColumn, $boardId) {
            $position = $newColumn['position'] ?? (ListBoard::where('board_id', $boardId)->max('position') + 1000);

            $list = ListBoard::create([
                'name' => $newColumn['title'],
                'closed' => false,
                'position' => $position,
                'board_id' => $boardId,
            ]);
            return $list;
        });

        // Broadcast event sau khi transaction thành công
        broadcast(new ListCreated($list));

        return response()->json([
            'id'        => $list->id,
            'title'     => $list->name,
            'position'  => $list->position,
            'board_id'   => $list->board_id
        ], 201);
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

        broadcast(new ListNameUpdated($list));

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

        broadcast(new ListArchived($list));

        return response()->json([
            'message' => 'List archived successfully',
            'data' => $list
        ]);
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

    public function getListById($id)
    {
        // Tìm danh sách dựa trên listId
        $list = ListBoard::with('board', 'cards')->findOrFail($id);

        if (!$list) {
            return response()->json(['message' => 'List not found'], 404);
        }

        return response()->json($list);
    }
}
