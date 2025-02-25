<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BoardController extends Controller
{
    public function index()
    {
        $board = Board::where('closed', 0)->get();
        return response()->json($board);
    }

    //     public function index($workspaceId)
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
    //             'workspace' =>$workspace
    //         ]);
    //     } catch (\Exception $e) {
    //         return response()->json(['error' => 'Something went wrong', 'message' => $e->getMessage()], 500);
    //     }
    // }



    public function trash()
    {
        $board = Board::where('closed', 1)->get();
        return response()->json($board);
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
    public function show($workspaceId)
    {
        try {
            // Kiểm tra quyền truy cập
            $workspace = Workspace::findOrFail($workspaceId);
            if ($workspace->user_id != auth()->id()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
    
            // Lấy tất cả các bảng của workspace
            $boards = $workspace->boards;
    
            // Kiểm tra nếu workspace không có bảng nào
            if ($boards->isEmpty()) {
                return response()->json(['message' => 'No boards found in this workspace'], 404);
            }
    
            return response()->json([
                'success' => true,
                'data' => $boards, // Trả về tất cả các bảng của workspace
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
    public function UpdateIs_marked(string $id)
    {
        try {
            DB::beginTransaction();
            $board = Board::findOrFail($id);
            // Toggle giá trị 'is_marked'
            $board->is_marked = $board->is_marked == 0 ? 1 : 0;
            // Lưu bản ghi sau khi thay đổi
            $board->save();
            DB::commit();
            return response()->json([
                'result' => true,
                'message' => 'is_marked status updated successfully.',
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
    public function destroy(string $id)
    {
        $board = Board::find($id);
        if ($board) {
            // Set deleted to 1
            $board->deleted = 1;
            $board->save();

            return response()->json([
                'result' => true,
                'message' => 'Soft deleted successfully.'
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
}
