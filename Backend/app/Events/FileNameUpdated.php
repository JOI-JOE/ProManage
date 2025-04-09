<?php
namespace App\Events;

use App\Models\Attachment;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class FileNameUpdated implements ShouldBroadcast
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
            'file_name_defaut' => $this->attachment->file_name_defaut,
        ];
    }

    public function broadcastAs()
    {
        return 'attachment.fileNameUpload'; // Tên sự kiện
    }
}
