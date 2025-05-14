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

class CardDatesUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $card;
    public $changes;
    public $userName;

    public function __construct(Card $card, array $changes, $userName)
    {
        $this->card = $card;
        $this->changes = $changes;
        $this->userName = $userName;
    }

    public function broadcastOn()
    {
        return new Channel('card.' . $this->card->id);
    }

    public function broadcastWith()
    {
        return [
            'card_id' => $this->card->id,
            'changes' => $this->changes,
            'user_name' => $this->userName,
        ];
    }

    public function broadcastAs()
    {
        return 'card.dates-updated';
    }
}
