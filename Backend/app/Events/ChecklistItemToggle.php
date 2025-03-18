<?php

namespace App\Events;

use App\Models\ChecklistItem;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Spatie\Activitylog\Models\Activity;

class ChecklistItemToggle implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;



     public $checklistItem;
     public $cardId;
     public $activity;
     public function __construct(ChecklistItem $checklistItem, $cardId, ?Activity $activity)
    {
        $this->checklistItem = $checklistItem;
        $this->cardId = $cardId;
        $this->activity = $activity;
    }


    public function broadcastOn()
    {
        return new Channel('checklist.' . $this->checklistItem->checklist->card_id); // Kênh theo checklist_id
    }

    public function broadcastAs()
    {
        return 'checklistItem.toggle';
    }
}
