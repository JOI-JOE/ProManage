<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Card;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CalendarController extends Controller
{
    //
    // public function index(Request $request)
    // {
    //     $boardId = $request->query('board_id',[]);
    //     $month = $request->query('month'); // ví dụ: 2025-04
    //     $startOfMonth = Carbon::createFromFormat('Y-m', $month)->startOfMonth()->toDateString();
    //     $endOfMonth = Carbon::createFromFormat('Y-m', $month)->endOfMonth()->toDateString();

    //     $cards = DB::table('cards')
    //         ->join('list_boards', 'cards.list_board_id', '=', 'list_boards.id')
    //         ->join('boards', 'list_boards.board_id', '=', 'boards.id')
    //         ->where('boards.id', $boardId)
    //         ->where(function ($query) use ($startOfMonth, $endOfMonth) {
    //             $query->whereDate('cards.start_date', '<=', $endOfMonth)
    //                 ->whereDate('cards.end_date', '>=', $startOfMonth);
    //         })
    //         ->select(
    //             'cards.id',
    //             'cards.title',
    //             'cards.start_date as start',
    //             'cards.end_date as end',
    //             'cards.is_completed as is_completed',
    //             'list_boards.name as list_title',
    //             'boards.id as board_id',
    //             'boards.name as board_name'
    //         )
    //         ->get();

    //     $cardIds = $cards->pluck('id')->toArray();
    //     $labels = DB::table('card_label')
    //         ->join('labels', 'card_label.label_id', '=', 'labels.id')
    //         ->join('colors', 'labels.color_id', '=', 'colors.id')
    //         ->whereIn('card_label.card_id', $cardIds)
    //         ->select(
    //             'card_label.card_id',
    //             'labels.title as label_title',

    //             'colors.hex_code as color_code'
    //         )
    //         ->get()
    //         ->groupBy('card_id');


    //     // Lấy thành viên
    //     $members = DB::table('card_user')
    //         ->join('users', 'card_user.user_id', '=', 'users.id')
    //         ->whereIn('card_user.card_id', $cardIds)
    //         ->select('card_user.card_id', 'users.full_name', 'users.image')
    //         ->get()
    //         ->groupBy('card_id');

    //     $result = $cards->map(function ($card) use ($labels, $members) {
    //         return [
    //             'id' => $card->id,
    //             'title' => $card->title,
    //             'start' => $card->start,
    //             'end' => $card->end,
    //             'is_completed'=>$card->is_completed,
    //             'list_title' => $card->list_title,
    //             'board_name' => $card->board_name,
    //             'board_id' => $card->board_id, // 👈 thêm dòng này
    //             'labels' => $labels->get($card->id, collect())->values(),
    //             'members' => $members->get($card->id, collect())->values(),
    //         ];
    //     });

    //     return response()->json($result);
    // }
    public function index(Request $request)
    {
        // Lấy danh sách board_id, có thể là 1 hoặc nhiều
        $boardIds = $request->input('board_id', []);
        if (!is_array($boardIds)) {
            $boardIds = [$boardIds];
        }

        // Lấy khoảng thời gian lọc (start-end) hoặc fallback từ month
        $start = $request->input('start');
        $end = $request->input('end');

        if (!$start || !$end) {
            $month = $request->input('month');
            if ($month) {
                $start = Carbon::createFromFormat('Y-m', $month)->startOfMonth()->toDateString();
                $end = Carbon::createFromFormat('Y-m', $month)->endOfMonth()->toDateString();
            } else {
                return response()->json(['message' => 'Missing start/end or month'], 422);
            }
        }

        // Lấy các card trong khoảng thời gian
        $cards = DB::table('cards')
            ->join('list_boards', 'cards.list_board_id', '=', 'list_boards.id')
            ->join('boards', 'list_boards.board_id', '=', 'boards.id')
            ->when(!empty($boardIds), fn($q) => $q->whereIn('boards.id', $boardIds))
            ->where(function ($query) use ($start, $end) {
                $query->whereDate('cards.start_date', '<=', $end)
                    ->whereDate('cards.end_date', '>=', $start);
            })
            ->select(
                'cards.id',
                'cards.title',
                'cards.start_date as start',
                'cards.end_date as end',
                'cards.is_completed',
                'list_boards.name as list_title',
                'boards.id as board_id',
                'boards.name as board_name'
            )
            ->get();

        $cardIds = $cards->pluck('id')->toArray();

        // Lấy label
        $labels = DB::table('card_label')
            ->join('labels', 'card_label.label_id', '=', 'labels.id')
            ->join('colors', 'labels.color_id', '=', 'colors.id')
            ->whereIn('card_label.card_id', $cardIds)
            ->select(
                'card_label.card_id',
                'labels.title as label_title',
                'colors.hex_code as color_code'
            )
            ->get()
            ->groupBy('card_id');

        // Lấy thành viên
        $members = DB::table('card_user')
            ->join('users', 'card_user.user_id', '=', 'users.id')
            ->whereIn('card_user.card_id', $cardIds)
            ->select('card_user.card_id', 'users.full_name', 'users.image')
            ->get()
            ->groupBy('card_id');

        // Mapping lại dữ liệu cho frontend
        $result = $cards->map(function ($card) use ($labels, $members) {
            return [
                'id' => $card->id,
                'title' => $card->title,
                'start' => $card->start,
                'end' => $card->end,
                'is_completed' => $card->is_completed,
                'list_title' => $card->list_title,
                'board_id' => $card->board_id,
                'board_name' => $card->board_name,
                'labels' => $labels->get($card->id, collect())->values(),
                'members' => $members->get($card->id, collect())->values(),
            ];
        });

        return response()->json($result);
    }

    public function update(Request $request,  $cardId)
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'required|date',
        ]);
        Log::info($request->all());

        $card = Card::find($cardId);


        // Update end_date
        $start = $request->start_date ? Carbon::parse($request->start_date) : $card->start_date;
        $end = Carbon::parse($request->end_date);
        if ($end->lt($start)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ngày kết thúc không được nhỏ hơn ngày bắt đầu đã lưu.'
            ], 422);
        }
        $card->start_date = $start;
        $card->end_date = $end;

        // Giữ lại giờ và phút của reminder cũ
        if ($card->reminder) {
            $oldReminder = Carbon::parse($card->reminder);
            $newReminder = Carbon::parse($request->end_date)
                ->setTime($oldReminder->hour, $oldReminder->minute, $oldReminder->second);
            $card->reminder = $newReminder;
        }

        $card->save();

        return response()->json([
            'message' => 'Cập nhật thành công',
            'card' => $card
        ]);
    }
}
