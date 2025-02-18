<?php

namespace App\Services;

use App\Models\User;
use Google\Client;
use Google\Service\Gmail;

class GoogleService
{
    /**
     * @var \Google\Client
     */
    protected $client;

    public function __construct()
    {
        $this->client = new Client();
        $this->client->setClientId(env('GOOGLE_CLIENT_ID'));
        $this->client->setClientSecret(env('GOOGLE_CLIENT_SECRET'));
        $this->client->setRedirectUri(env('GOOGLE_REDIRECT_URI'));

        // Thêm quyền gửi email
        // $this->client->addScope([
        //     'https://www.googleapis.com/auth/userinfo.email',
        //     'https://www.googleapis.com/auth/userinfo.profile',
        //     'https://www.googleapis.com/auth/gmail.send',
        // ]);

        // $this->client->setAccessType('offline'); // Cần thiết để lấy refresh token
        // $this->client->setPrompt('consent'); // Yêu cầu lại quyền nếu user đã cấp trước đó
    }
    public function setAccessToken($accessToken)
    {
        $this->client->setAccessToken($accessToken);
    }

    /**
     * Làm mới access token bằng refresh token
     */
    public function refreshAccessToken($refreshToken, User $user)
    {
        try {
            $newToken = $this->client->fetchAccessTokenWithRefreshToken($refreshToken);

            if (isset($newToken['access_token'])) {
                $user->google_access_token = $newToken['access_token'];

                // Kiểm tra xem có refresh token mới không
                if (isset($newToken['refresh_token'])) {
                    $user->google_refresh_token = $newToken['refresh_token'];
                }

                $user->save(); // Lưu vào database

                return $newToken;
            } else {
                throw new \Exception('Could not refresh access token');
            }
        } catch (\Exception $e) {
            throw new \Exception('Failed to refresh access token: ' . $e->getMessage());
        }
    }

    /**
     * Kiểm tra xem access token có hết hạn không
     */
    public function isAccessTokenExpired($accessToken)
    {
        $this->setAccessToken($accessToken);
        return $this->client->isAccessTokenExpired();
    }

    public function sendEmail($accessToken, $to, $subject, $body)
    {
        $this->setAccessToken($accessToken);
        $service = new Gmail($this->client);

        $rawMessage = $this->encodeMessage($to, $subject, $body);
        $message = new \Google\Service\Gmail\Message();
        $message->setRaw($rawMessage);

        $service->users_messages->send('me', $message);
    }

    

    public function encodeMessage($to, $subject, $body)
    {
        $boundary = uniqid(rand(), true);
        $headers  = "From: me\r\n";
        $headers .= "To: $to\r\n";
        $headers .= "Subject: $subject\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "Content-Transfer-Encoding: base64\r\n\r\n";

        $bodyEncoded = chunk_split(base64_encode($body));

        // Kết hợp headers và nội dung email
        $message = $headers . $bodyEncoded;

        // Base64url encode
        $encodedMessage = rtrim(strtr(base64_encode($message), '+/', '-_'), '=');

        return $encodedMessage;
    }
}
