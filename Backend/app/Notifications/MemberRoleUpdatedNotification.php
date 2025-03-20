<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MemberRoleUpdatedNotification extends Notification
{
    use Queueable;
    use Queueable;

    public $boardId;
    public $newRole;

    public function __construct($boardId, $newRole)
    {
        $this->boardId = $boardId;
        $this->newRole = $newRole;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via($notifiable)
    {
        return ['database', 'broadcast']; // Gửi qua database và broadcast (realtime)
    }

    /**
     * Get the array representation of the notification (cho database).
     */
    public function toArray($notifiable)
    {
        $roleText = $this->newRole === 'admin' ? 'Quản trị viên' : 'Thành viên';
        return [
            'board_id' => $this->boardId,
            'message' => "Bạn đã được cập nhật thành $roleText trong bảng",
        ];
    }

    /**
     * Get the broadcastable representation of the notification (cho realtime).
     */
    public function toBroadcast($notifiable)
    {
        $roleText = $this->newRole === 'admin' ? 'Quản trị viên' : 'Thành viên';
        return new BroadcastMessage([
            'message' => "Bạn đã được cập nhật thành $roleText trong bảng",
            'board_id' => $this->boardId,
        ]);
    }
}
