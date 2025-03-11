<?php

namespace App\Events;

use App\Models\Card;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log; // Import Log Facade


class CardCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public $card;

    public function __construct(Card $card)
    {
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
            new Channel('board.' . $this->card->listBoard->board_id),
        ];
    }

    public function broadcastAs()
    {
        return 'card.created';
    }

    public function broadcastWith()
    {
        Log::info('CardCreated event broadcasted', [
            'card' => $this->card,
        ]);

        return [
            'id'  => $this->card->id,
            'columnId' => $this->card->list_board_id,
            'title' => $this->card->title,
            'position' => $this->card->position,
        ];
    }
}
