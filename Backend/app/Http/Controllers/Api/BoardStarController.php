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
                'b.name as board_name',
                'b.thumbnail as board_thumbnail',
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
    public function starBoard($boardId)
    {
        $user = Auth::user();

        // Kiểm tra xem board_id có tồn tại trong bảng boards không
        $board = Board::find($boardId);  // Tìm board theo boardId

        if (!$board) {
            return response()->json(['message' => 'Board not found', 'starred' => false], 404); // Board không tồn tại
        }

        $conditions = ['user_id' => $user->id, 'board_id' => $boardId];

        // Kiểm tra xem đã đánh dấu sao chưa, nếu chưa thì tạo mới
        $deleted = BoardStar::where($conditions)->delete();  // Cố gắng xóa nếu có tồn tại

        if ($deleted) {
            return response()->json(['message' => 'Board unstarred successfully', 'starred' => false]);
        }

        // Nếu không xóa được (nghĩa là chưa tồn tại), thì tạo mới
        BoardStar::create([
            'id' => Str::uuid(),
            'user_id' => $user->id,
            'board_id' => $boardId,
        ]);
        return response()->json(['message' => 'Board starred successfully', 'starred' => true]);
    }

    /**
     * Xóa sao khỏi board
     */
    public function unstarBoard($boardId, $boardStarId)
    {
        $user = Auth::user();

        // Kiểm tra xem board_id có tồn tại trong bảng boards không
        $board = Board::find($boardId);  // Tìm board theo boardId

        if (!$board) {
            return response()->json(['message' => 'Board not found', 'starred' => false], 404); // Board không tồn tại
        }

        $conditions = ['user_id' => $user->id, 'board_id' => $boardId];

        // Nếu là DELETE và có boardStarId, tức là yêu cầu xóa một sao cụ thể
        $boardStar = BoardStar::where($conditions)->where('id', $boardStarId)->first();
        if ($boardStar) {
            $boardStar->delete();
            return response()->json(['message' => 'Board unstarred successfully', 'starred' => false]);
        }

        return response()->json(['message' => 'Star not found', 'starred' => false], 404);
    }
}
