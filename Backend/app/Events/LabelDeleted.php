<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LabelDeleted implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public $labelId;
    public $boardId;

    public function __construct($labelId, $boardId)
    {
        $this->labelId = $labelId;
        $this->boardId = $boardId;
    }

    public function broadcastOn()
    {
        return new Channel('board.' . $this->boardId); // Kênh realtime theo boardId
    }

    public function broadcastAs()
    {
        return 'label.deleted'; // Tên sự kiện
    }
}