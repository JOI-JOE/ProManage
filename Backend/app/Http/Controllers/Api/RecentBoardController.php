<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Models\recentBoard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log; 

class RecentBoardController extends Controller
{
    //
    public function index()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $recentBoards = RecentBoard::where('user_id', $user->id)
            ->orderBy('last_accessed', 'desc')
            ->get();

        return response()->json([
            'result' => true,
            'data' => $recentBoards
        ]);
    }

    /**
     * Lưu bảng vào danh sách gần đây khi người dùng truy cập
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        try {
            // Validate dữ liệu đầu vào
            $request->validate([
                'board_id' => 'required|exists:boards,id', // Kiểm tra bảng tồn tại
            ]);

            Log::info('User ID: ' . $user->id . ' is accessing Board ID: ' . $request->board_id);
            Log::info('Updating last_accessed to: ' . now());

            $recentBoard = recentBoard::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'board_id' => $request->board_id,
                    
                ],
                [
                    'last_accessed' => now(),
                ]
            );

            return response()->json([
                'result' => true,
                'message' => 'Board added to recent list',
                'data' => $recentBoard
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'result' => false,
                'message' => 'Something went wrong',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
