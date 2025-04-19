<?php

namespace App\Jobs;

use App\Models\Card;
use App\Notifications\ReminderNotificationCard;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class SendReminderNotificationCard implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $card;

    public function __construct(Card $card)
    {
        $this->card = $card;
    }

    public function handle(): void
    {
        // Kiểm tra card có tồn tại không
        if (!$this->card || !$this->card->exists) {
            Log::error("🚨 Card không tồn tại hoặc đã bị xóa (ID: {$this->card->id}).");
            return;
        }

        // Lấy danh sách thành viên với các cột cần thiết
        $users = $this->card->members()->select('users.id', 'users.email')->get();

        if ($users->isEmpty()) {
            Log::error("🚨 Không có thành viên nào để gửi thông báo cho Card ID: {$this->card->id}");
            return;
        }

        $validUsers = $users->filter(fn($user) => !empty($user->email));

        if ($validUsers->isEmpty()) {
            Log::error("🚨 Không có thành viên hợp lệ để gửi thông báo cho Card ID: {$this->card->id}");
            return;
        }

        $now = Carbon::now();
        $tolerance = $now->copy()->addMinutes(5); // Khoảng thời gian khoan dung 5 phút

        // Kiểm tra và gửi thông báo dựa trên các trường
        $notificationsSent = false;
        $debugInfo = [];

        // 1. Kiểm tra reminder
        if ($this->card->reminder) {
            $reminderDate = $this->ensureCarbonInstance($this->card->reminder);
            $debugInfo[] = "reminder: " . $reminderDate->format('Y-m-d H:i:s');

            // Kiểm tra nếu ngày hiện tại trùng với ngày reminder HOẶC trong khoảng thời gian khoan dung
            if ($now->isSameDay($reminderDate) || $tolerance->gte($reminderDate)) {
                try {
                    Notification::send($validUsers, new ReminderNotificationCard($this->card, 'reminder'));
                    Log::info("📩 Đã gửi nhắc nhở (reminder) đến " . $validUsers->count() . " thành viên cho Card ID: {$this->card->id} vào: " . $now->toDateTimeString());
                    $notificationsSent = true;
                } catch (\Exception $e) {
                    Log::error("🚨 Lỗi khi gửi nhắc nhở (reminder) cho Card ID: {$this->card->id}: " . $e->getMessage());
                }
            } else {
                $debugInfo[] = "Không gửi reminder: Hiện tại (" . $now->format('Y-m-d H:i:s') . ") không phải ngày reminder và ngoài khoảng khoan dung";
            }
        }

        // 2. Kiểm tra start_date (gửi trước 1 ngày)
        if ($this->card->start_date) {
            $startDate = $this->ensureCarbonInstance($this->card->start_date);
            $oneDayBeforeStart = $startDate->copy()->subDay();
            $debugInfo[] = "start_date: " . $startDate->format('Y-m-d') . ", ngày trước đó: " . $oneDayBeforeStart->format('Y-m-d');

            if ($now->isSameDay($oneDayBeforeStart)) {
                try {
                    Notification::send($validUsers, new ReminderNotificationCard($this->card, 'start_date'));
                    Log::info("📩 Đã gửi nhắc nhở (start_date) đến " . $validUsers->count() . " thành viên cho Card ID: {$this->card->id} vào: " . $now->toDateTimeString());
                    $notificationsSent = true;
                } catch (\Exception $e) {
                    Log::error("🚨 Lỗi khi gửi nhắc nhở (start_date) cho Card ID: {$this->card->id}: " . $e->getMessage());
                }
            } else {
                $debugInfo[] = "Không gửi start_date: Hiện tại (" . $now->format('Y-m-d') . ") không phải ngày trước start_date";
            }
        }

        // 3. Kiểm tra end_date + end_time (gửi trước 1 ngày)
        if ($this->card->end_date) {
            try {
                // Chuẩn hóa end_date và end_time
                $endDate = $this->ensureCarbonInstance($this->card->end_date);
                $endTimeString = $this->card->end_time ? $this->ensureCarbonInstance($this->card->end_time)->format('H:i:s') : '23:59:59';

                // Kết hợp ngày và giờ
                $endDateTime = Carbon::parse($endDate->format('Y-m-d') . ' ' . $endTimeString);
                $oneDayBeforeEnd = $endDateTime->copy()->subDay();

                $debugInfo[] = "end_date: " . $endDate->format('Y-m-d') . ", end_time: " . $endTimeString;
                $debugInfo[] = "endDateTime: " . $endDateTime->format('Y-m-d H:i:s') . ", ngày trước đó: " . $oneDayBeforeEnd->format('Y-m-d H:i:s');

                if ($now->isSameDay($oneDayBeforeEnd)) {
                    Notification::send($validUsers, new ReminderNotificationCard($this->card, 'end_date'));
                    Log::info("📩 Đã gửi nhắc nhở (end_date) đến " . $validUsers->count() . " thành viên cho Card ID: {$this->card->id} vào: " . $now->toDateTimeString());
                    $notificationsSent = true;
                } else {
                    $debugInfo[] = "Không gửi end_date: Hiện tại (" . $now->format('Y-m-d') . ") không phải ngày trước end_date";
                }
            } catch (\Exception $e) {
                Log::error("🚨 Lỗi khi xử lý end_date/end_time cho Card ID: {$this->card->id}: " . $e->getMessage());
            }
        }

        // Kiểm tra nếu đến hạn (ngày kết thúc là hôm nay)
        if ($this->card->end_date) {
            try {
                $endDate = $this->ensureCarbonInstance($this->card->end_date);
                $endTimeString = $this->card->end_time ? $this->ensureCarbonInstance($this->card->end_time)->format('H:i:s') : '23:59:59';
                $endDateTime = Carbon::parse($endDate->format('Y-m-d') . ' ' . $endTimeString);

                // Nếu hôm nay là ngày end_date
                if ($now->isSameDay($endDateTime)) {
                    $debugInfo[] = "Hôm nay là ngày end_date!";
                    Notification::send($validUsers, new ReminderNotificationCard($this->card, 'due_today'));
                    Log::info("📩 Đã gửi thông báo ĐẾN HẠN HÔM NAY đến " . $validUsers->count() . " thành viên cho Card ID: {$this->card->id} vào: " . $now->toDateTimeString());
                    $notificationsSent = true;
                }
            } catch (\Exception $e) {
                Log::error("🚨 Lỗi khi kiểm tra ngày đến hạn cho Card ID: {$this->card->id}: " . $e->getMessage());
            }
        }

        if (!$notificationsSent) {
            Log::warning("⏳ Không có điều kiện nào phù hợp để gửi thông báo cho Card ID: {$this->card->id}. Debug info: " . implode(" | ", $debugInfo));
        }
    }

    /**
     * Chuyển đổi giá trị thành đối tượng Carbon
     */
    private function ensureCarbonInstance($value): Carbon
    {
        if ($value instanceof Carbon) {
            return $value;
        }
        return Carbon::parse($value);
    }
}
