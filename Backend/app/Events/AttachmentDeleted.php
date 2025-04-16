<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class AttachmentDeleted implements ShouldBroadcastNow
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
        return new Channel('card.' . $this->card->id);
    }

    public function broadcastAs()
    {
        return 'attachment.deleted';
    }

    public function broadcastWith()
    {

        $data = [
            'attachment_id' => $this->attachmentId,
            'card_id' => $this->card->id,
        ];
        Log::info('Hậu đẹp trai xóa', $data);
        return $data;
    }
}
