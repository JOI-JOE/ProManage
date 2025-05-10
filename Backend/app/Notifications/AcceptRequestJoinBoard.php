<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\HtmlString;

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
        return ['mail', 'database', 'broadcast']; // Gửi qua email và lưu vào database
    }

    public function toMail($notifiable)
    {
        $boardLink = "http://localhost:5173/b/{$this->board_id}/{$this->board_name}";

        return (new MailMessage)
            ->subject('Yêu cầu tham gia bảng đã được duyệt')
            ->view('emails.accepted_request', [
                'fullName' => $notifiable->full_name,
                'boardName' => $this->board_name,
                'boardId' => $this->board_id,
                'boardLink' => $boardLink,
                'greeting' => "Xin chào {$notifiable->full_name},",
                'approvalMessage' => "Yêu cầu tham gia bảng '{$this->board_name}' của bạn đã được duyệt.",
                'thankYouMessage' => 'Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!'
            ]);
    }

    public function toDatabase($notifiable)
    {
        return [
            'board_id' => $this->board_id,
            'board_name' => $this->board_name,
            'message' => "Bạn đã được thêm vào bảng <a href=\"/b/{$this->board_id}/{$this->board_name}\">{$this->board_name}</a>",

        ];
    }

    public function toArray($notifiable)
    {
        return [
            'board_id' => $this->board_id,
            'board_name' => $this->board_name,
            'message' => "Yêu cầu tham gia bảng <a href=\"/b/{$this->board_id}/\"{$this->board_name} của bạn đã được duyệt.</a>",
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'board_id' => $this->board_id,
            'board_name' => $this->board_name,
            'message' => new HtmlString(
                "Bạn đã được thêm vào bảng <a href=\"/b/{$this->board_id}/" . urlencode($this->board_name) . "\">{$this->board_name}</a>"
            ),
        ]);
    }
}
