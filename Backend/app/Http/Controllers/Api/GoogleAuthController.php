<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{

    public function redirectToAuthProvider($provider)
    {
        if ($provider === 'google') {
            return Socialite::driver('google')
                ->scopes([
                    'https://www.googleapis.com/auth/userinfo.email',
                    'https://www.googleapis.com/auth/userinfo.profile',
                    'https://www.googleapis.com/auth/gmail.send',
                ])
                ->with([
                    'access_type' => 'offline', // Lấy refresh token
                    'prompt' => 'consent', // Yêu cầu cấp lại quyền
                ])
                ->redirect();
        }

        return response()->json([
            'error' => 'Unsupported provider',
            'message' => 'Provider not supported. Only Google is allowed.',
        ], 400);
    }

    public function handleProviderCallback($provider)
    {
        try {
            // Kiểm tra provider hợp lệ
            if (!in_array($provider, ['google'])) {
                return response()->json(['error' => 'Unsupported provider'], 400);
            }

            // Lấy thông tin người dùng từ provider
            $socialUser = Socialite::driver($provider)->user();

            // Xử lý hoặc tạo người dùng
            $user = $this->findOrCreateUser($socialUser, $provider);

            // Đăng nhập người dùng
            Auth::login($user);

            // Tạo token xác thực
            $token = $user->createToken('auth-token')->plainTextToken;

            // Trả về thông tin người dùng và token
            return response()->json([
                'id'                   => $user->id,
                'name'                 => $user->full_name,
                'email'                => $user->email,
                'avatar'               => $socialUser->getAvatar(),
                'provider'             => $provider,
                'google_access_token'  => $user->google_access_token,
                'google_refresh_token' => $user->google_refresh_token,
                'token'                => $token,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to authenticate', 'message' => $e->getMessage()], 500);
        }
    }

    protected function findOrCreateUser($socialUser, $provider)
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
                'google_access_token'   => $socialUser->token,
                'google_refresh_token'  => $socialUser->refreshToken,
                'password'              => bcrypt(str()->random(16)),
            ]);
        }

        return $user;
    }
}
