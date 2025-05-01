<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;

class WorkspaceMemberNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $actor; // Người thực hiện hành động
    protected $target_user; // Người nhận thông báo (có thể là admin hoặc thành viên)
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
        $subject = $this->getSubject($notifiable);

        return (new MailMessage)
            ->subject($subject)
            ->view('emails.workspace_member_notification', [
                'notifiable' => $notifiable,
                'inviter' => $this->actor,
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
            'message' => $this->getMessage($notifiable),
            'url' => $this->url,
            'actor' => $this->actor->full_name,
            'target_user' => $this->target_user ? $this->target_user->full_name : null,
            'workspace' => $this->workspace->display_name,
            'action_type' => $this->action_type,
        ];
    }

    /**
     * Get the subject based on action type and notifiable user.
     *
     * @param mixed $notifiable
     * @return string
     */
    protected function getSubject($notifiable): string
    {
        $isAdmin = $this->isAdmin($notifiable);

        switch ($this->action_type) {
            case 'add':
                return $isAdmin
                    ? "Thành viên mới được thêm vào Không gian làm việc"
                    : "Bạn đã được thêm vào Không gian làm việc";
            case 'invite':
                return $isAdmin
                    ? "Lời mời mới tham gia Không gian làm việc"
                    : "Lời mời tham gia Không gian làm việc";
            case 'remove':
                return $isAdmin
                    ? "Thành viên đã bị xóa khỏi Không gian làm việc"
                    : "Bạn đã bị xóa khỏi Không gian làm việc";
            case 'remove_request':
                return $isAdmin
                    ? "Yêu cầu tham gia đã bị hủy"
                    : "Yêu cầu tham gia của bạn đã bị hủy";
            case 'send_request':
                return "Yêu cầu tham gia Không gian làm việc mới";
            case 'join':
                return "Thành viên mới tham gia Không gian làm việc";
            default:
                return "Thông báo Không gian làm việc";
        }
    }

    /**
     * Get the message based on action type and notifiable user.
     *
     * @param mixed $notifiable
     * @return string
     */
    protected function getMessage($notifiable): string
    {
        $isAdmin = $this->isAdmin($notifiable);

        switch ($this->action_type) {
            case 'add':
                return $isAdmin
                    ? "{$this->actor->full_name} đã thêm {$this->target_user->full_name} vào Không gian làm việc {$this->workspace->display_name}."
                    : "{$this->actor->full_name} đã thêm bạn vào Không gian làm việc {$this->workspace->display_name}.";
            case 'invite':
                return $isAdmin
                    ? "{$this->actor->full_name} đã mời {$this->target_user->full_name} tham gia Không gian làm việc {$this->workspace->display_name}."
                    : "{$this->actor->full_name} đã mời bạn tham gia Không gian làm việc {$this->workspace->display_name}.";
            case 'remove':
                return $isAdmin
                    ? "{$this->actor->full_name} đã xóa {$this->target_user->full_name} khỏi Không gian làm việc {$this->workspace->display_name}."
                    : "{$this->actor->full_name} đã xóa bạn khỏi Không gian làm việc {$this->workspace->display_name}.";
            case 'remove_request':
                return $isAdmin
                    ? "{$this->actor->full_name} đã hủy yêu cầu tham gia của {$this->target_user->full_name} khỏi Không gian làm việc {$this->workspace->display_name}."
                    : "Yêu cầu tham gia Không gian làm việc {$this->workspace->display_name} của bạn đã bị hủy.";
            case 'send_request':
                return "{$this->actor->full_name} đã gửi yêu cầu tham gia Không gian làm việc {$this->workspace->display_name}.";
            case 'join':
                return "{$this->actor->full_name} đã tham gia Không gian làm việc {$this->workspace->display_name}.";
            default:
                return "Thông báo liên quan đến Không gian làm việc {$this->workspace->display_name}.";
        }
    }

    /**
     * Check if the notifiable user is an admin of the workspace.
     *
     * @param mixed $notifiable
     * @return bool
     */
    protected function isAdmin($notifiable): bool
    {
        // Giả định rằng Workspace model có một relationship hoặc method để kiểm tra admin
        // Ví dụ: $this->workspace->admins là một collection chứa các admin
        return $this->workspace->admins->contains('id', $notifiable->id);
    }

    /**
     *
     * @return void
     */
    public function notifyAdmins(): void
    {
        // Lấy danh sách admin của workspace
        $admins = $this->workspace->admins;

        foreach ($admins as $admin) {
            // Gửi thông báo đến từng admin, trừ actor nếu actor là admin
            if ($admin->id !== $this->actor->id) {
                $admin->notify($this);
            }
        }
    }
}
