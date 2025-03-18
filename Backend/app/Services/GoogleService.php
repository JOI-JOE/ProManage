<?php

namespace App\Services;

use App\Models\User;
use Google\Client;
use Google\Service\Gmail;
use Google\Service\Gmail\Message;
use Illuminate\Support\Facades\Log;

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
    }

    /**
     * Thiết lập access token
     *
     * @param string $accessToken
     */
    public function setAccessToken(string $accessToken): void
    {
        $this->client->setAccessToken($accessToken);
    }

    /**
     * Làm mới access token bằng refresh token
     *
     * @param string $refreshToken
     * @param User $user
     * @return array
     * @throws \Exception
     */
    public function refreshAccessToken(string $refreshToken, User $user): array
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
            Log::error("Failed to refresh access token: " . $e->getMessage());
            throw new \Exception('Failed to refresh access token: ' . $e->getMessage());
        }
    }

    /**
     * Kiểm tra xem access token có hết hạn không
     *
     * @param string $accessToken
     * @return bool
     */
    public function isAccessTokenExpired(string $accessToken): bool
    {
        $this->setAccessToken($accessToken);
        return $this->client->isAccessTokenExpired();
    }

    /**
     * Gửi email
     *
     * @param string $accessToken
     * @param string $senderName
     * @param string $senderEmail
     * @param string $to
     * @param string $subject
     * @param array $data
     * @param string $template
     * @return Message
     * @throws \Exception
     */
    public function sendEmail(
        string $accessToken,
        string $senderName,
        string $senderEmail,
        string $to,
        string $subject,
        array $data,
        string $template = 'emails.invite'
    ): Message {
        try {
            // Kiểm tra địa chỉ email hợp lệ
            if (!$this->validateEmail($to)) {
                throw new \InvalidArgumentException("Invalid email address: {$to}");
            }

            // Thiết lập access token
            $this->setAccessToken($accessToken);

            // Render nội dung email từ Blade template
            // $body = $this->renderEmailTemplate($template, $data);
            // Render nội dung email từ Blade template
            $body = view($template, $data)->render();

            // Tạo raw message
            $rawMessage = $this->encodeMessage($to, $senderName, $senderEmail, $subject, $body);

            // Tạo và gửi email
            $service = new Gmail($this->client);
            $message = new Message();
            $message->setRaw($rawMessage);

            return $service->users_messages->send('me', $message);
        } catch (\Exception $e) {
            Log::error("Failed to send email to {$to}: " . $e->getMessage());
            throw $e; // Re-throw exception để xử lý ở cấp cao hơn nếu cần
        }
    }

    /**
     * Render nội dung email từ Blade template
     *
     * @param string $template
     * @param array $data
     * @return string
     * @throws \RuntimeException
     */
    protected function renderEmailTemplate(string $template, array $data): string
    {
        try {
            return view($template, $data)->render();
        } catch (\Exception $e) {
            Log::error("Failed to render email template: " . $e->getMessage());
            throw new \RuntimeException("Failed to render email template: " . $e->getMessage());
        }
    }

    /**
     * Kiểm tra địa chỉ email hợp lệ
     *
     * @param string $email
     * @return bool
     */
    protected function validateEmail(string $email): bool
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    /**
     * Mã hóa email
     *
     * @param string $to
     * @param string $senderName
     * @param string $senderEmail
     * @param string $subject
     * @param string $body
     * @return string
     */
    public function encodeMessage(
        string $to,
        string $senderName,
        string $senderEmail,
        string $subject,
        string $body
    ): string {

        // Thiết lập địa chỉ gửi mặc định để ẩn thông tin người gửi
        $noReplyEmail = "no-reply@promanage.com";  // Thay bằng email no-reply của bạn
        // $noReplyName = "Promanage";  // Tên hiển thị trong email

        // Mã hóa tiêu đề
        $encodedSubject = "=?UTF-8?B?" . base64_encode($subject) . "?=";

        // Thiết lập headers
        $headers  = "From: {$senderName} <{$noReplyEmail}>\r\n"; // Sử dụng No-Reply
        $headers .= "To: {$to}\r\n";
        $headers .= "Subject: {$encodedSubject}\r\n"; // Mã hóa tiêu đề
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "Content-Transfer-Encoding: base64\r\n";

        // Mã hóa nội dung email
        $bodyEncoded = chunk_split(base64_encode($body));

        // Kết hợp headers và nội dung email
        $message = $headers . "\r\n" . $bodyEncoded;

        // Base64url encode toàn bộ message
        return rtrim(strtr(base64_encode($message), '+/', '-_'), '=');
    }
}
