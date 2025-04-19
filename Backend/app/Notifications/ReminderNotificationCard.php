<?php

namespace App\Notifications;

use App\Mail\CardReminderMail;
use App\Models\Card;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Support\Facades\Log;

class ReminderNotificationCard extends Notification implements ShouldQueue
{
    use Queueable;

    public $card;
    public $type;

    public function __construct(Card $card, string $type = 'reminder')
    {
        $this->card = $card;
        $this->type = $type;
    }

    public function via($notifiable)
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail($notifiable)
    {
        try {
            Log::info("📩 Gửi email nhắc nhở đến {$notifiable->email} về thẻ: {$this->card->title} (type: {$this->type})");
            return (new CardReminderMail($this->card, $this->type))->to($notifiable->email);
        } catch (\Exception $e) {
            Log::error("🚨 Lỗi khi gửi email cho {$notifiable->email}: " . $e->getMessage());
            throw $e; // Re-throw để queue có thể retry
        }
    }

    public function toArray($notifiable)
    {
        return $this->getNotificationData();
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage($this->getNotificationData());
    }

    protected function getNotificationData()
    {
        $deadline = $this->formatDeadline();
        $message = $this->getMessage();

        return [
            'type' => 'reminder',
            'card_id' => $this->card->id,
            'card_title' => $this->card->title,
            'message' => "{$message}: Thẻ '{$this->card->title}' sẽ đến hạn vào {$deadline}",
            'url' => $this->getCardUrl(),
        ];
    }

    protected function getMessage()
    {
        return match ($this->type) {
            'start_date' => 'Bắt đầu',
            'end_date' => 'Hạn chót',
            'reminder' => 'Nhắc nhở',
            default => 'Nhắc nhở',
        };
    }

    private function formatDeadline()
    {
        $dateTime = null;

        switch ($this->type) {
            case 'start_date':
                $dateTime = $this->card->start_date;
                break;
            case 'end_date':
                if ($this->card->end_date) {
                    $time = $this->card->end_time ?? '00:00:00';
                    $dateTime = Carbon::parse($this->card->end_date . ' ' . $time);
                }
                break;
            case 'reminder':
                $dateTime = $this->card->reminder;
                break;
        }

        if (!$dateTime) {
            return "Không có hạn chót";
        }

        return $dateTime->format('d/m/Y H:i');
    }

    private function getCardUrl()
    {
        try {
            // Sử dụng list_board thay vì list
            if (!$this->card->list_board || !$this->card->list_board->board) {
                Log::warning("🚨 Relationship list_board hoặc board không tồn tại cho Card ID: {$this->card->id}");
                return "http://localhost:5173/cards/{$this->card->id}";
            }

            return "http://localhost:5173/b/{$this->card->list_board->board->id}/{$this->card->list_board->board->name}/c/{$this->card->id}/" . urlencode($this->card->title);
        } catch (\Exception $e) {
            Log::error("🚨 Lỗi khi tạo URL cho Card ID: {$this->card->id}: " . $e->getMessage());
            return "http://localhost:5173/cards/{$this->card->id}";
        }
    }
}
