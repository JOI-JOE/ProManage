<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;

use App\Models\ChecklistItem;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ReminderNotificationCheckListItem extends Notification implements ShouldQueue
{
    use Queueable;

    public $item;

    public function __construct(ChecklistItem $item)
    {
        $this->item = $item;
    }

    public function via($notifiable)
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail($notifiable)
    {
        // Định dạng thời gian cho đẹp hơn
        $deadline = $this->formatDeadline();



        return (new MailMessage)
            ->subject("📌 Nhắc nhở: {$this->item->name}")
            ->greeting("Xin chào, {$notifiable->name}!")
            ->line("Bạn có một công việc cần hoàn thành:")
            ->line("**📌 Công Việc: {$this->item->name}**")
            ->line("⏳ Hạn chót: {$deadline}")
            // ->action('Xem chi tiết', "http://localhost:5173/b/{$this->item->list->board->id}/{$this->item->list->board->name}/c/{$this->item->id}/{$this->item->title}") // Thêm nút xem thẻ
            ->line("Vui lòng kiểm tra ngay để không bỏ lỡ!");
    }

    public function toArray($notifiable)
    {
        return [
            'type' => 'reminder',
            'item_id' => $this->item->id,
            'item_title' => $this->item->name,
            'message' => "Nhắc nhở: Công Việc '{$this->item->name}' sẽ đến hạn vào " . $this->formatDeadline(),
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'type' => 'reminder',
            'item_id' => $this->item->id,
            'item_title' => $this->item->name,
            'message' => "Nhắc nhở: Công Việc '{$this->item->name}' sẽ đến hạn vào " . $this->formatDeadline(),
        ]);
    }

    /**
     * Định dạng ngày giờ đẹp hơn
     */
    private function formatDeadline()
    {
        if (!$this->item->end_date) {
            return "Không có hạn chót";
        }

        $date = Carbon::parse($this->item->end_date)->format('d/m/Y');
        $time = $this->item->end_time ? Carbon::parse($this->item->end_time)->format('H:i') : '';

        return trim("{$date} {$time}");
    }
}
