<?php


use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\WorkspaceInvitationsController;
use App\Http\Controllers\Api\WorkspaceMembersController;
use App\Http\Controllers\Api\AttachmentController;
use App\Http\Controllers\Api\BoardController;
use App\Http\Controllers\Api\BoardMemberController;
use App\Http\Controllers\Api\ChecklistItemMemberController;
use App\Http\Controllers\Api\CardController;
use App\Http\Controllers\api\CardMemberController;
use App\Http\Controllers\Api\ChecklistController;
use App\Http\Controllers\Api\ChecklistItemController;
use App\Http\Controllers\Api\CommentCardController;
use App\Http\Controllers\Api\ListController;
use App\Http\Controllers\Api\RecentBoardController;
use App\Http\Controllers\Api\WorkspaceController;
use App\Http\Controllers\Api\GoogleAuthController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Api\LabelController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DragDropController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\BoardStarController;
use App\Http\Controllers\Api\EmailController;
use App\Mail\TestMail;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Mail;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::post('/register', [AuthController::class, 'handleRegister'])->name('login');
Route::post('/login', [AuthController::class, 'handleLogin']);

Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

Route::post('/forgot-password', [AuthController::class, 'sendResetPassword']);

// Route::get('/send-test-mail', [EmailController::class, 'sendTestMail']);

// Route::get('/auth/redirect', [AuthController::class, 'loginGitHub']);
// Route::get('/auth/callback', [AuthController::class, 'handleLoginGitHub']);


Route::middleware(['web'])->group(function () {
    Route::controller(GoogleAuthController::class)->group(function () {
        Route::get('/auth/redirect/google', 'redirectToAuthProvider');
        Route::get('/auth/callback/google', 'handleProviderCallback');
    });
});

Route::get('/workspaces/{workspaceId}/invitationSecret/{inviteToken}', [WorkspaceInvitationsController::class, 'getInvitationSecretByReferrer']);
Route::get('/invite-board/{token}', [BoardMemberController::class, 'handleInvite']);

Route::middleware(['auth:sanctum'])->group(function () {

    // Function lấy dữ liệu user
    Route::controller(AuthController::class)->group(function () {
        Route::prefix('member')->group(function () {
            Route::get('/me',  'index');
        });
    });

    // Function board thì có để ở ngoài vì nó có chế độ public
    Route::controller(BoardController::class)->group(function () {
        Route::get('boards/{boardId}', 'show');
    });

    // Function list 
    Route::controller(ListController::class)->group(function () {
        Route::prefix('lists')->group(function () {
            Route::post('/',  'store');
            Route::get('/{boardId}', 'show');
            Route::put('/{listId}',  'update');
        });
    });

    // Function lấy dữ liệu của star
    Route::controller(BoardStarController::class)->group(function () {
        Route::prefix('boardstars')->group(function () {
            Route::get('/',  'index');
        });
        Route::post('member/{userId}/boardStars', 'starBoard');
        Route::delete('member/{userId}/boardStars/{boardId}', 'unstarBoard');
    });

    // Function lấy dữ liệu của workspace 
    Route::controller(WorkspaceController::class)->group(function () {
        Route::prefix('workspaces')->group(function () {
            Route::get('/', 'index');
            Route::get('/name/{workspaceName}', 'showWorkspaceByName');
            Route::post('/', 'store');
            Route::put('/{workspace}', 'updateWorkspaceInfo');
            Route::delete('/{workspace}', 'destroy');
        });
    });

    Route::controller(WorkspaceInvitationsController::class)->group(callback: function () {
        Route::post("/workspaces/{workspaceId}/invitationSecret", 'createInvitationSecret');
        Route::get('/workspaces/{workspaceId}/invitationSecret', 'getInvitationSecret');
        Route::delete('/workspaces/{workspaceId}/invitationSecret', 'cancelInvitationSecret');
        // Route::post("/workspaces/{workspaceId}/invitationSecret/{inviteToken}", 'acceptInvitation');
        Route::get('search/members', 'searchMembers');
        Route::put('workspaces/{workspaceId}/members/{memberId}', 'confirmWorkspaceMembers');
    });

    Route::controller(WorkspaceMembersController::class)->group(function () {
        Route::post('/workspace/{workspaceId}/member/{memberId}',  'addMemberToWorkspaceDirection');
    });

    // Card
    Route::prefix('card')->controller(CardController::class)->group(function () {
        Route::post('/', 'store');
        Route::get('/{cardId}', 'show');
        Route::put('/{cardId}', 'update');
        Route::delete('/{cardId}', 'destroy');
        Route::post('/{cardId}/copy',  'copy');
        Route::post('/{cardId}/move',  'move');
        Route::put('/{cardId}/drag', action: 'updatePositionCard');
    });

    Route::prefix('card')->group(function () {
        // Card Member
        Route::controller(CardMemberController::class)->group(function () {
            Route::post('/{cardId}/idMember', 'toggleJoin');
            Route::post('/{cardId}/idMember/{memberId}', 'store');
            Route::delete('/{cardId}/idMember/{memberId}', 'remove');
        });
        // Checklist
        Route::controller(ChecklistController::class)->group(function () {
            Route::get('/{cardId}/checklists', 'index'); // Lấy danh sách checklist của 1 card
            Route::post('/{cardId}/checklists', 'store'); // Tạo checklist mới cho 1 card
            Route::put('/checklist/{checklistItemId}',   'update');
            Route::delete('/checklist/{checklistItemId}',   'delete');
        });
        // Attachment
        Route::controller(AttachmentController::class)->group(function () {
            Route::get('/{cardId}/attachments', 'index');
            Route::post('/{cardId}/attachments', 'store');
            Route::put('/attachment/{attachmentId}', 'update');
            Route::delete('/attachment/{attachmentId}', 'delete');
        });
        // Comment
        Route::controller(CommentCardController::class)->group(function () {
            Route::get('/{cardId}/comments', 'index');
            Route::post('/{cardId}/comments', 'store');
            Route::put('/comment/{commentId}',  'update');
            Route::delete('/comment/{commentId}',  'delete');
        });
    });
    // ChecklistItem
    Route::prefix('checklist')->controller(ChecklistItemController::class)->group(function () {
        Route::post('/{checklistId}/items',  'store');
        Route::put('/{checklistItemId}/items',  'update');
        Route::delete('/{checklistItemId}/items',  'delete');
    });
    // Activity for card by id
    Route::controller(ActivityLogController::class)->group(function () {
        Route::get('/activity/cards/{cardId}', 'getActivityLogForCard');
        // Route::get('/activity/boards/{board}', 'showBoardActivity')->name('activity.boards.show');
        // Route::get('/activity/lists/{list}', 'showListActivity')->name('activity.lists.show');
        // Route::get('/activity/members/{member}', 'showMemberActivity')->name('activity.members.show');
        // Route::get('/activity/all', 'showAllActivity')->name('activity.all');
    });

    // Notification 
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);


    // Route::controller(CardController::class)->group(function () {
    //     Route::prefix('card')->group(function () {
    //         Route::post('/', 'store');
    //         Route::get('/{cardId}', 'show');
    //     });
    //     // Route::put('/{cardId}/name', 'updateName');
    //     // Route::put('/{cardId}/description', 'updateDescription');
    //     // Route::put('/{cardId}/dates', 'updateDates');
    //     // Route::delete('/{cardId}/dates', 'removeDates');
    //     // Route::get('/{cardId}/history', 'getCardHistory');

    //     // Route::post('/{cardId}/members/email', 'addMemberByEmail');
    //     // Route::delete('/{cardId}/members/{user}', 'removeMember')->name('cards.removeMember');
    // });


    // Route::prefix('cards')->group(function () {
    //     Route::get('/list/{listId}', [CardController::class, 'getCardsByList']);
    //     Route::post('/', [CardController::class, 'store']);

    //     Route::put('/{cardId}/updatename', [CardController::class, 'updateName']);
    //     Route::put('/{cardID}/description', [CardController::class, 'updateDescription']);
    //     Route::post('/{cardId}/members/email', [CardController::class, 'addMemberByEmail']);
    //     Route::delete('/{card}/members/{user}', [CardController::class, 'removeMember'])
    //         ->name('cards.removeMember');

    //     Route::put('/{cardId}/dates', [CardController::class, 'updateDates']);
    //     Route::delete('/{cardId}/dates', [CardController::class, 'removeDates']);
    //     Route::get('/{cardId}/labels', [LabelController::class, 'getLabels']);
    //     Route::post('/{cardId}/labels', [LabelController::class, 'addLabelToCard']);
    //     Route::delete('/{cardId}/labels/{labelId}', [LabelController::class, 'removeLabelFromCard']);
    //     Route::get('/{cardId}/history', [CardController::class, 'getCardHistory']);
    // });


    // Route::get('/search', [SearchController::class, 'search']);

    // Route::get('/color', [ColorController::class, 'index']);

    // Route::prefix('lists')->group(function () {
    //     Route::post('/', [ListController::class, 'store']);
    //     Route::get('/{boardId}/listClosed', [ListController::class, 'getListClosed']);
    //     Route::delete('{id}/destroy', [ListController::class, 'destroy']);
    //     // Route::patch('/{listId}/updateName', [ListController::class, 'updateName']);
    //     Route::patch('/{id}/closed', [ListController::class, 'updateClosed']);
    //     // Route::put('/{id}/updateColor', [ListController::class, 'updateColor']);
    //     Route::get('/{id}/detail', [ListController::class, 'getListById']);
    // });

});

// Routes quản lý bảng
Route::get('/boards', [BoardController::class, 'index']);
Route::delete('/boards/{boardId}', [BoardController::class, 'toggleBoardClosed']);


Route::post('/createBoard', [BoardController::class, 'store'])->middleware('auth:sanctum');

Route::prefix('boards/{id}/')->group(function () {
    Route::patch('thumbnail', [BoardController::class, 'updateThumbnail']);
    Route::patch('marked', [BoardController::class, 'updateIsMarked']);
    Route::patch('archive', [BoardController::class, 'updateArchive']);
    Route::patch('visibility', [BoardController::class, 'updateVisibility']);
    Route::patch('name', [BoardController::class, 'updateName']);
    Route::get('creater', [BoardController::class, 'showCreated']);  // Route cho người tạo bảng
});


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/boards/{boardId}/members', [BoardMemberController::class, 'getBoardMembers']);
    Route::get('/guest-boards', [BoardMemberController::class, 'getGuestBoards']);

    Route::post('/board/{boardId}/invite', [BoardMemberController::class, 'generateInviteLink']);
    Route::delete('/remove-invite/{token}', [BoardMemberController::class, 'removeInviteLink']);
    Route::post('/join-board/{token}', [BoardMemberController::class, 'join']);
    Route::get('/notifications', [NotificationController::class, 'getNotifications']);
    Route::put('/boards/update-role', [BoardMemberController::class, 'updateRoleMemberInBoard']);
    Route::delete('{boardId}/boards/removeMember', [BoardMemberController::class, 'removeMemberFromBoard']);

    Route::get('/boards/{boardId}/members/{userId}/cards', [BoardMemberController::class, 'getMemberCards']);
    Route::get('/boards/{boardId}/members/{userId}/items', [BoardMemberController::class, 'getMemberChecklistItems']);
});

// Recent board cho user trong workspace
Route::middleware('auth:sanctum')->group(function () {
    Route::get('recent-boards', [RecentBoardController::class, 'index']);
    Route::post('recent-boards', [RecentBoardController::class, 'store']);
    Route::get('closed', [BoardController::class, 'closed']);
});


Route::middleware('auth:sanctum')->prefix('cards')->group(function () {
    Route::get('/{listId}/getCardsByList', [CardController::class, 'getCardsByList']);

    Route::get('/boards/{boardId}/archived', [CardController::class, 'getArchivedCardsByBoard']);
    Route::patch('/{id}/toggle-archive', [CardController::class, 'toggleArchive']);
    Route::delete('/{id}/delete', [CardController::class, 'delete']);

    Route::get('/{id}/show', [CardController::class, 'show']);
    Route::patch('/{cardID}/description', [CardController::class, 'updateDescription']);
    Route::post('/', [CardController::class, 'store']);
    Route::put('/{cardId}/updatename', [CardController::class, 'updateName']);

    /////Lấy ra member của card
    Route::get('/{cardId}/members', [CardMemberController::class, 'getCardMembers']);
    Route::post('/{card_id}/toggle-member', [CardMemberController::class, 'toggleCardMember']);


    Route::post('/{cardId}/members/email', [CardController::class, 'addMemberByEmail'])->name('card.addMember'); // thêm thành viên vào thẻ
    Route::delete('/{card}/members/{user}', [CardController::class, 'removeMember'])->name('cards.removeMember'); // xóa thành viên ra khỏi thẻ
    Route::get('/{cardId}/dates', [CardController::class, 'getSchedule']); // lấy danh sách ngày giờ theo card
    Route::put('/{cardId}/dates', [CardController::class, 'updateDates']); // cập nhật ngày của thẻ
    Route::delete('/{cardId}/dates', [CardController::class, 'removeDates']); // xóa ngày
    Route::get('/{cardId}/labels', [LabelController::class, 'getLabels']); // danh sách nhãn trong thẻ
    Route::put('/{cardId}/labels/update-action', [LabelController::class, 'updateAddAndRemove']); // thêm và xóa nhãn khỏi thẻ

    Route::get('/{cardId}/history', [CardController::class, 'getCardHistory']);
});

// 📂 File đính kèm (Attachments)
Route::prefix('/{cardId}/attachments')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [AttachmentController::class, 'getAttachments']);
    Route::patch('/{attachmentId}/update-name', [AttachmentController::class, 'updateNameFileAttachment']);
    Route::post('/upload', [AttachmentController::class, 'uploadAttachment']);
    Route::patch('/{attachmentId}/set-cover-image', [AttachmentController::class, 'setCoverImage']);

    Route::delete('/{attachmentId}/delete', [AttachmentController::class, 'deleteAttachment']);
    Route::patch('/{attachmentId}/update-cover', [AttachmentController::class, 'setCoverImage']);
})->middleware('auth:sanctum');
// checklists
Route::middleware('auth:sanctum')->group(function () {
    // Checklist routes
    Route::get('/cards/{cardId}/checklists', [ChecklistController::class, 'index']); // Lấy danh sách checklist theo card
    Route::post('/checklists', [ChecklistController::class, 'store']); // Thêm mới checklist
    Route::put('/checklists/{id}', [ChecklistController::class, 'update']); // Cập nhật checklist
    Route::delete('/checklists/{id}', [ChecklistController::class, 'deleteChecklist']); // Xóa checklist
    Route::get('/item/{id}/show', [ChecklistItemController::class, 'show']);
    Route::get('/item/{id}/dates-item', [ChecklistItemController::class, 'getChecklistItemDate']);
    Route::put('/update-date/{id}/item', [ChecklistItemController::class, 'updateDate']);

    // Checklist Item routes
    Route::get('/checklist-items/{id}/item', [ChecklistItemController::class, 'getChecklistItems']); // Lấy danh sách checklist item theo checklist
    Route::post('/checklist-items', [ChecklistItemController::class, 'store']); // Thêm mới checklist item
    Route::post('/checklist-items/{id}/toggle-member', [ChecklistItemMemberController::class, 'toggleMember']);
    Route::get('/checklist-items/{id}/members', [ChecklistItemMemberController::class, 'getMembers']);
    Route::put('/item/{id}/name', [ChecklistItemController::class, 'updateName']); // Cập nhật tên của checklist item
    Route::put('/item/{id}/completed', [ChecklistItemController::class, 'toggleCompletionStatus']); // Cập nhật trạng thái hoàn thành của checklist item
    Route::delete('/item/{id}', [ChecklistItemController::class, 'destroy']);
});
// Route::delete('/checklists/{id}', [ChecklistItemController::class, 'destroy']);// xóa checklists
Route::get('/users/{userId}/notifications', [CardController::class, 'getUserNotifications']);

// });



// Route::get('/boards/{boardId}/labels', [LabelController::class, 'getLabelsByBoard']); // hiển thị nhãn theo bảng
// Route::post('/boards/{boardId}/labels', [LabelController::class, 'createLabel']); // thêm nhãn chung
// Route::delete('/labels/{labelId}', [LabelController::class, 'deleteLabelByBoard']); // xóa nhãn
// Route::patch('/labels/{labelId}/update-name', [LabelController::class, 'updateLabelName']);

// Comment
// Route::middleware(['auth:sanctum'])->group(function () {
//     Route::get('/cards/{cardId}/comments', [CommentCardController::class, 'index']);
//     Route::post('/comments', [CommentCardController::class, 'addCommentIntoCard']);
//     Route::delete('/comments/{id}', [CommentCardController::class, 'destroy']);
//     Route::put('/comments/{id}', [CommentCardController::class, 'update']);
// });