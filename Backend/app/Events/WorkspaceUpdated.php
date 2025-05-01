<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class WorkspaceUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $workspace;

    public $userId;

    public function __construct($workspace, $userId)
    {
        $this->workspace = $workspace;
        $this->userId = $userId;
    }
    /**
     * The channels the event should broadcast on.
     */
    public function broadcastOn()
    {
        return [
            new Channel("workspace.{$this->workspace->id}")
        ];
    }

    public function broadcastWith(): array
    {
        // Xây dựng dữ liệu payload
        $data = [
            'workspace_id' => $this->workspace->id,
            'user_id' => $this->userId,
        ];
        return $data;
    }

    public function broadcastAs()
    {
        return 'workspace.updated';
    }
}
