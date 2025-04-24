<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Support\Facades\Log;

class MemberInvitedToWorkspace implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $workspaceId;
    public $user;

    public function __construct($workspaceId, $user)
    {
        $this->workspaceId = $workspaceId;
        $this->user = $user;
    }

    public function broadcastOn()
    {
        return new Channel("user.{$this->user->id}");
    }

    public function broadcastWith()
    {
        $data = [
            'user' => [
                'id' => $this->user->id,
                'email' => $this->user->email,
                'name' => $this->user->name,
                'workspaceId' => $this->workspaceId
            ],
        ];

        Log::info('Broadcast payload for MemberInvitedToWorkspace', $data);

        return $data;
    }

    public function broadcastAs()
    {
        return 'MemberInvitedToWorkspace';
    }
}
