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

class ChecklistItemUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $checklistItem;
    public $card;
    public $user;

    /**
     * Create a new event instance.
     */
    public function __construct($checklistItem, Card $card, $user)
    {
        $this->checklistItem = $checklistItem;
        $this->card = $card;
        $this->user = $user;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
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
            'checklist_item' => $this->checklistItem,
            'card_id' => $this->card->id,
            'user_id' => $this->user ? $this->user->id : null,
        ];
        Log::info(' data:', $data);
        return $data;
    }
}
