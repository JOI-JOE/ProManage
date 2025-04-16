<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class AttachmentUpdated implements ShouldBroadcastNow
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
        return new Channel('card.' . $this->card->id);
    }

    public function broadcastAs()
    {
        return 'attachment.updated';
    }

    public function broadcastWith()
    {
        $data = [
            'attachment' => $this->attachment,
            'card_id' => $this->card->id,
        ];
        Log::info('Hậu đẹp trai update', $data);
        return $data;
    }
}
