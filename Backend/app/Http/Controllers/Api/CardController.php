<?php

namespace App\Http\Controllers\api;

use App\Events\CardCreate;
use App\Http\Controllers\Controller;
use App\Models\Card;
use App\Models\User;
use App\Notifications\CardMemberAddedNotification;
use App\Notifications\MemberAddedNotification;
use Illuminate\Http\Request;

class CardController extends Controller
{
    public function store(Request $request)
    {
        $card = Card::create([
            'title' => $request->title,
            'list_board_id' => $request->list_board_id,
        ]);

        broadcast(new CardCreate($card))->toOthers();

        return response()->json($card);
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
    public function removeMember(Card $card, User $user)
    {
        // Kiểm tra xem thành viên có thuộc thẻ không
        if (!$card->users()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'Thành viên không tồn tại trong thẻ'], 404);
        }

        // Xóa thành viên khỏi thẻ
        $card->users()->detach($user->id);

        return response()->json(['message' => 'Đã xóa thành viên khỏi thẻ thành công']);
    }
}
