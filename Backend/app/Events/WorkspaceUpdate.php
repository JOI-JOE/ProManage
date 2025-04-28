<?php

namespace App\Events;

use App\Models\Workspace;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;

class WorkspaceUpdate implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $workspace;

    /**
     */
    public function __construct(Workspace $workspace)
    {
        $this->workspace = $workspace;
    }

    /**
     * The channels the event should broadcast on.
     */
    public function broadcastOn()
    {
        return new Channel('workspace.' . $this->workspace->id);
    }

    public function broadcastWith(): array
    {
        // Xây dựng dữ liệu payload
        $data = [
            'id' => $this->workspace->id,
        ];

        return $data;
    }

    /**
     * The name of the event being broadcast.
     *
     * @return string
     */
    public function broadcastAs()
    {
        return 'workspace.updated';
    }
}
