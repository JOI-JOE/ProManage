<?php

namespace App\Http\Controllers\Api;

use App\Events\ListCreated;
use App\Events\ListUpdated;
use App\Models\Board;
use App\Models\ListBoard;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

class ListController extends Controller
{
    // ----------------------------------------------------
    // public function show($boardId)
    // {
    //     $userId = auth()->id();

    //     // 1. Lấy thông tin board cơ bản và kiểm tra tồn tại
    //     $board = DB::table('boards')
    //         ->select('id', 'visibility', 'workspace_id')
    //         ->where('id', $boardId)
    //         ->first();

    //     if (!$board) {
    //         return response()->json(['message' => 'Board not found'], 404);
    //     }

    //     // 2. Kiểm tra quyền truy cập
    //     if (!$this->hasBoardAccess($board, $userId)) {
    //         return response()->json(['message' => 'Access denied'], 403);
    //     }

    //     // 3. Lấy danh sách lists và cards trong một query duy nhất
    //     $lists = DB::table('list_boards')
    //         ->where('board_id', $boardId)
    //         ->where('closed', 0)
    //         ->orderBy('position')
    //         ->get(['id', 'name', 'position', 'closed', 'board_id']);

    //     // Nếu không có lists thì trả về luôn
    //     if ($lists->isEmpty()) {
    //         return response()->json([
    //             'id' => $board->id,
    //             'lists' => []
    //         ], 200);
    //     }

    //     // 4. Lấy tất cả cards thuộc các lists trong một query
    //     $cards = DB::table('cards')
    //         ->whereIn('list_board_id', $lists->pluck('id'))
    //         ->where('is_archived', 0)
    //         ->orderBy('position')
    //         ->get(['id', 'title', 'list_board_id', 'position', 'is_archived']);

    //     // 5. Nhóm cards theo list_board_id để tối ưu hiệu năng
    //     $groupedCards = $cards->groupBy('list_board_id');

    //     // 6. Format dữ liệu response
    //     $response = [
    //         'id' => $board->id,
    //         'lists' => $lists->map(function ($list) use ($groupedCards) {
    //             return [
    //                 'id' => $list->id,
    //                 'name' => $list->name,
    //                 'position' => (float)$list->position,
    //                 'closed' => (bool)$list->closed,
    //                 'cards' => isset($groupedCards[$list->id])
    //                     ? $groupedCards[$list->id]->map(function ($card) {
    //                         return [
    //                             'id' => $card->id,
    //                             'title' => $card->title,
    //                             'list_board_id' => $card->list_board_id,
    //                             'position' => (float)$card->position,
    //                             'closed' => (bool)$card->is_archived,
    //                         ];
    //                     })->values()
    //                     : []
    //             ];
    //         })->values()
    //     ];

    //     return response()->json($response, 200);
    // }

    public function show($boardId, Request $request)
    {
        $userId = auth()->id();

        // 1. Lấy thông tin board cơ bản và kiểm tra tồn tại
        $board = DB::table('boards')
            ->select('id', 'visibility', 'workspace_id')
            ->where('id', $boardId)
            ->first();

        if (!$board) {
            return response()->json(['message' => 'Board not found'], 404);
        }

        // 2. Kiểm tra quyền truy cập
        if (!$this->hasBoardAccess($board, $userId)) {
            return response()->json(['message' => 'Access denied'], 403);
        }

        // 3. Lấy danh sách lists với phân trang (mặc định 5 list mỗi lần)
        $listsPerPage = 5; // Số lượng list mỗi lần
        $listsPage = $request->query('page', 1);
        $lists = DB::table('list_boards')
            ->where('board_id', $boardId)
            ->where('closed', 0)
            ->orderBy('position')
            ->paginate($listsPerPage, ['*'], 'page', $listsPage);

        // Nếu không có lists thì trả về luôn
        if (empty($lists->items())) {
            return response()->json([
                'id' => $board->id,
                'lists' => [],
                'pagination' => [
                    'total_lists' => 0,
                    'per_page_lists' => $listsPerPage,
                    'current_page_lists' => $listsPage,
                    'has_more_lists' => false
                ]
            ], 200);
        }

        // 4. Lấy tất cả list IDs để query cards
        $listIds = array_column($lists->items(), 'id');

        // 5. Lấy cards với phân trang (10 cards mỗi list)
        $cardsPerPage = 10;
        $cardsPage = $request->query('cards_page', 1);

        $cardsQuery = DB::table('cards')
            ->whereIn('list_board_id', $listIds)
            ->where('is_archived', 0)
            ->orderBy('position')
            ->paginate($cardsPerPage * count($listIds), ['*'], 'page', $cardsPage);

        // 6. Nhóm cards theo list_board_id
        $groupedCards = [];
        foreach ($cardsQuery->items() as $card) {
            $groupedCards[$card->list_board_id][] = [
                'id' => $card->id,
                'title' => $card->title,
                'list_board_id' => $card->list_board_id,
                'position' => (float)$card->position,
                'closed' => (bool)$card->is_archived,
            ];
        }

        // 7. Format dữ liệu response
        $formattedLists = [];
        foreach ($lists->items() as $list) {
            $formattedLists[] = [
                'id' => $list->id,
                'name' => $list->name,
                'position' => (float)$list->position,
                'closed' => (bool)$list->closed,
                'cards' => $groupedCards[$list->id] ?? [],
            ];
        }

        // Kiểm tra xem có dữ liệu tiếp theo không để quyết định `has_more_lists`
        $hasMoreLists = $lists->hasMorePages();
        $hasMoreCards = $cardsQuery->hasMorePages();

        return response()->json([
            'id' => $board->id,
            'lists' => $formattedLists,
            'pagination' => [
                'total_lists' => $lists->total(),
                'per_page_lists' => $listsPerPage,
                'current_page_lists' => $listsPage,
                'has_more_lists' => $hasMoreLists,
                'total_cards' => $cardsQuery->total(),
                'per_page_cards' => $cardsPerPage,
                'current_page_cards' => $cardsPage,
                'has_more_cards' => $hasMoreCards
            ]
        ], 200);
    }
    /**
     * Kiểm tra quyền truy cập nghiêm ngặt
     * Chỉ trả về true nếu user có quyền xem board
     */
    private function hasBoardAccess($board, $userId)
    {
        // Nếu là thành viên của board
        if (DB::table('board_members')->where('board_id', $board->id)->where('user_id', $userId)->exists()) {
            return true;
        }

        // Nếu board public
        if ($board->visibility === 'public') {
            return true;
        }

        // Nếu board thuộc workspace và user là thành viên workspace
        if ($board->visibility === 'workspace' && $board->workspace_id) {
            return DB::table('workspace_members')
                ->where('workspace_id', $board->workspace_id)
                ->where('user_id', $userId)
                ->exists();
        }

        // Các trường hợp khác không có quyền
        return false;
    }
    // ----------------------------------------------------

    public function index($boardId)
    {
        $board = Board::where('id', $boardId)
            ->with([
                'listBoards' => function ($query) {
                    $query->where('closed', false)
                        ->orderBy('position')
                        ->with([
                            'cards' => function ($cardQuery) {
                                $cardQuery->orderBy('position')
                                    ->withCount('comments')
                                    ->with([
                                        'checklists' => function ($checklistQuery) {
                                            $checklistQuery->with('items');
                                        },
                                        'labels' // Thêm mối quan hệ labels
                                    ]);
                            }
                        ]);
                },
                'workspace.members', // Lấy danh sách thành viên của workspace
                'members' // Lấy danh sách thành viên của board

            ])
            ->first();

        if (!$board) {
            return response()->json(['message' => 'Board not found'], 404);
        }

        $responseData = [
            'id' => $board->id,
            'title' => $board->name,
            'description' => $board->description ?? '',
            'visibility' => $board->visibility,
            'workspaceId' => $board->workspace_id,
            'isMarked' => (bool) $board->is_marked,
            'thumbnail' => $board->thumbnail ?? null,
            'columns' => $board->listBoards->map(function ($list) {
                return [
                    'id' => $list->id,
                    'boardId' => $list->board_id,
                    'title' => $list->name,
                    'position' => (int) $list->position,
                    'cards' => $list->cards->map(function ($card) {
                        return [
                            'id' => $card->id,
                            'columnId' => $card->list_board_id,
                            'title' => $card->title,
                            'description' => $card->description ?? '',
                            'position' => (int) $card->position,
                            'comments_count' => $card->comments_count,
                            'is_archived' => (bool) $card->is_archived,
                            'checklists' => $card->checklists->map(function ($checklist) {
                                return [
                                    'id' => $checklist->id,
                                    'card_id' => $checklist->card_id,
                                    'name' => $checklist->name,
                                    'items' => $checklist->items->map(function ($item) {
                                        return [
                                            'id' => $item->id,
                                            'checklist_id' => $item->checklist_id,
                                            'name' => $item->name,
                                            'is_completed' => (bool) $item->is_completed,
                                        ];
                                    })->toArray(),
                                ];
                            })->toArray(),
                            'labels' => $card->labels->map(function ($label) {
                                return [
                                    'id' => $label->id,
                                    'card_id' => $label->card_id,
                                    'color' => $label->color,
                                    'text' => $label->text,
                                ];
                            })->toArray(),
                        ];
                    })->toArray(),
                ];
            })->toArray(),
        ];
        return response()->json($responseData);
    }

    public function getListClosed($boardId)
    {
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
    public function destroy($id)
    {
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
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'boardId' => 'required|exists:boards,id',
                'name' => 'required|string',
                'pos' => 'required|numeric', // Thêm numeric để đảm bảo position là số
            ]);

            $list = ListBoard::create([
                'board_id' => $validated['boardId'],
                'name' => $validated['name'],
                'position' => $validated['pos'],
            ]);

            broadcast(new ListCreated($list))->toOthers();

            return response()->json([
                'success' => true,
                'list' => [
                    'id' => $list->id,
                    'name' => $list->name,
                    'position' => $list->position,
                    'board_id' => $list->board_id,
                    'closed' => $list->closed
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create list',
                'error' => $e->getMessage()
            ], 400);
        }
    }
    public function update(Request $request, $listId)
    {
        // Tìm list theo ID
        $list = ListBoard::find($listId);
        if (!$list) {
            return response()->json(['message' => 'List not found'], 404);
        }

        // Validation rules: 'name', 'closed' và 'position' đều có thể có trong request
        $validated = $request->validate([
            'name' => 'sometimes|string|max:50',   // Tên là tùy chọn, phải là chuỗi, tối đa 50 ký tự
            'closed' => 'sometimes|boolean',        // 'closed' là tùy chọn, phải là boolean
            'position' => 'sometimes',     // 'position' là tùy chọn, phải là số nguyên
        ]);

        // Nếu có trường 'position', cập nhật 'position' của list
        if (isset($validated['position'])) {
            $list->update(['position' => $validated['position']]);
        }

        // Cập nhật các trường còn lại (name và closed)
        if (isset($validated['name']) || isset($validated['closed'])) {
            $list->update($validated);
        }

        // Lấy lại thông tin sau khi cập nhật
        $list->refresh();

        // Broadcast sự kiện (cập nhật danh sách cho client khác)
        broadcast(new ListUpdated($list))->toOthers();

        // Trả về kết quả sau khi cập nhật thành công
        return response()->json([
            'data' => $list,
            'message' => 'List updated successfully'
        ], 200);
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
