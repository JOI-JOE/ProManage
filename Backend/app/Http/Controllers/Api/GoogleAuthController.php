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
        // Kiểm tra nếu người dùng đã đăng nhập và có token
        if (Auth::check() && $user = Auth::user()) {
            if ($user->google_access_token) {
                return redirect("http://localhost:5173?token={$user->createToken('auth_token')->plainTextToken}&idMember={$user->id}");
            }
        }

        // Chuyển hướng đến Google OAuth, bỏ prompt=consent
        return Socialite::driver('google')
            ->with(['access_type' => 'offline'])
            ->scopes(['openid', 'profile', 'email', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/gmail.send'])
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
            return redirect("http://localhost:5173/login/google?token={$token}&idMember={$user->id}");
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

        // Tạo user_name từ initials của full_name
        $fullName = $socialUser->getName();
        
        // Làm sạch full_name: loại bỏ ký tự đặc biệt, chỉ giữ chữ cái và khoảng trắng
        $cleanedFullName = preg_replace('/[^a-zA-Z\s]/', '', $fullName);
        
        // Tạo initials từ full_name đã làm sạch
        $initials = strtolower(implode('', array_map(function($word) {
            return substr($word, 0, 1);
        }, explode(' ', trim($cleanedFullName)))));

        // Tạo username unique với 3 số ngẫu nhiên
        $maxAttempts = 10; // Giới hạn số lần thử để tránh vòng lặp vô hạn
        $attempt = 0;
        do {
            $randomNumber = rand(100, 999);
            $username = $initials . $randomNumber;
            $attempt++;
            
            // Nếu đã thử quá nhiều lần mà vẫn trùng, thêm số ngẫu nhiên dài hơn
            if ($attempt >= $maxAttempts) {
                $username = $initials . rand(1000, 9999); // Dùng 4 chữ số
                break;
            }
        } while (User::where('user_name', $username)->exists());

        // Nếu người dùng đã tồn tại, cập nhật token
        if ($user) {
            $user->google_access_token = $socialUser->token;
            if ($socialUser->refreshToken) {
                $user->google_refresh_token = $socialUser->refreshToken;
            }
            // Cập nhật user_name nếu chưa có
            if (!$user->user_name) {
                $user->user_name = $username;
            }
            $user->save();
        } else {
            // Tạo người dùng mới
            $user = User::create([
                'full_name'             => $fullName,
                'email'                 => $socialUser->getEmail(),
                'google_id'             => $socialUser->getId(),
                'google_access_token'   => $socialUser->token,
                'google_refresh_token'  => $socialUser->refreshToken,
                'password'              => bcrypt(str()->random(16)),
                'user_name'             => $username
            ]);
        }
        return $user;
    }
}
