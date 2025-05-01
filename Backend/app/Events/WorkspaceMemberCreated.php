<?php

namespace App\Events;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class WorkspaceMemberCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $workspaceId;
    public $user;

    /**
     * Create a new event instance.
     */
    public function __construct($workspaceId, $user)
    {
        $this->workspaceId = $workspaceId;
        $this->user = $user;
    }
    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel("user.{$this->user->id}"),
            new Channel("workspace.{$this->workspaceId}")
        ];
    }

 
    public function broadcastAs(): string
    {
        return 'workspace.member.created';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array
     */
    public function broadcastWith(): array
    {

        $data = [
            'workspace_id' => $this->workspaceId,
            'user_id' => $this->user->id,
        ];
        Log::info('Thềm thành viên vào lạhklasjfkajsklfjlkasjfkl', $data);

        return $data;
    }
}
