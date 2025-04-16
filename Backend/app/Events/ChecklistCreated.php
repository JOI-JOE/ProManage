<?php

namespace App\Events;

use App\Models\Card;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ChecklistCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $checklistData;
    public $card;
    public $user;

    /**
     * Create a new event instance.
     */
    public function __construct(array $checklistData, Card $card, $user)
    {
        $this->checklistData = $checklistData;
        $this->card = $card;
        $this->user = $user;
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
            'checklist' => $this->checklistData,
            'user' => $this->user ? [
                'id' => (string) $this->user->id, // Ensure ID is a string
                'full_name' => $this->user->full_name,
            ] : null,
        ];

        // Debug: Log the data being broadcast
        Log::info('ChecklistCreated hậu data: ', $data);

        return $data;
    }
}
