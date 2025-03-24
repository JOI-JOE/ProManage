<?php

namespace App\Jobs;

use App\Models\Card;
use App\Notifications\ReminderNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendReminderNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public $card;
    public function __construct(Card $card)
    {
        //
        $this->card = $card;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        if (now()->lt($this->card->reminder)) {
            Log::warning("⏳ Chưa đến thời gian nhắc nhở, dừng job.");
            return;
        }

        $users = $this->card->members;

        if (!$users || $users->isEmpty()) {
            Log::error("🚨 Không có thành viên nào để gửi thông báo cho Card ID: {$this->card->id}");
            return;
        }

        foreach ($users as $user) {
            if (!$user || !$user->email) {
                Log::error("🚨 Lỗi: Không tìm thấy user hoặc email trống để gửi thông báo.");
                continue;
            }
            $user->notify(new ReminderNotification($this->card));
            Log::info("📩 Đã gửi nhắc nhở đến {$user->email}");
        }
    }

}
