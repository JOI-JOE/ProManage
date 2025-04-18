<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\Card;
use App\Models\ListBoard;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $keyword = $request->get('query');
        $userId = Auth::id();

        // Tìm kiếm bảng
        $boards = Board::with('workspace') // Eager load workspace
            ->where('name', 'like', "%$keyword%")
            ->whereHas('members', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->get()
            ->map(function ($board) {
                return [
                    'id' => $board->id,
                    'name' => $board->name,
                    'workspace_display_name' => $board->workspace ? $board->workspace->display_name : null,
                    'thumbnail' => $board->thumbnail
                    // Thêm các trường khác nếu cần
                ];
            });
        // Tìm kiếm các danh sách thuộc các board mà người dùng là thành viên
        // $lists = ListBoard::where('name', 'like', "%$keyword%")
        //                   ->whereHas('board.members', function ($query) use ($userId) {
        //                       $query->where('user_id', $userId);
        //                   })
        //                   ->get();

        // Tìm kiếm thẻ (card) trong các danh sách thuộc các board mà người dùng là thành viên
        $cards = Card::where(function ($query) use ($keyword) {
            $query->where('title', 'like', "%$keyword%")
                  ->orWhere('description', 'like', "%$keyword%");
        })
        ->whereHas('list.board.members', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
        ->get()
        ->map(function ($card) {
            // Lấy thông tin ListBoard thông qua list_id
            $listBoard = ListBoard::find($card->list_board_id);
            
            // Lấy thông tin Board thông qua board_id từ ListBoard
            $board = $listBoard ? Board::find($listBoard->board_id) : null;

            return [
                'id' => $card->id,
                'title' => $card->title,
                'listboard_name' => $listBoard ? $listBoard->name : null,
                'board_name' => $board ? $board->name : null,
                'board_id' => $board ? $board->id : null,
            ];
        });

        // Tìm kiếm người dùng (trong cùng board hoặc workspace mà người dùng là thành viên)
        // $users = User::where('user_name', 'like', "%$keyword%")
        //              ->orWhere('email', 'like', "%$keyword%")
        //              ->where(function ($query) use ($userId) {
        //                  // Tìm người dùng trong cùng board
        //                  $query->whereHas('boards', function ($boardQuery) use ($userId) {
        //                      $boardQuery->whereHas('members', function ($boardMemberQuery) use ($userId) {
        //                          $boardMemberQuery->where('user_id', $userId);
        //                      });
        //                  })
        //                  // Tìm người dùng trong cùng workspace
        //                  ->orWhereHas('workspaces', function ($workspaceQuery) use ($userId) {
        //                      $workspaceQuery->whereHas('members', function ($workspaceMemberQuery) use ($userId) {
        //                          $workspaceMemberQuery->where('user_id', $userId);
        //                      });
        //                  });
        //              })
        //              ->get();
        // Trả kết quả
        return response()->json([
            'boards' => $boards,
            // 'lists' => $lists,
            'cards' => $cards,
            // 'users' => $users
        ]);
    }
}
