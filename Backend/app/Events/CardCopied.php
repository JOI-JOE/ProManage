<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CardCopied implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public $card;

    public function __construct($card)
    {
        $this->card = $card;
    }
   
    public function broadcastOn()
    {
        // Channel có thể là theo board để các thành viên cùng xem

        return new Channel('boards.' . $this->card->list->board->id);
        // return new Channel('card.' . $this->card->id); // Phát theo 

    }

    public function broadcastAs()
    {
        return 'card.copied';
    }

}
