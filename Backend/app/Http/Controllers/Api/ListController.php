<?php

namespace App\Http\Controllers\Api;

use App\Events\ListCreated;
use App\Http\Requests\ListUpdateNameRequest;
use App\Models\Board;
use App\Models\ListBoard;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

class ListController extends Controller
{
    // ----------------------------------------------------
    public function show($boardId)
    {
        // Bước 1: Lấy thông tin board
        $board = DB::table('boards')
            ->select(
                'id AS board_id',
                'name AS board_name',
                'created_at',
                'updated_at'
            )
            ->find($boardId);

        if (!$board) {
            return response()->json(['message' => 'Board not found'], 404);
        }

        // Bước 2: Lấy danh sách list_boards thuộc board này
        $lists = DB::table('list_boards')
            ->where('board_id', $boardId)
            ->select([
                'id',
                'name',
                'closed',
                'position',
                'created_at',
                'updated_at',
            ])
            ->orderBy('position')
            ->get()
            ->toArray();

        // Bước 3: Lấy danh sách cards thuộc board này
        $cards = DB::table('cards')
            ->join('list_boards', 'cards.list_board_id', '=', 'list_boards.id')
            ->where('list_boards.board_id', $boardId)
            ->where('cards.is_archived', false)
            ->select([
                'cards.id',
                'cards.title AS name',
                'cards.description AS desc',
                'cards.thumbnail AS idAttachmentCover',
                'cards.position',
                'cards.start_date AS start',
                'cards.end_date AS due',
                'cards.end_time',
                'cards.reminder AS dueReminder',
                DB::raw('CAST(cards.is_completed AS UNSIGNED) AS dueComplete'),
                DB::raw('CAST(cards.is_archived AS UNSIGNED) AS closed'),
                'cards.list_board_id',
                'list_boards.board_id AS boardId',
            ])
            ->orderBy('cards.position')
            ->get()
            ->map(function ($card) {
                return (object) array_merge((array) $card, [
                    'labels' => [],
                    'memberId' => [],
                    'labelId' => [],
                    'checklists' => [],
                ]);
            })
            ->toArray();

        // Lấy tất cả card IDs để truy vấn dữ liệu liên quan
        // $cardIds = array_keys($cards);

        // // Bước 4: Lấy danh sách labels cho các cards
        // if (!empty($cardIds)) {
        //     $cardLabels = DB::table('card_label')
        //         ->join('labels', 'card_label.label_id', '=', 'labels.id')
        //         ->whereIn('card_label.card_id', $cardIds)
        //         ->select(
        //             DB::raw('card_label.card_id'),
        //             DB::raw('card_label.label_id'),
        //             DB::raw('labels.id AS id'),
        //             DB::raw('labels.title AS title'),
        //             // DB::raw('labels.color AS color'),
        //             DB::raw('labels.created_at'),
        //             DB::raw('labels.updated_at')
        //         )
        //         ->get();

        //     foreach ($cardLabels as $cardLabel) {
        //         $cardId = $cardLabel->card_id;
        //         if (isset($cards[$cardId])) {
        //             $cards[$cardId]->labels[] = [
        //                 'id' => $cardLabel->id,
        //                 'name' => $cardLabel->name,
        //                 'color' => $cardLabel->color,
        //                 'created_at' => $cardLabel->created_at,
        //                 'updated_at' => $cardLabel->updated_at,
        //             ];
        //             $cards[$cardId]->idLabels[] = $cardLabel->id;
        //         }
        //     }

        //     // Bước 5: Lấy danh sách card_user và thông tin users
        //     $cardUsers = DB::table('card_user')
        //         ->join('users', 'card_user.user_id', '=', 'users.id')
        //         ->whereIn('card_user.card_id', $cardIds)
        //         ->select(
        //             DB::raw('card_user.card_id'),
        //             DB::raw('card_user.user_id'),
        //             DB::raw('users.full_name AS full_name'),
        //             DB::raw('users.initials AS initials'),
        //             DB::raw('users.image AS image')
        //         )
        //         ->get();

        //     foreach ($cardUsers as $cardUser) {
        //         $cardId = $cardUser->card_id;
        //         if (isset($cards[$cardId])) {
        //             $cards[$cardId]->idMembers[] = $cardUser->user_id;
        //         }
        //     }

        //     // Bước 6: Lấy danh sách check_list
        //     $checkLists = DB::table('check_lists')
        //         ->whereIn('card_id', $cardIds)
        //         ->select(
        //             DB::raw('id'),
        //             DB::raw('name'),
        //             DB::raw('created_at'),
        //             DB::raw('card_id')
        //         )
        //         ->get();

        //     foreach ($checkLists as $checkList) {
        //         $cardId = $checkList->card_id;
        //         if (isset($cards[$cardId])) {
        //             $cards[$cardId]->checklists[] = [
        //                 'id' => $checkList->id,
        //                 'name' => $checkList->name,
        //                 'created_at' => $checkList->created_at,
        //                 'card_id' => $checkList->card_id,
        //             ];
        //         }
        //     }
        // }

        // Chuyển cards thành mảng giá trị (loại bỏ key)
        $cards = array_values($cards);

        // Bước 7: Tạo responseData
        $response = [
            'id' => $boardId,
            'lists' => $lists,
            'cards' => $cards,
        ];

        return response()->json($response);
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
        $validated = $request->validate([
            'boardId' => 'required|exists:boards,id',
            'name' => 'required|string',
            'pos' => 'required',
        ]);

        $list = ListBoard::create([
            'board_id' =>  $validated['boardId'],
            'name' => $validated['name'],
            'position' => $validated['pos'],
        ]);
        // Phát sự kiện WebSocket
        broadcast(new ListCreated($list))->toOthers();

        return response()->json([
            'id' => $list->id,
            'title' => $list->name,
            'position' => $list->position,
            'board_id' => $list->board_id,
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

        // broadcast(new ListArchived($list));

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
