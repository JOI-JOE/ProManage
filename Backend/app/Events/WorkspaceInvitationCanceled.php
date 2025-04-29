<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class WorkspaceInvitationCanceled implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $workspaceId;

    public function __construct($workspaceId)
    {
        $this->workspaceId = $workspaceId;
    }

    public function broadcastOn()
    {
        return new Channel('workspace.invite.' . $this->workspaceId);
    }

    public function broadcastWith()
    {
        return [
            'workspaceId' => $this->workspaceId,
        ];
    }

    public function broadcastAs()
    {
        return 'invitation.canceled';
    }
}
