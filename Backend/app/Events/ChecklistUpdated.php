<?php

namespace App\Events;

use App\Models\Card;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ChecklistUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $checklist;
    public $card;
    /**
     * Create a new event instance.
     */
    public function __construct($checklist, $card)
    {
        $this->checklist = $checklist;
        $this->card = $card;
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
        return 'checklist.updated';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        $data = [
            'id' => $this->checklist['id'] ?? null,
            'card_id' => $this->card->id,
        ];
        Log::info('Hậu sửa checklist data: ', $data);
        return $data;
    }
}
