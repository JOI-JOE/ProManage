<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\MeResource;
use App\Models\Board;
use App\Models\BoardMember;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMembers;
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
        // Xác thực người dùng
        $userId = Auth::id();
        if (!$userId) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Lấy thông tin cơ bản của người dùng
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

        $pending = DB::table('workspace_members')
            ->join('workspaces', 'workspace_members.workspace_id', '=', 'workspaces.id')
            ->where('workspace_members.user_id', $userId)
            ->where('workspace_members.member_type', 'pending')
            ->select('workspaces.id')
            ->get();

        // Lấy danh sách workspaces với thông tin chi tiết và trạng thái admin
        $workspaces = DB::table('workspaces')
            ->leftJoin('workspace_members', function ($join) use ($userId) {
                $join->on('workspace_members.workspace_id', '=', 'workspaces.id')
                    ->where('workspace_members.user_id', $userId)
                    ->where('workspace_members.joined', '=', true);
            })
            ->select(
                'workspaces.id',
                'workspaces.name',
                'workspaces.display_name',
                'workspaces.logo_url as logo',
                'workspaces.logo_hash',
                'workspaces.permission_level',
                'workspaces.id_member_creator',
                'workspace_members.member_type',
                DB::raw('IF(workspaces.id_member_creator = ? OR workspace_members.member_type = "admin", TRUE, FALSE) AS is_admin')
            )
            ->addBinding($userId, 'select')
            ->where(function ($query) use ($userId) {
                $query->whereIn('workspaces.id', function ($subQuery) use ($userId) {
                    $subQuery->select('workspace_id')
                        ->from('workspace_members')
                        ->where('user_id', $userId)
                        ->where('workspace_members.member_type', '!=', 'pending')
                        ->where('workspace_members.is_deactivated', '=', false);
                })
                    ->orWhere('workspaces.id_member_creator', $userId);
            })
            ->distinct()
            ->get()
            ->map(function ($workspace) {
                return [
                    'id' => $workspace->id,
                    'name' => $workspace->name,
                    'display_name' => $workspace->display_name,
                    'permission_level' => $workspace->permission_level,
                    'id_member_creator' => $workspace->id_member_creator,
                    'is_admin' => (bool) $workspace->is_admin,
                    'member_type' => $workspace->member_type
                ];
            })
            ->values()
            ->all();

        // Lấy danh sách board ID mà người dùng có quyền truy cập (KHÔNG CACHE)
        // Lấy danh sách boards với thông tin chi tiết và trạng thái admin
        $boards = DB::table('boards')
            ->leftJoin('board_members', function ($join) use ($userId) {
                $join->on('board_members.board_id', '=', 'boards.id')
                    ->where('board_members.user_id', $userId);
            })
            ->select(
                'boards.id',
                'boards.name',
                'boards.thumbnail',
                'boards.visibility',
                'boards.workspace_id',
                'boards.created_by',
                'boards.created_at',
                'board_members.role',
                DB::raw('IF(boards.created_by = ? OR board_members.role = "admin", TRUE, FALSE) AS is_admin')
            )
            ->addBinding($userId, 'select')
            ->where(function ($query) use ($userId) {
                $query->whereIn('boards.id', function ($subQuery) use ($userId) {
                    $subQuery->select('board_id')
                        ->from('board_members')
                        ->where('user_id', $userId);
                })
                    ->orWhere('boards.created_by', $userId);
            })
            ->where('boards.closed', 0)
            ->distinct()
            ->get()
            ->map(function ($board) {
                return [
                    'id' => $board->id,
                    'name' => $board->name,
                    'visibility' => $board->visibility,
                    'workspace_id' => $board->workspace_id,
                    'is_admin' => (bool) $board->is_admin,
                    'role' => $board->role
                ];
            })
            ->values()
            ->all();

        return response()->json([
            'user' => $user,
            'workspaces' => $workspaces,
            'boards' => $boards,
            'pending' => $pending
        ]);
    }

    // ----------------------------------------------------------------------------------------------------------------------------

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

            // Xác thực người dùng
            if (!Auth::attempt($request->only('email', 'password'))) {
                return response()->json(['message' => 'Mật khẩu không đúng'], 401);
            }

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
