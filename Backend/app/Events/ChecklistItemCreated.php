<?php

namespace App\Events;

use App\Models\Card;
use App\Models\ChecklistItem;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ChecklistItemCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $checklistItem;
    public $card;
    public $user;

    public function __construct(ChecklistItem $checklistItem, Card $card, $user)
    {
        $this->checklistItem = $checklistItem;
        $this->card = $card;
        $this->user = $user;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('card.' . $this->card->id),
        ];
    }

    public function broadcastAs()
    {
        return 'checklistItem.created';
    }

    public function broadcastWith(): array
    {
        $data = [
            'checklist_item' => [
                'id' => $this->checklistItem->id,
                'checklist_id' => $this->checklistItem->checklist_id,
                'name' => $this->checklistItem->name,
                'is_completed' => $this->checklistItem->is_completed,
                'start_date' => $this->checklistItem->start_date,
                'end_date' => $this->checklistItem->end_date,
                'end_time' => $this->checklistItem->end_time,
                'reminder' => $this->checklistItem->reminder,
                'assignee' => $this->checklistItem->assignee,
                'created_at' => $this->checklistItem->created_at,
                'updated_at' => $this->checklistItem->updated_at,
            ],
            'card_id' => $this->card->id,
            'user_id' => $this->user ? $this->user->id : null,
        ];
        Log::info('Broadcasting checklistItem.created:', $data);
        return $data;
    }
}
