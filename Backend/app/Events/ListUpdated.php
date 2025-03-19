<?php

namespace App\Events;

use App\Models\ListBoard;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
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

    /**
     * Define the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        // Thay đổi từ Channel sang PrivateChannel
        return new PrivateChannel('board.' . $this->list->board_id);
    }

    /**
     * Define the event name.
     *
     * @return string
     */
    public function broadcastAs()
    {
        return 'list.updated';
    }

    /**
     * Define the data to be broadcast.
     *
     * @return array
     */
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
