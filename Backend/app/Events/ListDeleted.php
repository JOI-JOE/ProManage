<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;

class ListDeleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $list_id;
    public $list_title;
    public $board_id;

    public function __construct($listId, $listTitle, $boardId)
    {
        $this->list_id = $listId;
        $this->list_title = $listTitle;
        $this->board_id = $boardId;
    }

    public function broadcastOn()
    {
        return new Channel("board.{$this->board_id}");
    }

    public function broadcastAs()
    {
        return 'list.deleted';
    }
}
