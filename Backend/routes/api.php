<?php


use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\WorkspaceInvitationsController;
use App\Http\Controllers\Api\WorkspaceMembersController;
use App\Http\Controllers\Api\AttachmentController;
use App\Http\Controllers\Api\BoardController;
use App\Http\Controllers\Api\BoardMemberController;
use App\Http\Controllers\Api\EmailController;
use App\Http\Controllers\Api\CardController;
use App\Http\Controllers\api\CardMemberController;
use App\Http\Controllers\Api\ChecklistController;
use App\Http\Controllers\Api\ChecklistItemController;
use App\Http\Controllers\Api\ColorController;
use App\Http\Controllers\Api\CommentCardController;
use App\Http\Controllers\Api\ListController;
use App\Http\Controllers\Api\RecentBoardController;
use App\Http\Controllers\Api\WorkspaceController;
use App\Http\Controllers\Api\GoogleAuthController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Api\LabelController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DragDropController;

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

// Route::get('/auth/redirect', [AuthController::class, 'loginGitHub']);
// Route::get('/auth/callback', [AuthController::class, 'handleLoginGitHub']);

Route::middleware(['web'])->group(function () {
    Route::controller(GoogleAuthController::class)->group(function () {
        Route::get('/auth/redirect/google', 'redirectToAuthProvider');
        Route::get('/auth/callback/google', 'handleProviderCallback');
    });
});

// Đường dẫn này để kiểm tra xem lời mời có hợp lệ
Route::get('/workspaces/{workspaceId}/invitationSecret/{inviteToken}', [WorkspaceInvitationsController::class, 'getInvitationSecretByReferrer']);
Route::get('/workspace/public/{workspaceId}', [WorkspaceController::class, 'getWorkspaceById']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get("users/me", [AuthController::class, 'getUser']);
    // Route::get('member/me', [AuthController::class, 'getUserData']);
    Route::get('member/{id?}', [AuthController::class, 'getUserData']);

    Route::controller(WorkspaceController::class)->group(function () {
        Route::get('workspaces', 'index');
        Route::get('workspaces/{workspaceId}', 'showWorkspaceById'); // Lấy theo ID
        Route::get('workspaces/name/{workspaceName}', 'showWorkspaceByName'); // Lấy theo tên (dùng query param ?name=xxx)
        Route::get('workspaces/boardMarked/{workspaceName}', 'getBoardMarkedByWorkspace'); // Lấy theo tên (dùng query param ?name=xxx)
        Route::post('workspaces', 'store');
        Route::delete('workspaces/{workspace}', 'destroy');
        Route::put('workspaces/{workspace}', 'updateWorkspaceInfo');
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
        Route::post('/workspace/{workspaceId}/addMembers', action: 'addMembersToWorkspace');
        Route::post('/workspace/{workspaceId}/member/{memberId}',  'addMemberToWorkspaceDirection');
    });

    // Route::post('/send-mail', [EmailController::class, 'sendEmail']);

    Route::controller(BoardController::class)->group(function () {
        Route::get('boards/{boardId}', 'showBoardById');
    });

    Route::prefix('cards')->group(function () {
        Route::get('/list/{listId}', [CardController::class, 'getCardsByList']);
        // Route::put('/update-position', [DragDropController::class, 'updateCardPosition']);
        // Function tạo card
        Route::post('/', [CardController::class, 'store']);

        Route::put('/{cardId}/updatename', [CardController::class, 'updateName']);
        Route::put('/{cardID}/description', [CardController::class, 'updateDescription']);
        Route::post('/{cardId}/members/email', [CardController::class, 'addMemberByEmail']);
        Route::delete('/{card}/members/{user}', [CardController::class, 'removeMember'])
            ->name('cards.removeMember');

        Route::put('/{cardId}/dates', [CardController::class, 'updateDates']);
        Route::delete('/{cardId}/dates', [CardController::class, 'removeDates']);
        Route::get('/{cardId}/labels', [LabelController::class, 'getLabels']);
        Route::post('/{cardId}/labels', [LabelController::class, 'addLabelToCard']);
        Route::delete('/{cardId}/labels/{labelId}', [LabelController::class, 'removeLabelFromCard']);
        Route::get('/{cardId}/history', [CardController::class, 'getCardHistory']);
    });

    // Funtion kéo thả column
    Route::put('/boards/update-column-position', [DragDropController::class, 'updateListPosition']);
    Route::put('/boards/update-card-same-col', [DragDropController::class, 'updateCardPositionsSameColumn']);
    Route::put('/boards/update-card-diff-col', [DragDropController::class, 'updateCardPositionsDifferentColumn']);

    // Send Email
});


Route::get('/color', [ColorController::class, 'index']);
Route::get('/workspaces/{id}/boards', [ListController::class, 'getBoardsByWorkspace']);

Route::prefix('lists')->group(function () {
    Route::get('/{boardId}', [ListController::class, 'index']);
    Route::post('/', [ListController::class, 'store']);
    Route::delete('{id}/destroy', [ListController::class, 'destroy']);
    Route::get('/{boardId}/listClosed', [ListController::class, 'getListClosed']);
    Route::patch('/{id}/updateName', [ListController::class, 'updateName']);
    Route::patch('/{id}/closed', [ListController::class, 'updateClosed']);
    Route::put('/{id}/updateColor', [ListController::class, 'updateColor']);
    Route::get('/{id}/detail', [ListController::class, 'getListById']);
});

Route::get('/colors', [ColorController::class, 'index']);

Route::prefix('workspaces/{workspaceId}/boards')->group(function () {
    Route::get('/', [BoardController::class, 'show']);
    Route::get('{boardId}', [BoardController::class, 'show']);
    Route::put('{boardId}', [BoardController::class, 'update']);
    Route::delete('{boardId}', [BoardController::class, 'destroy']);
});

// Routes quản lý bảng
Route::get('/boards', [BoardController::class, 'index']);



Route::get('/boards/{boardId}', [BoardController::class, 'showBoardById']);
Route::get('/board/{id}', [BoardController::class, 'getBoard']);
Route::get('/boards_marked', [BoardController::class, 'getBoardMarked'])->middleware(['auth:sanctum']);

Route::post('/createBoard', [BoardController::class, 'store'])->middleware('auth:sanctum');

Route::prefix('boards/{id}/')->group(function () {
    Route::patch('thumbnail', [BoardController::class, 'updateThumbnail']);
    Route::patch('marked', [BoardController::class, 'updateIsMarked']);
    Route::patch('archive', [BoardController::class, 'updateArchive']);
    Route::patch('visibility', [BoardController::class, 'updateVisibility']);
    Route::patch('name', [BoardController::class, 'updateName']);
    Route::get('creater', [BoardController::class, 'showCreated']);  // Route cho người tạo bảng
});

// // Routes cho thành viên bảng
// Route::prefix('boards/{boardId}/members')->group(function () {
//     Route::get('', [BoardMemberController::class, 'index']);
//     Route::post('', [BoardMemberController::class, 'addMember']);
//     Route::put('{userId}/role', [BoardMemberController::class, 'updateMemberRole']);
//     Route::delete('{userId}', [BoardMemberController::class, 'leaveBoard']);
// });

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user/boards', [BoardMemberController::class, 'getUserBoards']);
    Route::post('/board/{boardId}/invite', [BoardMemberController::class, 'generateInviteLink']);
    Route::post('/join-board/{token}', [BoardMemberController::class, 'join']);
});
Route::get('/invite-board/{token}', [BoardMemberController::class, 'handleInvite']);

// Recent board cho user trong workspace
Route::middleware('auth:sanctum')->group(function () {
    Route::get('recent-boards', [RecentBoardController::class, 'index']);
    Route::post('recent-boards', [RecentBoardController::class, 'store']);
});


// Route cho bảng đã xóa
Route::get('/trashes', [BoardController::class, 'trash']);


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
    Route::put('/{cardId}/dates', [CardController::class, 'updateDates']); // cập nhật ngày của thẻ
    Route::delete('/{cardId}/dates', [CardController::class, 'removeDates']); // xóa ngày
    Route::get('/{cardId}/labels', [LabelController::class, 'getLabels']); // danh sách nhãn trong thẻ
    Route::put('/{cardId}/labels/update-action', [LabelController::class, 'updateAddAndRemove']); // thêm và xóa nhãn khỏi thẻ

    Route::get('/{cardId}/history', [CardController::class, 'getCardHistory']);
});

Route::get('/boards/{boardId}/labels', [LabelController::class, 'getLabelsByBoard']); // hiển thị nhãn theo bảng
Route::post('/boards/{boardId}/labels', [LabelController::class, 'createLabel']); // thêm nhãn chung
Route::delete('/labels/{labelId}', [LabelController::class, 'deleteLabelByBoard']); // xóa nhãn
Route::patch('/labels/{labelId}/update-name', [LabelController::class, 'updateLabelName']);

// Comment
Route::middleware(['auth:sanctum'])->group(function () {
    // Lấy tất cả bình luận của card
    Route::get('/cards/{cardId}/comments', [CommentCardController::class, 'index']);

    // Thêm bình luận vào card
    Route::post('/comments', [CommentCardController::class, 'addCommentIntoCard']);

    // Xóa bình luận
    Route::delete('/comments/{id}', [CommentCardController::class, 'destroy']);

    // Cập nhật bình luận
    Route::put('/comments/{id}', [CommentCardController::class, 'update']);
});

// 📂 File đính kèm (Attachments)
Route::prefix('/{cardId}/attachments')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [AttachmentController::class, 'getAttachments']);
    Route::patch('/{attachmentId}/update-name', [AttachmentController::class, 'updateNameFileAttachment']);
    Route::post('/upload', [AttachmentController::class, 'uploadAttachment']);
    Route::post('/uploadcover', [AttachmentController::class, 'uploadCover']);

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

    // Checklist Item routes
    Route::get('/checklist/{checklistId}/item', [ChecklistItemController::class, 'getChecklistItems']); // Lấy danh sách checklist item theo checklist
    Route::post('/checklist-items', [ChecklistItemController::class, 'store']); // Thêm mới checklist item
    Route::put('/item/{id}/name', [ChecklistItemController::class, 'updateName']); // Cập nhật tên của checklist item
    Route::put('/item/{id}/completed', [ChecklistItemController::class, 'toggleCompletionStatus']); // Cập nhật trạng thái hoàn thành của checklist item
    Route::delete('/item/{id}', [ChecklistItemController::class, 'destroy']);
});
// Route::delete('/checklists/{id}', [ChecklistItemController::class, 'destroy']);// xóa checklists
Route::get('/users/{userId}/notifications', [CardController::class, 'getUserNotifications']);

// });

Route::get('/activities/{cardId}', [ActivityLogController::class, 'getActivitiesByCard']);
