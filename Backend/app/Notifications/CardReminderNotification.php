<?php

namespace App\Notifications;

use App\Models\Card;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CardReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $card;

    public function __construct(Card $card)
    {
        $this->card = $card;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Nhắc nhở: Card sắp đến hạn')
            ->greeting('Xin chào ' . $notifiable->full_name)
            ->line('Card **' . $this->card->title . '** sắp đến hạn.')
            ->line('Hạn chót: ' . $this->card->end_date . ' ' . ($this->card->end_time ?? ''))
            ->action('Xem Card', url('/boards/' . $this->card->list_board->board_id . '/cards/' . $this->card->id))
            ->line('Cảm ơn bạn đã sử dụng hệ thống!');
    }
}
