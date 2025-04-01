<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        if (!$userId) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Sử dụng transaction để đảm bảo tính nhất quán
        return DB::transaction(function () use ($userId) {
            // Tối ưu query user với select cần thiết
            $user = DB::table('users')
                ->where('id', $userId)
                ->select([
                    'id',
                    'user_name',
                    'email',
                    'full_name',
                    'image',
                    'initials',
                    'activity_block'
                ])
                ->first();

            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }

            // Tối ưu query workspaces với subquery thay vì leftJoin
            $workspaceQuery = DB::table('workspaces')
                ->whereExists(function ($query) use ($userId) {
                    $query->select(DB::raw(1))
                        ->from('workspace_members')
                        ->whereColumn('workspace_members.workspace_id', 'workspaces.id')
                        ->where('workspace_members.user_id', $userId);
                })
                ->orWhere('id_member_creator', $userId);

            $allWorkspaceIds = $workspaceQuery
                ->distinct()
                ->pluck('id')
                ->all();

            // Tối ưu query boards với subquery
            $boardQuery = DB::table('boards')
                ->whereExists(function ($query) use ($userId) {
                    $query->select(DB::raw(1))
                        ->from('board_members')
                        ->whereColumn('board_members.board_id', 'boards.id')
                        ->where('board_members.user_id', $userId);
                })
                ->orWhere('created_by', $userId);

            $allBoardIds = $boardQuery
                ->distinct()
                ->pluck('id')
                ->all();

            return response()->json([
                'user' => $user,
                'workspaceId' => $allWorkspaceIds,
                'boardId' => $allBoardIds,
            ], 200);
        });
    }



    public function handleLogin(Request $request)
    {
        try {
            // Validate the request
            $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);

            // Kiểm tra xem email có tồn tại không
            $user = User::where('email', $request->email)->first();
            if (!$user) {
                return response()->json(['message' => 'Email không tồn tại'], 404);
            }

            // // Xác thực người dùng
            // if (!Auth::attempt($request->only('email', 'password'))) {
            //     return response()->json(['message' => 'Mật khẩu không đúng'], 401);
            // }

            // Tạo token sau khi xác thực thành công
            $token = $user->createToken('token')->plainTextToken;

            // Lấy thông tin người dùng đã đăng nhập
            $user = Auth::user();

            return response()->json([
                'message' => 'Đăng nhập thành công',
                'token' => $token,
                'user' => $user
            ]);
        } catch (\Exception $e) {
            // Ghi log lỗi
            Log::error('Lỗi đăng nhập: ' . $e->getMessage());

            // Trả về thông báo lỗi chung
            return response()->json([
                'message' => 'Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại sau.',
            ], 500);
        }
    }
    public function handleRegister(Request $request)
    {
        // Validate dữ liệu đầu vào
        $validated = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'user_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validated->fails()) {
            return response()->json(['errors' => $validated->errors()], 400);
        }

        // Tạo người dùng mới
        $user = User::create([
            'full_name' => $request->full_name,
            'user_name' => $request->user_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Tạo token cho người dùng mới
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function sendResetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Email không tồn tại!'], 404);
        }

        // Tạo mật khẩu mới ngẫu nhiên
        $newPassword = Str::random(10);
        $user->password = Hash::make($newPassword);
        $user->save();

        // Gửi email mật khẩu mới
        Mail::raw("Mật khẩu mới của bạn là: $newPassword", function ($message) use ($user) {
            $message->to($user->email)
                ->subject('Mật khẩu mới của bạn');
        });

        return response()->json(['message' => 'Mật khẩu mới đã được gửi qua email!']);
    }

    ////// Logout
    public function logout(Request $request)
    {


        $request->user()->tokens()->delete(); // Xóa tất cả token của user
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function loginGitHub()
    {
        return Socialite::driver('github')->redirect();
    }

    public function handleLoginGitHub()
    {
        try {
            $githubUser = Socialite::driver('github')->stateless()->user();

            if (!$githubUser->getEmail()) {
                throw new \Exception("GitHub account missing email");
            }

            // dd($githubUser);
            $avatarUrl = $githubUser->getAvatar();

            // Kiểm tra và tải ảnh về storage
            $avatarName = null;
            if ($avatarUrl = $githubUser->getAvatar()) {
                $response = Http::get($avatarUrl);

                if ($response->successful()) {
                    Storage::disk('public')->makeDirectory('avatars'); // Đảm bảo thư mục tồn tại
                    $avatarName = 'avatars/' . Str::random(20) . '.jpg';
                    Storage::disk('public')->put($avatarName, $response->body());
                }
            }

            $user = User::updateOrCreate(
                ['email' => $githubUser->email], // Điều kiện tìm kiếm
                [
                    'role' => 'member',
                    'user_name' => $githubUser->name,
                    'full_name' => $githubUser->name,
                    'password' => "password",
                    'github_id' => $githubUser->id,
                    'github_avatar' => $avatarName ?? $avatarUrl,
                ]
            );


            $token = $user->createToken('token')->plainTextToken;

            // Chuyển hướng về React với token
            return redirect()->to("http://localhost:5173/auth/callback?token=$token");
        } catch (\Exception $e) {
            Log::error($e); // Log toàn bộ lỗi
            return response()->json(
                ['error' => $e->getMessage()],
                500
            );
        }
    }
}
