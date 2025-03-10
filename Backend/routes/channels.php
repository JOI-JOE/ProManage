<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;
use App\Models\Board;

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


// Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
//     return (int) $user->id === (int) $id;
// });

// Broadcast::channel('board.{boardId}', function ($user, $boardId) {
//     return true;
// });

// Broadcast::channel('list.{listId}', function ($user, $listId) {
//     return true; // Hoặc thêm logic kiểm tra quyền truy cập
// });

// Broadcast::channel('board.{boardId}', function ($user, $boardId) {
//     return true; // Hoặc thêm logic kiểm tra quyền truy cập
// });

// Broadcast::channel('cards-channel', function () {
//     return true;
// });
