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
use Spatie\Activitylog\Models\Activity;

class ChecklistCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;


    public $checklist;
    public $activity;

    public function __construct(CheckList $checklist, Activity $activity)
    {
        $this->checklist = $checklist;
        $this->activity = $activity;
    }

    public function broadcastOn()
    {
        return new Channel('checklist.' . $this->checklist->card_id);
    }

    public function broadcastAs()
    {
        return 'checklist.created';
    }
}
