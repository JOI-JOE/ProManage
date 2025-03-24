<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CardDeleted implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public $cardId;
    public $boardId;

    public function __construct($cardId, $boardId)
    {
        $this->cardId = $cardId;
        $this->boardId = $boardId;
    }

    public function broadcastOn()
    {
        return new Channel('boards.' . $this->boardId);
    }

    public function broadcastWith()
    {
        return [
            'card_id' => $this->cardId
        ];
    }

    public function broadcastAs()
    {
        return 'CardDelete';
    }
}
