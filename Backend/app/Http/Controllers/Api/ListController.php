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
use App\Jobs\BroadcastListCreated;

class ListController extends Controller
{
    public function show($boardId)
    {
        $userId = auth()->id();

        // 1. Get basic board info and check existence
        $board = DB::table('boards')
            ->select('id', 'visibility', 'workspace_id')
            ->find($boardId);

        if (!$board) {
            return response()->json(['message' => 'Board not found'], 404);
        }

        // 2. Check access rights
        if (!$this->hasBoardAccess($board, $userId)) {
            return response()->json(['message' => 'Access denied'], 403);
        }

        // 3. Get all lists for the board
        $lists = DB::table('list_boards')
            ->select('id', 'name', 'position', 'closed')
            ->where('board_id', $boardId)
            ->where('closed', 0)
            ->orderBy('position')
            ->get()
            ->toArray(); // Convert Collection to array

        // Early return if no lists found
        if (empty($lists)) {
            return response()->json([
                'id' => $boardId,
                'lists' => [],
                'cards' => []
            ]);
        }

        // 4. Get list IDs for cards query
        $listIds = array_column($lists, 'id');

        // 5. Get all cards with counts and related data
        $cards = DB::table('cards')
            ->select([
                'cards.id',
                'cards.title',
                'cards.thumbnail',
                'cards.position',
                'cards.start_date',
                'cards.end_date',
                'cards.end_time',
                'cards.reminder',
                'cards.is_completed',
                'cards.is_archived',
                'cards.list_board_id',
                DB::raw('(SELECT COUNT(*) FROM comment_cards WHERE comment_cards.card_id = cards.id) as comment_count'),
                DB::raw('(SELECT COUNT(*) FROM attachments WHERE attachments.card_id = cards.id) as attachment_count'),
                DB::raw('(SELECT COUNT(*) FROM checklists cl JOIN checklist_items cli ON cl.id = cli.checklist_id WHERE cl.card_id = cards.id) as total_checklist_items'),
                DB::raw('(SELECT COUNT(*) FROM checklists cl JOIN checklist_items cli ON cl.id = cli.checklist_id WHERE cl.card_id = cards.id AND cli.is_completed = 1) as completed_checklist_items'),
                'list_boards.name as list_board_name',
            ])
            ->join('list_boards', 'cards.list_board_id', '=', 'list_boards.id')
            ->whereIn('list_board_id', $listIds)
            ->where('is_archived', 0)
            ->orderBy('position')
            ->get()
            ->toArray(); // Convert Collection to array

        // 6. Get checklist items with dates for each card
        $cardIds = array_column($cards, 'id');

        // Get checklist items with start_date and end_date
        $checklistItems = DB::table('checklists')
            ->join('checklist_items', 'checklists.id', '=', 'checklist_items.checklist_id')
            ->select(
                'checklists.card_id',
                'checklist_items.end_time as checklist_end_time',
                'checklist_items.end_date as checklist_end_date'
            )
            ->whereIn('checklists.card_id', $cardIds)
            ->get()
            ->toArray();

        // Group checklist dates by card_id (take the first non-null start_date and end_date)
        $checklistDatesByCard = [];
        foreach ($checklistItems as $item) {
            $cardId = $item->card_id;
            if (!isset($checklistDatesByCard[$cardId])) {
                $checklistDatesByCard[$cardId] = [
                    'checklist_end_time' => $item->checklist_end_time,
                    'checklist_end_date' => $item->checklist_end_date,
                ];
            }
        }

        // 7. Get additional card data (labels and members)
        $cardLabels = DB::table('card_label')
            ->join('labels', 'card_label.label_id', '=', 'labels.id')
            ->select('card_label.card_id', 'labels.id as label_id', 'labels.title', 'labels.color_id')
            ->whereIn('card_label.card_id', $cardIds)
            ->get()
            ->toArray(); // Convert Collection to array

        // Group labels by card_id
        $labelsByCard = [];
        foreach ($cardLabels as $label) {
            $labelsByCard[$label->card_id][] = $label;
        }

        // Get members for cards
        $cardMembers = DB::table('card_user')
            ->join('users', 'card_user.user_id', '=', 'users.id')
            ->select('card_user.card_id', 'users.id as user_id', 'users.id')
            ->whereIn('card_user.card_id', $cardIds)
            ->get()
            ->toArray();

        // Group members by card_id
        $membersByCard = [];
        foreach ($cardMembers as $member) {
            $membersByCard[$member->card_id][] = $member;
        }

        // 8. Format cards data
        $formattedCards = [];
        foreach ($cards as $card) {
            $cardId = $card->id;
            $listId = $card->list_board_id;

            $labels = $labelsByCard[$cardId] ?? [];
            $members = $membersByCard[$cardId] ?? [];
            $checklistDates = $checklistDatesByCard[$cardId] ?? [
                'checklist_end_date' => null,
                'checklist_end_time' => null,
            ];

            $labelIds = array_map(function ($label) {
                return $label->label_id;
            }, $labels);
            $memberIds = array_map(function ($member) {
                return $member->user_id;
            }, $members);

            $formattedLabels = [];
            foreach ($labels as $label) {
                $formattedLabels[] = [
                    'id' => $label->label_id,
                    'name' => $label->title,
                    'color' => $label->color_id
                ];
            }

            $formattedCards[] = [
                'id' => $cardId,
                'title' => $card->title,
                'thumbnail' => $card->thumbnail,
                'position' => (float)$card->position,
                'is_archived' => (bool)$card->is_archived,
                'list_board_id' => $listId,
                'is_completed' => (bool)$card->is_completed,
                'labelId' => $labelIds,
                'labels' => $formattedLabels,
                'membersId' => $memberIds,
                "badges" => [
                    'attachments' => (int)$card->attachment_count,
                    'comments' => (int)$card->comment_count,
                    'start' => $card->start_date,
                    'due' => $card->end_date,
                    'dueTime' => $card->end_time,
                    'dueReminder' => $card->reminder,
                    'dueComplete' => (bool)$card->is_completed,
                    'checkItems' => (int)$card->total_checklist_items,
                    'checkItemsChecked' => (int)$card->completed_checklist_items,
                    'checklistDue' => $checklistDates['checklist_end_date'],   // Thêm end_date của checklist
                    'checklistDueTime' => $checklistDates['checklist_end_time'], // Thêm start_date của checklist
                    'description' => !empty($card->description)
                ]
            ];
        }

        // 9. Format lists
        $formattedLists = [];
        foreach ($lists as $list) {
            $formattedLists[] = [
                'id' => $list->id,
                'name' => $list->name,
                'position' => (float)$list->position,
                'closed' => (bool)$list->closed,
            ];
        }

        // 10. Return the response with separated lists and cards
        return response()->json([
            'id' => $boardId,
            'lists' => $formattedLists,
            'cards' => $formattedCards,
        ]);
    }

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

            // BroadcastListCreated::dispatch($list);
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
            'position' => 'sometimes|numeric',     // 'position' là tùy chọn, phải là số nguyên
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
