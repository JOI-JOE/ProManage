<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GoogleAuthController extends Controller
{
    public function redirectToAuthProvider()
    {
        $socialite = Socialite::driver('google')
            ->stateless()
            ->scopes(['openid', 'profile', 'email'])
            ->with(['access_type' => 'offline', 'prompt' => 'select_account']);

        $url = $socialite->redirect()->getTargetUrl();

        return response()->json(['url' => $url]);
    }

    public function handleProviderCallback(Request $request)
    {
        try {
            $code = $request->query('code');
            if (!$code) {
                throw new \Exception('Mã xác thực không hợp lệ.');
            }

            $socialUser = Socialite::driver('google')->stateless()->user();
            $user = $this->findOrCreateUser($socialUser);
            Auth::login($user);

            $token = $user->createToken('auth_token')->plainTextToken;

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
        $avatar = $socialUser->getAvatar(); // Lấy URL ảnh đại diện từ Google
        $initials = $this->generateInitials($fullName); // Tạo initials từ full_name

        // Tạo username
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
            // Cập nhật thông tin nếu cần
            $user->update([
                'user_name' => $user->user_name ?? $username,
                'full_name' => $fullName,
                'initials' => $user->initials ?? $initials,
                'image' => $user->image ?? $avatar,
                'google_id' => $socialUser->getId(),
            ]);
            return $user;
        }

        return User::create([
            'full_name' => $fullName,
            'email' => $email,
            'google_id' => $socialUser->getId(),
            // 'password' => bcrypt(Str::random(16)),
            'password' => bcrypt('promanage'), // Mật khẩu mặc định
            'user_name' => $username,
            'initials' => $initials,
            'image' => $avatar,
        ]);
    }

    /**
     * Tạo initials từ full_name
     */
    protected function generateInitials($fullName)
    {
        if (!$fullName) {
            return null;
        }

        $words = explode(' ', trim($fullName));
        $initials = '';

        // Lấy chữ cái đầu của tối đa 2 từ
        foreach (array_slice($words, 0, 2) as $word) {
            if (!empty($word)) {
                $initials .= strtoupper(substr($word, 0, 1));
            }
        }

        return $initials ?: null;
    }
}
