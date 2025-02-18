<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CardMemberAddedNotification extends Notification
{
    use Queueable;

    protected $card;

    /**
     * Create a new notification instance.
     */
    public function __construct(object $card)
    {
        $this->card = $card;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Bạn đã được thêm vào thẻ: " . $this->card->title)
            ->line("Bạn vừa được thêm vào thẻ: **" . $this->card->title . "**.")
            ->line('Cảm ơn bạn đã sử dụng hệ thống!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'card',
            'card_id' => $this->card->id,
            'message' => "Bạn đã được thêm vào thẻ: " . $this->card->title,
        ];
    }
}
