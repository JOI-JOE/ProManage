<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AcceptRequest implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $user_id;
    public $board_id;
    public $board_name;

    public function __construct($user_id, $board_id, $board_name)
    {
        $this->user_id = $user_id;
        $this->board_id = $board_id;
        $this->board_name = $board_name;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('user.' . $this->user_id);
    }

    public function broadcastWith()
    {
        return [
            'board_id' => $this->board_id,
            'board_name' => $this->board_name,
            'message' => "Bạn đã được thêm vào bảng <a href=\"/b/{$this->board_id}/{$this->board_name}\">{$this->board_name}</a>",
        ];
    }
}
