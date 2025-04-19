<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ChecklistItemDeleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $checklistItemId;
    public $card;

    public function __construct($checklistItemId, $card)
    {
        $this->card = $card;
        $this->checklistItemId = $checklistItemId;
    }

    public function broadcastOn()
    {
        return new Channel('card.' . $this->card->id);
    }

    public function broadcastAs()
    {
        return 'checklistItemItem.deleted';
    }


    public function broadcastWith()
    {
        $data = [
            'checklist_item_id' => $this->checklistItemId,
        ];
        Log::info('Hậu xóa checklistitem', $data);
        return $data;
    }
}
