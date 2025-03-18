<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChecklistDeleted implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public $checklistId;
    public $cardId;
    public $activity;

    public function __construct($checklistId, $cardId, $activity = null)
    {
        $this->checklistId = $checklistId;
        $this->cardId = $cardId;
        $this->activity = $activity;
    }

    public function broadcastOn()
    {
        return new Channel("checklist.{$this->cardId}");
    }

    public function broadcastAs()
    {
        return 'checklist.deleted';
    }
}
