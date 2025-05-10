<?php

namespace App\Events;

use App\Models\ChecklistItem;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;

class ChecklistItemDatesUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $item;
    public $user_name;

    public function __construct(ChecklistItem $item, $user_name)
    {
        $this->item = $item;
        $this->user_name = $user_name;
    }

    public function broadcastOn()
    {
        return new Channel('card.' . $this->item->checklist->card_id); // Broadcast theo card ID
    }

    public function broadcastAs()
    {
        return 'checklist-item.dates-updated';
    }

    public function broadcastWith()
    {
        return [
            'checklist_item_id' => $this->item->id,
            'user_name' => $this->user_name,
            'end_date' => $this->item->end_date,
            'end_time' => $this->item->end_time,
            'reminder' => $this->item->reminder,
        ];
    }
}
