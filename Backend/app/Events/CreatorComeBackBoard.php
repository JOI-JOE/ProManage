<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CreatorComeBackBoard implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public $boardId;
    public $userId; // ID của creator
    public $userName; // Tên của creator
    public $memberIds; // Danh sách ID thành viên nhận thông báo

    public function __construct($boardId, $userId, $userName, $memberIds)
    {
        $this->boardId = $boardId;
        $this->userId = $userId;
        $this->userName = $userName;
        $this->memberIds = $memberIds;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn()
    {
        return array_map(function ($memberId) {
            return new PrivateChannel("App.Models.User.{$memberId}");
        }, $this->memberIds);
    }

    public function broadcastWith()
    {
        return [
            'board_id' => $this->boardId,
            'user_id' => $this->userId,
            'user_name' => $this->userName,
            'message' => "{$this->userName} đã trở lại bảng ",
        ];
    }
}
