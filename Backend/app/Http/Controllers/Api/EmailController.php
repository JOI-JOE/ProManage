<?php

namespace App\Http\Controllers\Api;

use Google\Client;
use Google\Service\Gmail;
use Google\Service\Gmail\Message;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class EmailController extends Controller
{
    private $client;

    public function __construct()
    {
        $this->client = new Client();
        $this->client->setClientId(env('GOOGLE_CLIENT_ID'));
        $this->client->setClientSecret(env('GOOGLE_CLIENT_SECRET'));
        $this->client->setRedirectUri(env('GOOGLE_REDIRECT_URI', 'http://127.0.0.1:8000/api/v1/callback'));
        $this->client->addScope(Gmail::GMAIL_SEND);
    }

    public function handleCallback(Request $request)
    {
        if (!$request->has('code')) {
            return response()->json(['error' => 'Authorization code not available'], 400);
        }

        try {
            $token = $this->client->fetchAccessTokenWithAuthCode($request->query('code'));
            $this->client->setAccessToken($token);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch access token', 'message' => $e->getMessage()], 500);
        }

        // Send email to multiple recipients
        $to = ['iknowhtml161@gmail.com', 'recipient2@example.com'];
        $subject = 'Hello from Gmail API';
        $messageText = 'This is a test email sent to multiple recipients using the Gmail API from a Laravel app.';

        try {
            $this->sendEmail($to, $subject, $messageText);
            return response()->json(['success' => 'Email sent successfully to multiple recipients.'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to send email', 'message' => $e->getMessage()], 500);
        }
    }

    public function sendEmailToMultipleRecipients()
    {
        $authUrl = $this->client->createAuthUrl();
        return response()->json(['auth_url' => $authUrl]);
    }

    /**
     * Hàm gửi email qua Gmail API
     */
    private function sendEmail($to, $subject, $messageText)
    {
        $message = new Message();

        $rawMessageString = "To: " . implode(',', $to) . "\r\n";
        $rawMessageString .= "Subject: {$subject}\r\n";
        $rawMessageString .= "MIME-Version: 1.0\r\n";
        $rawMessageString .= "Content-Type: text/html; charset=utf-8\r\n";
        $rawMessageString .= "Content-Transfer-Encoding: quoted-printable\r\n\r\n";
        $rawMessageString .= "<p>{$messageText}</p>";

        // Encode message in base64 (URL-safe)
        $rawMessage = base64_encode($rawMessageString);
        $rawMessage = str_replace(['+', '/', '='], ['-', '_', ''], $rawMessage);
        $message->setRaw($rawMessage);

        $service = new Gmail($this->client);
        $service->users_messages->send('me', $message);
    }
}
