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
    private const FRONTEND_URL = 'http://localhost:5173';

    public function getUserData(Request $request, $id = null)
    {
        try {
            // Kiểm tra nếu ID không được truyền thì lấy từ user đang đăng nhập
            $userId = ($id === 'me') ? Auth::id() : $id;
            if (!$userId) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized or invalid user',
                ], 401);
            }
            return $this->fetchUserData($request, $userId);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Server Error',
                'error' => $e->getMessage(), // Giúp debug nhanh hơn
            ], 500);
        }
    }
    private function fetchUserData(Request $request, $id)
    {
        $user = User::find($id); // Tìm user theo ID

        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'User not found'], 404);
        }

        $response = [
            'user' => $this->prepareUserData($request, $user),
            'workspaces' => $request->has('workspaces') ? $this->getWorkspaces($request, $user) : [],
            'boards' => $request->has('boards') ? $this->getBoards($request, $user) : [],
            'boardStars' => $request->query('boardStars') === 'true' ? $this->getBoardStars($user) : [],
        ];

        // 🔥 Loại bỏ các mảng rỗng ([])
        $response = array_filter($response);

        return response()->json($response);
    }

    private function prepareUserData($request, $user)
    {
        $validUserFields = [
            'id',
            'user_name',
            'full_name',
            'initials',
            'image',
            'email',
            'role',
            'activity_block',
            'url',
            'workspace_id',
            'board_id'
        ];

        $userFields = $request->query('fields');
        if (!$userFields) {
            return [];
        }

        $selectedUserFields = $this->getSelectedFields($userFields, $validUserFields);

        if (empty($selectedUserFields)) {
            return [];
        }

        $filteredUser = collect($user)->only($selectedUserFields);

        // Nếu 'url' được yêu cầu, thêm vào dữ liệu
        if (in_array('url', $selectedUserFields)) {
            $filteredUser->put('url', self::FRONTEND_URL . "/u/{$user->user_name}");
        }

        // Chỉ thêm workspace_id nếu nó được yêu cầu
        if (in_array('workspace_id', $selectedUserFields)) {
            $workspaceIds = optional($user->workspaceMember)->pluck('workspace_id')->toArray() ?? [];
            $filteredUser->put('workspace_id', $workspaceIds);
        }

        // Chỉ thêm board_id nếu nó được yêu cầu
        if (in_array('board_id', $selectedUserFields)) {
            $boardIds = optional($user->boardMember)->pluck('board_id')->toArray() ?? [];
            $filteredUser->put('board_id', $boardIds);
        }

        return $filteredUser->toArray();
    }

    private function getWorkspaces($request, $user)
    {
        if (!is_object($user)) {
            return response()->json(['error' => 'Invalid user data'], 400);
        }

        if ($request->query('workspaces') !== 'all') {
            return collect();
        }

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

        $selectedWorkspaceFields = $this->getSelectedFields($request->query('workspace_fields', 'id'), $validWorkspaceFields);

        $userWorkspaceIds = WorkspaceMembers::where('user_id', $user->id)->pluck('workspace_id');

        return Workspace::where(function ($query) use ($userWorkspaceIds, $user) {
            $query->whereIn('id', $userWorkspaceIds)
                ->orWhere('id_member_creator', $user->id);
        })->select($selectedWorkspaceFields)->get();
    }

    private function getBoards($request, $user)
    {
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

        // Xác định các trường hợp lệ được chọn
        $selectedBoardFields = $this->getSelectedFields(
            $request->query('board_fields', 'id'),
            $validBoardFields
        );

        // Query lấy danh sách boards mà user là thành viên
        $boardQuery = Board::whereHas('boardMembers', fn($query) => $query->where('user_id', $user->id))
            ->select($selectedBoardFields);

        // Áp dụng bộ lọc
        $boards = $this->applyBoardFilters($boardQuery, $request);

        // Thêm memberships nếu `board_memberships=me`
        if ($request->query('board_memberships') === 'me') {
            $this->addMembershipsToBoards($boards, $user);
        }

        // Thêm workspace nếu `board_workspaces=true`
        if ($request->query('board_workspaces') === 'true') {

            $workspaceFields = $request->query('board_workspace_fields');
            $this->addWorkspaceToBoards($boards, $user, $workspaceFields);
        }

        return $boards;
    }
    private function getBoardStars($user)
    {
        return Board::where('is_marked', true)
            ->whereHas('boardMembers', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->select(['id', 'name'])
            ->get();
    }

    private function getSelectedFields($fields, $validFields)
    {
        $fieldsArray = array_filter(explode(',', $fields));
        return array_intersect($fieldsArray, $validFields);
    }

    private function applyBoardFilters($boardQuery, $request)
    {
        $boards = collect();

        if ($request->has('boards')) {
            $boardFilters = explode(',', $request->query('boards'));

            if (in_array('open', $boardFilters)) {
                $boards = (clone $boardQuery)->where('closed', false)->get();
            }
            if (in_array('starred', $boardFilters)) {
                $boards = $boards->merge((clone $boardQuery)->where('is_marked', true)->get());
            }
        }

        return $boards;
    }

    private function addMembershipsToBoards($boards, $user)
    {
        if ($boards->isEmpty()) {
            return;
        }

        $memberships = BoardMember::whereIn('board_id', $boards->pluck('id'))
            ->where('user_id', $user->id)
            ->select(['id', 'board_id', 'user_id', 'role', 'is_unconfirmed', 'is_deactivated'])
            ->get()
            ->groupBy('board_id');

        $boards->transform(function ($board) use ($memberships) {
            $board->members = $memberships->get($board->id, collect())->map(fn($member) => [
                'id'             => $member->id,
                'member_id'      => $member->user_id,
                'role'           => $member->role,
                'is_unconfirmed' => $member->is_unconfirmed,
                'is_deactivated' => $member->is_deactivated,
            ]);
            return $board;
        });
    }

    private function addWorkspaceToBoards($boards, $user, $workspaceFields): void
    {
        if ($boards->isEmpty()) {
            return;
        }

        // Lấy danh sách workspace_id từ boards (loại bỏ null)
        $workspaceIds = $boards->pluck('workspace_id')->filter()->unique();

        if ($workspaceIds->isEmpty()) {
            return;
        }

        $validWorkspaceFields = [
            'id',
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

        $selectedWorkspaceFields = $workspaceFields
            ? $this->getSelectedFields($workspaceFields, $validWorkspaceFields)
            : ['id', 'name'];

        // Lấy danh sách workspace mà user có quyền truy cập
        $workspaces = Workspace::whereIn('id', $workspaceIds)
            ->where(function ($query) use ($user) {
                $query->whereIn('id', WorkspaceMembers::where('user_id', $user->id)->pluck('workspace_id'))
                    ->orWhere('id_member_creator', $user->id);
            })
            ->select($selectedWorkspaceFields)
            ->get()
            ->keyBy('id');

        // Gán thông tin workspace vào từng board
        $boards->transform(fn($board) => tap($board, fn($b) => $b->workspace = $workspaces->get($b->workspace_id) ?? null));
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
