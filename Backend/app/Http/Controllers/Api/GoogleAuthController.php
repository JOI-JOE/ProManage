<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Laravel\Socialite\Facades\Socialite;

/**
 * @OA\Info(
 *     title="My API",
 *     version="1.0.0",
 *     description="API documentation for My Laravel App"
 * )
 */

class GoogleAuthController extends Controller
{
    /**
     * @OA\Info(
     *     title="My API",
     *     version="1.0.0",
     *     description="API documentation for My Laravel App"
     * )
     */

    /**
     * @OA\Get(
     *     path="/auth/redirect/{provider}",
     *     summary="Redirect to authentication provider",
     *     description="Redirects the user to the Google OAuth consent screen for authentication and authorization.",
     *     operationId="redirectToAuthProvider",
     *     tags={"Authentication"},
     *     @OA\Parameter(
     *         name="provider",
     *         in="path",
     *         description="The authentication provider (currently only Google is supported)",
     *         required=true,
     *         @OA\Schema(type="string", enum={"google"})
     *     ),
     *     @OA\Response(
     *         response=302,
     *         description="Redirects user to the Google OAuth page for authentication",
     *         @OA\Header(
     *             header="Location",
     *             description="URL for redirection to Google OAuth consent screen",
     *             @OA\Schema(type="string", example="https://accounts.google.com/o/oauth2/v2/auth?scope=...&response_type=code&redirect_uri=...")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Unsupported provider",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Unsupported provider"),
     *             @OA\Property(property="message", type="string", example="Provider not supported. Only Google is allowed.")
     *         )
     *     )
     * )
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
        }

        return response()->json([
            'error' => 'Unsupported provider',
            'message' => 'Provider not supported. Only Google is allowed.',
        ], 400);
    }

    /**
     * @OA\Post(
     *     path="/auth/callback/{provider}",
     *     summary="Handle authentication provider callback",
     *     description="Handles the callback from the authentication provider and returns user information along with tokens.",
     *     operationId="handleProviderCallback",
     *     tags={"Authentication"},
     *     @OA\Parameter(
     *         name="provider",
     *         in="path",
     *         description="The authentication provider (currently only Google is supported)",
     *         required=true,
     *         @OA\Schema(type="string", enum={"google"})
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successfully authenticated and retrieved user data",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="name", type="string", example="John Doe"),
     *             @OA\Property(property="email", type="string", example="john.doe@example.com"),
     *             @OA\Property(property="avatar", type="string", example="https://example.com/avatar.jpg"),
     *             @OA\Property(property="provider", type="string", example="google"),
     *             @OA\Property(property="google_access_token", type="string", example="ya29.a0AfH6S..."),
     *             @OA\Property(property="google_refresh_token", type="string", example="1//0gDhA..."),
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Unsupported provider",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Unsupported provider"),
     *             @OA\Property(property="message", type="string", example="Provider not supported. Only Google is allowed.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Failed to authenticate",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Failed to authenticate"),
     *             @OA\Property(property="message", type="string", example="Error message from the exception.")
     *         )
     *     )
     * )
     */

    public function handleProviderCallback($provider)
    {
        try {
            // Kiểm tra xem provider có hợp lệ không
            // if (!in_array($provider, ['google', 'github'])) {
            if (!in_array($provider, ['google'])) {
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
