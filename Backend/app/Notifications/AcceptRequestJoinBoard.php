<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AcceptRequestJoinBoard extends Notification implements ShouldQueue
{
    use Queueable;

    protected $board_id;
    protected $board_name;

    public function __construct($board_id, $board_name)
    {
        $this->board_id = $board_id;
        $this->board_name = $board_name;
    }

    public function via($notifiable)
    {
        return ['mail', 'database']; // Gửi qua email và lưu vào database
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Yêu cầu tham gia bảng đã được duyệt')
            ->greeting("Xin chào {$notifiable->full_name},")
            ->line("Yêu cầu tham gia bảng '{$this->board_name}' của bạn đã được duyệt.")
            ->action('Xem bảng', "http://localhost:5173/b/$this->board_id/$this->board_name")
            ->line('Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!');
    }

    public function toArray($notifiable)
    {
        return [
            'board_id' => $this->board_id,
            'board_name' => $this->board_name,
            'message' => "Yêu cầu tham gia bảng '{$this->board_name}' của bạn đã được duyệt.",
        ];
    }
}
