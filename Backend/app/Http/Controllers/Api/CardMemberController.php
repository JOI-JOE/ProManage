<?php

namespace App\Http\Controllers\Api;

use App\Events\CardMemberUpdated;
use App\Events\CardUpdated;
use App\Http\Controllers\Controller;
use App\Models\Card;
use App\Models\User;
use App\Notifications\CardMemberUpdatedNotification;
use App\Services\GoogleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Spatie\Activitylog\Models\Activity;

class CardMemberController extends Controller
{
    protected $googleService;

    public function __construct(GoogleService $googleService)
    {
        $this->googleService = $googleService;
    }

    public function toggleJoin($cardId)
    {
        $card = Card::findOrFail($cardId);
        /** @var \App\Models\User|null $authUser */
        $authUser = auth()->user();
        if (!$authUser) {
            return response()->json(['message' => 'Chưa đăng nhập.'], 401);
        }

        $isMember = $card->members()->where('user_id', $authUser->id)->exists();

        if ($isMember) {
            $card->members()->detach($authUser->id);

            $lastJoinLog = Activity::where('subject_type', Card::class)
                ->where('subject_id', $card->id)
                ->where('causer_id', $authUser->id)
                ->where('description', 'like', "%đã tham gia thẻ này%")
                ->latest()
                ->first();

            if ($lastJoinLog) {
                $lastJoinLog->delete();
            }

            $activity = activity()
                ->causedBy($authUser)
                ->performedOn($card)
                ->withProperties([
                    'card_id' => $card->id,
                    'card_title' => $card->title,
                    'user_id' => $authUser->id,
                    'full_name' => $authUser->full_name,
                ])
                ->log("{$authUser->full_name} đã rời khỏi thẻ này");

            try {
                $notifications = [
                    [
                        'user_name' => $authUser->full_name,
                        'action' => "đã rời khỏi thẻ",
                        'context' => $card->title,
                    ],
                ];

                Log::info('Queuing email in toggleJoin (leave)', [
                    'email' => $authUser->email,
                    'subject' => "Bạn Đã Rời Khỏi Thẻ: {$card->title}",
                ]);

                broadcast(new CardUpdated($card))->toOthers();
            } catch (\Exception $e) {
                Log::error('Failed to queue email or broadcast in toggleJoin: ' . $e->getMessage(), ['card_id' => $card->id]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Rời khỏi thẻ thành công.',
                'joined' => false,
            ]);
        } else {
            $card->members()->syncWithoutDetaching([$authUser->id => ['assigned_at' => now()]]);

            $activity = activity()
                ->causedBy($authUser)
                ->performedOn($card)
                ->withProperties([
                    'card_id' => $card->id,
                    'card_title' => $card->title,
                    'user_id' => $authUser->id,
                    'full_name' => $authUser->full_name,
                ])
                ->log("{$authUser->full_name} đã tham gia thẻ này");

            try {
                $notifications = [
                    [
                        'user_name' => $authUser->full_name,
                        'action' => "đã tham gia thẻ",
                        'context' => $card->title,
                    ],
                ];

                Log::info('Queuing email in toggleJoin (join)', [
                    'email' => $authUser->email,
                    'subject' => "Bạn Đã Tham Gia Thẻ: {$card->title}",
                ]);

                broadcast(new CardMemberUpdated($card, $authUser, 'added', $activity))->toOthers();
                broadcast(new CardUpdated($card))->toOthers();
            } catch (\Exception $e) {
                Log::error('Failed to queue email or broadcast in toggleJoin: ' . $e->getMessage(), ['card_id' => $card->id]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Tham gia thẻ thành công.',
                'joined' => true,
            ]);
        }
    }

    public function store($cardId, $memberId)
    {
        $card = Card::findOrFail($cardId);
        $user = User::select(['id', 'full_name', 'email'])->findOrFail($memberId);
        /** @var \App\Models\User|null $authUser */
        $authUser = auth()->user();
        if (!$authUser) {
            return response()->json(['message' => 'Chưa đăng nhập.'], 401);
        }

        $isMember = $card->members()->where('user_id', $memberId)->exists();

        if ($isMember) {
            return response()->json([
                'message' => 'Thành viên đã có trong thẻ.',
                'success' => false,
                'memberId' => $memberId,
            ], 422);
        }

        $card->members()->syncWithoutDetaching([$memberId => ['assigned_at' => now()]]);

        $activity = activity()
            ->causedBy($authUser)
            ->performedOn($card)
            ->withProperties([
                'card_id' => $card->id,
                'card_title' => $card->title,
                'user_id' => $user->id,
                'full_name' => $user->full_name,
            ])
            ->log("{$authUser->full_name} đã thêm {$user->full_name} vào thẻ này");

        try {
            $notifications = [
                [
                    'user_name' => $authUser->full_name,
                    'action' => "đã thêm bạn vào thẻ",
                    'context' => $card->title,
                ],
            ];

            Log::info('Queuing email in store', [
                'email' => $user->email,
                'subject' => "Bạn Đã Được Thêm Vào Thẻ: {$card->title}",
            ]);

            broadcast(new CardUpdated($card))->toOthers();
        } catch (\Exception $e) {
            Log::error('Failed to queue email or broadcast in store: ' . $e->getMessage(), [
                'card_id' => $card->id,
                'exception' => $e->getTraceAsString(),
            ]);
        }

        return response()->json([
            'message' => 'Thêm thành viên vào thẻ thành công.',
            'success' => true,
            'memberId' => $memberId,
        ]);
    }

    public function remove($cardId, $memberId)
    {
        $card = Card::findOrFail($cardId);
        $user = User::select(['id', 'full_name', 'email'])->findOrFail($memberId);
        /** @var \App\Models\User|null $authUser */
        $authUser = auth()->user();
        if (!$authUser) {
            return response()->json(['message' => 'Chưa đăng nhập.'], 401);
        }

        $isMember = $card->members()->where('user_id', $memberId)->exists();

        if (!$isMember) {
            return response()->json([
                'message' => 'Thành viên này không có trong thẻ.',
                'success' => false,
                'memberId' => $memberId,
                'removed' => false,
            ], 422);
        }

        $card->members()->detach($memberId);

        if ($authUser->id === $user->id) {
            $lastJoinLog = Activity::where('subject_type', Card::class)
                ->where('subject_id', $card->id)
                ->where('causer_id', $user->id)
                ->where('description', 'like', "%đã tham gia thẻ này%")
                ->latest()
                ->first();

            if ($lastJoinLog) {
                $lastJoinLog->delete();
            }
        }

        $activity = activity()
            ->causedBy($authUser)
            ->performedOn($card)
            ->withProperties([
                'card_id' => $card->id,
                'card_title' => $card->title,
                'user_id' => $user->id,
                'full_name' => $user->full_name,
            ])
            ->log($authUser->id === $user->id
                ? "{$authUser->full_name} đã rời khỏi thẻ này"
                : "{$authUser->full_name} đã gỡ {$user->full_name} khỏi thẻ này");

        try {
            if ($authUser->id !== $user->id) {
                $notifications = [
                    [
                        'user_name' => $authUser->full_name,
                        'action' => "đã xóa bạn khỏi thẻ",
                        'context' => $card->title,
                    ],
                ];

                Log::info('Queuing email in remove', [
                    'email' => $user->email,
                    'subject' => "Bạn Đã Bị Xóa Khỏi Thẻ: {$card->title}",
                ]);

               
            } else {
                Log::info('Skipping email in remove: User is removing themselves', [
                    'authUser_id' => $authUser->id,
                    'user_id' => $user->id,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to queue email in remove: ' . $e->getMessage(), [
                'card_id' => $card->id,
                'exception' => $e->getTraceAsString(),
            ]);
        }

        return response()->json([
            'message' => 'Xóa thành viên khỏi thẻ thành công.',
            'success' => true,
            'memberId' => $memberId,
            'removed' => true,
        ]);
    }
}
