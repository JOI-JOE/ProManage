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

Broadcast::channel('board.{boardId}', function ($user, $boardId) {
    return $user->boards->contains('id', $boardId);
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

