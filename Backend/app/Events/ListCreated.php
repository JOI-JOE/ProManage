<?php

namespace App\Events;

use App\Models\ListBoard;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log; // Import Log Facade


class ListCreated implements ShouldBroadcastNow
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
        return 'list.created';
    }

    public function broadcastWith()
    {
        $data = [
            'newList' => [
                'id' => $this->list->id,
                'boardId' => $this->list->board_id,
                'title' => $this->list->name,
                'position' => (int) $this->list->position,
                'cards' => [],
            ]
        ];
        Log::info('BroadcastWith được gọi', ['data' => $data]);

        return $data;
    }
}
