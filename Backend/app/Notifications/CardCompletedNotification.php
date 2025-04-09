<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;
use App\Models\Card;

class CardCompletedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $card;
    public $user;

    public function __construct(Card $card, User $user)
    {
        $this->card = $card;
        $this->user = $user; // Lưu thông tin người đánh dấu
    }
    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'type' => 'card_completed',
            'card_id' => $this->card->id,
            'card_title' => $this->card->title,
            'list_id' => $this->card->list->id ?? null,
            'list_name' => $this->card->list->name ?? null,
            'board_id' => $this->card->list->board->id ?? null,
            'board_name' => $this->card->list->board->name ?? null,
            'is_completed' => $this->card->is_completed,
            'by_user' => [
                'id' => $this->user->id,
                'full_name' => $this->user->full_name, // Tên người thực hiện
            ],
            'message' => $this->card->is_completed
                ? 'Thẻ được đánh dấu đã hoàn tất'
                : 'Thẻ đã được bỏ đánh dấu hoàn tất'
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage($this->toDatabase($notifiable));
    }
}
