<?php

namespace App\Events;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Support\Facades\Log;

class SendRequestJoinWorkspace implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $user;
    public $workspace;

    /**
     * Tạo instance sự kiện.
     *
     * @param User $user
     * @param Workspace $workspace
     */
    public function __construct(User $user, Workspace $workspace)
    {
        $this->user = $user;
        $this->workspace = $workspace;
    }

    /**
     * Các kênh mà sự kiện này sẽ broadcast đến.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        return new Channel("workspace.{$this->workspace->id}");
    }

    /**
     * Tên sự kiện broadcast.
     */
    public function broadcastAs()
    {
        return 'JoinRequestSent';
    }

    /**
     * Dữ liệu sẽ được gửi kèm với sự kiện broadcast.
     *
     * @return array
     */
    public function broadcastWith()
    {
        $payload = [
            'user' => $this->user->only(['id', 'name', 'email']),
            'workspace' => $this->workspace->only(['id', 'name']),
        ];

        Log::info('Broadcasting WorkspaceMemberUpdated event with payload:', $payload);

        return $payload;
    }
}
