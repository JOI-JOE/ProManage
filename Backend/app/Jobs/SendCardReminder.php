<?php

namespace App\Jobs;

use App\Models\Card;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendCardReminder implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $card;
    protected $user;

    public function __construct(Card $card, User $user)
    {
        $this->card = $card;
        $this->user = $user;
    }

    public function handle()
    {
        try {
            // Gửi email tới user
            Mail::to($this->user->email)->send(new \App\Mail\CardReminderMail($this->card));
            Log::info("Sent reminder email for Card ID: {$this->card->id} to User ID: {$this->user->id}, Email: {$this->user->email}");
        } catch (\Exception $e) {
            Log::error("Failed to send reminder email for Card ID: {$this->card->id}, User ID: {$this->user->id}, Error: {$e->getMessage()}");
            throw $e;
        }
    }
}
