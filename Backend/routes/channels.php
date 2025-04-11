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


Broadcast::channel('board.{boardId}', function ($user, $boardId) {
    return true;
});

Broadcast::channel('card.{cardId}', function ($user, $cardId) {
    return true; // Hoặc thêm logic kiểm tra quyền truy cập
});

Broadcast::channel('checklist.{cardId}', function ($cardId) {
    return true; // 🔥 Public channel, ai cũng nghe được
});
Broadcast::channel('checklist-item.{checklistItemId}', function ($checklistItemId) {
    // Vì đây là public channel, ai cũng có thể đăng ký
    return true;
});


Broadcast::channel('App.Models.User.{userId}', function ($user, $userId) {
    return (string) $user->id === (string) $userId;
});

Broadcast::channel('user.{id}', function ($user, $id) {
    // Kiểm tra xem user hiện tại có quyền subscribe vào channel này không
    return (string) $user->id === (string) $id;
});

// Channel cho các sự kiện liên quan đến Board
Broadcast::channel('boards.{boardId}', function ($user, $boardId) {
    return true;
});

Broadcast::channel('private-user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});
