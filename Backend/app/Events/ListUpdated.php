<?php

namespace App\Events;

use App\Models\ListBoard;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ListUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $list;

    public function __construct(ListBoard $list)
    {
        $this->list = $list;
    }

    public function broadcastOn()
    {
        return new Channel('board.' . $this->list->board_id);
    }

    public function broadcastAs()
    {
        return 'list.updated';
    }

    public function broadcastWith()
    {
        return [
            'updatedList' => [
                'id' => $this->list->id,
                'boardId' => $this->list->board_id,
                'title' => $this->list->name, // Cập nhật tên list
                'position' => (int) $this->list->position, // Cập nhật vị trí list
            ]
        ];
    }
}
