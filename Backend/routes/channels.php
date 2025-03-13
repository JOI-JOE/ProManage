<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;
use App\Models\Board;
use App\Models\Card;
use App\Models\ListBoard;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/


// Channel cho các sự kiện liên quan đến Board
Broadcast::channel('board.{boardId}', function ($user, $boardId) {
    return Board::find($boardId) !== null; // Kiểm tra xem Board có tồn tại không
});

Broadcast::channel('board.{boardId}.list.{listId}', function ($user, $boardId, $listId) {
    return Board::find($boardId) !== null && ListBoard::find($listId) !== null; // Kiểm tra xem Board và List có tồn tại không
});

Broadcast::channel('board.{boardId}.card.{cardId}', function ($user, $boardId, $cardId) {
    return Board::find($boardId) !== null && Card::find($cardId) !== null; // Kiểm tra xem Board và Card có tồn tại không
});

// Broadcast::channel('card.' . $cardId, function ($user) use ($card) {
//     return true; // Cho phép tất cả người dùng nghe sự kiện
// });

Broadcast::channel('card.{cardId}', function ($user, $cardId) {
    return true; // Hoặc thêm logic kiểm tra quyền truy cập
});
