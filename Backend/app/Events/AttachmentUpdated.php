<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class AttachmentUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $attachment;
    public $cardId;

    public function __construct($attachment, $cardId)
    {
        $this->attachment = $attachment;
        $this->cardId = $cardId;
    }

    public function broadcastOn()
    {
        return new Channel('card.' . $this->cardId);
    }

    public function broadcastAs()
    {
        return 'attachment.updated';
    }

    public function broadcastWith()
    {
        $data = [
            'attachment_id' => $this->attachment->id,
        ];
        return $data;
    }
}
