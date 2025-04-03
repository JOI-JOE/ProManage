<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MemberRemovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $boardId;
    protected $boardName;

    public function __construct($boardId, $boardName)
    {
        $this->boardId = $boardId;
        $this->boardName = $boardName;
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    public function toArray($notifiable)
    {
        return [
            'message' => "Bạn đã bị xóa khỏi bảng '{$this->boardName}'.",
            'board_id' => $this->boardId,
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'message' => "Bạn đã bị xóa khỏi bảng '{$this->boardName}'.",
            'board_id' => $this->boardId,
        ]);
    }
}
