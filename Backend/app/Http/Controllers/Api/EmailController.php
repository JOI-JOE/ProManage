<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\GoogleService;
use Illuminate\Support\Facades\Auth;

class EmailController extends Controller
{
    protected $googleService;

    public function __construct(GoogleService $googleService)
    {
        $this->googleService = $googleService;
    }

    public function sendEmail(Request $request)
    {
        try {
            // Lấy user đã đăng nhập
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'User not authenticated'], 401);
            }

            // Kiểm tra access token
            if (!$user->google_access_token) {
                return response()->json(['error' => 'Google Access Token not found'], 400);
            }

            $accessToken = $user->google_access_token;
            $refreshToken = $user->google_refresh_token;

            // Kiểm tra và làm mới access token nếu cần
            $accessToken = $this->refreshTokenIfNeeded($user, $accessToken, $refreshToken);

            // Lấy dữ liệu từ request
            $toEmails = $request->input('to', []);
            $subject = $request->input('subject', '');
            $body = $request->input('body', '');

            if (empty($toEmails)) {
                return response()->json(['error' => 'Recipient emails are required'], 400);
            }

            // Xử lý gửi email
            $this->processEmails($accessToken, $toEmails, $subject, $body, $user->full_name);

            return response()->json(['message' => 'Emails processed successfully!']);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to send email',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Kiểm tra và làm mới access token nếu cần
     */
    private function refreshTokenIfNeeded($user, $accessToken, $refreshToken)
    {
        if ($this->googleService->isAccessTokenExpired($accessToken)) {
            if (!$refreshToken) {
                throw new \Exception('Access token expired and no refresh token available. Please re-authenticate.');
            }

            // Làm mới token
            $newToken = $this->googleService->refreshAccessToken($refreshToken, $user);
            $accessToken = $newToken['access_token'];

            // Cập nhật vào database
            $user->update([
                'google_access_token' => $accessToken,
                'google_refresh_token' => $newToken['refresh_token'] ?? $user->google_refresh_token,
            ]);
        }

        return $accessToken;
    }

    /**
     * Xử lý gửi email 
     * việc gửi email sẽ có 2 trường hợp
     * 1. là email đã tồn tại trên database
     * 2. là email chưa tồn tại trên database
     */
    private function processEmails($accessToken, $toEmails, $subject, $body, $senderName)
    {
        $sentEmails = [];
        $failedEmails = [];

        foreach ($toEmails as $to) {
            if ($this->checkEmailExists($to)) {
                // Gửi email cho user đã có tài khoản
                if ($this->googleService->sendEmail($accessToken, $senderName, $to, $subject, $body)) {
                    $sentEmails[] = $to;
                } else {
                    $failedEmails[] = $to;
                }
            } else {
                $failedEmails[] = $to;
            }
        }

        // Trả về response tổng hợp
        $response = [];

        if (!empty($sentEmails)) {
            $response['message'] = 'Emails processed successfully!';
            $response['sent'] = $sentEmails;
        }

        if (!empty($failedEmails)) {
            $response['error'] = 'Some emails could not be sent.';
            $response['failed'] = $failedEmails;
        }

        // Chọn HTTP status code phù hợp
        $statusCode = empty($failedEmails) ? 200 : 400;

        return response()->json($response, $statusCode);
    }

    private function checkEmailExists($email)
    {
        $user = User::where('email', $email)->first();
        return $user !== null;
    }
}
