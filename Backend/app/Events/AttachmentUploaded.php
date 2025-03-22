<?php

namespace App\Events;

use App\Models\Attachment;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Spatie\Activitylog\Models\Activity;

class AttachmentUploaded implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $attachment;
    public $activity;
    public $cardId;
    public $uploadedBy;

    public function __construct(Attachment $attachment, Activity $activity, $uploadedBy)
    {
        $this->attachment = $attachment;
        $this->activity = $activity;
        $this->cardId = $attachment->card_id;
        $this->uploadedBy = $uploadedBy;
    }

    public function broadcastOn()
    {
        return new Channel('card.' . $this->cardId);
    }

    public function broadcastWith()
    {
        return [
            'attachment' => $this->attachment,
            'activity' => $this->activity,
            'uploaded_by' => $this->uploadedBy
        ];
    }

    public function broadcastAs()
    {
        return 'attachment.uploaded';
    }
}
