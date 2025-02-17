<?php

namespace App\Services;

use Google\Client;
use Google\Service\Gmail;
use Laravel\Socialite\Facades\Socialite;

class GoogleService
{
    protected $client;

    public function __construct()
    {
        $this->client = new Client();
        $this->client->setClientId(env('GOOGLE_CLIENT_ID'));
        $this->client->setClientSecret(env('GOOGLE_CLIENT_SECRET'));
        $this->client->setRedirectUri(env('GOOGLE_REDIRECT_URI'));
        $this->client->addScope(Gmail::GMAIL_SEND);
        $this->client->setAccessType('offline');
        $this->client->setPrompt('consent');
    }

    public function getAuthUrl()
    {
        return Socialite::driver('google')->redirect()->getTargetUrl();
    }

    // Lấy token từ Socialite thay vì Google API Client
    public function getAccessToken($provider)
    {
        // Lấy thông tin người dùng từ Google hoặc GitHub thông qua Socialite
        $user = Socialite::driver($provider)->user();

        // Trả về access token từ Socialite
        return $user->token;
    }

    public function sendEmail($accessToken, $to, $subject, $body)
    {
        $this->client->setAccessToken($accessToken);

        if ($this->client->isAccessTokenExpired()) {
            throw new \Exception('Access token expired.');
        }

        $service = new Gmail($this->client);
        $message = new Gmail\Message();

        // Tạo nội dung email
        $rawMessage = $this->createMessage($to, $subject, $body);
        $encodedMessage = base64_encode($rawMessage);
        $encodedMessage = str_replace(['+', '/', '='], ['-', '_', ''], $encodedMessage);
        $message->setRaw($encodedMessage);

        return $service->users_messages->send('me', $message);
    }

    private function createMessage($to, $subject, $body)
    {
        $headers = "From: your-email@gmail.com\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "Subject: $subject\r\n";
        $headers .= "To: $to\r\n";
        $headers .= "\r\n";

        return $headers . $body;
    }
}
