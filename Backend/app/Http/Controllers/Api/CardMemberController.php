<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Models\Card;
use App\Models\User;
use Illuminate\Http\Request;

class CardMemberController extends Controller
{

    public function getCardMembers($cardId)
    {
        try {
            $card = Card::with('members')->findOrFail($cardId);
            return response()->json(
                [
                    'success' => true,
                    'message' => "Lấy member của card thành công",
                    'data' => $card->members
                ]

            );
        } catch (\Throwable $th) {
            return response()->json(
                [
                    'success' => false,
                    'message' => "Lấy member của card không thành công",

                ]

            );
        }
    }

    public function toggleCardMember(Request $request, $cardId)
{
    $request->validate([
        'user_id' => 'required|exists:users,id',
    ]);

    $card = Card::findOrFail($cardId);
    $user = User::findOrFail($request->user_id); // Lấy user từ database
    $authUser = auth()->user(); // Người thực hiện hành động

    // Kiểm tra xem user đã tham gia chưa
    $isMember = $card->members()->where('user_id', $user->id)->exists();

    if ($isMember) {
        // Nếu đã tham gia thì rời khỏi
        $card->members()->detach($user->id);

        // Chỉ ghi log nếu user rời đi KHÔNG PHẢI là chính mình
        if ($authUser->id !== $user->id) {
            activity()
                ->causedBy($authUser)
                ->performedOn($card)
                ->withProperties([
                    'card_id' => $card->id,
                    'card_title' => $card->title,
                    'user_id' => $user->id,
                    'user_name' => $user->user_name,
                ])
                ->log("{$authUser->full_name} đã rời khỏi thẻ này");
        }

        return response()->json(['message' => 'Bạn đã rời khỏi thẻ']);
    } else {
        // Nếu chưa tham gia thì thêm vào
        $card->members()->syncWithoutDetaching([$user->id => ['assigned_at' => now()]]);

        // Luôn ghi log khi tham gia (dù là chính mình hay người khác)
        activity()
            ->causedBy($authUser)
            ->performedOn($card)
            ->withProperties([
                'card_id' => $card->id,
                'card_title' => $card->title,
                'user_id' => $user->id,
                'user_name' => $user->user_name,
            ])
            ->log("{$authUser->full_name} đã tham gia thẻ này");

        return response()->json(['message' => 'Bạn đã tham gia vào thẻ']);
    }
}
    
}
