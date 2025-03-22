<?php

namespace App\Events;

use App\Models\ListBoard;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ListUpdated implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public $list;

    public function __construct(ListBoard $list)
    {
        $this->list = $list;
        Log::info('ListUpdated event created', [
            'list_id'  => $list->id,
            'board_id' => $list->board_id,
            'title'    => $list->name,
            'position' => (int)$list->position,
        ]);
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
            'updatedList' => [
                'id'       => $this->list->id,
                'boardId'  => $this->list->board_id,
                'title'    => $this->list->name,
                'position' => (int)$this->list->position,
            ]
        ];

        Log::info('Broadcasting list.updated event', $data);
        return $data;
    }
}
