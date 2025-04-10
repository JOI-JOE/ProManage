<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;
use App\Models\Board;
use App\Models\Card;
use App\Models\ListBoard;
use Illuminate\Support\Facades\Log;

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
// Broadcast::channel('workspace-invite-{workspaceId}', function ($user, $workspaceId) {
//     return $user->isMemberOfWorkspace($workspaceId);
// });

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
    Log::info("Authenticating channel", [
        'user_id' => $user ? $user->id : null,
        'requested_userId' => $userId,
    ]);
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
    Log::info("Auth user:", [$user->id]); // Ghi log kiểm tra user
    Log::info("Request userId:", [$userId]);

    return (int) $user->id === (int) $userId;
});


Broadcast::channel('board.{boardId}.admins', function ($user, $boardId) {
    $board = Board::findOrFail($boardId);
    
    // Kiểm tra xem user có phải admin của bảng không
    return $board->members()
        ->where('user_id', $user->id)
        ->where('role', 'admin')
        ->exists();
});