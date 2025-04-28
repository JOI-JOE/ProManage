<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Support\Facades\Log;

class WorkspaceMemberUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $workspaceId;
    public $user;

    /**
     * Tạo instance sự kiện.
     */
    public function __construct($workspaceId, User $user)
    {
        $this->workspaceId = $workspaceId;
        $this->user = $user;

        $this->dontBroadcastToCurrentUser();
    }

    /**
     * Các kênh mà sự kiện này sẽ broadcast đến.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        return [
            new Channel("workspace.{$this->workspaceId}")
        ];
    }

    /**
     * Tên sự kiện broadcast.
     */
    public function broadcastAs()
    {
        return 'workspace.member.updated';
    }
    /**
     * Dữ liệu sẽ được gửi kèm với sự kiện broadcast.
     *
     * @return array
     */
    public function broadcastWith()
    {
        // Xây dựng dữ liệu payload
        $data = [
            'workspace_id' => $this->workspaceId,
            'user_id' => $this->user->id,
        ];
        Log::info('Chuyển giao quyền lực vào lạhklasjfkajsklfjlkasjfkl', $data);

        return $data;
    }
}
