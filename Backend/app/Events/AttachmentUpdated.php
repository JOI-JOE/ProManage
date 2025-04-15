<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AttachmentUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $attachment;
    public $card;

    public function __construct($attachment, $card)
    {
        $this->attachment = $attachment;
        $this->card = $card;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('card.' . $this->card->id);
    }

    public function broadcastAs()
    {
        return 'attachment.updated';
    }

    public function broadcastWith()
    {
        return [
            'attachment' => $this->attachment,
            'card_id' => $this->card->id,
        ];
    }
}
