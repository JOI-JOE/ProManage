<?php

namespace App\Http\Controllers\api;

use App\Events\CardMemberUpdated;
use App\Http\Controllers\Controller;
use App\Models\Card;
use App\Models\User;
use App\Notifications\CardMemberUpdatedNotification;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;

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
        $user = User::select(['id', 'full_name', 'user_name'])->findOrFail($request->user_id);
        $authUser = auth()->user(); // Người thực hiện hành động

        // Kiểm tra xem user đã là thành viên chưa
        $isMember = $card->members()->where('user_id', $user->id)->exists();

        if ($isMember) {
            $card->members()->detach($user->id);

            // Tìm log cũ (log khi user tham gia thẻ này)
            $lastJoinLog = Activity::where('subject_type', Card::class)
                ->where('subject_id', $card->id)
                ->where('causer_id', $user->id) // Log do chính user tạo
                ->where('description', 'like', "%đã tham gia thẻ này%")
                ->latest()
                ->first();

            // Nếu có log, xóa log này
            if ($lastJoinLog) {
                $lastJoinLog->delete();
            }

            // Nếu bị admin gỡ (không phải tự rời), ghi log
            if ($authUser->id !== $user->id) {
                $activity = activity()
                    ->causedBy($authUser)
                    ->performedOn($card)
                    ->withProperties([
                        'card_id' => $card->id,
                        'card_title' => $card->title,
                        'user_id' => $user->id,
                        'full_name' => $user->full_name,
                    ])
                    ->log("{$authUser->full_name} đã gỡ {$user->full_name} khỏi thẻ này");

                    $user->notify(new CardMemberUpdatedNotification($card, 'removed', $authUser, $activity, $user->id));

            } else {
                $activity = null;
            }

            broadcast(new CardMemberUpdated($card, $user, 'removed', $activity))->toOthers();

            return response()->json(['message' => 'Bạn đã rời khỏi thẻ']);
        } else {
            // Nếu chưa tham gia thì thêm vào
            $card->members()->syncWithoutDetaching([$user->id => ['assigned_at' => now()]]);

            // Ghi log tùy trường hợp
            if ($authUser->id === $user->id) {
                // Tự tham gia
                $activity = activity()
                    ->causedBy($authUser)
                    ->performedOn($card)
                    ->withProperties([
                        'card_id' => $card->id,
                        'card_title' => $card->title,
                        'user_id' => $user->id,
                        'user_name' => $user->user_name,
                    ])
                    ->log("{$authUser->full_name} đã tham gia thẻ này");
            } else {
                // Admin thêm thành viên khác
                $activity = activity()
                    ->causedBy($authUser)
                    ->performedOn($card)
                    ->withProperties([
                        'card_id' => $card->id,
                        'card_title' => $card->title,
                        'user_id' => $user->id,
                        'full_name' => $user->full_name,
                        // 'authUser' => $authUser->full_name,
                    ])
                    ->log("{$authUser->full_name} đã thêm {$user->full_name} vào thẻ này");

                    $user->notify(new CardMemberUpdatedNotification($card, 'added', $authUser, $activity, $user->id));

            }

            broadcast(new CardMemberUpdated($card, $user, 'added', $activity))->toOthers();

            return response()->json(['message' => 'Thành viên đã được thêm vào thẻ']);
        }
    }


}
