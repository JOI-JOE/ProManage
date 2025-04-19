<?php

namespace App\Events;

use App\Http\Resources\WorkspaceResource;
use App\Models\Workspace;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class WorkspaceCreate implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $workspace;

    public function __construct(Workspace $workspace)
    {
        $this->workspace = $workspace;
    }

    public function broadcastOn(): array
    {
        $workspaceResource = new WorkspaceResource($this->workspace);
        $workspaceArray = $workspaceResource->toArray(request()); // Important: Pass the request!

        Log::info(message: "Create Workspace: " . print_r($workspaceArray, true));
        return [
            new Channel('workspace'),
        ];
    }
}
