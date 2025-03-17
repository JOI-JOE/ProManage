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

class ChecklistItemUpdated implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public $checklistItem;

    public function __construct(ChecklistItem $checklistItem)
    {
        \Log::info("🔥 ChecklistItemCreated Event Triggered: ", ['item' => $checklistItem]);
        $this->checklistItem = $checklistItem;
    }


    public function broadcastOn()
    {
        return new Channel('checklist.' . $this->checklistItem->checklist->card_id); // Kênh theo checklist_id
    }

    public function broadcastAs()
    {
        return 'checklistItem.updated';
    }
}

