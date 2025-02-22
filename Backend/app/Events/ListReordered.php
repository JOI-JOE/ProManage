<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ListReordered implements ShouldBroadcastNow
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
        return new Channel("board.{$this->boardId}");
    }

    public function broadcastAs()
    {
        return 'list.reordered';
    }
}
