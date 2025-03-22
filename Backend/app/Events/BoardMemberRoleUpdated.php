<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BoardMemberRoleUpdated implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public $boardId;
    public $userId;
    public $role;

    public function __construct($boardId, $userId, $role)
    {
        $this->boardId = $boardId;
        $this->userId = $userId;
        $this->role = $role;
    }

    public function broadcastOn()
    {
        return new Channel('boards.' . $this->boardId);
    }

    public function broadcastWith()
    {
        return [
            'user_id' => $this->userId,
            'role' => $this->role,
        ];
    }

    public function broadcastAs()
    {
        return 'BoardUpdateRole';
    }
}
