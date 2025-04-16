<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ChecklistItemDeleted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $checklistItemId;
    public $checklistId;
    public $cardId;
    public $userId;

    public function __construct($checklistItemId, $checklistId, $cardId, $userId)
    {
        $this->checklistItemId = $checklistItemId;
        $this->checklistId = $checklistId;
        $this->cardId = $cardId;
        $this->userId = $userId;
    }

    public function broadcastOn()
    {
        return new Channel('card.' . $this->cardId);
    }

    public function broadcastWith()
    {
        $data = [
            'checklist_item_id' => $this->checklistItemId,
            'checklist_id' => $this->checklistId,
            'card_id' => $this->cardId,
            'user_id' => $this->userId,
        ];
        Log::info('Broadcasting checklistItem.deleted:', $data);
        return $data;
    }

    public function broadcastAs()
    {
        return 'checklistItem.deleted';
    }
}
