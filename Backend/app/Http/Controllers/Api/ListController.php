<?php

namespace App\Http\Controllers\Api;

use App\Events\ListArchived;
use App\Events\ListClosed;
use App\Events\ListCreated;
use App\Events\ListNameUpdated;
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
        $board = Board::where('id', $boardId)
            ->with([
                'listBoards' => function ($query) {
                    $query->where('closed', false)
                        ->orderBy('position')
                        ->with(['cards' => function ($cardQuery) {
                            $cardQuery->where('is_archived', false) // Chỉ lấy card chưa bị lưu trữ
                            ->orderBy('position')
                            ->withCount('comments'); // Đếm số lượng comment của card
                        }]);
                }
            ])
            ->first();

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
            'creator' => $board->creator ? [
                'id' => $board->creator->id,
                'name' => $board->creator->full_name, 
                'email' => $board->creator->email, 
                'avatar' => $board->creator->image ?? null, 
            ] : null, // Kiểm tra nếu creator có tồn tại
            'columnOrderIds' => $board->listBoards->pluck('id')->toArray(), // Thứ tự danh sách (list_boards)
            'columns' => $board->listBoards->map(function ($list) {
                return [
                    'id' => $list->id,
                    'boardId' => $list->board_id,
                    'title' => $list->name, // Tên danh sách (list_boards)
                    'position' => (int) $list->position, // Vị trí của danh sách, đảm bảo là số nguyên
                    // 'colorId' => $list->color_id ?? null, // Màu sắc nếu có, mặc định là null nếu không có
                    'cardOrderIds' => $list->cards->pluck('id')->toArray(), // Danh sách thứ tự các card
                    'cards' => $list->cards->map(function ($card) {
                        return [
                            'id' => $card->id,
                            'columnId' => $card->list_board_id, // ID danh sách mà thẻ thuộc về
                            'title' => $card->title, // Tên thẻ
                            'description' => $card->description ?? '', // Mô tả, mặc định là chuỗi rỗng nếu không có
                            // 'thumbnail' => $card->thumbnail ?? null, // Ảnh thu nhỏ của thẻ, mặc định là null nếu không có
                            'position' => (int) $card->position, // Vị trí thẻ trong danh sách, đảm bảo là số nguyên
                            // 'startDate' => $card->start_date ?? null, // Ngày bắt đầu, mặc định là null nếu không có
                            // 'endDate' => $card->end_date ?? null, // Ngày kết thúc, mặc định là null nếu không có
                            // 'endTime' => $card->end_time ?? null, // Thời gian kết thúc, mặc định là null nếu không có
                            // 'isCompleted' => (bool) $card->is_completed, // Trạng thái hoàn thành
                            // 'isArchived' => (bool) $card->is_archived, // Trạng thái lưu trữ
                            // 'cover' => $card->cover ?? null, // Ảnh bìa nếu có, mặc định là null nếu không có
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
        // Validate dữ liệu từ request
        $validated = $request->validate([
            'newColumn' => 'required|array',
            'newColumn.board_id' => 'required|exists:boards,id', // Đảm bảo đúng board_id
            'newColumn.title' => 'required|string',
            'newColumn.position' => 'nullable|integer',
            // 'newColumn.color_id' => 'nullable|exists:colors,id',
        ]);

        $newColumn = $validated['newColumn'];
        $boardId = $newColumn['board_id'];

        // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
        $list = DB::transaction(function () use ($newColumn, $listBoard, $boardId) {
            // Tính toán position nếu không được truyền từ frontend
            $position = $newColumn['position'] ?? ($listBoard->where('board_id', $boardId)->max('position') + 1000);

            // Tạo danh sách mới
            $list = ListBoard::create([
                'name' => $newColumn['title'],
                'closed' => false,
                'position' => $position,
                'board_id' => $boardId,
            ]);

            // Broadcast sự kiện sau khi tạo thành công
            broadcast(new ListCreated($list))->toOthers();

            return $list;
        });

        // Lấy toàn bộ danh sách thuộc board sau khi thêm mới
        $lists = $listBoard->where('board_id', $boardId)
            ->orderBy('position')
            ->get()
            ->map(function ($list) {
                return [
                    'id' => $list->id,
                    'board_id' => $list->board_id,
                    'name' => $list->name,
                    'position' => $list->position,
                ];
            });

        // Trả về response JSON với toàn bộ danh sách
        return response()->json($lists, 201);
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

    public function reorder(Request $request)
    {
        $validatedData = $request->validate([
            'board_id' => 'required|exists:boards,id|integer', // Kiểm tra board_id có tồn tại không
            'positions' => 'required|array', // Đảm bảo positions là mảng
            'positions.*.id' => 'required|exists:list_boards,id|integer', // Kiểm tra id của từng list có tồn tại
            'positions.*.position' => 'required|integer', // Đảm bảo position là số
        ]);

        $boardId = $validatedData['board_id'];
        $updatedPositions = $validatedData['positions'];

        try {
            DB::transaction(function () use ($updatedPositions) {
                foreach ($updatedPositions as $positionData) {
                    // Cập nhật vị trí của từng danh sách (list)
                    ListBoard::where('id', $positionData['id'])->update(['position' => $positionData['position']]);
                }
            });

            // Lấy danh sách sau khi cập nhật từ DB
            $updatedLists = ListBoard::select('id', 'name', 'position')
                ->where('board_id', $boardId)
                ->where('closed', false)
                ->orderBy('position')
                ->get();

            broadcast(new ListReordered($boardId, $updatedLists));

            return response()->json([
                'message' => 'List positions updated successfully',
                'updated_lists' => $updatedLists
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Có lỗi xảy ra khi cập nhật vị trí danh sách',
                'message' => $e->getMessage()
            ], 500);
        }
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
