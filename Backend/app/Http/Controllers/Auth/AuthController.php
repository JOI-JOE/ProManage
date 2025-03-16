<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\MeResource;
use App\Models\Board;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
    public function getUserData(Request $request)
    {
        // 🔹 Log query params để kiểm tra
        Log::info('Received query params: ', $request->query());

        // 🔹 Danh sách các fields hợp lệ cho user
        $validFields = ['id', 'user_name', 'full_name', 'initials', 'image', 'email', 'activity_block'];

        // 🔹 Lấy danh sách fields từ request
        $fields = $request->query('fields') ? explode(',', $request->query('fields')) : ['id'];
        $selectedFields = array_intersect($fields, $validFields);
        if (empty($selectedFields)) {
            $selectedFields = ['id'];
        }

        // 🔹 Truy vấn user từ database
        $user = User::where('id', auth()->id())->select($selectedFields)->first();
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'User not found'], 404);
        }

        // ====================================================
        // 🔹 Xử lý danh sách boards (Mặc định lấy `open`)
        // ====================================================
        $validBoards = ['open', 'starred'];
        $requestedBoards = $request->query('boards') ? explode(',', $request->query('boards')) : ['open'];
        $filteredBoards = array_intersect($requestedBoards, $validBoards);
        if (empty($filteredBoards)) {
            $filteredBoards = ['open'];
        }

        // ====================================================
        // 🔹 Xử lý danh sách board_fields (Chỉ giữ lại các trường có trong bảng `boards`)
        // ====================================================
        $validBoardFields = ['id', 'name', 'thumbnail', 'description', 'is_marked', 'archive', 'closed', 'created_by', 'visibility', 'workspace_id'];

        $boardFields = $request->query('board_fields') ? explode(',', $request->query('board_fields')) : ['id', 'name'];
        $selectedBoardFields = array_intersect($boardFields, $validBoardFields);
        if (empty($selectedBoardFields)) {
            $selectedBoardFields = ['id', 'name'];
        }

        // ====================================================
        // 🔹 Truy vấn danh sách boards
        // ====================================================

        // ✅ Truy vấn cơ bản lấy boards mà user là thành viên
        $boardQuery = Board::whereHas('boardMembers', function ($query) {
            $query->where('user_id', auth()->id());
        })->select($selectedBoardFields);

        // ✅ Lấy danh sách boards "open" (không bị đóng)
        $boards = in_array('open', $filteredBoards)
            ? (clone $boardQuery)->where('closed', false)->get()
            : collect();

        $boardStars = in_array('starred', $filteredBoards)
            ? Board::where('is_marked', true)->select(['id', 'name'])->get()
            : collect();


        return response()->json([
            'status' => 'success',
            'message' => 'User data retrieved successfully',
            'query_params' => $request->query(),
            'user' => $user,
            'boards' => $boards,         // Danh sách board "open"
            'boardStars' => $boardStars, // Danh sách board "starred"
        ]);
    }
    public function getUser()
    {
        $user = Auth::user(); // Lấy thông tin người dùng hiện tại

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return new MeResource($user);
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

    // Register
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
