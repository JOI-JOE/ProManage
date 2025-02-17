<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
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
        // dd($request->input('access_token'));
        // Giả sử bạn lấy token từ response của Socialite sau khi người dùng đăng nhập
        $accessToken = $request->input('access_token'); // Hoặc từ database nếu lưu access token

        // Refresh the access token if it is expired

        $to = 'iknowhtml161@gmail.com';
        $subject = 'Test Email';
        $body = 'This is a test email sent using Gmail API.';

        try {
            // Gửi email
            $this->googleService->sendEmail($accessToken, $to, $subject, $body);
            return response()->json(['message' => 'Email sent successfully!']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to send email', 'message' => $e->getMessage()], 500);
        }
    }
}
