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
        $boards = Board::where('name', 'like', "%$keyword%")
        ->whereHas('members', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
        ->get();

        // Tìm kiếm các danh sách thuộc các board mà người dùng là thành viên
        $lists = ListBoard::where('name', 'like', "%$keyword%")
                          ->whereHas('board.members', function ($query) use ($userId) {
                              $query->where('user_id', $userId);
                          })
                          ->get();

        // Tìm kiếm thẻ (card) trong các danh sách thuộc các board mà người dùng là thành viên
        $cards = Card::where('title', 'like', "%$keyword%")
                     ->orWhere('description', 'like', "%$keyword%")
                     ->whereHas('list.board.members', function ($query) use ($userId) {
                         $query->where('user_id', $userId);
                     })
                     ->get();

        // Tìm kiếm người dùng (trong cùng board hoặc workspace mà người dùng là thành viên)
        $users = User::where('user_name', 'like', "%$keyword%")
                     ->orWhere('email', 'like', "%$keyword%")
                     ->where(function ($query) use ($userId) {
                         // Tìm người dùng trong cùng board
                         $query->whereHas('boards', function ($boardQuery) use ($userId) {
                             $boardQuery->whereHas('members', function ($boardMemberQuery) use ($userId) {
                                 $boardMemberQuery->where('user_id', $userId);
                             });
                         })
                         // Tìm người dùng trong cùng workspace
                         ->orWhereHas('workspaces', function ($workspaceQuery) use ($userId) {
                             $workspaceQuery->whereHas('members', function ($workspaceMemberQuery) use ($userId) {
                                 $workspaceMemberQuery->where('user_id', $userId);
                             });
                         });
                     })
                     ->get();
        // Trả kết quả
        return response()->json([
            'boards' => $boards,
            // 'lists' => $lists,
            'cards' => $cards,
            'users' => $users
        ]);
    }
}
