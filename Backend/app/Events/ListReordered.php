<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ListReordered implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $boardId;
    public $positions;
    public $timestamp;

    public function __construct($boardId, $positions, $timestamp)
    {
        $this->boardId = $boardId;
        $this->positions = $positions;
        $this->timestamp = $timestamp;
    }

    public function broadcastOn()
    {
        return new Channel('board.' . $this->boardId);
    }

    public function broadcastAs()
    {
        return 'list.reordered';
    }

    public function broadcastWith()
    {
        return [
            'lists' => $this->positions,
            'timestamp' => $this->timestamp,
        ];
    }
}
