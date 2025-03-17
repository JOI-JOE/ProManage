<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\MeResource;
use App\Models\Board;
use App\Models\BoardMember;
use App\Models\User;
use App\Models\Workspace;
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
        Log::info('Received query params: ', $request->query());

        // ================================================
        // 🔹 Lọc fields trước khi query
        // ================================================
        $validUserFields = [
            'id',  // Đảm bảo có thể tạo ID UUID thủ công
            'user_name',
            'full_name',
            'initials',
            'image',
            'email',
            'role',
            'activity_block',
        ];
        $userFields = $request->query('fields') ? explode(',', $request->query('fields')) : ['id'];
        $selectedUserFields = array_intersect($userFields, $validUserFields);

        $validWorkspaceFields = [
            'id',
            'id_member_creator',
            'name',
            'display_name',
            'desc',
            'logo_hash',
            'logo_url',
            'permission_level',
            'board_invite_restrict',
            'org_invite_restrict',
            'board_delete_restrict',
            'board_visibility_restrict',
            'team_type'
        ];
        $workspaceFields = $request->query('workspace_fields') ? explode(',', $request->query('workspace_fields')) : ['id', 'display_name', 'name'];
        $selectedWorkspaceFields = array_intersect($workspaceFields, $validWorkspaceFields);

        $validBoardFields = [
            'id',
            'name',
            'thumbnail',
            'description',
            'is_marked',
            'archive',
            'closed',
            'created_by',
            'visibility',
            'workspace_id'
        ];
        $boardFields = $request->query('board_fields') ? explode(',', $request->query('board_fields')) : ['id'];
        $selectedBoardFields = array_intersect($boardFields, $validBoardFields);

        // ================================================
        // 🔹 Query dữ liệu sau khi đã lọc fields
        // ================================================
        $user = User::select($selectedUserFields)->find(auth()->id());
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'User not found'], 404);
        }

        $workspaces = collect();
        if ($request->query('workspaces') === 'all') {
            $workspaces = Workspace::whereHas('members', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })->select($selectedWorkspaceFields)->get();
        }

        $boards = collect();
        $boardQuery = Board::whereHas('boardMembers', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->select($selectedBoardFields);

        if ($request->query('boards')) {
            $boardFilters = explode(',', $request->query('boards'));
            if (in_array('open', $boardFilters)) {
                $boards = (clone $boardQuery)->where('closed', false)->get();
            }
            if (in_array('starred', $boardFilters)) {
                $boards = $boards->merge((clone $boardQuery)->where('is_marked', true)->get());
            }
        }

        $boardStars = ($request->query('boardStars') === 'true')
            ? Board::where('is_marked', true)->select(['id', 'name'])->get()
            : collect();

        if ($request->query('board_memberships') === 'me') {
            $memberships = BoardMember::whereIn('board_id', $boards->pluck('id'))
                ->where('user_id', $user->id)
                ->select(['id', 'board_id', 'user_id', 'role', 'is_unconfirmed', 'is_deactivated'])
                ->get()
                ->groupBy('board_id');

            $boards = $boards->map(function ($board) use ($memberships) {
                $board->members = $memberships->get($board->id, collect())->map(function ($member) {
                    return [
                        'id'             => $member->id,
                        'member_id'      => $member->user_id,
                        'role'           => $member->role,
                        'is_unconfirmed' => $member->is_unconfirmed,
                        'is_deactivated' => $member->is_deactivated,
                    ];
                });
                return $board;
            });
        }

        return response()->json([
            'user' => $user,
            'workspaces' => $workspaces,
            'boards' => $boards,
            'boardStars' => $boardStars,
        ]);
    }

    /**
     * Helper function để lọc và validate fields từ query params
     */
    private function getValidatedFields($requestFields, $validFields, $default = ['id'])
    {
        $fields = $requestFields ? explode(',', $requestFields) : $default;
        return array_intersect($fields, $validFields) ?: $default;
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
