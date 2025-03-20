<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MemberJoinedBoard implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public $creatorId; // ID của chủ bảng
    public $boardId;
    public $userName; // Tên người vừa tham gia


    public function __construct($creatorId, $boardId, $userName)
    {
        $this->creatorId = $creatorId;
        $this->boardId = $boardId;
        $this->userName = $userName;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     * 
     * 
     */

     public function broadcastOn()
    {
        // Gửi tới channel riêng của chủ bảng
        return new PrivateChannel('user.' . $this->creatorId);
    }

   public function broadcastWith()
    {
        return [
            'message' => "{$this->userName} vừa tham gia bảng",
            'board_id' => $this->boardId,
        ];
    }
}
