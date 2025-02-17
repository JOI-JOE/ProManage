<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{

    /**
     * Function dưới đấy sẽ chuyển hướng người dùng đến màn hình xác thực của Google(OAuth consent screen)
     * createAuthUrl - tạo một url xác thực và chuyền người dùng đén google
     * 
     */
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
        } elseif ($provider === 'github') {
            return Socialite::driver('github')->redirect();
        }
    }

    public function handleProviderCallback($provider)
    {
        try {
            // Kiểm tra xem provider có hợp lệ không
            if (!in_array($provider, ['google', 'github'])) {
                return response()->json(['error' => 'Unsupported provider'], 400);
            }

            // Lấy thông tin người dùng từ provider qua Socialite
            $socialUser = Socialite::driver($provider)->user();

            $googleAccessToken  = $socialUser->token; // Token từ Socialite
            $googleRefreshToken = $socialUser->refreshToken; // Refresh token nếu có

            // Tìm user trong database dựa trên email, hoặc tạo mới nếu chưa có
            $user = User::where('email', $socialUser->getEmail())->first();

            // Nếu người dùng đã tồn tại
            if ($user) {
                // Cập nhật token mới
                $user->google_access_token = $googleAccessToken;

                // Chỉ cập nhật refresh token nếu nó tồn tại
                if ($googleRefreshToken) {
                    $user->google_refresh_token = $googleRefreshToken;
                }

                $user->save();
            } else {
                // Nếu người dùng chưa có, tạo mới
                $user = User::create([
                    'full_name'             => $socialUser->getName(),
                    'email'                 => $socialUser->getEmail(),
                    'google_access_token'   => $googleAccessToken,
                    'google_refresh_token'  => $googleRefreshToken, // Lưu refresh token nếu có
                    'password'              => bcrypt(str()->random(16)),
                ]);
            }

            return response()->json([
                'id'                   => $user->id,
                'name'                 => $user->full_name,
                'email'                => $user->email,
                'avatar'               => $socialUser->getAvatar(),
                'provider'             => $provider,
                'google_access_token'  => $user->google_access_token, // Lấy từ database
                'google_refresh_token' => $user->google_refresh_token, // Lấy từ database
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to authenticate', 'message' => $e->getMessage()], 500);
        }
    }
}
