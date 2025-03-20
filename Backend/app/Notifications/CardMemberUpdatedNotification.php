<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Broadcasting\PrivateChannel;

class CardMemberUpdatedNotification extends Notification implements ShouldBroadcast, ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public $card, public $action, public $byUser, public $activityLog, public $notifiableId)
    {
    }


    public function via($notifiable)
    {
        // $this->notifiableId = $notifiable->id;
        return ['database', 'broadcast'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toDatabase($notifiable)
    {
        return [
            'card_id' => $this->card->id,
            'card_title' => $this->card->title,
            'action' => $this->action, // 'added' hoặc 'removed'
            'by_user' => $this->byUser->only(['id', 'full_name']),
            'message' => $this->action === 'added'
                ? "Đã thêm bạn"
                : "Đã loại bạn",
            'activity_id' => $this->activityLog?->id,
            'list_id' => $this->card->list->id ?? null,
            'list_name' => $this->card->list->name ?? null,
            'board_id' => $this->card->list->board->id ?? null,
            'board_name' => $this->card->list->board->name ?? null,
            'notifiable' => $notifiable->id
        ];
    }



    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage($this->toDatabase($notifiable));
    }

    public function broadcastOn()
    {
        return new PrivateChannel('App.Models.User.' . $this->notifiableId);
    }

}
