<?php

namespace App\Console\Commands;

use App\Jobs\SendCardReminder;
use App\Models\Card;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckCardReminders extends Command
{
    protected $signature = 'cards:check-reminders';
    protected $description = 'Check cards with upcoming reminders and dispatch reminder jobs for assigned users in card_user table';

    public function handle()
    {
        try {
            // Lấy thời điểm hiện tại
            $now = Carbon::now();
            Log::info('Running cards:check-reminders at: ' . $now->toDateTimeString());

            // Lấy các card chưa bị lưu trữ, có reminder, và reminder trùng ngày với hôm nay
            $cards = Card::where('is_archived', false)
                ->whereNotNull('reminder')
                ->whereDate('reminder', $now->toDateString()) // Chỉ lấy reminder trùng ngày với hôm nay
                ->with('users') // Eager load quan hệ users (từ bảng card_user)
                ->get();

            // Ghi log số lượng card
            Log::info('Found ' . $cards->count() . ' cards with reminders for today (' . $now->toDateString() . ').');

            // Xử lý từng card
            foreach ($cards as $card) {
                try {
                    $reminderTime = Carbon::parse($card->reminder)->toDateTimeString();
                    Log::info("Processing Card ID: {$card->id}, Title: {$card->title}, Reminder: {$reminderTime}");

                    // Kiểm tra xem card có user nào được gán trong bảng card_user không
                    if (!$card->users || $card->users->isEmpty()) {
                        Log::warning("Card ID: {$card->id} has no assigned users in card_user table, skipping email.");
                        continue;
                    }

                    // Gửi email cho từng user được gán trong card_user
                    foreach ($card->users as $user) {
                        try {
                            Log::info("Dispatching reminder for Card ID: {$card->id} to User ID: {$user->id}, Email: {$user->email}");
                            SendCardReminder::dispatch($card, $user)->onQueue('reminders');
                        } catch (\Exception $e) {
                            Log::error("Error dispatching reminder for Card ID: {$card->id}, User ID: {$user->id}, Error: {$e->getMessage()}");
                        }
                    }
                } catch (\Exception $e) {
                    Log::error("Error processing card ID: {$card->id}, Error: {$e->getMessage()}");
                }
            }

            $this->info('Checked ' . $cards->count() . ' cards for reminders at ' . $now->toDateTimeString());
        } catch (\Exception $e) {
            Log::error("Error in cards:check-reminders: {$e->getMessage()}");
            throw $e; // Ném lại để Scheduler ghi trạng thái FAIL
        }
    }
}
