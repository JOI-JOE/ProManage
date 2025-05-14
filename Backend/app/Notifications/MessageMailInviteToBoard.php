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
        $inviteLink = "http://localhost:5173/invite-board/{$this->invitation->invite_token}";

        return (new MailMessage)
            ->subject("Bạn đã được mời tham gia bảng {$this->invitation->board->name}")
            ->view('emails.invite_board_email', [
                // 'inviterName' => "Bạn", // Tên người gửi lời mời
                'boardName' => $this->invitation->board->name, // Tên bảng
                'messageContent' => $this->invitation->invitation_message ?? 'Bạn được mời tham gia một bảng làm việc.',
                'inviteLink' => $inviteLink, // Liên kết mời
                'greeting' => 'Chào bạn,', // Lời chào
                'signupMessage' => 'Nếu bạn chưa có tài khoản, bạn sẽ được hướng dẫn đăng ký và tự động tham gia bảng sau khi đăng ký.',
                'ignoreMessage' => 'Nếu bạn không mong đợi lời mời này, bạn có thể bỏ qua email này.'
            ]);
    }
}
