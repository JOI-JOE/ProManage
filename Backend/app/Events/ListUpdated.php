<?php

namespace App\Events;

use App\Models\ListBoard;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ListUpdated implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

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
        // Sử dụng Channel để broadcast công khai (bất kỳ ai cũng có thể nhận sự kiện)
        return new Channel('board.' . $this->list->board_id);
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
        $data = [
            'id'       => $this->list->id,
            'boardId'  => $this->list->board_id,
            'name'    => $this->list->name,
            'position' => $this->list->position,
            'closed'   => $this->list->closed
        ];
        return $data;
    }
}
