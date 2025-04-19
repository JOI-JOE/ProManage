<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Jobs\SendWorkspaceEmailJob;
use App\Mail\TestMail;
use App\Models\User;
use App\Services\GoogleService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class EmailController extends Controller
{
    protected $googleService;

    public function __construct(GoogleService $googleService)
    {
        $this->googleService = $googleService;
    }
    // public function sendEmail(Request $request)
    // {
    //     try {
    //         // Lấy user đã đăng nhập
    //         $user = Auth::user();
    //         if (!$user) {
    //             return response()->json(['error' => 'User not authenticated'], 401);
    //         }

    //         // Kiểm tra access token
    //         if (!$user->google_access_token) {
    //             return response()->json(['error' => 'Google Access Token not found'], 400);
    //         }

    //         $accessToken = $user->google_access_token;
    //         $refreshToken = $user->google_refresh_token;

    //         // Kiểm tra và làm mới access token nếu cần
    //         $accessToken = $this->refreshTokenIfNeeded($user, $accessToken, $refreshToken);

    //         // Lấy dữ liệu từ request
    //         $toEmails = $request->input('to', []);
    //         $subject = $request->input('subject', '');
    //         $body = $request->input('body', '');

    //         if (empty($toEmails)) {
    //             return response()->json(['error' => 'Recipient emails are required'], 400);
    //         }

    //         // Đẩy vào hàng đợi để gửi email bất đồng bộ
    //         dispatch(new SendWorkspaceEmailJob($accessToken, $user->full_name, $toEmails, $subject, $body));

    //         return response()->json(['message' => 'Emails are being processed in the background.']);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'error' => 'Failed to send email',
    //             'message' => $e->getMessage()
    //         ], 500);
    //     }
    // }
    // /**
    //  * Kiểm tra và làm mới access token nếu cần
    //  */
    // private function refreshTokenIfNeeded($user, $accessToken, $refreshToken)
    // {
    //     if ($this->googleService->isAccessTokenExpired($accessToken)) {
    //         if (!$refreshToken) {
    //             throw new \Exception('Access token expired and no refresh token available. Please re-authenticate.');
    //         }

    //         // Làm mới token
    //         $newToken = $this->googleService->refreshAccessToken($refreshToken, $user);
    //         $accessToken = $newToken['access_token'];

    //         // Cập nhật vào database
    //         $user->update([
    //             'google_access_token' => $accessToken,
    //             'google_refresh_token' => $newToken['refresh_token'] ?? $user->google_refresh_token,
    //         ]);
    //     }

    //     return $accessToken;
    // }

    public function sendTestMail()
    {
        $to = 'haungodang2003@gmail.com'; // địa chỉ nhận
        $message = "Xin chào! Đây là email test từ Promanage.";

        Mail::to($to)->send(new TestMail($message));

        return response()->json(['message' => 'Đã gửi email thành công']);
    }
}
