<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\GoogleService;

class EmailController extends Controller
{
    protected $googleService;

    public function __construct(GoogleService $googleService)
    {
        $this->googleService = $googleService;
    }
    public function sendEmail(Request $request)
    {
        // Lấy user từ database (có thể thay bằng Auth::user() nếu cần)
        $email = 'iknowhtml161@gmail.com';
        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }

        if (!$user->google_access_token) {
            return response()->json(['error' => 'Google Access Token not found'], 400);
        }

        // Lấy access token và refresh token từ database
        $accessToken = $user->google_access_token;
        $refreshToken = $user->google_refresh_token;

        try {
            // Kiểm tra nếu access token đã hết hạn và làm mới nếu cần
            if ($this->googleService->isAccessTokenExpired($accessToken)) {
                if (!$refreshToken) {
                    return response()->json(['error' => 'Access token expired and no refresh token available. Please re-authenticate.'], 401);
                }

                // Làm mới access token
                $newToken = $this->googleService->refreshAccessToken($refreshToken, $user);

                // Cập nhật token mới
                $user->google_access_token = $newToken['access_token'];

                // Nếu có refresh token mới, cập nhật vào database
                if (isset($newToken['refresh_token'])) {
                    $user->google_refresh_token = $newToken['refresh_token'];
                }

                $user->save(); // Lưu thay đổi

                $accessToken = $newToken['access_token'];
            }

            // Lấy thông tin email từ request
            $to = $request->input('to');
            $subject = $request->input('subject');
            $body = $request->input('body');

            // Gửi email
            $this->googleService->sendEmail($accessToken, $to, $subject, $body);

            return response()->json(['message' => 'Email sent successfully!']);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to send email',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
