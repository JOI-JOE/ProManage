<?php

namespace App\Events;

use App\Models\CommentCard;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CardCompletedToggled implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public $card;

    public function __construct($card)
    {
        $this->card = $card;
    }

    public function broadcastOn()
    {
        return new Channel('card.' . $this->card->id); // Phát theo 
    }

    public function broadcastAs()
    {
        return 'card.toggled'; // Tên sự kiện
    }
}
