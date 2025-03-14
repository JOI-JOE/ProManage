<?php

namespace App\Jobs;

use App\Services\GoogleService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendWorkspaceEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $accessToken;
    protected $senderName;
    protected $toEmails;
    protected $subject;
    protected $body;

    public function __construct($accessToken, $senderName, $toEmails, $subject, $body)
    {
        $this->accessToken = $accessToken;
        $this->senderName = $senderName;
        $this->toEmails = $toEmails;
        $this->subject = $subject;
        $this->body = $body;
    }

    public function handle(GoogleService $googleService)
    {
        try {
            foreach ($this->toEmails as $to) {
                $googleService->sendEmail($this->accessToken, $this->senderName, $to, $this->subject, $this->body);
                Log::info("📧 Email sent successfully to {$to}");
            }
        } catch (\Exception $e) {
            Log::error("❌ Failed to send email: " . $e->getMessage());
        }
    }
}
