<?php

namespace App\Events;

use App\Http\Resources\WorkspaceResource;
use App\Models\Workspace;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class WorkspaceUpdate implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $workspace;
    /**
     * Create a new event instance.
     */
    public function __construct(Workspace $workspace)
    {
        $this->workspace = $workspace;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $workspaceResource = new WorkspaceResource($this->workspace);
        $workspaceArray = $workspaceResource->toArray(request()); // Important: Pass the request!

        Log::info("Updated Workspace: " . print_r($workspaceArray, true));
        return [
            new Channel('workspace'),
        ];
    }
}
