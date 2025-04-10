<?php

namespace App\Events;

use App\Models\Attachment;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class CoverImageUpdated implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public $attachment;

    public function __construct(Attachment $attachment)
    {
        $this->attachment = $attachment;
    }

    public function broadcastOn()
    {
        return new Channel('card.' . $this->attachment->card_id);
    }

    public function broadcastWith()
    {
        return [
            'card_id' => $this->attachment->card_id,
            'attachment_id' => $this->attachment->id,
            'is_cover' => $this->attachment->is_cover,
            'file_url' => $this->attachment->file_url,
        ];
    }

    public function broadcastAs()
    {
        return 'attachment.coverUpload'; // Tên sự kiện
    }
}
