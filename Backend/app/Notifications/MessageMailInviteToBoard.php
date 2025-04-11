<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MessageMailInviteToBoard extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    protected $invitation;

    public function __construct($invitation)
    {
        $this->invitation = $invitation;
    }

    public function via($notifiable)
    {
        return ['mail']; // Bạn có thể thêm 'database', 'broadcast', nếu cần
    }

    public function toMail($notifiable)
    {
    
        return (new MailMessage)
            ->subject("Bạn đã được mời tham gia bảng{$this->invitation->board->name}")
            ->greeting('Chào bạn,')
            ->line($this->invitation->invitation_message ?? 'Bạn được mời tham gia một bảng làm việc.')
            ->action('Tham gia vào bảng', "http://localhost:5173/invite-board/{$this->invitation->invite_token}")
            ->line('Nếu bạn chưa có tài khoản, bạn sẽ được hướng dẫn đăng ký và tự động tham gia bảng sau khi đăng ký.')
            ->line('Nếu bạn không mong đợi lời mời này, bạn có thể bỏ qua email này.');
    }
}
