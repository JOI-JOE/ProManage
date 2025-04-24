<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Mail\WorkspaceInvitation; // Import Mailable hiện tại
use Illuminate\Notifications\Messages\BroadcastMessage;

class WorkspaceInvitationNotification extends Notification
{
    use Queueable;

    protected $workspaceName;
    protected $inviterName;
    protected $message;
    protected $link;

    public function __construct($workspaceName, $inviterName, $message, $link)
    {
        $this->workspaceName = $workspaceName;
        $this->inviterName = $inviterName;

        $this->message = $message
            ? "{$inviterName}: {$message} (Workspace: {$workspaceName})"
            : "{$inviterName} mời bạn tham gia workspace \"{$workspaceName}\"";

        $this->link = $link;
    }

    public function via($notifiable)
    {
        return ['mail', 'database', 'broadcast']; // Chỉ gửi qua email, thêm 'database' nếu muốn lưu thông báo
    }

    public function toMail($notifiable)
    {
        // Tái sử dụng Mailable WorkspaceInvitation
        return (new WorkspaceInvitation(
            $this->workspaceName,
            $this->inviterName,
            $this->message,
            $this->link
        ))->to($notifiable->email);
    }

    public function toArray($notifiable)
    {
        // Nếu dùng kênh database, lưu dữ liệu thông báo
        return [
            'workspace_name' => $this->workspaceName,
            'inviter_name' => $this->inviterName,
            'message' => $this->message,
            'link' => $this->link,
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'workspace_name' => $this->workspaceName,
            'inviter_name' => $this->inviterName,
            'message' => $this->message,
            'link' => $this->link,
        ]);
    }
}
