<?php

namespace App\Http\Controllers\api;

use App\Events\CardCreate;
use App\Http\Controllers\Controller;
use App\Models\Card;
use App\Models\ListBoard;
use App\Models\User;
use App\Notifications\CardMemberAddedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CardController extends Controller
{
    // lấy thẻ theo danh sách
    public function getCardsByList($listId)
    {
        $cards = Card::where('list_board_id', $listId)->get();



        return response()->json([
            'status'=>true,
            'data'=>$cards
        ]);
    }
    public function store(Request $request)
    {
        $card = Card::create([
            'title' => $request->title,
            'list_board_id' => $request->list_board_id,
        ]);

        broadcast(new CardCreate($card))->toOthers();

        return response()->json($card);
    }
    // cập nhật tên
    public function updateName($cardId, Request $request)
    {
        $card = Card::find($cardId);


        $request->validate([
            'title' => 'required'
        ]);
        $card->update([
            'title' => $request->title
        ]);
        return response()->json(
            [
                'status' => true,
                'data' => $card,
            ]
        );
    }
    // cập nhật mô tả
    public function updateDescription($cardId, Request $request,)
    {
        $card = Card::find($cardId);
        $request->validate([
            'description' => 'nullable|string|max:1000'
        ]);

        $card->update([
            'description' => $request->description
        ]);

        return response()->json([
            'message' => 'Mô tả đã được cập nhật thành công',
            'card' => $card
        ]);
    }

    // thêm người dùng vào thẻ

    public function addMemberByEmail(Request $request, $cardId)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $user = User::where('email', $request->email)->first();

        // Nếu email không tồn tại trong hệ thống, trả về lỗi
        if (!$user) {
            return response()->json(['message' => 'Email không tồn tại trong hệ thống'], 404);
        }

        $cards = Card::findOrFail($cardId);



        // Kiểm tra nếu user đã có trong thẻ chưa
        if (!$cards->users()->where('users.id', $user->id)->exists()) {
            $cards->users()->attach($user->id);

            // Gửi thông báo
            $user->notify(new CardMemberAddedNotification($cards));


            return response()->json(['message' => 'Đã thêm thành viên vào thẻ và gửi thông báo'], 200);
        }

        return response()->json(['message' => 'Người dùng đã có trong thẻ'], 400);
    }
    // thành viên khỏi card
    public function removeMember($cardId,  $userID)
    {
        $card = Card::find($cardId);
        $user = User::find($userID);
        // dd($card,$user);
        // Kiểm tra xem user có trong thẻ không
        if (!$card->users()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'message' => 'Người dùng không tồn tại trong thẻ này'
            ], 404);
        }

        // Xóa user khỏi thẻ
        $card->users()->detach($user->id);

        return response()->json([
            'message' => 'Đã xóa thành viên khỏi thẻ thành công',
            'status' => true,

        ]);
    }

    public function updateDates(Request $request, $cardId)
    {


        $request->validate([
            'start_date' => 'nullable|date_format:Y-m-d',
            'end_date'   => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
            'end_time'   => 'nullable|date_format:H:i',

        ]);

        $card = Card::findOrFail($cardId);

        // $card->start_date = $request->start_date;
        // $card->end_date = $request->end_date;
        // $card->end_time = $request->end_time;
        // dd($request->all());
        // $card->save();
        $card->update([
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'end_time' => $request->end_time,
        ]);

        return response()->json([
            'message' => 'Cập nhật ngày và giờ thành công!',
            'data' => $card,
        ]);
    }
    public function removeDates($cardId)
    {
        $card = Card::findOrFail($cardId);
        $card->start_date = null;
        $card->end_date = null;
        $card->end_time = null;
        $card->save();

        return response()->json([
            'message' => 'Đã xóa ngày bắt đầu & ngày kết thúc khỏi thẻ!',
            'data' => $card,
        ]);
    }
}
