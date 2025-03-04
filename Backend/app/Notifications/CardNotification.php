<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CardNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $type;
    protected $card;
    protected $extraData;
    protected $userName;

    /**
     * Tạo một thông báo mới.
     */
    public function __construct(string $type, object $card, array $extraData = [], string $userName = '')
    {
        $this->type = $type;
        $this->card = $card;
        $this->extraData = $extraData;
        $this->userName = $userName;
    }

    /**
     * Xác định các kênh gửi thông báo.
     */
    public function via(object $notifiable): array
    {
        // Phân loại thông báo, nếu là 'add_member' thì gửi email, còn lại chỉ gửi thông báo database/broadcast
        if ($this->shouldSendMail($this->type)) {
            return ['mail', 'database', 'broadcast']; // Gửi email + thông báo
        }

        return ['database', 'broadcast']; // Chỉ gửi thông báo
    }

    /**
     * Kiểm tra xem loại thông báo có yêu cầu gửi email hay không.
     */
    private function shouldSendMail(string $type): bool
    {
        // Các loại thông báo cần gửi email
        return in_array($type, ['add_member']);
    }

    /**
     * Gửi thông báo qua email.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject($this->getMailSubject())
            ->greeting("Xin chào " . $notifiable->name . ",")
            ->line($this->getMessage());

        // Nếu có URL, thêm vào nút hành động
        if (isset($this->extraData['url'])) {
            $mail->action('Xem chi tiết', $this->extraData['url']);
        }

        return $mail->line('Cảm ơn bạn đã sử dụng hệ thống!');
    }

    /**
     * Lưu thông báo vào database.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => $this->type,
            'card_id' => $this->card->id,
            'message' => $this->getMessage(),
            'extra' => $this->extraData
        ];
    }

    /**
     * Gửi thông báo real-time (broadcast).
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }

    /**
     * Lấy nội dung thông báo dựa trên loại.
     */
    private function getMessage(): string
    {
        switch ($this->type) {
            case 'add_member':
                return "Bạn đã được thêm vào thẻ: " . $this->card->title;
            case 'update_datetime':
                return $this->userName . ' đã cập nhật ngày giờ của thẻ';
                case 'uploaded_attachment':
                    return $this->userName . ' đã tải lên tệp: ' . ($this->extraData['file_name'] ?? 'Không rõ');
                case 'added_comment':
                    return $this->userName . ' đã bình luận: "' . ($this->extraData['comment'] ?? 'Không có nội dung') . '"';
            default:
                return 'Thông báo từ hệ thống';
        }
    }

    /**
     * Lấy tiêu đề email phù hợp với loại thông báo.
     */
    private function getMailSubject(): string
    {
        switch ($this->type) {
            case 'add_member':
                return "Bạn được thêm vào thẻ: " . $this->card->title;
            default:
                return "Thông báo mới từ hệ thống";
        }
    }
}
