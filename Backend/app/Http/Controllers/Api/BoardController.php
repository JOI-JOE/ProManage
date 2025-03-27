<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\BoardMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BoardController extends Controller
{
    // Hậu - Tối ưu lại dữ liệu của board
    public function show($boardId)
    {
        $userId = Auth::id();

        // Lấy thông tin board
        $board = DB::table('boards')
            ->where('id', $boardId)
            ->first();

        // Trường hợp 1: Board không tồn tại
        if (!$board) {
            return response()->json([
                'message' => 'Board not found'
            ], 404);
        }

        // Lấy danh sách thành viên của board (sẽ dùng ở nhiều trường hợp)
        $members = DB::table('board_members')
            ->join('users', 'board_members.user_id', '=', 'users.id')
            ->where('board_members.board_id', $boardId)
            ->select('users.id', 'users.user_name', 'users.initials', 'users.email', 'board_members.role')
            ->get();

        // Kiểm tra xem user có phải là thành viên của board không
        $isBoardMember = DB::table('board_members')
            ->where('board_id', $boardId)
            ->where('user_id', $userId)
            ->exists();

        // Trường hợp 2: User đã tham gia board (board member) → Có quyền truy cập đầy đủ
        if ($isBoardMember) {
            $workspace = $this->getWorkspaceData($board->workspace_id);
            return response()->json([
                'board' => [
                    'id' => $board->id,
                    'name' => $board->name,
                    'description' => $board->description,
                    'visibility' => $board->visibility,
                    'workspace_id' => $board->workspace_id
                ],
                'members' => $members,
                'workspace' => $workspace,
                'message' => 'You are a member of this board. You have full access.',
                'isEditable' => true,
                'canJoin' => false // Đã là thành viên, không cần tham gia lại
            ], 200);
        }

        // Trường hợp 3: User chưa tham gia board (not a board member)
        // Kiểm tra workspace membership nếu board thuộc workspace
        $isWorkspaceMember = false;
        $workspace = null;
        if ($board->workspace_id) {
            $workspace = DB::table('workspaces')
                ->where('id', $board->workspace_id)
                ->select('workspaces.id', 'workspaces.display_name', 'workspaces.name', 'workspaces.permission_level')
                ->first();

            if ($workspace) {
                $isWorkspaceMember = DB::table('workspace_members')
                    ->where('workspace_id', $board->workspace_id)
                    ->where('user_id', $userId)
                    ->exists();
            } else {
                return response()->json([
                    'message' => 'Workspace not found for this board.'
                ], 404);
            }
        }

        // Chuẩn bị dữ liệu workspace cho response
        $workspaceData = $this->getWorkspaceData($board->workspace_id);

        // Trường hợp 4: Board là Public
        if ($board->visibility === 'public') {
            $workspaceData = $workspace && $workspace->permission_level === 'public'
                ? [
                    'id' => $workspace->id,
                    'display_name' => $workspace->display_name,
                    'name' => $workspace->name,
                    'permission_level' => $workspace->permission_level
                ]
                : ($workspace ? 'private' : null);

            return response()->json([
                'board' => [
                    'id' => $board->id,
                    'name' => $board->name,
                    'description' => $board->description,
                    'visibility' => $board->visibility,
                    'workspace_id' => $board->workspace_id
                ],
                'members' => $members,
                'workspace' => $workspaceData,
                'message' => 'This is a public board. You can view but cannot edit unless you are a member.',
                'isEditable' => false,
                'canJoin' => true // Cho phép yêu cầu tham gia board
            ], 200);
        }

        // Trường hợp 5: Board là Private
        if ($board->visibility === 'private') {
            return response()->json([
                'message' => 'This is a private board. You need to be invited to view or edit.'
            ], 403);
        }

        // Trường hợp 6: Board thuộc Workspace
        if ($board->visibility === 'workspace') {
            // Trường hợp 6.1: User đã tham gia workspace
            if ($isWorkspaceMember) {
                return response()->json([
                    'board' => [
                        'id' => $board->id,
                        'name' => $board->name,
                        'description' => $board->description,
                        'visibility' => $board->visibility,
                        'workspace_id' => $board->workspace_id
                    ],
                    'members' => $members,
                    'workspace' => $workspaceData,
                    'message' => 'You are a member of the workspace. You can view this board but cannot edit unless you are a board member.',
                    'isEditable' => false,
                    'canJoin' => true // Cho phép yêu cầu tham gia board
                ], 200);
            }

            // Trường hợp 6.2: User chưa tham gia workspace
            // Kiểm tra xem workspace có public không
            if ($workspace->permission_level === 'public') {
                return response()->json([
                    'board' => [
                        'id' => $board->id,
                        'name' => $board->name,
                        'description' => $board->description,
                        'visibility' => $board->visibility,
                        'workspace_id' => $board->workspace_id
                    ],
                    'members' => $members,
                    'workspace' => $workspaceData,
                    'message' => 'This board belongs to a public workspace. You can view but cannot edit unless you join the workspace and board.',
                    'isEditable' => false,
                    'canJoinWorkspace' => true, // Cho phép yêu cầu tham gia workspace
                    'canJoin' => false
                ], 200);
            }

            // Trường hợp 6.3: Workspace là Private và user không phải thành viên
            return response()->json([
                'message' => 'This board belongs to a private workspace. You need to join the workspace to view or edit.'
            ], 403);
        }

        // Trường hợp 7: Visibility không hợp lệ
        return response()->json([
            'message' => 'Invalid board visibility setting.'
        ], 400);
    }

    private function getWorkspaceData($workspaceId)
    {
        if (!$workspaceId) {
            return null;
        }

        $workspace = DB::table('workspaces')
            ->where('id', $workspaceId)
            ->select('workspaces.id', 'workspaces.display_name', 'workspaces.name', 'workspaces.permission_level')
            ->first();

        if (!$workspace) {
            return null;
        }

        return [
            'id' => $workspace->id,
            'display_name' => $workspace->display_name,
            'name' => $workspace->name,
            'permission_level' => $workspace->permission_level
        ];
    }

    //----------------------------------------------
    public function index()
    {
        $board = Board::where('closed', 0)->get();
        return response()->json($board);
    }

    public function getBoardDetail($id)
    {
        $board = Board::with('lists.cards')->findOrFail($id);
        return response()->json($board);
    }

    public function showBoardById($boardId)
    {
        try {
            // Tìm board theo ID
            $board = Board::with('creator')->findOrFail($boardId);
            // $creator = $board->creator()->first(); // Lấy thông tin người tạo
            // Trả về kết quả nếu tìm thấy
            return response()->json([
                'result' => true,
                'data' => $board,
                // 'user'=> $board->creator,
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'result' => false,
                'message' => 'Board not found.'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'result' => false,
                'message' => 'Something went wrong',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    // public function index($workspaceId)
    // {
    //     try {
    //         // Kiểm tra nếu workspace tồn tại
    //         $workspace = Workspace::findOrFail($workspaceId);

    //         // Kiểm tra quyền truy cập của user
    //         if ($workspace->user_id != auth()->id()) {
    //             return response()->json(['error' => 'Unauthorized'], 403);
    //         }

    //         // Lấy các boards của workspace với điều kiện closed = 0
    //         $boards = $workspace->boards()->where('closed', 0)->get();

    //         return response()->json([
    //             'success' => true,
    //             'data' => $boards,
    //         ]);
    //     } catch (\Exception $e) {
    //         return response()->json(['error' => 'Something went wrong', 'message' => $e->getMessage()], 500);
    //     }
    // }

    // public function getBoardMarked()
    // {
    //     try {
    //         $user = Auth::user()->id;
    //         if (!$user) {
    //             return 'Cho cái sanctum vào !!!!!';
    //         }

    //         $boards = Board::where('is_marked', 1)
    //             ->whereHas('workspace.users', function ($query) use ($user) {
    //                 $query->where('user_id', $user); // Kiểm tra user có trong workspace không
    //             })
    //             ->with('workspace:id,display_name') // Lấy thông tin workspace
    //             ->get();

    //         return response()->json([
    //             'success' => true,
    //             'data' => $boards,
    //         ], 200);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Lỗi khi lấy danh sách bảng được đánh dấu.',
    //             'error' => $e->getMessage(),
    //         ], 500);
    //     }
    // }

    public function closed()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Lấy các bảng đã đóng, kiểm tra xem người dùng có phải là thành viên trong bảng board_members đó không
        $closedBoards = Board::where('closed', 1) // Lọc các bảng đã đóng
            ->whereHas('members', function ($query) use ($user) {
                $query->where('user_id', $user->id); // Kiểm tra user_id
            })
            ->with(['workspace', 'members']) // Eager load thông tin workspace và board_members
            ->get();

        return response()->json([
            'result' => true,
            'data' => $closedBoards
        ]);
    }

    public function store(Request $request)
    {
        Log::info('📩 Dữ liệu nhận được:', $request->all()); // Ghi log
        try {
            // Validate dữ liệu đầu vào
            // $request->validate([
            //     'name' => 'required|string|max:255',
            //     'thumbnail' => 'nullable|image|mimes:jpg,jpeg,png|max:2048', // Kiểm tra hình ảnh
            //     'description' => 'nullable|string',
            //     'is_marked' => 'boolean',
            //     'archive' => 'boolean',
            //     'closed' => 'boolean',
            //     'visibility' => 'required|in:public,private,member',
            //     'workspace_id' => 'required|exists:workspaces,id',
            // ]);

            $user = Auth::user(); // Lấy user hiện tại

            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Lấy ID của user đang đăng nhập
            $userId = $user->id;

            // Lưu dữ liệu từ request
            $data = $request->all();

            // Kiểm tra và upload hình ảnh
            if ($request->hasFile('thumbnail')) {
                $data['thumbnail'] = $this->upload_image($request->file('thumbnail'));
            }

            // Tạo board mới
            $board = Board::create([
                'name' => $request->name,
                'thumbnail' => $data['thumbnail'] ?? null,
                'description' => $request->description,
                'is_marked' => $request->is_marked ?? false,
                'archive' => $request->archive ?? false,
                'closed' => $request->closed ?? false,
                'created_by' => $userId,
                'visibility' => $request->visibility,
                'workspace_id' => $request->workspace_id,
            ]);

            BoardMember::create([
                'board_id' => $board->id,
                'user_id' => $userId,
                'role' => 'admin',
                'joined' => 1
            ]);

            return response()->json([
                'result' => true,
                'message' => 'Tạo board thành công',
                'data' => $board,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Trả về lỗi validate
            return response()->json([
                'result' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            // Xử lý lỗi chung
            return response()->json([
                'result' => false,
                'message' => 'Đã xảy ra lỗi khi tạo board',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update cho các trường ngoài ảnh
     */
    public function update(Request $request, string $id)
    {
        try {
            DB::beginTransaction();
            $data = $request->all();
            $board = Board::findOrFail($id);
            if ($request->hasFile('thumbnail')) {
                $data['thumbnail'] = $this->upload_image($request->file('thumbnail'));
                unlink($board->thumbnail); // Xóa file ảnh cũ
            }
            $board->update($data);
            DB::commit();
            return response()->json([
                'result' => true,
                'message' => 'success',
                'data' => $board
            ]);
        } catch (\Throwable $th) {
            DB::rollBack();
            throw $th;
        }
    }


    // public function show($workspaceId, $boardId)
    // {
    //     try {
    //         // Kiểm tra quyền truy cập
    //         $workspace = Workspace::findOrFail($workspaceId);
    //         if ($workspace->user_id != auth()->id()) {
    //             return response()->json(['error' => 'Unauthorized'], 403);
    //         }

    //         // Lấy thông tin board 
    //         $board = $workspace->boards()->firstOrFail();

    //         return response()->json([
    //             'success' => true,
    //             'data' => $board,
    //         ]);
    //     } catch (\Exception $e) {
    //         return response()->json(['error' => 'Something went wrong', 'message' => $e->getMessage()], 500);
    //     }
    // }


    /**
     * Update tên board
     */
    public function updateName(Request $request, string $id)
    {
        try {
            DB::beginTransaction();
            $board = Board::findOrFail($id);

            // Kiểm tra nếu có trường 'name' trong yêu cầu
            if ($request->has('name')) {
                // Cập nhật trường 'name'
                $board->name = $request->input('name');
                $board->save();
            }

            DB::commit();
            return response()->json([
                'result' => true,
                'message' => 'Board name updated successfully.',
                'data' => $board
            ]);
        } catch (\Throwable $th) {
            // Rollback nếu có lỗi xảy ra
            DB::rollBack();
            throw $th;
        }
    }
    /**
     * Update cho riêng trường thumbnailthumbnail
     */
    public function updateThumbnail(Request $request, string $id)
    {
        try {
            DB::beginTransaction();
            $board = Board::findOrFail($id);

            // Kiểm tra xem có file thumbnail không
            if ($request->hasFile('thumbnail')) {
                // Xử lý file thumbnail mới
                $thumbnailPath = $this->upload_image($request->file('thumbnail'));

                // Xóa file thumbnail cũ nếu có
                if ($board->thumbnail) {
                    unlink($board->thumbnail);
                }
                // Cập nhật trường thumbnail
                $board->thumbnail = $thumbnailPath;
                $board->save();
            }

            // Commit transaction và trả về kết quả
            DB::commit();
            return response()->json([
                'result' => true,
                'message' => 'Thumbnail updated successfully.',
                'data' => $board
            ]);
        } catch (\Throwable $th) {
            // Rollback nếu có lỗi xảy ra
            DB::rollBack();
            throw $th;
        }
    }

    /**
     * Update cho riêng trường visibility 
     */
    public function updateVisibility(Request $request, string $id)
    {
        try {
            DB::beginTransaction();
            $board = Board::findOrFail($id);

            // Kiểm tra nếu có trường 'visibility' trong yêu cầu

            if ($request->has('visibility')) {
                // Cập nhật trường 'visibility'
                $board->visibility = $request->input('visibility');
                $board->save();
            }
            DB::commit();
            return response()->json([
                'result' => true,
                'message' => 'Visibility updated successfully.',
                'data' => $board
            ]);
        } catch (\Throwable $th) {
            // Rollback nếu có lỗi xảy ra
            DB::rollBack();
            throw $th;
        }
    }

    /**
     * Update cho riêng trường is_marked 
     */
    public function updateIsMarked(string $id)
    {
        try {
            DB::beginTransaction();

            $board = Board::findOrFail($id);
            if (!$board) {
                return response()->json([
                    'result' => false,
                    'message' => 'Board not found'
                ], 404);
            }

            // Toggle giá trị 'is_marked'
            $board->update(['is_marked' => !$board->is_marked]);

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => 'is_marked status updated successfully.',
                'is_marked' => $board->is_marked // Trả về trạng thái mới
            ]);
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json([
                'result' => false,
                'message' => 'Failed to update is_marked',
                'error' => $th->getMessage()
            ], 500);
        }
    }
    /**
     * Update cho riêng trường archive 
     */
    public function UpdateArchive(string $id)
    {
        try {
            DB::beginTransaction();
            $board = Board::findOrFail($id);
            // Toggle giá trị 'archive'
            $board->archive = $board->archive == 0 ? 1 : 0;
            // Lưu bản ghi sau khi thay đổi
            $board->save();
            DB::commit();
            return response()->json([
                'result' => true,
                'message' => 'archive status updated successfully.',
                'data' => $board
            ]);
        } catch (\Throwable $th) {
            // Rollback nếu có lỗi xảy ra
            DB::rollBack();
            throw $th;
        }
    }

    /**
     * Update cho riêng trường archive 
     */
    public function showCreated($id)
    {
        $board = Board::findOrFail($id); // Lấy bảng theo ID

        // Lấy thông tin người tạo bảng
        $creator = $board->creator; // Đây sẽ là một instance của model User

        return response()->json([
            'board' => $board,
            'creator' => $creator,
        ]);
    }


    /**
     * Xóa mềm -> lưu trữ
     */
    public function toggleBoardClosed(string $id)
    {
        $board = Board::find($id);

        if ($board) {
            // Đảo trạng thái closed (1 -> 0, 0 -> 1)
            $board->closed = !$board->closed;
            $board->save();

            return response()->json([
                'result' => true,
                'message' => $board->closed ? 'Board closed successfully.' : 'Board reopened successfully.',
                'data' => $board
            ]);
        }

        return response()->json([
            'result' => false,
            'message' => 'Record not found.'
        ], 404);
    }


    /**
     * xóa hoàn toàn -> confirm xóa
     */
    public function ForceDestroy(string $id)
    {
        $board = Board::findOrFail($id);
        $board->delete();
        return response()->json([
            'result' => true,
            'message' => 'success',
        ]);
    }

    public function getBoard($id)
    {
        // Tìm board theo id cùng với workspace và danh sách boards
        $board = Board::where('id', $id)
            ->with(['workspace.boards']) // Load luôn danh sách boards trong workspace
            ->first();

        if ($board) {
            return response()->json([
                'board' => $board,
                'workspace' => [
                    'id' => $board->workspace->id,
                    'name' => $board->workspace->name,
                    'display_name' => $board->workspace->display_name,
                    'boards' => $board->workspace->boards // Đảm bảo trả về danh sách boards
                ]
            ]);
        } else {
            return response()->json(['error' => 'Board not found'], 404);
        }
    }
}
