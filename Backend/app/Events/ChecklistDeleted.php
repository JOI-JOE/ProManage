<?php

namespace App\Events;

use App\Models\Card;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ChecklistDeleted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $checklistId;
    public $card;
    public $user;

    /**
     * Create a new event instance.
     */
    public function __construct($checklistId, Card $card, $user)
    {
        $this->checklistId = $checklistId;
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
    public function broadcastAs(): string
    {
        return 'checklist.deleted';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        $data = [
            'checklist_id' => $this->checklistId,
            'card_id' => $this->card->id,
        ];

        Log::info('Hậu xóa checklist', $data);
        return $data;
    }
}
