<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChecklistItemDeleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $itemId;
    public $cardId;

    public function __construct($itemId, $cardId)
    {
        $this->itemId = $itemId;
        $this->cardId = $cardId;
    }

    public function broadcastOn()
    {
        return new Channel("checklist.{$this->cardId}"); // 🔥 Đổi từ checklistId => cardId
    }

    public function broadcastAs()
    {
        return "checklistItem.deleted";
    }
}
