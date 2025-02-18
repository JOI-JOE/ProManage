<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CardCreate
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $card;

    public function __construct($card)
    {
        $this->card = $card;
    }

    public function broadcastOn()
    {
        return ['cards-channel'];
    }

    public function broadcastAs()
    {
        return 'card-created';
    }
    public function broadcastWith()
    {
        return ['card' => $this->card];
    }
}
