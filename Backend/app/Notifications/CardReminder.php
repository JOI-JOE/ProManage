<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class CardReminder extends Notification
{
    use Queueable;

    protected $card;

    public function __construct($card)
    {
        $this->card = $card;
    }

    public function via($notifiable)
    {
        return ['mail', 'database']; // Gửi qua email và lưu vào DB để hiển thị trong UI
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Nhắc nhở về card: ' . $this->card->title)
            ->line('Card "' . $this->card->title . '" sắp đến thời hạn!')
            ->line('Thời gian bắt đầu: ' . $this->card->start_date)
            ->line('Thời gian kết thúc: ' . $this->card->end_date . ' ' . $this->card->end_time)
            ->action('Xem Card', url('/cards/' . $this->card->id))
            ->line('Cảm ơn bạn đã sử dụng hệ thống!');
    }

    public function toArray($notifiable)
    {
        return [
            'card_id' => $this->card->id,
            'title' => $this->card->title,
            'message' => 'Nhắc nhở: Card "' . $this->card->title . '" sắp đến thời hạn!',
            'start_date' => $this->card->start_date,
            'end_date' => $this->card->end_date,
            'end_time' => $this->card->end_time,
        ];
    }
}
