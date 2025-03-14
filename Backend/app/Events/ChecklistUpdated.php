<?php

namespace App\Events;

use App\Models\CheckList;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChecklistUpdated implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public $checklist;

    public function __construct(CheckList $checklist)
    {
        $this->checklist = $checklist;
    }

    public function broadcastOn()
    {
        return new Channel('checklist.' . $this->checklist->card_id); 
    }

    public function broadcastAs()
    {
        return "checklist.updated";
    }
}
