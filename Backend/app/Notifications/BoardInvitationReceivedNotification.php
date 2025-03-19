<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BoardInvitationReceivedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */

    protected $board;
    protected $inviter;
    

    public function __construct($board, $inviter)
    {
        $this->board = $board;
        $this->inviter = $inviter;
    }
    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via($notifiable)
    {
        return ['database', 'broadcast']; // Lưu vào DB và gửi real-time qua Pusher
    }
    /**
     * Get the mail representation of the notification.
     */
    
     public function toMail($notifiable)
     {
         return (new MailMessage)
             ->subject('Bạn được mời vào bảng mới')
             ->line("{$this->inviter->full_name} đã mời bạn vào bảng {$this->board->name}")
             ->action('Xem bảng', url("/b/{$this->board->id}/{$this->board->name}"));
     }
    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray($notifiable)
    {
        return [
            'board_id' => $this->board->id,
            'board_name' => $this->board->name,
            'inviter_id' => $this->inviter->id,
            'inviter_name' => $this->inviter->full_name,
            'message' => "{$this->inviter->full_name} đã mời bạn vào bảng {$this->board->name}",
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'board_id' => $this->board->id,
            'board_name' => $this->board->name,
            'inviter_id' => $this->inviter->id,
            'inviter_name' => $this->inviter->full_name,
            'message' => "{$this->inviter->full_name} đã mời bạn vào bảng {$this->board->name}",
        ]);
    }
}
