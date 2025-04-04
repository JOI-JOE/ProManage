<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Models\BoardStar;
use App\Models\Board; // Import Model Board
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BoardStarController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth'); // Đảm bảo user phải đăng nhập
    }
    // 
    public function index()
    {
        $userId = Auth::id();

        if (!$userId) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        // Truy vấn trực tiếp từ DB để tăng tốc
        $boardStars = DB::table('board_stars as bs')
            ->join('boards as b', 'bs.board_id', '=', 'b.id') // Join để lấy dữ liệu từ bảng boards
            ->where('bs.user_id', $userId)
            ->select([
                'bs.id as star_id',
                'bs.board_id',
                'b.name as name',
                'b.thumbnail as thumbnail',
                DB::raw('TRUE as starred'),
                'bs.created_at',
            ])
            ->orderByDesc('bs.created_at') // Lấy dữ liệu mới nhất trước
            ->get();

        return response()->json([
            'board_stars' => $boardStars,
        ], 200);
    }
    /**
     * Thêm sao vào board
     */
    public function starBoard(Request $request, $userId)
    {
        $boardId = $request->input('boardId'); // hoặc $request->query('user_id')

        $board = Board::findOrFail($boardId);

        $existingStar = BoardStar::where('user_id', $userId)->where('board_id', $boardId)->first();

        if ($existingStar) {
            $existingStar->delete(); // Xóa sao khỏi board
            return response()->json(['message' => 'Board unstarred successfully', 'starred' => false]);
        }
        // Nếu chưa có sao, tạo mới một sao
        $star = BoardStar::create([
            'id' => Str::uuid(),
            'user_id' => $userId,
            'board_id' => $boardId,
        ]);

        return response()->json(
            $star
        );
    }
    /**
     * Xóa sao khỏi board
     */
    public function unstarBoard($userId, $boardId)
    {
        try {
            // Tìm board_star dựa trên board_id và user_id
            $boardStar = DB::table('board_stars')
                ->where('board_id', $boardId)
                ->where('user_id', $userId)
                ->first();

            // Kiểm tra nếu không tìm thấy bản ghi
            if (!$boardStar) {
                return response()->json([
                    'message' => 'Board star not found or you do not have permission to unstar this board',
                ], 404);
            }
            DB::table('board_stars')->where('id', $boardStar->id)->delete();
            return response()->json([
                'message' => 'Board unstarred successfully',
                'board_star_id' => $boardStar->id,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while unstarring the board',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
