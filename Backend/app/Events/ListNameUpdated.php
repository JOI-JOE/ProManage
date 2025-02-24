<?php

namespace App\Events;

use App\Models\ListBoard;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ListNameUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $list;

    public function __construct(ListBoard $list)
    {
        $this->list = $list;
    }

    public function broadcastOn()
    {
        return new Channel('list.' . $this->list->id);// Kênh theo boardId
    }

    public function broadcastAs()
    {
        return 'list.nameUpdated'; // Tên sự kiện
    }
}
