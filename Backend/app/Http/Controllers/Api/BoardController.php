<?php

namespace App\Http\Controllers\Api;

use App\Events\BoardUpdatedName;
use App\Http\Controllers\Controller;
use App\Http\Resources\MeResource;
use App\Models\Board;
use App\Models\BoardMember;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Events\BoardStatusChanged;


class BoardController extends Controller
{

    /// ---------------------------------------------
    // public function show($boardId)
    // {
    //     $userId = Auth::id();

    //     // Bước 1: Lấy thông tin board
    //     $board = DB::table('boards')
    //         ->where('id', $boardId)
    //         ->first();

    //     if (!$board) {
    //         return response()->json(['message' => 'Board not found.'], 404);
    //     }

    //     // Bước 2: Kiểm tra quyền truy cập và lấy dữ liệu
    //     $boardAccess = $this->checkBoardAccess($board, $userId);

    //     if (!$boardAccess['showBoardData']) {
    //         return response()->json(['action' => 'request_access'], 403);
    //     }

    //     // Bước 3: Chuẩn bị dữ liệu trả về từ boardAccess
    //     $response = array_filter([
    //         'board' => [
    //             'id' => $board->id,
    //             'name' => $board->name,
    //             'description' => $board->description,
    //             'visibility' => $board->visibility,
    //             'workspace_id' => $board->workspace_id,
    //             'logo'  => $board->thumbnail,
    //             'closed' => $board->closed,
    //         ],
    //         'members' => $boardAccess['members'],
    //         'memberships' => $boardAccess['memberships'],
    //         'workspace' => $boardAccess['workspace'] ?: null,
    //         'isEditable' => $boardAccess['isEditable'],
    //         'canJoinBoard' => !$boardAccess['isBoardMember'] && $boardAccess['canJoinBoard'],
    //         'canJoinWorkspace' => $boardAccess['canJoinWorkspace'],
    //     ], fn($value) => $value !== null);

    //     return response()->json($response, 200);
    // }

    private function checkBoardAccess($board, $userId)
    {
        $access = [
            'hasAccess' => false,
            'showBoardData' => false,
            'canJoinBoard' => false,
            'canJoinWorkspace' => false,
            'workspace' => null,
            'isEditable' => false,
            'isBoardMember' => false,
            'isWorkspaceMember' => false,
            'members' => null,
            'memberships' => null,
            'status' => 403,
        ];

        // Kiểm tra membership
        $access['isBoardMember'] = DB::table('board_members')
            ->where('board_id', $board->id)
            ->where('user_id', $userId)
            ->exists();

        $access['isWorkspaceMember'] = $board->workspace_id
            ? DB::table('workspace_members')
                ->where('workspace_id', $board->workspace_id)
                ->where('user_id', $userId)
                ->exists()
            : false;

        // Lấy thông tin workspace
        $workspace = $board->workspace_id
            ? DB::table('workspaces')
                ->where('id', $board->workspace_id)
                ->select('id', 'name', 'display_name', 'permission_level', 'logo_url')
                ->first()
            : null;

        // Xử lý các trường hợp
        if ($access['isBoardMember'] && $access['isWorkspaceMember']) {
            // Trường hợp 1: Thành viên cả board và workspace
            $access['hasAccess'] = true;
            $access['showBoardData'] = true;
            $access['canJoinBoard'] = false;
            $access['isEditable'] = true;
            $access['status'] = 200;
            if ($workspace) {
                $access['workspace'] = [
                    'id' => $workspace->id,
                    'name' => $workspace->name,
                    'display_name' => $workspace->display_name,
                    'visibility' => $workspace->permission_level,
                    'logo' => $workspace->logo_url,
                    'memberships' => DB::table('workspace_members')
                        ->where('workspace_id', $board->workspace_id)
                        ->select('id', 'user_id', 'member_type', 'is_unconfirmed', 'is_deactivated', 'last_active')
                        ->get(),
                ];
            }
        } elseif ($access['isBoardMember']) {
            // Trường hợp 2: Chỉ là thành viên board
            $access['hasAccess'] = true;
            $access['showBoardData'] = true;
            $access['canJoinWorkspace'] = true;
            $access['isEditable'] = true;
            $access['canJoinBoard'] = false;
            $access['status'] = 200;
            if ($workspace) {
                $access['workspace'] = [
                    'id' => $workspace->id,
                    'name' => $workspace->name,
                    'display_name' => $workspace->display_name,
                    'visibility' => $workspace->permission_level,
                    'logo' => $workspace->logo_url,
                ];
            }
        } elseif ($access['isWorkspaceMember']) {
            // Trường hợp 3: Chỉ là thành viên workspace
            $access['hasAccess'] = true;
            $access['isEditable'] = true;
            if ($workspace) {
                $access['workspace'] = [
                    'id' => $workspace->id,
                    'name' => $workspace->name,
                    'display_name' => $workspace->display_name,
                    'visibility' => $workspace->permission_level,
                    'logo' => $workspace->logo_url,
                    'memberships' => DB::table('workspace_members')
                        ->where('workspace_id', $board->workspace_id)
                        ->select('id', 'user_id', 'member_type', 'is_unconfirmed', 'is_deactivated', 'last_active')
                        ->get(),
                ];
            }
            if ($board->visibility === 'public' || $board->visibility === 'workspace') {
                $access['showBoardData'] = true;
                $access['canJoinBoard'] = true;
                $access['status'] = 200;
            } else { // private
                $access['showBoardData'] = false;
                $access['status'] = 403;
            }
        } else {
            // Trường hợp 4: Không là thành viên
            if ($board->visibility === 'public') {
                $access['hasAccess'] = true;
                $access['showBoardData'] = true;
                // $access['canJoinBoard'] = true;
                $access['status'] = 200;
                if ($workspace && $workspace->permission_level === 'public') {
                    // $access['canJoinWorkspace'] = true;
                    $access['workspace'] = [
                        'id' => $workspace->id,
                        'name' => $workspace->name,
                        'display_name' => $workspace->display_name,
                        'visibility' => $workspace->permission_level,
                        'logo' => $workspace->logo_url,
                    ];
                }
            } else { // board private
                $access['showBoardData'] = false;
                $access['status'] = 403;
            }
        }

        // Lấy dữ liệu board members và memberships nếu có quyền xem
        if ($access['showBoardData']) {
            $access['members'] = DB::table('board_members')
                ->join('users', 'board_members.user_id', '=', 'users.id')
                ->where('board_members.board_id', $board->id)
                ->select('users.id', 'users.user_name', 'users.initials', 'users.email', 'users.image', 'users.full_name')
                ->get();

            $access['memberships'] = DB::table('board_members')
                ->where('board_members.board_id', $board->id)
                ->select(
                    'board_members.id',
                    'board_members.is_unconfirmed',
                    'board_members.user_id',
                    'board_members.is_deactivated',
                    'board_members.role',
                    'board_members.last_active'
                )
                ->get();
        }

        return $access;
    }
    // Dữ liệu sửa lại 
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

    public function getBoardMarked()
    {
        try {
            $user = Auth::user()->id;
            if (!$user) {
                return 'Cho cái sanctum vào !!!!!';
            }

            $boards = Board::where('is_marked', 1)
                ->whereHas('workspace.users', function ($query) use ($user) {
                    $query->where('user_id', $user); // Kiểm tra user có trong workspace không
                })
                ->with('workspace:id,display_name') // Lấy thông tin workspace
                ->get();

            return response()->json([
                'success' => true,
                'data' => $boards,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách bảng được đánh dấu.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function closed()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Lấy các bảng đã đóng, kiểm tra xem người dùng có phải là thành viên trong bảng board_members đó không
        $closedBoards = Board::where('closed', 1)
        ->where(function ($query) use ($user) {
            $query->where('created_by', $user->id)
                  ->orWhereHas('members', function ($q) use ($user) {
                      $q->where('user_id', $user->id);
                  });
        })
        
        ->with(['workspace', 'members'])
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


    public function show($workspaceId, $boardId)
    {
        try {
            // Kiểm tra quyền truy cập
            $workspace = Workspace::findOrFail($workspaceId);
            if ($workspace->user_id != auth()->id()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            // Lấy thông tin board 
            $board = $workspace->boards()->firstOrFail();

            return response()->json([
                'success' => true,
                'data' => $board,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Something went wrong', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Update tên board
     */
    public function updateName(Request $request, string $id)
    {
        try {
            DB::beginTransaction();

            $board = Board::findOrFail($id);

            if ($request->filled('name')) { // Kiểm tra có dữ liệu name không
                $board->update(['name' => $request->input('name')]);
                DB::commit();

                broadcast(new BoardUpdatedName($board))->toOthers();


                return response()->json([
                    'result' => true,
                    'message' => 'Board name updated successfully.',
                    'data' => $board
                ]);
            }

            DB::rollBack(); // Không có dữ liệu mới, rollback tránh commit dư
            return response()->json([
                'result' => false,
                'message' => 'No name provided.',
            ], 400);
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json([
                'result' => false,
                'message' => 'An error occurred.',
            ], 500);
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

            broadcast(new BoardStatusChanged($board))->toOthers();

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

        // Xóa tất cả card_label liên quan đến labels của board
        foreach ($board->labels as $label) {
            DB::table('card_label')->where('label_id', $label->id)->delete();
        }

        // Xóa các comments, checklists, attachments liên quan đến cards thông qua lists
        foreach ($board->lists as $list) {
            foreach ($list->cards as $card) {
                $card->comments()->delete();
                $card->checklists()->delete();
                $card->attachments()->delete();
            }
            // Xóa cards trong list
            $list->cards()->delete();
        }

        // Xóa labels và lists
        $board->labels()->delete();
        $board->lists()->delete();

        // Cuối cùng xóa board
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

    public function getBoardDetails($boardId)
    {
        $board = Board::with(['workspace', 'listBoards']) // đảm bảo quan hệ là đúng tên
            ->findOrFail($boardId);

        return response()->json([
            'board' => $board,
            'workspace' => $board->workspace,
            'lists' => $board->listBoards, // hoặc 'list_board' nếu bạn dùng tên khác
        ]);
    }

    public function copyBoard(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'workspace_id' => 'required|uuid',
            'source_board_id' => 'required|uuid',
            'keep_cards' => 'boolean',
            'visibility' => 'required|in:private,workspace,public',
        ]);

        $sourceBoard = Board::with(['lists.cards'])->findOrFail($request->source_board_id);

        // Tạo bản sao của bảng
        $newBoard = $sourceBoard->replicate(['id', 'created_at', 'updated_at']);
        $newBoard->name = $request->name;
        $newBoard->workspace_id = $request->workspace_id;
        $newBoard->visibility = $request->visibility;
        $newBoard->is_marked = 0;
        $newBoard->save();


        BoardMember::create([
            'board_id' => $newBoard->id,
            'user_id' => auth()->id(),
            'role' => 'admin',
            'joined' => true,
        ]);

        // Nếu người dùng chọn giữ lại thẻ
        if ($request->keep_cards) {
            foreach ($sourceBoard->lists as $list) {
                $newList = $list->replicate(['id', 'created_at', 'updated_at']);
                $newList->board_id = $newBoard->id;
                $newList->save();

                foreach ($list->cards as $card) {
                    $newCard = $card->replicate(['id', 'created_at', 'updated_at']);
                    $newCard->list_board_id = $newList->id;
                    $newCard->save();
                }
            }
        }

        return response()->json([
            'message' => 'Board copied successfully.',
            'board' => $newBoard,
        ], 201);
    }

    public function updateLastAccessed(Request $request, $boardId)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Kiểm tra board có tồn tại không
        $board = Board::find($boardId);
        if (!$board) {
            return response()->json(['error' => 'Board not found'], 404);
        }

        // Kiểm tra quyền truy cập (nếu cần)
        // Ví dụ: Kiểm tra xem user có phải là thành viên của workspace chứa board không
        $hasAccess = $board->workspace()->where(function ($query) use ($user) {
            $query->where('id_member_creator', $user->id)
                ->orWhereHas('members', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                });
        })->exists();

        if (!$hasAccess) {
            return response()->json(['error' => 'You do not have access to this board'], 403);
        }

        // Cập nhật last_accessed
        $board->last_accessed = now();
        $board->save();

        return response()->json([
            'result' => true,
            'message' => 'Last accessed time updated',
        ]);
    }
}
