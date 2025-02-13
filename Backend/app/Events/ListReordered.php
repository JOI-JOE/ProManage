<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ListReordered implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $boardId;
    public $positions;
    
    public function __construct($boardId, $positions)
    {
        $this->boardId = $boardId;
        $this->positions = $positions;
    }

    
    public function broadcastOn()
    {
        return new Channel('board.' . $this->boardId);
    }


    public function broadcastAs()
    {
        return 'list.reordered';
    }
}
