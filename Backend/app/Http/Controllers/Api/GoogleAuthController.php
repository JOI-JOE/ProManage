<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
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
            return Socialite::driver('google')->redirect();
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

            // Lấy thông tin người dùng từ provider
            $user = Socialite::driver($provider)->user();

            // Kiểm tra xem có phải Google không và lưu access token
            if ($provider === 'google') {
                $googleAccessToken = $user->token; // Lấy token từ Google
                $googleRefreshToken = $user->refreshToken; // Lấy refresh token nếu có

                // Lưu vào cơ sở dữ liệu
                $dbUser = User::where('email', $user->getEmail())->first();
                $dbUser->google_access_token = $googleAccessToken;
                $dbUser->google_refresh_token = $googleRefreshToken;  // Nếu cần lưu refresh token
                $dbUser->save();
            }

            // Trả về dữ liệu người dùng
            return response()->json([
                'id' => $user->getId(),
                'name' => $user->getName(),
                'email' => $user->getEmail(),
                'avatar' => $user->getAvatar(),
                'provider' => $provider,
                'token' => $user->token // Trả về token cho client nếu cần
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to authenticate', 'message' => $e->getMessage()], 500);
        }
    }
}
