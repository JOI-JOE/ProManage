<?php

namespace App\Events;

use App\Models\Card;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ChecklistItemUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $checklistItem;
    public $card;

    /**
     * Create a new event instance.
     */
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

    /**
     * The event's broadcast name.
     */
    public function broadcastAs()
    {
        return 'checklistItem.updated';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        $data = [
            'id' => $this->checklistItem->id,
            'checklist_id' => $this->checklistItem->checklist_id,
            'card_id' => $this->card->id,
        ];
        Log::info('hậu đang cập nhập cai này data:', $data);
        return $data;
    }
}
