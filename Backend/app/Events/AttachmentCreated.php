<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast; // Use this
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AttachmentCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $attachment;

    public function __construct($attachment)
    {
        $this->attachment = $attachment;
    }

    public function broadcastOn()
    {
        return new Channel('card.' . $this->attachment['card_id']);
    }

    public function broadcastAs()
    {
        return 'attachment.created';
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->attachment['id'] ?? null,
            'file_name' => $this->attachment['file_name'] ?? '',
            'path_url' => $this->attachment['path_url'] ?? '',
            'file_name_defaut' => $this->attachment['file_name_defaut'] ?? '',
            'is_cover' => $this->attachment['is_cover'] ?? false,
            'type' => $this->attachment['type'],
            'card_id' => $this->attachment['card_id'] ?? null,
            'updated_at' => $this->attachment['updated_at'] ?? now(),
            'created_at' => $this->attachment['created_at'] ?? now(),
        ];
    }
}
