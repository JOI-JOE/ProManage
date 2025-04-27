<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WorkspaceMemberNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $actor; // Người thực hiện hành động (inviter/remover)
    protected $target_user; // Người bị ảnh hưởng (người được mời/thêm/xóa)
    protected $workspace;
    protected $url;
    protected $action_type;

    /**
     * Create a new notification instance.
     *
     * @param mixed $actor
     * @param mixed $target_user
     * @param mixed $workspace
     * @param string $url
     * @param string $action_type
     */
    public function __construct($actor, $target_user, $workspace, string $url, string $action_type)
    {
        $this->actor = $actor;
        $this->target_user = $target_user;
        $this->workspace = $workspace;
        $this->url = $url;
        $this->action_type = $action_type;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param mixed $notifiable
     * @return array<int, string>
     */
    public function via($notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param mixed $notifiable
     * @return MailMessage
     */
    public function toMail($notifiable): MailMessage
    {
        $subject = $this->getSubject();

        return (new MailMessage)
            ->subject($subject)
            ->view('emails.workspace_member_notification', [
                'notifiable' => $notifiable,
                'inviter' => $this->actor, // Dùng inviter để tương thích với template
                'action_type' => $this->action_type,
                'workspace' => $this->workspace,
                'url' => env('FRONTEND_URL') . "/w/{$this->workspace->id}/",
            ]);
    }

    /**
     * Get the array representation of the notification for database/broadcast.
     *
     * @param mixed $notifiable
     * @return array<string, mixed>
     */
    public function toArray($notifiable): array
    {
        return [
            'message' => $this->getMessage(),
            'url' => $this->url,
            'actor' => $this->actor->full_name,
            'target_user' => $this->target_user->full_name,
            'workspace' => $this->workspace->display_name,
            'action_type' => $this->action_type,
        ];
    }

    /**
     * Get the subject based on action type.
     *
     * @return string
     */
    protected function getSubject(): string
    {
        switch ($this->action_type) {
            case 'add':
                return 'Bạn đã được thêm vào Không gian làm việc';
            case 'invite':
                return 'Lời mời tham gia Không gian làm việc';
            case 'remove':
                return 'Bạn đã bị xóa khỏi Không gian làm việc';
            case 'remove_request':
                return 'Yêu cầu tham gia Không gian làm việc đã bị hủy';
            default:
                return 'Thông báo Không gian làm việc';
        }
    }

    /**
     * Get the message based on action type.
     *
     * @return string
     */
    protected function getMessage(): string
    {
        switch ($this->action_type) {
            case 'add':
                return "{$this->actor->full_name} đã thêm {$this->target_user->full_name} vào Không gian làm việc {$this->workspace->display_name}.";
            case 'invite':
                return "{$this->actor->full_name} đã mời {$this->target_user->full_name} tham gia Không gian làm việc {$this->workspace->display_name}.";
            case 'remove':
                return "{$this->actor->full_name} đã xóa {$this->target_user->full_name} khỏi Không gian làm việc {$this->workspace->display_name}.";
            case 'remove_request':
                return "{$this->actor->full_name} đã hủy yêu cầu tham gia của {$this->target_user->full_name} khỏi Không gian làm việc {$this->workspace->display_name}.";
            default:
                return 'Thông báo liên quan đến Không gian làm việc.';
        }
    }
}
