<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class AttachmentDeleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $attachmentId;
    public $cardId;

    public function __construct($attachmentId, $cardId)
    {
        $this->attachmentId = $attachmentId;
        $this->cardId = $cardId;
    }

    public function broadcastOn()
    {
        return new Channel('card.' . $this->cardId);
    }

    public function broadcastAs()
    {
        return 'attachment.deleted';
    }

    public function broadcastWith()
    {
        $data = [
            'attachment_id' => $this->attachmentId,
            'card_id' => $this->cardId,
        ];

        Log::info('Broadcasting AttachmentDeleted', $data);

        return $data;
    }
}
