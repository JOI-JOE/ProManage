<?php

namespace App\Events;

use App\Models\ListBoard;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class ListNameUpdated implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public $list;

    public function __construct(ListBoard $list)
    {
        $this->list = $list;
    }

    public function broadcastOn()
    {
        return new Channel('board.' . $this->list->board_id);
        // hoặc PrivateChannel nếu cần xác thực
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->list->id,
            'name' => $this->list->name,
        ];
    }

    public function broadcastAs()
    {
        return 'list.name.updated';
    }
}
