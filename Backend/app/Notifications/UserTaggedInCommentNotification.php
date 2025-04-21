<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\CommentCard;
use Carbon\Carbon;

class UserTaggedInCommentNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $comment;

    public function __construct(CommentCard $comment)
    {
        $this->comment = $comment;
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'type' => 'comment',
            'card_id' => $this->comment->card_id,
            'card_title' => $this->comment->card->title ?? null,
            'comment_id' => $this->comment->id,
            'comment_content' => $this->comment->content,
            'comment_user_name' => $this->comment->user->name ?? 'Ai đó',
            'board_id' => $this->comment->card->list->board->id ?? null,
            'board_name' => $this->comment->card->list->board->name ?? null,
            'list_id' => $this->comment->card->list->id ?? null,
            'list_name' => $this->comment->card->list->name ?? null,
            'by_user' => [
                'id' => $this->comment->user->id,
                'full_name' => $this->comment->user->full_name,
            ],
            'message' => "\"". strip_tags($this->comment->content) . "\"",
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage($this->toDatabase($notifiable));
    }
}
