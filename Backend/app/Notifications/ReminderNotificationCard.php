<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use App\Models\Card;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ReminderNotificationCard extends Notification implements ShouldQueue
{
    use Queueable;

    public $card;

    public function __construct(Card $card)
    {
        $this->card = $card;
    }

    public function via($notifiable)
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail($notifiable)
    {
        // Định dạng thời gian cho đẹp hơn
        $deadline = $this->formatDeadline();

        Log::info("📩 Gửi email nhắc nhở đến {$notifiable->email} về thẻ: {$this->card->title}");

        return (new MailMessage)
            ->subject("📌 Nhắc nhở: {$this->card->title}")
            ->greeting("Xin chào, {$notifiable->name}!")
            ->line("Bạn có một công việc cần hoàn thành:")
            ->line("**📌 Thẻ: {$this->card->title}**")
            ->line("⏳ Hạn chót: {$deadline}")
            ->action('Xem chi tiết', "http://localhost:5173/b/{$this->card->list->board->id}/{$this->card->list->board->name}/c/{$this->card->id}") // Thêm nút xem thẻ
            ->line("Vui lòng kiểm tra ngay để không bỏ lỡ!");
    }

    public function toArray($notifiable)
    {
        return [
            'type' => 'reminder',
            'card_id' => $this->card->id,
            'card_title' => $this->card->title,
            'list_id' => $this->card->list->id ?? null,
            'list_name' => $this->card->list->name ?? null,
            'board_id' => $this->card->list->board->id ?? null,
            'board_name' => $this->card->list->board->name ?? null,
            'message' => "Nhắc nhở: Thẻ '{$this->card->title}' sẽ đến hạn vào " . $this->formatDeadline(),
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'type' => 'reminder',
            'card_id' => $this->card->id,
            'card_title' => $this->card->title,
            'list_id' => $this->card->list->id ?? null,
            'list_name' => $this->card->list->name ?? null,
            'board_id' => $this->card->list->board->id ?? null,
            'board_name' => $this->card->list->board->name ?? null,
            'message' => "Nhắc nhở: Thẻ '{$this->card->title}' sẽ đến hạn vào " . $this->formatDeadline(),
        ]);
    }

    /**
     * Định dạng ngày giờ đẹp hơn
     */
    private function formatDeadline()
    {
        if (!$this->card->end_date) {
            return "Không có hạn chót";
        }

        $date = Carbon::parse($this->card->end_date)->format('d/m/Y');
        $time = $this->card->end_time ? Carbon::parse($this->card->end_time)->format('H:i') : '';

        return trim("{$date} {$time}");
    }
}
