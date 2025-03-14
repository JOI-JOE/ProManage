<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CardMemberUpdated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public $cardId;
    public $userId;
    public $action;

    public function __construct($cardId, $userId, $action)
    {
         $this->cardId = $cardId;
        $this->userId = $userId;
        $this->action = $action;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel("card.{$this->cardId}"),
        ];
    }

    public function broadcastWith()
    {
        return [
            'card_id' => $this->cardId,
            'user_id' => $this->userId,
            'action'  => $this->action, // 'added' hoặc 'removed'
        ];
    }
}
