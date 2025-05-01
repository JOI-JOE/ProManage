<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\WorkspaceRequest;
use App\Http\Resources\WorkspaceResource;
use App\Models\Workspace;
use App\Models\WorkspaceMembers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class WorkspaceController extends Controller
{

    public function index()
    {
        $userId = Auth::id();

        if (!$userId) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Lấy danh sách workspaces mà user tham gia hoặc tạo
        $workspaces = DB::table('workspaces')
            ->leftJoin('workspace_members', function ($join) use ($userId) {
                $join->on('workspace_members.workspace_id', '=', 'workspaces.id')
                    ->where('workspace_members.user_id', $userId)
                    ->where('workspace_members.joined', 1)
                    ->where('workspace_members.is_deactivated', 0);
            })
            ->select(
                'workspaces.id',
                'workspaces.name',
                'workspaces.display_name',
                'workspaces.id_member_creator',
                'workspaces.logo_url as logo',
                'workspaces.logo_hash as logo_hash',
                'workspaces.permission_level',
                'workspace_members.member_type',
                'workspace_members.joined',
                DB::raw('(SELECT COUNT(*) FROM workspace_members wm WHERE wm.workspace_id = workspaces.id AND wm.joined = 1 AND wm.is_deactivated = 0) AS member_count'),
                DB::raw('IF(workspaces.id_member_creator = ?, TRUE, FALSE) AS is_creator')
            )
            ->addBinding($userId, 'select')
            ->where(function ($query) use ($userId) {
                $query->where('workspace_members.user_id', $userId);
            })
            ->distinct()
            ->get();

        // Lấy tất cả boards mà user tham gia hoặc tạo
        $boards = DB::table('boards')
            ->leftJoin('board_members', function ($join) use ($userId) {
                $join->on('board_members.board_id', '=', 'boards.id')
                    ->where('board_members.user_id', $userId);
            })
            ->leftJoin('workspaces as ws', 'boards.workspace_id', '=', 'ws.id')
            ->leftJoin('users as creator', 'boards.created_by', '=', 'creator.id')
            ->select(
                'boards.id',
                'boards.name',
                'boards.workspace_id',
                'boards.thumbnail',
                'boards.visibility',
                'boards.created_by',
                'boards.created_at',
                'boards.last_accessed',
                'boards.is_marked',
                'boards.closed', // 👉 THÊM DÒNG NÀY
                'board_members.role',
                DB::raw('(SELECT COUNT(*) FROM board_members bm WHERE bm.board_id = boards.id) AS member_count'),
                'ws.id as workspace_id_ref',
                'ws.name as workspace_name',
                'ws.display_name as workspace_display_name',
                'ws.permission_level as workspace_visibility',
                'ws.logo_url as workspace_logo',
                'creator.user_name as created_by_name',
                'creator.image as created_by_image'
            )
            ->where(function ($query) use ($userId) {
                $query->where('boards.created_by', $userId)
                    ->orWhereNotNull('board_members.user_id');
            })
            // ->where('boards.closed', 0)
            ->orderBy('boards.created_at', 'desc')
            ->get();


        // Chuẩn bị dữ liệu trả về
        $responseData = [
            'workspaces' => [],
            'guestWorkspaces' => [], // Thay personal_boards bằng guestWorkspaces
            'id' => $userId
        ];

        // Chuẩn bị workspaces mà user đã tham gia
        $workspaceIds = $workspaces->pluck('id')->toArray();
        $responseData['workspaces'] = $workspaces->map(function ($workspace) {
            return [
                'id' => $workspace->id,
                'name' => $workspace->name,
                'display_name' => $workspace->display_name,
                'logo' => $workspace->logo,
                'logo_hash' => $workspace->logo_hash,
                'id_member_creator' => $workspace->id_member_creator,
                'permission_level' => $workspace->permission_level,
                'member_type' => $workspace->member_type,
                'joined' => $workspace->joined,
                'member_count' => $workspace->member_count,
                'is_creator' => $workspace->is_creator,
                'boards' => []
            ];
        })->values()->all();

        // Chuẩn bị guestWorkspaces (các workspace mà user chưa tham gia nhưng có tham gia board)
        $guestWorkspaces = [];
        foreach ($boards as $board) {
            $boardData = [
                'id' => $board->id,
                'name' => $board->name,
                'workspace_id' => $board->workspace_id,
                'thumbnail' => $board->thumbnail,
                'visibility' => $board->visibility,
                'created_by' => $board->created_by,
                'created_by_name' => $board->created_by_name,
                'created_by_image' => $board->created_by_image,
                'is_marked' => $board->is_marked,
                'created_at' => $board->created_at,
                'role' => $board->role,
                'member_count' => $board->member_count,
                'closed' => (bool) $board->closed, // 👉 thêm dòng này
                'last_accessed' => $board->last_accessed
            ];

            if ($board->workspace_id && in_array($board->workspace_id, $workspaceIds)) {
                // Board thuộc workspace mà user đã tham gia
                foreach ($responseData['workspaces'] as &$workspaceData) {
                    if ($workspaceData['id'] === $board->workspace_id) {
                        $workspaceData['boards'][] = $boardData;
                        break;
                    }
                }
            } elseif ($board->workspace_id && $board->workspace_id_ref) {
                // Board thuộc workspace mà user chưa tham gia (guest workspace)
                $workspaceId = $board->workspace_id;
                if (!isset($guestWorkspaces[$workspaceId])) {
                    $guestWorkspaces[$workspaceId] = [
                        'id' => $board->workspace_id_ref,
                        'name' => $board->workspace_name,
                        'display_name' => $board->workspace_display_name,
                        'logo' => $board->workspace_logo,
                        'permission_level' => $board->workspace_visibility,
                        'boards' => []
                    ];
                }
                $guestWorkspaces[$workspaceId]['boards'][] = $boardData;
            }
            // Bỏ qua các board không thuộc workspace (personal boards) vì không cần nữa
        }

        // Chuyển guestWorkspaces thành mảng và đảm bảo boards không bị lồng
        $responseData['guestWorkspaces'] = array_values($guestWorkspaces);
        foreach ($responseData['guestWorkspaces'] as &$guestWorkspace) {
            $guestWorkspace['boards'] = array_values($guestWorkspace['boards']);
        }

        // Đảm bảo boards trong workspaces không bị lồng mảng
        $responseData['workspaces'] = array_map(function ($workspace) {
            $workspace['boards'] = array_values($workspace['boards']);
            return $workspace;
        }, $responseData['workspaces']);

        return response()->json($responseData, 200);
    }

    public function show($workspaceId)
    {
        try {
            // Kiểm tra nếu tên workspace không hợp lệ
            if (!$workspaceId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Id workspace không được để trống.',
                ], 400);
            }

            // Lấy user hiện tại
            $currentUser = auth()->user();

            if (!$currentUser) {
                return response()->json([
                    'success' => false,
                    'message' => 'Người dùng chưa đăng nhập.',
                ], 401);
            }
            // Tìm workspace theo tên
            $workspace = DB::table('workspaces')
                ->where('id', $workspaceId)
                ->first();

            // Nếu không tìm thấy workspace
            if (!$workspace) {
                Log::error("Không tìm thấy workspace: $workspaceId");
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy workspace.',
                ], 404);
            }

            // Kiểm tra xem người dùng hiện tại có phải admin của workspace này không
            $isAdmin = DB::table('workspace_members')
                ->where('workspace_id', $workspace->id)
                ->where('user_id', $currentUser->id)
                ->where('member_type', 'admin')
                ->exists();

            // Lấy danh sách thành viên của workspace
            $members = DB::table('workspace_members')
                ->where('workspace_id', $workspace->id)
                ->where('joined', true)
                ->where('is_deactivated', false)
                ->join('users', 'workspace_members.user_id', '=', 'users.id')
                ->select(
                    'workspace_members.id',
                    'workspace_members.workspace_id',
                    'workspace_members.user_id',
                    'workspace_members.member_type',
                    'workspace_members.is_unconfirmed',
                    'workspace_members.joined',
                    'workspace_members.is_deactivated',
                    'workspace_members.last_active',
                    'users.id as user_id',
                    'users.full_name',
                    'users.email',
                    'users.user_name',
                    'users.initials',
                    'users.image'
                )
                ->get()
                ->map(function ($member) {
                    return [
                        'id' => $member->id,
                        'workspace_id' => $member->workspace_id,
                        'user_id' => $member->user_id,
                        'member_type' => $member->member_type,
                        'is_unconfirmed' => (bool) $member->is_unconfirmed,
                        'joined' => (bool) $member->joined,
                        'is_deactivated' => (bool) $member->is_deactivated,
                        'last_active' => $member->last_active,
                        'user' => [
                            'id' => $member->user_id,
                            'full_name' => $member->full_name,
                            'email' => $member->email,
                            'user_name' => $member->user_name,
                            'initials' => $member->initials,
                            'image' => $member->image,
                        ],
                    ];
                })->toArray();

            // Lấy danh sách yêu cầu tham gia (requests) - những thành viên chưa joined
            $requests = DB::table('workspace_members')
                ->where('workspace_id', $workspace->id)
                ->where('joined', false)
                ->where('member_type', 'pending')
                ->join('users', 'workspace_members.user_id', '=', 'users.id')
                ->select(
                    'workspace_members.id',
                    'workspace_members.workspace_id',
                    'workspace_members.user_id',
                    'workspace_members.member_type',
                    'workspace_members.is_unconfirmed',
                    'workspace_members.joined',
                    'workspace_members.is_deactivated',
                    'workspace_members.last_active',
                    'users.id as user_id',
                    'users.full_name',
                    'users.email',
                    'users.user_name',
                    'users.initials',
                    'users.image'
                )
                ->get()
                ->map(function ($member) {
                    return [
                        'id' => $member->id,
                        'workspace_id' => $member->workspace_id,
                        'user_id' => $member->user_id,
                        'member_type' => $member->member_type,
                        'is_unconfirmed' => (bool) $member->is_unconfirmed,
                        'joined' => (bool) $member->joined,
                        'is_deactivated' => (bool) $member->is_deactivated,
                        'last_active' => $member->last_active,
                        'user' => [
                            'id' => $member->user_id,
                            'full_name' => $member->full_name,
                            'email' => $member->email,
                            'user_name' => $member->user_name,
                            'initials' => $member->initials,
                            'image' => $member->image,
                        ],
                    ];
                })->toArray();

            // Lấy danh sách guest - những người là thành viên của board nhưng không phải thành viên workspace
            $guests = DB::table('board_members')
                ->whereIn('board_id', function ($query) use ($workspaceId) {
                    $query->select('id')
                        ->from('boards')
                        ->where('workspace_id', $workspaceId)
                        ->where('closed', false);
                })
                ->where('joined', true)
                ->where('is_deactivated', false)
                ->whereNotIn('user_id', function ($query) use ($workspaceId) {
                    $query->select('user_id')
                        ->from('workspace_members')
                        ->where('workspace_id', $workspaceId)
                        ->where('joined', true)
                        ->where('is_deactivated', false);
                })
                ->join('users', 'board_members.user_id', '=', 'users.id')
                ->select(
                    'board_members.user_id',
                    'users.id as user_id',
                    'users.full_name',
                    'users.email',
                    'users.user_name',
                    'users.initials',
                    'users.image'
                )
                ->distinct()
                ->get()
                ->map(function ($guest) {
                    return [
                        'user_id' => $guest->user_id,
                        'user' => [
                            'id' => $guest->user_id,
                            'full_name' => $guest->full_name,
                            'email' => $guest->email,
                            'user_name' => $guest->user_name,
                            'initials' => $guest->initials,
                            'image' => $guest->image,
                        ],
                    ];
                })->toArray();

            // Lấy danh sách bảng của workspace
            $boards = DB::table('boards')
                ->where('workspace_id', $workspace->id)
                ->where('closed', false)
                ->get()
                ->map(function ($board) {
                    // Lấy danh sách thành viên của bảng
                    $boardMembers = DB::table('board_members')
                        ->where('board_id', $board->id)
                        ->where('joined', true)
                        ->where('is_deactivated', false)
                        ->join('users', 'board_members.user_id', '=', 'users.id')
                        ->select(
                            'board_members.id',
                            'board_members.board_id',
                            'board_members.user_id',
                            'board_members.role',
                            'board_members.is_unconfirmed',
                            'board_members.joined',
                            'board_members.is_deactivated',
                            'board_members.referrer_id',
                            'board_members.last_active',
                            'users.id as user_id',
                            'users.full_name',
                            'users.email',
                            'users.initials',
                            'users.user_name',
                            'users.image'
                        )
                        ->get()
                        ->map(function ($boardMember) {
                        return [
                            'id' => $boardMember->id,
                            'board_id' => $boardMember->board_id,
                            'user_id' => $boardMember->user_id,
                            'role' => $boardMember->role,
                            'is_unconfirmed' => (bool) $boardMember->is_unconfirmed,
                            'joined' => (bool) $boardMember->joined,
                            'is_deactivated' => (bool) $boardMember->is_deactivated,
                            'referrer_id' => $boardMember->referrer_id,
                            'last_active' => $boardMember->last_active,
                            'user' => [
                                'id' => $boardMember->user_id,
                                'full_name' => $boardMember->full_name,
                                'email' => $boardMember->email,
                                'user_name' => $boardMember->user_name,
                                'initials' => $boardMember->initials,
                                'image' => $boardMember->image,
                            ],
                        ];
                    })->toArray();

                        
                    $lists = DB::table('list_boards')
                    ->where('board_id', $board->id)
                    ->where('closed', false)
                    ->select(
                        'id',
                        'board_id',
                        'name',
                        'position',
                        'created_at',
                        'updated_at'
                    )
                    ->orderBy('position', 'asc')
                    ->get()
                    ->map(function ($list) {
                    return [
                        'id' => $list->id,
                        'board_id' => $list->board_id,
                        'name' => $list->name,
                        'position' => $list->position,
                        'created_at' => $list->created_at,
                        'updated_at' => $list->updated_at,
                    ];
                })->toArray();


                    return [
                        'id' => $board->id,
                        'name' => $board->name,
                        'thumbnail' => $board->thumbnail,
                        'description' => $board->description,
                        'is_marked' => (bool) $board->is_marked,
                        'archive' => (bool) $board->archive,
                        'closed' => (bool) $board->closed,
                        'created_by' => $board->created_by,
                        'visibility' => $board->visibility,
                        'workspace_id' => $board->workspace_id,
                        'created_at' => $board->created_at,
                        'updated_at' => $board->updated_at,
                        'members' => $boardMembers,
                        'lists' => $lists,
                    ];
                })->toArray();

            // Tạo mảng dữ liệu để truyền vào WorkspaceResource
            $workspaceData = [
                'id' => $workspace->id,
                'name' => $workspace->name,
                'display_name' => $workspace->display_name,
                'desc' => $workspace->desc,
                'logo_hash' => $workspace->logo_hash,
                'logo_url' => $workspace->logo_url,
                'permission_level' => $workspace->permission_level,
                'team_type' => $workspace->team_type,
                'created_at' => $workspace->created_at,
                'updated_at' => $workspace->updated_at,
                'members' => $members,
                'boards' => $boards,
                'guests' => $guests,
                'requests' => $requests,
                'isCurrentUserAdmin' => $isAdmin,
            ];

            // Trả về dữ liệu workspace dưới dạng resource
            return new WorkspaceResource($workspaceData);
        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy chi tiết workspace: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi lấy chi tiết workspace.',
            ], 500);
        }
    }

    public function showWorkspaceByName($workspaceName)
    {
        try {
            // Kiểm tra nếu tên workspace không hợp lệ
            if (!$workspaceName) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tên workspace không được để trống.',
                ], 400);
            }

            // Lấy user hiện tại
            $currentUser = auth()->user();

            if (!$currentUser) {
                return response()->json([
                    'success' => false,
                    'message' => 'Người dùng chưa đăng nhập.',
                ], 401);
            }

            // Tìm workspace theo tên
            $workspace = DB::table('workspaces')
                ->where('name', $workspaceName)
                ->first();

            // Nếu không tìm thấy workspace
            if (!$workspace) {
                Log::error("Không tìm thấy workspace: $workspaceName");
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy workspace.',
                ], 404);
            }

            // Kiểm tra xem người dùng hiện tại có phải admin của workspace này không
            $isAdmin = DB::table('workspace_members')
                ->where('workspace_id', $workspace->id)
                ->where('user_id', $currentUser->id)
                ->where('member_type', 'admin')
                ->exists();

            // Lấy danh sách thành viên của workspace
            $members = DB::table('workspace_members')
                ->where('workspace_id', $workspace->id)
                ->where('joined', true)
                ->where('is_deactivated', false)
                ->join('users', 'workspace_members.user_id', '=', 'users.id')
                ->select(
                    'workspace_members.id',
                    'workspace_members.workspace_id',
                    'workspace_members.user_id',
                    'workspace_members.member_type',
                    'workspace_members.is_unconfirmed',
                    'workspace_members.joined',
                    'workspace_members.is_deactivated',
                    'workspace_members.last_active',
                    'users.id as user_id',
                    'users.full_name',
                    'users.email',
                    'users.initials',
                    'users.image'
                )
                ->get()
                ->map(function ($member) {
                    return [
                        'id' => $member->id,
                        'workspace_id' => $member->workspace_id,
                        'user_id' => $member->user_id,
                        'member_type' => $member->member_type,
                        'is_unconfirmed' => (bool) $member->is_unconfirmed,
                        'joined' => (bool) $member->joined,
                        'is_deactivated' => (bool) $member->is_deactivated,
                        'last_active' => $member->last_active,

                        'user' => [
                            'id' => $member->user_id,
                            'full_name' => $member->full_name,
                            'email' => $member->email,
                            'initials' => $member->initials,
                            'image' => $member->image,
                        ],
                    ];
                })->toArray();

            // Lấy danh sách bảng của workspace
            $boards = DB::table('boards')
                ->where('workspace_id', $workspace->id)
                ->where('closed', false)
                ->get()
                ->map(function ($board) {
                    // Lấy danh sách thành viên của bảng
                    $boardMembers = DB::table('board_members')
                        ->where('board_id', $board->id)
                        ->where('joined', true)
                        ->where('is_deactivated', false)
                        ->join('users', 'board_members.user_id', '=', 'users.id')
                        ->select(
                            'board_members.id',
                            'board_members.board_id',
                            'board_members.user_id',
                            'board_members.role',
                            'board_members.is_unconfirmed',
                            'board_members.joined',
                            'board_members.is_deactivated',
                            'board_members.referrer_id',
                            'board_members.last_active',
                            'users.id as user_id',
                            'users.full_name',
                            'users.email',
                            'users.initials',
                            'users.image'
                        )
                        ->get()
                        ->map(function ($boardMember) {
                        return [
                            'id' => $boardMember->id,
                            'board_id' => $boardMember->board_id,
                            'user_id' => $boardMember->user_id,
                            'role' => $boardMember->role,
                            'is_unconfirmed' => (bool) $boardMember->is_unconfirmed,
                            'joined' => (bool) $boardMember->joined,
                            'is_deactivated' => (bool) $boardMember->is_deactivated,
                            'referrer_id' => $boardMember->referrer_id,
                            'last_active' => $boardMember->last_active,
                            'user' => [
                                'id' => $boardMember->user_id,
                                'full_name' => $boardMember->full_name,
                                'email' => $boardMember->email,
                                'initials' => $boardMember->initials,
                                'image' => $boardMember->image,
                            ],
                        ];
                    })->toArray();

                    return [
                        'id' => $board->id,
                        'name' => $board->name,
                        'thumbnail' => $board->thumbnail,
                        'description' => $board->description,
                        'is_marked' => (bool) $board->is_marked,
                        'archive' => (bool) $board->archive,
                        'closed' => (bool) $board->closed,
                        'created_by' => $board->created_by,
                        'last_accessed' => $board->last_accessed,
                        'visibility' => $board->visibility,
                        'workspace_id' => $board->workspace_id,
                        'created_at' => $board->created_at,
                        'updated_at' => $board->updated_at,
                        'members' => $boardMembers,
                    ];
                })->toArray();

            // Tạo mảng dữ liệu để truyền vào WorkspaceResource
            $workspaceData = [
                'id' => $workspace->id,
                'name' => $workspace->name,
                'display_name' => $workspace->display_name,
                'desc' => $workspace->desc,
                'logo_hash' => $workspace->logo_hash,
                'logo_url' => $workspace->logo_url,
                'permission_level' => $workspace->permission_level,
                'team_type' => $workspace->team_type,
                'created_at' => $workspace->created_at,
                'updated_at' => $workspace->updated_at,
                'members' => $members,
                'boards' => $boards,
                // 'markedBoards' => $markedBoards,
                'isCurrentUserAdmin' => $isAdmin,
            ];

            // Trả về dữ liệu workspace dưới dạng resource
            return new WorkspaceResource($workspaceData);
        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy chi tiết workspace: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi lấy chi tiết workspace.',
            ], 500);
        }
    }

    public function getBoardMarkedByWorkspace($workspaceName)
    {
        try {
            $workspace = Workspace::where('name', $workspaceName)->first();
            $boardMarked = $workspace->boards()->where('is_marked', 1)->get();
            return response()->json([
                'success' => true,
                'data' => $boardMarked,
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi lấy danh sách board.',
            ]);
        }
    }

    public function store(WorkspaceRequest $request)
    {
        $user = Auth::user();
        $validatedData = $request->validated();

        // Bắt đầu transaction
        DB::beginTransaction();

        try {
            // Tạo workspace
            $workspace = Workspace::create([
                'name' => Workspace::generateUniqueName($validatedData['display_name']),
                'id_member_creator' => $user->id,
                'display_name' => $validatedData['display_name'],
                ...Arr::except($validatedData, ['display_name']),
            ]);

            // Tạo workspace member
            WorkspaceMembers::create([
                'workspace_id' => $workspace->id,
                'user_id' => $user->id,
                'member_type' => WorkspaceMembers::$ADMIN,
                'joined' => true,
                'last_active' => now(),
            ]);

            // Commit transaction nếu mọi thứ thành công
            DB::commit();

            return response()->json([
                'message' => 'Workspace created successfully',
                'data' => new WorkspaceResource($workspace),
            ], 201);
        } catch (\Exception $e) {
            // Rollback transaction nếu có lỗi
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to create workspace',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function destroy(Workspace $workspace)
    {
        if ($workspace) {
            // Xóa tất cả các board liên quan trước khi xóa workspace
            $workspace->boards()->delete();

            $workspace->delete();
        } else {
            return response()->json(['error' => 'Workspace not found'], 404);
        }
    }
    public function updateWorkspaceInfo(Request $request, $id)
    {
        $workspace = Workspace::find($id);

        if (!$workspace) {
            return response()->json([
                'message' => 'Workspace not found.',
            ], 404);
        }

        // Validate dữ liệu đầu vào
        $validatedData = $request->validate([
            'name' => 'sometimes|string|max:255',
            'display_name' => 'sometimes|required|string|max:50|unique:workspaces,display_name,' . $id,
            'desc' => 'nullable|string|max:1000',
        ]);

        // Không có dữ liệu nào để cập nhật
        if (empty($validatedData)) {
            return response()->json([
                'message' => 'No changes detected.',
            ], 200);
        }

        $workspace->update($validatedData);

        return response()->json([
            'message' => 'Workspace updated successfully',
            'data' => new WorkspaceResource($workspace->fresh()),
        ], 200);
    }

    public function permissionLevel(Request $request)
    {
        $validatedData = $request->validate([
            'private' => 'required|string',
            'public' => 'required|string',
        ]);

        $permissionLevels = [
            'private' => $validatedData['private'],
            'public' => $validatedData['public'],
        ];

        return response()->json([
            'data' => $permissionLevels,
        ]);
    }
    public function getWorkspaceInPulic(Request $request, $workspaceId)
    {
        try {
            // 🔹 Tìm workspace theo ID
            $workspace = Workspace::findOrFail($workspaceId);

            // 🔹 Kiểm tra tham số query
            $includeEnterprise = filter_var($request->query('enterprise', false), FILTER_VALIDATE_BOOLEAN);
            $fields = $request->query('fields', 'basic');
            $includeMembers = $request->query('members', false);
            $memberFields = $request->query('member_fields', '');

            // 🔹 Danh sách trường hợp lệ của thành viên
            $defaultMemberFields = [
                // 'workspace_members.user_id as id',  // 🔹 Sử dụng `user_id` thay vì `id`
                // 'users.full_name as fullName',
                'users.user_name'
            ];

            // 🔹 Nếu có member_fields, lọc các trường hợp lệ
            $selectedFields = [];
            if (!empty($memberFields)) {
                $allowedFields = array_map('trim', explode(',', $memberFields));
                $mappedFields = array_intersect_key(array_flip($allowedFields), array_flip($defaultMemberFields));
                $selectedFields = array_values(array_intersect($defaultMemberFields, array_keys($mappedFields)));
            }

            if (empty($selectedFields)) {
                $selectedFields = $defaultMemberFields;
            }

            // 🔹 Chuẩn bị response
            $response = [
                'id' => $workspace->id,
                'name' => $workspace->name,
                'enterprise' => $includeEnterprise,
            ];

            if ($fields === 'all') {
                $response['details'] = $workspace;
            }

            if ($includeMembers === 'all') {
                $response['members'] = DB::table('workspace_members')
                    ->join('users', 'workspace_members.user_id', '=', 'users.id')
                    ->where('workspace_members.workspace_id', $workspaceId)
                    ->select($selectedFields)
                    ->get();
            }

            return response()->json($response, 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Workspace không tồn tại!',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi lấy thông tin workspace!',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function getGuestWorkspaces(Request $request)
    {
        $userId = $request->user()->id;

        $guestWorkspaces = DB::table('workspaces')
            ->join('boards', 'workspaces.id', '=', 'boards.workspace_id')
            ->join('board_members', function ($join) use ($userId) {
                $join->on('boards.id', '=', 'board_members.board_id')
                    ->where('board_members.user_id', '=', $userId);
            })
            ->where('workspaces.id_member_creator', '!=', $userId) // Loại bỏ workspace do user sở hữu
            ->distinct()
            ->select('workspaces.id', 'workspaces.name')
            ->get();

        return response()->json([
            'message' => 'Lấy thành công không gian làm việc khách',
            'data' => $guestWorkspaces,
        ]);
    }
    public function getUserWorkspaces(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Lấy tất cả workspace mà user đã tạo (kèm theo board, list, card)
            $ownedWorkspaces = Workspace::where('id_member_creator', $user->id)
                ->with([
                    'boards' => function ($query) {
                        $query->select('id', 'workspace_id', 'name', 'closed')
                            ->with([
                                'lists' => function ($listQuery) {
                                    $listQuery->select('id', 'board_id', 'name', 'closed')
                                        ->with([
                                            'cards' => function ($cardQuery) {
                                                $cardQuery->select('id', 'list_board_id', 'title', 'position', 'is_archived'); // Thêm các field nếu cần
                                            }
                                        ]);
                                }
                            ]);
                    }
                ])
                ->get();

            // Lấy tất cả workspace mà user tham gia nhưng không phải là chủ sở hữu
            $guestWorkspaces = Workspace::whereHas('boards.boardMembers', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
                ->where('id_member_creator', '!=', $user->id)
                ->with([
                    'boards' => function ($query) use ($user) {
                        $query->whereHas('boardMembers', function ($q) use ($user) {
                            $q->where('user_id', $user->id);
                        })
                            ->select('id', 'workspace_id', 'name', 'closed')
                            ->with([
                                'lists' => function ($listQuery) {
                                    $listQuery->select('id', 'board_id', 'name', 'closed')
                                        ->with([
                                            'cards' => function ($cardQuery) {
                                                $cardQuery->select('id', 'list_board_id', 'title', 'position', 'is_archived');
                                            }
                                        ]);
                                }
                            ]);
                    }
                ])
                ->distinct()
                ->get();

            return response()->json([
                'message' => 'Lấy danh sách không gian làm việc thành công',
                'owned_workspaces' => $ownedWorkspaces,
                'guest_workspaces' => $guestWorkspaces,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Something went wrong',
                'message' => $e->getMessage(),
                'line' => $e->getLine(), // tiện debug
            ], 500);
        }
    }
}
