<?php

namespace App\Http\Controllers\Api;

use App\Events\ListCreated;
use App\Events\ListNameUpdated;
// use App\Events\ListUpdated;
use App\Http\Requests\ListUpdateNameRequest;
use App\Jobs\BroadcastListCreated;
use App\Models\Board;
use App\Models\Card;
use App\Models\ListBoard;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Pusher\Pusher;

class ListController extends Controller
{

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

        $user = Auth::user();
        // Kiểm tra xem user hiện tại có trong workspace.members hay không
        $isWorkspaceMember = $board->workspace->members2->contains('id',$user->id);

        $responseData = [
            'id' => $board->id,
            'title' => $board->name,
            'description' => $board->description ?? '',
            'visibility' => $board->visibility,
            'workspaceId' => $board->workspace_id,
            'isMarked' => (bool) $board->is_marked,
            'thumbnail' => $board->thumbnail ?? null,
            'created_by' => $board->created_by,
            'isWorkspaceMember' => $isWorkspaceMember, // Thêm trạng thái user có trong workspace.members hay không
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

    ///////////////// Viết riêng ra để làm cho dễ (quốc)
    public function checkBoardAccess($boardId)
    {
        $board = Board::where('id', $boardId)
            ->with(['members', 'workspace.users']) // load workspace users
            ->first();

        if (!$board) {
            return response()->json(['message' => 'Board not found'], 404);
        }

        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Authentication required'], 401);
        }

        // ✅ Nếu là thành viên bảng → full quyền
        if ($board->members->contains($user->id)) {
            return response()->json(['access' => true]);
        }

        // 🌐 Nếu public → cho phép xem (readonly)
        if ($board->visibility === 'public') {
            return response()->json(['access' => true, 'readonly' => true]);
        }

        // 🏢 Nếu visibility là workspace → kiểm tra thành viên workspace
        if ($board->visibility === 'workspace') {
            if (!$board->workspace) {
                return response()->json(['error' => 'Workspace not found for this board'], 500);
            }

            if ($board->workspace->users->contains($user->id)) {
                return response()->json(['access' => true, 'readonly' => true]);
            } else {
                return response()->json(['error' => 'You are not a member of this workspace'], 403);
            }
        }

        // 🔒 Nếu là bảng riêng tư → trả lỗi cụ thể
        if ($board->visibility === 'private') {
            return response()->json(['error' => 'You are not a member of this private board'], 403);
        }

        return response()->json(['error' => 'Access denied to this board'], 403);
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
            'board_id' => $validated['boardId'],
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

        // broadcast(new ListNameUpdated($list))->toOthers(); // <- realtime

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

    public function duplicate(Request $request, string $id)
    {
        $originalList = ListBoard::with('cards.checklists.items', 'cards.labels', 'cards.members', 'cards.attachments', 'cards.comments')
            ->findOrFail($id);

        DB::beginTransaction();

        try {
            // Tạo list mới
            ListBoard::where('board_id', $originalList->board_id)
                ->where('position', '>', $originalList->position)
                ->increment('position');

            $newList = ListBoard::create([
                'board_id' => $originalList->board_id,
                'name' => $request->input('name', $originalList->name . ' (Copy)'),
                'position' => $originalList->position + 1,
            ]);

            // Lấy danh sách thành viên trong board
            $boardMemberIds = DB::table('board_members')
                ->where('board_id', $originalList->board_id)
                ->pluck('user_id');

            foreach ($originalList->cards as $card) {
                $newCard = Card::create([
                    'title' => $card->title,
                    'description' => $card->description,
                    'position' => $card->position,
                    'start_date' => $card->start_date,
                    'end_date' => $card->end_date,
                    'end_time' => $card->end_time,
                    'is_completed' => $card->is_completed, // ✅ giữ nguyên trạng thái hoàn thành
                    'is_archived' => false,
                    'board_id' => $originalList->board_id,
                    'list_board_id' => $newList->id,
                ]);

                // Checklist & items
                foreach ($card->checklists as $checklist) {
                    $newChecklist = $checklist->replicate();
                    $newChecklist->card_id = $newCard->id;
                    $newChecklist->save();

                    foreach ($checklist->items as $item) {
                        $newItem = $item->replicate();
                        $newItem->checklist_id = $newChecklist->id;
                        $newItem->save();
                    }
                }

                // Labels
                $newCard->labels()->sync($card->labels->pluck('id'));

                // Members (lọc theo board)
                $memberIds = $card->members()->whereIn('id', $boardMemberIds)->pluck('id');
                $newCard->members()->sync($memberIds);

                // Attachments
                foreach ($card->attachments as $attachment) {
                    $newAttachment = $attachment->replicate();
                    $newAttachment->card_id = $newCard->id;
                    $newAttachment->file_name = Str::uuid() . '_' . $attachment->file_name;
                    $newAttachment->file_name_defaut = $attachment->file_name_defaut;
                    $newAttachment->save();
                }

                // Comments
                foreach ($card->comments as $comment) {
                    $newComment = $comment->replicate();
                    $newComment->card_id = $newCard->id;
                    $newComment->save();
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'List duplicated successfully',
                // 'list' => $newList->load('cards'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to duplicate list',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
