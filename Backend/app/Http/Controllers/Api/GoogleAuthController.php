<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Http\Request;

class GoogleAuthController extends Controller
{
    public function redirectToAuthProvider()
    {
        // Sử dụng Socialite ở chế độ stateless (không dùng session)

        $socialite = Socialite::driver('google')
            ->stateless() // Bỏ qua session
            ->scopes(['openid', 'profile', 'email'])
            ->with(['access_type' => 'offline', 'prompt' => 'select_account']);

        // Tạo URL OAuth thủ công
        $url = $socialite->redirect()->getTargetUrl();

        return response()->json(['url' => $url]);
    }

    public function handleProviderCallback(Request $request)
    {
        try {
            // Lấy mã code từ query parameter
            $code = $request->query('code');
            if (!$code) {
                throw new \Exception('Mã xác thực không hợp lệ.');
            }

            // Sử dụng Socialite ở chế độ stateless để lấy thông tin người dùng
            $socialUser = Socialite::driver('google')->stateless()->user();
            $user = $this->findOrCreateUser($socialUser);
            Auth::login($user);

            // Tạo token cho người dùng
            $token = $user->createToken('auth_token')->plainTextToken;

            // Redirect về frontend với token và idMember trong query parameter
            $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
            return redirect("{$frontendUrl}/login/google?token={$token}&idMember={$user->id}");
        } catch (\Exception $e) {
            Log::error('Google OAuth Error: ' . $e->getMessage());
            $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
            return redirect("{$frontendUrl}/login/google?error=login_failed&message=" . urlencode($e->getMessage()));
        }
    }

    protected function findOrCreateUser($socialUser)
    {
        $email = $socialUser->getEmail();
        $user = User::where('email', $email)->first();
        $fullName = $socialUser->getName();

        $usernameBase = $fullName ? strtolower(preg_replace('/[^a-zA-Z]/', '', $fullName)) : explode('@', $email)[0];
        $username = $usernameBase;
        $attempt = 0;
        $maxAttempts = 10;

        while (User::where('user_name', $username)->exists() && $attempt < $maxAttempts) {
            $username = $usernameBase . rand(100, 9999);
            $attempt++;
        }

        if ($attempt >= $maxAttempts) {
            throw new \Exception('Unable to generate unique username');
        }

        if ($user) {
            if (!$user->user_name) {
                $user->user_name = $username;
                $user->save();
            }
            return $user;
        }

        return User::create([
            'full_name' => $fullName,
            'email' => $email,
            'google_id' => $socialUser->getId(),
            'password' => bcrypt(str()->random(16)),
            'user_name' => $username,
        ]);
    }
}
