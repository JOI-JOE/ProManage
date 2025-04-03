<?php

namespace App\Jobs;

use App\Models\Card;
use App\Models\ChecklistItem;

use App\Notifications\ReminderNotificationCheckListItem;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendReminderNotificationChecklistItem implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public $item;
    public function __construct(ChecklistItem $item)
    {
        //
        $this->item = $item;
        Log::info("đã vào job");

    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        if (now()->lt($this->item->reminder)) {
            Log::warning("⏳ Chưa đến thời gian nhắc nhở, dừng job.");
            return;
        }

        $users = $this->item->members;

        if (!$users || $users->isEmpty()) {
            Log::error("🚨 Không có thành viên nào để gửi thông báo cho Item ID: {$this->item->id}");
            return;
        }

        foreach ($users as $user) {
            if (!$user || !$user->email) {
                Log::error("🚨 Lỗi: Không tìm thấy user hoặc email trống để gửi thông báo.");
                continue;
            }
            $user->notify(new ReminderNotificationCheckListItem($this->item));
            Log::info("📩 Đã gửi nhắc nhở đến {$user->email}");
        }
    }

}
