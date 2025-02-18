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

    // public function sendEmail(Request $request)
    // {
    //     // Lấy user từ database (có thể thay bằng Auth::user() nếu cần)
    //     $user = Auth::user();
    //     $user = User::where('email', $user->email)->first();

    //     if (!$user) {
    //         return response()->json(['error' => 'User not authenticated'], 401);
    //     }

    //     if (!$user->google_access_token) {
    //         return response()->json(['error' => 'Google Access Token not found'], 400);
    //     }

    //     // Lấy access token và refresh token từ database
    //     $accessToken = $user->google_access_token;
    //     $refreshToken = $user->google_refresh_token;

    //     try {
    //         // Kiểm tra nếu access token đã hết hạn và làm mới nếu cần
    //         if ($this->googleService->isAccessTokenExpired($accessToken)) {
    //             if (!$refreshToken) {
    //                 return response()->json(['error' => 'Access token expired and no refresh token available. Please re-authenticate.'], 401);
    //             }

    //             // Làm mới access token
    //             $newToken = $this->googleService->refreshAccessToken($refreshToken, $user);

    //             // Cập nhật token mới
    //             $user->google_access_token = $newToken['access_token'];

    //             // Nếu có refresh token mới, cập nhật vào database
    //             if (isset($newToken['refresh_token'])) {
    //                 $user->google_refresh_token = $newToken['refresh_token'];
    //             }

    //             $user->save(); // Lưu thay đổi

    //             $accessToken = $newToken['access_token'];
    //         }

    //         $toEmails = $request->input('to'); // Đây là một mảng các địa chỉ email
    //         $subject = $request->input('subject');
    //         $body = $request->input('body');

    //         // Gửi email đến từng địa chỉ trong mảng 
    //         // sử lý trường hợp email đã có trên trello
    //         // sử lsy trường hợp email chưa đăng ký trên trello

    //         foreach ($toEmails as $to) {
    //             $this->googleService->sendEmail($accessToken, $to, $subject, $body);
    //         }

    //         return response()->json(['message' => 'Email sent successfully!']);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'error' => 'Failed to send email',
    //             'message' => $e->getMessage()
    //         ], 500);
    //     }
    // }
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
            $this->processEmails($accessToken, $toEmails, $subject, $body);

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
     */
    private function processEmails($accessToken, $toEmails, $subject, $body)
    {
        foreach ($toEmails as $to) {
            // Kiểm tra email đã đăng ký trên Trello chưa
            $this->googleService->sendEmail($accessToken, $to, $subject, $body);
            // if ($this->checkEmailExistsOnTrello($to)) {
            //     // Gửi email cho user đã có tài khoản
            //     $this->googleService->sendEmail($accessToken, $to, $subject, $body);
            // } else {
            //     // Gửi email mời tham gia
            //     $this->sendInvitationEmail($to);
            // }
        }
    }


    private function checkEmailExistsOnTrello($email)
    {
        // Giả lập kiểm tra email trên Trello, bạn cần thay bằng API thực tế
        return in_array($email, ['user1@trello.com', 'user2@trello.com']);
    }

    /**
     * Gửi email mời tham gia nếu email chưa đăng ký Trello
     */
    private function sendInvitationEmail($email)
    {
        // Logic gửi email mời tham gia, có thể gửi email với nội dung đặc biệt
    }
}
