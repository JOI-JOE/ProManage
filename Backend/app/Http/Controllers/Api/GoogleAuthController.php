<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{

    public function redirectToAuthProvider()
    {
        return Socialite::driver('google')
            ->with(['access_type' => 'offline', 'prompt' => 'consent']) // Cấu hình Google OAuth
            ->scopes([
                'openid',
                'profile',
                'email',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/gmail.send' // Yêu cầu quyền gửi email
            ])
            ->redirect();
    }

    public function handleProviderCallback()
    {
        try {
            // Lấy thông tin người dùng từ provider (sử dụng stateless vì đây là API)
            $socialUser = Socialite::driver('google')->stateless()->user();

            // Xử lý hoặc tạo người dùng
            $user = $this->findOrCreateUser(socialUser: $socialUser);

            // Đăng nhập người dùng
            Auth::login($user);

            // Tạo token xác thực
            $token = $user->createToken('auth_token')->plainTextToken;

            // Trả về token qua response JSON hoặc redirect với token trong query (tùy chọn)
            return redirect("http://localhost:5173/login/google?token={$token}");
        } catch (\Exception $e) {
            // Ghi log lỗi để debug
            \Log::error('Google OAuth Error: ' . $e->getMessage());

            // Trả về thông báo lỗi chi tiết hơn
            return redirect('http://localhost:5173?error=login_failed&message=' . urlencode($e->getMessage()));
        }
    }

    protected function findOrCreateUser($socialUser)
    {
        // Tìm người dùng trong database
        $user = User::where('email', $socialUser->getEmail())->first();

        // Nếu người dùng đã tồn tại, cập nhật token
        if ($user) {
            $user->google_access_token = $socialUser->token;
            if ($socialUser->refreshToken) {
                $user->google_refresh_token = $socialUser->refreshToken;
            }
            $user->save();
        } else {
            // Tạo người dùng mới
            $user = User::create([
                'full_name'             => $socialUser->getName(),
                'email'                 => $socialUser->getEmail(),
                'google_id'             => $socialUser->getId(), // Thêm dòng này     
                'google_access_token'   => $socialUser->token,
                'google_refresh_token'  => $socialUser->refreshToken,
                'password'              => bcrypt(str()->random(16)),
            ]);
        }

        return $user;
    }
}
