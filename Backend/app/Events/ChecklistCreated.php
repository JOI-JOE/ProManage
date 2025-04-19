<?php

namespace App\Events;

use App\Models\Card;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ChecklistCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $checklist;

    protected $card;
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
        return 'checklist.created';
    }

    /**
     * Data to broadcast.
     */
    public function broadcastWith(): array
    {
        $data = [
            'id' => $this->checklist['id'] ?? null,
        ];

        // Debug: Log the data being broadcast
        Log::info('ChecklistCreated hậu data: ', $data);

        return $data;
    }
}
