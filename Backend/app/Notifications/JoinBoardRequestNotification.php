<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class JoinBoardRequestNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $board_id;
    protected $board_name;
    protected $user_name;
    protected $request_id;

    public function __construct($board_id, $board_name, $user_name, $request_id)
    {
        $this->board_id = $board_id;
        $this->board_name = $board_name;
        $this->user_name = $user_name;
        $this->request_id = $request_id;
    }

    public function via($notifiable)
    {
        return ['database']; // Lưu vào database để hiển thị trong UI
    }

    public function toArray($notifiable)
    {
        return [
            'board_id' => $this->board_id,
            'board_name' => $this->board_name,
            'user_name' => $this->user_name,
            'request_id' => $this->request_id,
            'message' => "Người dùng {$this->user_name} đã gửi yêu cầu tham gia bảng '{$this->board_name}'.",
        ];
    }
}
