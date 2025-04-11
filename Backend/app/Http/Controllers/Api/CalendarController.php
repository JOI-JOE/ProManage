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
    public function index(Request $request)
    {
        $boardId = $request->query('board_id');
        $month = $request->query('month'); // ví dụ: 2025-04

        $cards = DB::table('cards')
            ->join('list_boards', 'cards.list_board_id', '=', 'list_boards.id')
            ->join('boards', 'list_boards.board_id', '=', 'boards.id')
            ->where('boards.id', $boardId)
            ->whereMonth('cards.end_date', '=', date('m', strtotime($month)))
            ->whereYear('cards.end_date', '=', date('Y', strtotime($month)))
            ->select(
                'cards.id',
                'cards.title',
                'cards.end_date as start',
                'list_boards.name as list_title',
                'boards.id as board_id'
            )
            ->get();
        $cardIds = $cards->pluck('id')->toArray();
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

        $result = $cards->map(function ($card) use ($labels, $members) {
            return [
                'id' => $card->id,
                'title' => $card->title,
                'start' => $card->start,
                'list_title' => $card->list_title,
                'board_id' => $card->board_id, // 👈 thêm dòng này
                'labels' => $labels->get($card->id, collect())->values(),
                'members' => $members->get($card->id, collect())->values(),
            ];
        });

        return response()->json($result);
    }
    public function update(Request $request, $boardId, $cardId)
    {
        $request->validate([
            'end_date' => 'required|date',
            'month' => 'required|string'
        ]);
        Log::info($request->all());

        $card = Card::where('id', $cardId)
            ->whereHas('list', function ($query) use ($boardId) {
                $query->where('board_id', $boardId);
            })->first();
        if (!$card) {
            return response()->json(['message' => 'Card không thuộc board này'], 404);
        }

        // Update end_date
        $start_date = $card->start_date;
        $end_date = Carbon::parse($request->end_date);
        if ($end_date->lt($start_date)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ngày kết thúc không được nhỏ hơn ngày bắt đầu đã lưu.'
            ], 422);
        }

        $card->end_date = $request->end_date;

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
