<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AttachmentDeletedWithActivity implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public $cardId;
    public $attachmentId;
    public $fileName;
    public $activity;

    public function __construct($cardId, $attachmentId, $fileName, $activity)
    {
        $this->cardId = $cardId;
        $this->attachmentId = $attachmentId;
        $this->fileName = $fileName;
        $this->activity = $activity;
    }

    public function broadcastOn()
    {
        return new Channel('card.' . $this->cardId);
    }

    public function broadcastAs()
    {
        return 'attachment.deleted_with_activity';
    }
}
