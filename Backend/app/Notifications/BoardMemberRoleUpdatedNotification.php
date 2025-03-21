<?php

namespace App\Notifications;

use App\Models\Board;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BoardMemberRoleUpdatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $board;
    protected $role;
    protected $updatedBy;

    public function __construct(Board $board, $role, $updatedBy)
    {
        $this->board = $board;
        $this->role = $role;
        $this->updatedBy = $updatedBy;
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable)
    {
        $roleText = $this->role === 'admin' ? 'quản trị viên' : 'thành viên';
        return [
            'type' => 'role_updated',
            'board_id' => $this->board->id,
            'board_name' => $this->board->name,
            'role' => $this->role,
            // 'by_user' => $this->updatedBy->full_name,
            'by_user' => [
                // 'id' => $this->comment->user->id,
                'full_name' =>  $this->updatedBy->full_name,
            ],
            'message' => " đã chỉ định bạn là $roleText của bảng {$this->board->name}",
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage($this->toDatabase($notifiable));
    }
}
