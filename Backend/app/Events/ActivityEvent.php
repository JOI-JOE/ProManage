<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ActivityEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $activity;
    public $cardId;
    public $userIds; // Chỉ những người trong thẻ mới nhận sự kiện

    public function __construct($activity, $cardId, $userIds)
    {
        $this->activity = $activity;
        $this->cardId = $cardId;
        $this->userIds = $userIds;
    }

    public function broadcastOn()
    {
        // Phát sự kiện chỉ đến những thành viên trong thẻ
        return collect($this->userIds)->map(function ($userId) {
            return new PrivateChannel('user.' . $userId);
        })->toArray();
    }

    public function broadcastWith()
    {
        return [
            'activity' => $this->activity,
            'card_id' => $this->cardId,
            'user_ids' => $this->userIds,   

        ];
    }
}
