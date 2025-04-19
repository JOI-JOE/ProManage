<?php

namespace App\Events;

use App\Models\Card;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CardArchiveToggled implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public $card;

    public function __construct(Card $card)
    {
        $this->card = $card;
    }

    public function broadcastOn()
    {
        return new Channel('boards.' . $this->card->list->board->id);
    }

    public function broadcastWith()
    {
        return [
            'card_id' => $this->card->id,
            'is_archived' => $this->card->is_archived,
        ];
    }

    public function broadcastAs()
    {
        return 'CardArchiveToggled';
    }
}
