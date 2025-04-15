<?php

namespace App\Console\Commands;

use App\Models\Card;
use App\Notifications\CardReminder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckCardReminders extends Command
{
    protected $signature = 'cards:check-reminders';
    protected $description = 'Check for card reminders and send notifications';

    public function handle()
    {
        $now = now();
        // Lấy các card có reminder hoặc thời gian bắt đầu/kết thúc sắp đến
        $cards = Card::where('is_completed', false)
            ->where('is_archived', false)
            ->where(function ($query) use ($now) {
                $query->whereNotNull('reminder')
                    ->where('reminder', '>=', $now)
                    ->where('reminder', '<=', $now->addMinutes(5)) // Nhắc nhở trong khoảng 5 phút
                    ->orWhere(function ($q) use ($now) {
                        $q->whereNotNull('start_date')
                            ->whereRaw('CONCAT(start_date, " ", COALESCE(end_time, "00:00:00")) <= ?', [$now->addMinutes(30)])
                            ->whereRaw('CONCAT(start_date, " ", COALESCE(end_time, "00:00:00")) >= ?', [$now]);
                    })
                    ->orWhere(function ($q) use ($now) {
                        $q->whereNotNull('end_date')
                            ->whereRaw('CONCAT(end_date, " ", COALESCE(end_time, "00:00:00")) <= ?', [$now->addMinutes(30)])
                            ->whereRaw('CONCAT(end_date, " ", COALESCE(end_time, "00:00:00")) >= ?', [$now]);
                    });
            })
            ->with('users') // Load users được gán vào card
            ->get();

        foreach ($cards as $card) {
            foreach ($card->users as $user) {
                try {
                    $user->notify(new CardReminder($card));
                    Log::info('Reminder sent for card', ['card_id' => $card->id, 'user_id' => $user->id]);
                } catch (\Exception $e) {
                    Log::error('Failed to send reminder', [
                        'card_id' => $card->id,
                        'user_id' => $user->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        }

        $this->info('Card reminders checked and notifications sent.');
    }
}
