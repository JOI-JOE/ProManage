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

    public $checklistId;
    public $card;

    public function __construct($checklistItemId, $checklistId, $card)
    {
        $this->card = $card;
        $this->checklistId = $checklistId;
        $this->checklistItemId = $checklistItemId;
    }

    public function broadcastOn()
    {
        return new Channel('card.' . $this->card->id);
    }

    public function broadcastAs()
    {
        return 'checklistItem.deleted';
    }


    public function broadcastWith()
    {
        $data = [
            'id' => $this->checklistItemId,
            'checklist_id' => $this->checklistId,
        ];
        Log::info('Broadcasting hậu xóa cái này', $data);
        return $data;
    }
}
