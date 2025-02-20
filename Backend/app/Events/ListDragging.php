<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ListDragging implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public $boardId;
    public $draggingListId;
    public $position;

    public function __construct($boardId, $draggingListId, $position)
    {
        $this->boardId = $boardId;
        $this->draggingListId = $draggingListId;
        $this->position = $position;

        Log::info("🔥 Sự kiện đã được phát: boardId={$boardId}, listId={$draggingListId}, position={$position}");
    }

    public function broadcastOn()
    {
        return new Channel('board.' . $this->boardId);
    }

    public function broadcastAs()
    {
        return 'list.dragging';
    }
}