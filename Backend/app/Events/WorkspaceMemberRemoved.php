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

class WorkspaceMemberRemoved implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $workspaceId;
    public $user;
    /**
     * Tạo instance sự kiện.
     *
     * @param User $user
     * @param Workspace $workspace
     */
    public function __construct($workspaceId, $user)
    {
        $this->workspaceId = $workspaceId;
        $this->user = $user;

        $this->dontBroadcastToCurrentUser();
    }


    public function broadcastOn(): array
    {
        return [
            new Channel("user.{$this->user->id}"),
            new Channel("workspace.{$this->workspaceId}")
        ];
    }

    /**
     * Tên sự kiện broadcast.
     */
    public function broadcastAs()
    {
        return 'workspace.member.removed';
    }

    /**
     * Dữ liệu sẽ được gửi kèm với sự kiện broadcast.
     *
     * @return array
     */
    public function broadcastWith()
    {
        $data = [
            'workspace_id' => $this->workspaceId,
            'user_id' => $this->user->id,
        ];
        Log::info('Xóa thành viên vào lạhklasjfkajsklfjlkasjfkl', $data);

        return $data;
    }
}
