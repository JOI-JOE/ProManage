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
    // public function index()
    // {
    //     $user = Auth::user();

    //     if (!$user) {
    //         return response()->json(['error' => 'Unauthorized'], 401);
    //     }

    //     $recentBoards = RecentBoard::where('user_id', $user->id)
    //         ->orderBy('last_accessed', 'desc')
    //         ->get();

    //     return response()->json([
    //         'result' => true,
    //         'data' => $recentBoards
    //     ]);
    // }
    public function index()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Lấy dữ liệu từ bảng RecentBoard và eager load thông tin từ bảng Board và Workspace
        $recentBoards = RecentBoard::where('user_id', $user->id)
                                    ->orderBy('last_accessed', 'desc')
                                    ->with(['board.workspace'])  // Eager load mối quan hệ với bảng Board và Workspace
                                    ->take(5)  // Lấy 5 bảng gần đây nhất
                                    ->get();

        // Lấy các thông tin cần thiết bao gồm tên từ bảng board và display_name từ bảng workspace
        $recentBoardsWithDetails = $recentBoards->map(function ($recentBoard) {
            return [
                'id' => $recentBoard->id,
                'user_id' => $recentBoard->user_id,
                'last_accessed' => $recentBoard->last_accessed,
                'thumbnail' => $recentBoard->board->thumbnail, // Lấy thumbnail từ bảng Board
                'board_name' => $recentBoard->board->name,  // Lấy tên từ bảng Board
                'board_id' => $recentBoard->board->id,  // Lấy tên từ bảng Board
                'workspace_display_name' => $recentBoard->board->workspace->display_name, // Lấy display_name từ bảng Workspace
            ];
        });

        return response()->json([
            'result' => true,
            'data' => $recentBoardsWithDetails
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
