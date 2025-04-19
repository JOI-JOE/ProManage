<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use Illuminate\Support\Facades\Log;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule)
    {
        Log::info('Scheduler running at: ' . now()->toDateTimeString());
        $schedule->command('cards:check-reminders')
            ->everyMinute();
    }

    protected function commands()
    {
        $this->load(__DIR__ . '/Commands');
    }
}
