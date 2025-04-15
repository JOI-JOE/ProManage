<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AttachmentDeleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $attachmentId;
    public $card;

    public function __construct($attachmentId, $card)
    {
        $this->attachmentId = $attachmentId;
        $this->card = $card;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('card.' . $this->card->id);
    }

    public function broadcastAs()
    {
        return 'attachment.deleted';
    }

    public function broadcastWith()
    {
        return [
            'attachment_id' => $this->attachmentId,
            'card_id' => $this->card->id,
        ];
    }
}
