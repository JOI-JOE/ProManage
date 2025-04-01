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
            ->select('id AS board_id', 'name AS board_name', 'created_at', 'updated_at')
            ->find($boardId);

        if (!$board) {
            return response()->json(['message' => 'Board not found'], 404);
        }

        // Truy vấn danh sách `lists` cơ bản
        $listsQuery = DB::table('list_boards')
            ->where('board_id', $boardId)
            ->select('id', 'name', 'closed', 'position', 'created_at', 'updated_at')
            ->orderBy('position');

        $lists = $listsQuery->get()->map(fn($list) => (object) [
            'id' => $list->id,
            'name' => $list->name,
            'closed' => $list->closed,
            'position' => (float) $list->position,
            'created_at' => $list->created_at,
            'updated_at' => $list->updated_at,
            'cards' => function () use ($list) { // Lazy loading cho cards
                return $this->getCardsForList($list->id);
            },
        ])->all();

        // Trả về response cơ bản
        return response()->json([
            'id' => $boardId,
            'lists' => $lists,
            'cards' => function () use ($boardId) { // Lazy loading cho tất cả cards
                return $this->getCardsForBoard($boardId);
            },
        ]);
    }

    // Hàm lấy cards cho một list cụ thể
    private function getCardsForList($listId)
    {
        return DB::table('cards')
            ->where('list_board_id', $listId)
            ->where('is_archived', false)
            ->select(
                'id',
                'title',
                'description AS desc',
                'thumbnail AS idAttachmentCover',
                'position',
                'start_date AS start',
                'end_date AS due',
                'end_time',
                'reminder AS dueReminder',
                DB::raw('CAST(is_completed AS UNSIGNED) AS dueComplete'),
                DB::raw('CAST(is_archived AS UNSIGNED) AS closed'),
                'list_board_id'
            )
            ->orderBy('position')
            ->get()
            ->map(fn($card) => (object) [
                'id' => $card->id,
                'title' => $card->title,
                'desc' => $card->desc,
                'idAttachmentCover' => $card->idAttachmentCover,
                'position' => (float) $card->position,
                'start' => $card->start,
                'due' => $card->due,
                'end_time' => $card->end_time,
                'dueReminder' => $card->dueReminder,
                'dueComplete' => $card->dueComplete,
                'closed' => $card->closed,
                'list_board_id' => $card->list_board_id,
                'labels' => function () use ($card) { // Lazy loading cho labels
                    return $this->getLabelsForCard($card->id);
                },
                'memberId' => function () use ($card) { // Lazy loading cho members
                    return $this->getMembersForCard($card->id);
                },
                'labelId' => function () use ($card) { // Lazy loading cho label IDs
                    return $this->getLabelIdsForCard($card->id);
                },
                'checklists' => function () use ($card) { // Lazy loading cho checklists
                    return $this->getChecklistsForCard($card->id);
                },
            ])->all();
    }

    // Hàm lấy tất cả cards cho một board
    private function getCardsForBoard($boardId)
    {
        return DB::table('cards')
            ->join('list_boards', 'cards.list_board_id', '=', 'list_boards.id')
            ->where('list_boards.board_id', $boardId)
            ->where('cards.is_archived', false)
            ->select(
                'cards.id',
                'cards.title AS title',
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
                'list_boards.board_id AS boardId'
            )
            ->orderBy('cards.position')
            ->get()
            ->map(fn($card) => (object) [
                'id' => $card->id,
                'title' => $card->title,
                'desc' => $card->desc,
                'idAttachmentCover' => $card->idAttachmentCover,
                'position' => (float) $card->position,
                'start' => $card->start,
                'due' => $card->due,
                'end_time' => $card->end_time,
                'dueReminder' => $card->dueReminder,
                'dueComplete' => $card->dueComplete,
                'closed' => $card->closed,
                'list_board_id' => $card->list_board_id,
                'boardId' => $card->boardId,
                'labels' => function () use ($card) {
                    return $this->getLabelsForCard($card->id);
                },
                'memberId' => function () use ($card) {
                    return $this->getMembersForCard($card->id);
                },
                'labelId' => function () use ($card) {
                    return $this->getLabelIdsForCard($card->id);
                },
                'checklists' => function () use ($card) {
                    return $this->getChecklistsForCard($card->id);
                },
            ])->all();
    }

    // Hàm lấy labels cho một card
    private function getLabelsForCard($cardId)
    {
        return DB::table('card_label')
            ->join('labels', 'card_label.label_id', '=', 'labels.id')
            ->where('card_label.card_id', $cardId)
            ->select('labels.id', 'labels.title AS name', 'labels.created_at', 'labels.updated_at')
            ->get()
            ->map(fn($label) => (object) [
                'id' => $label->id,
                'name' => $label->name,
                'created_at' => $label->created_at,
                'updated_at' => $label->updated_at,
            ])->all();
    }

    // Hàm lấy member IDs cho một card
    private function getMembersForCard($cardId)
    {
        return DB::table('card_user')
            ->where('card_id', $cardId)
            ->pluck('user_id')
            ->all();
    }

    // Hàm lấy label IDs cho một card
    private function getLabelIdsForCard($cardId)
    {
        return DB::table('card_label')
            ->where('card_id', $cardId)
            ->pluck('label_id')
            ->all();
    }

    // Hàm lấy checklists cho một card
    private function getChecklistsForCard($cardId)
    {
        return DB::table('check_lists')
            ->where('card_id', $cardId)
            ->select('id', 'name', 'created_at', 'card_id')
            ->get()
            ->map(fn($checklist) => (object) [
                'id' => $checklist->id,
                'name' => $checklist->name,
                'created_at' => $checklist->created_at,
                'card_id' => $checklist->card_id,
            ])->all();
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
