<?php

namespace App\Notifications;

use App\Models\Attachment;
use App\Models\Card;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AttachmentUploadedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $card;
    public $attachment;
    public $uploadedBy;

    public function __construct(Card $card, Attachment $attachment, $uploadedBy)
    {
        $this->card = $card;
        $this->attachment = $attachment;
        $this->uploadedBy = $uploadedBy;
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'type' => 'attachment_uploaded',
            'card_id' => $this->card->id,
            'card_title' => $this->card->title,
            'list_id' => $this->card->list->id ?? null,
            'list_name' => $this->card->list->name ?? null,
            'board_id' => $this->card->list->board->id ?? null,
            'board_name' => $this->card->list->board->name ?? null,
            // 'uploaded_by' => $this->uploadedBy,
            'by_user' => [
                // 'id' => $this->comment->user->id,
                'full_name' => $this->uploadedBy,
            ],
            'attachment_name' => $this->attachment->file_name_defaut,
            'attachment_path' => $this->attachment->path_url,
            'message' => "Đã đính kèm {$this->attachment->file_name_defaut}"
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage($this->toDatabase($notifiable));
    }
}