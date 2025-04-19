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

    public function __construct($checklistItem, $card)
    {
        $this->checklistItem = $checklistItem;
        $this->card = $card;
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
            'id' => $this->checklistItem->id,
            'card_id' => $this->card->id,
        ];
        Log::info('hậu đang làm checklistItem.created:', $data);
        return $data;
    }
}
