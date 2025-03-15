<?php

namespace App\Jobs;

use App\Services\GoogleService;
use Illuminate\Bus\Queueable;
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
    protected $senderEmail;
    protected $toEmails;
    protected $subject;
    protected $data;
    protected $template;

    public function __construct($accessToken, $senderName, $senderEmail, $toEmails, $subject, $data, $template = 'emails.invite')
    {
        $this->accessToken = $accessToken;
        $this->senderName = $senderName;
        $this->senderEmail = $senderEmail;
        $this->toEmails = $toEmails;
        $this->subject = $subject;
        $this->data = $data;
        $this->template = $template;
    }

    public function handle(GoogleService $googleService)
    {
        try {
            foreach ($this->toEmails as $to) {
                $googleService->sendEmail(
                    $this->accessToken,
                    $this->senderName,
                    $this->senderEmail,
                    $to,
                    $this->subject,
                    $this->data,
                    $this->template
                );
                Log::info("📧 Email sent successfully to {$to}");
            }
        } catch (\Exception $e) {
            Log::error("❌ Failed to send email: " . $e->getMessage());
            throw $e; // Re-throw exception để xử lý ở cấp cao hơn nếu cần
        }
    }
}
