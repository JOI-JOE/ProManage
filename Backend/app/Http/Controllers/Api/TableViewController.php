<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Board;
use Illuminate\Http\Request;
use App\Models\Card;
use App\Models\ListBoard;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TableViewController extends Controller
{

    public function tableView(Request $request)
    {
        $userId = auth()->id();
        $boardIds = $request->input('boardIds', []);

        // Nếu boardIds không phải là mảng, chuyển thành mảng
        if (!is_array($boardIds)) {
            $boardIds = explode(',', $boardIds);
        }

        if (empty($boardIds)) {
            return response()->json(['message' => 'board_ids is required'], 422);
        }

        // 🔐 Lọc ra những board user có quyền xem
        $authorizedBoardIds = DB::table('board_members')
            ->where('user_id', $userId)
            ->whereIn('board_id', $boardIds)
            ->pluck('board_id')
            ->toArray();

        if (empty($authorizedBoardIds)) {
            return response()->json(['message' => 'User không có quyền xem các board này'], 403);
        }

        // 🔍 Query chính: Giữ nguyên GROUP_CONCAT cho members, bỏ GROUP_CONCAT cho labels
        $rawCards = DB::table('cards')
            ->join('list_boards', 'cards.list_board_id', '=', 'list_boards.id')
            ->join('boards', 'list_boards.board_id', '=', 'boards.id')
            ->leftJoin('card_user', 'cards.id', '=', 'card_user.card_id')
            ->leftJoin('users', 'card_user.user_id', '=', 'users.id')
            ->whereIn('boards.id', $authorizedBoardIds)
            ->select(
                'cards.id as card_id',
                'cards.title as card_title',
                'cards.end_date',
                'cards.end_time',
                'cards.reminder',
                'cards.is_completed',
                'list_boards.id as list_board_id',
                'list_boards.name as list_name',
                'boards.id as board_id',
                'boards.name as board_name',
                'boards.thumbnail as board_thumbnail',
                // Giữ nguyên GROUP_CONCAT cho members
                DB::raw('GROUP_CONCAT(DISTINCT users.id) as member_ids'),
                DB::raw('GROUP_CONCAT(DISTINCT users.full_name) as member_names')
            )
            ->groupBy(
                'cards.id',
                'cards.title',
                'cards.end_date',
                'cards.end_time',
                'cards.reminder',
                'cards.is_completed',
                'list_boards.id',
                'list_boards.name',
                'boards.id',
                'boards.name',
                'boards.thumbnail'
            )
            ->get();

        // 🔍 Query riêng để lấy labels cho tất cả cards
        $cardIds = $rawCards->pluck('card_id')->toArray();
        $labelsData = DB::table('card_label')
            ->join('labels', 'card_label.label_id', '=', 'labels.id')
            ->join('colors', 'labels.color_id', '=', 'colors.id')
            ->whereIn('card_label.card_id', $cardIds)
            ->select(
                'card_label.card_id',
                'labels.id as label_id',
                'labels.title as label_title',
                'labels.created_at as label_created_at',
                'labels.updated_at as label_updated_at',
                'colors.id as color_id',
                'colors.hex_code as color_hex_code',
                'colors.created_at as color_created_at'
            )
            ->get()
            ->groupBy('card_id');

        // 🔄 Xử lý cards
        $cards = $rawCards->map(function ($card) use ($labelsData) {
            // Xử lý members (giữ nguyên logic cũ)
            $memberIds = explode(',', $card->member_ids ?? '');
            $memberNames = explode(',', $card->member_names ?? '');

            $members = [];
            foreach ($memberIds as $i => $id) {
                if (!empty($id)) {
                    $members[] = [
                        'id' => $id,
                        'full_name' => $memberNames[$i] ?? null,
                    ];
                }
            }

            // Xử lý labels từ dữ liệu riêng
            $cardLabels = $labelsData[$card->card_id] ?? collect([]);
            $labels = $cardLabels->map(function ($label) {
                return [
                    'id' => $label->label_id,
                    'title' => $label->label_title,
                    'color' => [
                        'id' => $label->color_id,
                        'hex_code' => $label->color_hex_code,
                        'created_at' => $label->color_created_at,
                    ],
                    'created_at' => $label->label_created_at,
                    'updated_at' => $label->label_updated_at,
                ];
            })->values()->toArray();

            // Xử lý full_due_date (giữ nguyên logic cũ)
            $fullDueDate = null;
            if ($card->end_date) {
                $date = \Carbon\Carbon::parse($card->end_date);
                if ($card->end_time) {
                    $time = \Carbon\Carbon::parse($card->end_time);
                    $date->setTime($time->hour, $time->minute, $time->second);
                }
                $fullDueDate = $date->toIso8601String();
            }

            return [
                'card_id' => $card->card_id,
                'card_title' => $card->card_title,
                'end_date' => $card->end_date,
                'end_time' => $card->end_time,
                'reminder' => $card->reminder,
                'full_due_date' => $fullDueDate,
                'is_completed' => $card->is_completed,
                'list_board_id' => $card->list_board_id,
                'list_name' => $card->list_name,
                'board_id' => $card->board_id,
                'board_thumbnail' => $card->board_thumbnail,
                'board_name' => $card->board_name,
                'labels' => $labels,
                'members' => $members,
            ];
        });

        return response()->json($cards);
    }

    public function getListsByBoards(Request $request)
    {
        $boardIds = $request->input('boardIds', []);
        if (!is_array($boardIds)) {
            $boardIds = explode(',', $boardIds);
        }
        $lists = ListBoard::whereIn('board_id', $boardIds)
            ->select('id', 'name', 'board_id')
            ->get();

        return response()->json(
            $lists,
        );
    }
    public function updateList(Request $request, $id)
    {
        $request->validate([
            'listBoardId' => 'required|exists:list_boards,id',
        ]);

        $card = Card::findOrFail($id);
        $card->list_board_id = $request->listBoardId;
        $card->save();

        return response()->json([
            'message' => 'Cập nhật danh sách thành công',
            'card' => $card,
        ]);
    }
    public function getBoardMembersInTableView(Request $request, $boardId = [])
    {
        $boardIds = $request->input('boardIds', []);

        try {
            $board = Board::with('members:id,full_name,email')->find($boardId);
            return response()->json([
                'success' => true,
                'message' => 'lấy thành viên của bảng thành công',
                'data' => $board->members

            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => 'lấy thành viên của bảng khoong thành công',

            ]);
        }
    }
    public function getMembersByBoards(Request $request)
    {
        $boardIds = $request->input('boardIds'); // array

        $boards = Board::whereIn('id', $boardIds)
            ->with(['members' => function ($query) {
                $query->select('users.id', 'full_name', 'email');
            }])
            ->get();

        // Chuyển đổi định dạng
        $result = $boards->map(function ($board) {
            return [
                'board_id' => $board->id,
                'members' => $board->members->map(function ($member) use ($board) {
                    return [
                        'id' => $member->id,
                        'full_name' => $member->full_name,
                        'email' => $member->email,
                        'pivot' => [
                            'board_id' => $board->id,
                            'user_id' => $member->id,
                        ]
                    ];
                }),
            ];
        });

        return response()->json($result);
    }
    public function addMember($cardId, Request $request)
    {
        Log::info('Received addMember request', [
            'card_id' => $cardId,
            'member_id' => $request->member_id,
            'request' => $request->all()
        ]);
        $card = Card::findOrFail($cardId);
        $request->validate(['member_id' => 'required|exists:users,id']);
        if ($card->members()->where('user_id', $request->member_id)->exists()) {
            return response()->json(['message' => 'Member already in card'], 400);
        }
        $card->members()->attach($request->member_id);
        $card->load('members');
        return response()->json($card);
    }

    public function removeMember(Card $card, $member)
    {
        if (!$card->members()->where('user_id', $member)->exists()) {
            return response()->json(['message' => 'Member not in card'], 404);
        }
        $card->members()->detach($member);
        $card->load('members');
        return response()->json($card);
    }
    public function updateDueDate(Request $request, $cardId)
{
    Log::info('Received updateDueDate request', [
        'card_id' => $cardId,
        'end_date' => $request->end_date,
        'end_time' => $request->end_time,
        'reminder' => $request->reminder,
    ]);

    $request->validate([
        'end_date' => 'nullable|date_format:Y-m-d',
        'end_time' => 'nullable|date_format:H:i:s',
        'reminder' => 'nullable|date_format:Y-m-d H:i:s',
    ]);

    $card = Card::findOrFail($cardId);
    $card->end_date = $request->end_date;
    $card->end_time = $request->end_time;
    $card->reminder = $request->reminder;
    $card->save();

    Log::info('Due date and reminder updated', [
        'card_id' => $cardId,
        'end_date' => $card->end_date,
        'end_time' => $card->end_time,
        'reminder' => $card->reminder,
    ]);

    $fullDueDate = $card->end_date ? \Carbon\Carbon::parse($card->end_date) : null;
    if ($fullDueDate && $card->end_time) {
        $time = \Carbon\Carbon::parse($card->end_time);
        $fullDueDate->setTime($time->hour, $time->minute, $time->second);
    }

    return response()->json([
        'card_id' => $card->id,
        'end_date' => $card->end_date,
        'end_time' => $card->end_time,
        'reminder' => $card->reminder,
        'full_due_date' => $fullDueDate ? $fullDueDate->toIso8601String() : null,
        'is_overdue' => $card->end_date && !$card->is_completed && $fullDueDate?->isPast(),
    ]);
}
}

