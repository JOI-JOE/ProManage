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
    public $action; // 'removed' | 'updated'
    public $memberType; // 'admin' | 'member' | null nếu là bị xoá

    /**
     * Tạo instance sự kiện.
     *
     * @param int $workspaceId
     * @param User $user
     * @param string $action
     * @param string|null $memberType
     */
    public function __construct($workspaceId, User $user, string $action, ?string $memberType = null)
    {
        $this->workspaceId = $workspaceId;
        $this->user = $user;
        $this->action = $action;
        $this->memberType = $memberType;
    }

    /**
     * Các kênh mà sự kiện này sẽ broadcast đến.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
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
        return 'WorkspaceMemberUpdated';
    }
    /**
     * Dữ liệu sẽ được gửi kèm với sự kiện broadcast.
     *
     * @return array
     */
    public function broadcastWith()
    {
        // Xây dựng dữ liệu payload
        $payload = [
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'workspaceId' => $this->workspaceId,
            ],
            'action' => $this->action,
            'memberType' => $this->memberType,
        ];

        // Ghi log payload trước khi broadcast
        Log::info('Broadcasting WorkspaceMemberUpdated Event', $payload);

        // Trả về dữ liệu payload
        return $payload;
    }
}
