<?php


use App\Http\Controllers\Api\AttachmentController;
use App\Http\Controllers\Api\BoardController;
use App\Http\Controllers\Api\BoardMemberController;
use App\Http\Controllers\Api\EmailController;
use App\Http\Controllers\Api\CardController;
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
use App\Http\Controllers\Api\WorkspaceInvitationsController;
use App\Http\Controllers\Api\WorkspaceMembersController;
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
Route::get('/workspaces/{workspaceId}/validate-invite/{inviteToken}', [WorkspaceInvitationsController::class, 'validateInvitation']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get("users/me", [AuthController::class, 'getUser']);

    Route::controller(WorkspaceController::class)->group(function () {
        Route::get('workspaces', 'index');
        Route::get('workspaces/{workspaceId}', 'showWorkspaceById'); // Lấy theo ID
        Route::get('workspaces/name/{workspaceName}', 'showWorkspaceByName'); // Lấy theo tên (dùng query param ?name=xxx)

        Route::post('workspaces', 'store');
        Route::delete('workspaces/{workspace}', 'destroy');
        Route::put('workspaces/{workspace}', 'updateWorkspaceInfo');
    });

    Route::controller(WorkspaceInvitationsController::class)->group(callback: function () {
        Route::post("/workspaces/{workspaceId}/invitationSecret", 'createInvitationSecret');

        Route::get('/workspaces/{workspaceId}/{inviteToken}', 'getInvitationSecret');

        Route::delete('/workspaces/{workspaceId}/invitationSecret', 'cancelInvitationSecret');

        Route::post("/workspaces/{workspaceId}/invitationSecret/{inviteToken}", 'acceptInvitation');

        Route::delete('/workspaces/{workspaceId}/invitationSecret', 'cancelInvitationSecret');
    });

    Route::controller(WorkspaceMembersController::class)->group(function () {
        Route::get('/workspaces/{workspaceId}/addMembers', 'inviteMemberToWorkspace');
    });

    Route::controller(BoardController::class)->group(function () {
        Route::get('boards/{boardId}', 'showBoardById');
    });

    Route::prefix('cards')->group(function () {
        Route::get('/list/{listId}', [CardController::class, 'getCardsByList']);
        Route::put('/update-position', [DragDropController::class, 'updateCardPosition']);
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
});

// Funtion kéo thả column
Route::put('/boards/update-column-position', [DragDropController::class, 'updateListPosition']);
Route::put('/boards/update-card-same-col', [DragDropController::class, 'updateCardPositionsSameColumn']);
Route::put('/boards/update-card-diff-col', [DragDropController::class, 'updateCardPositionsDifferentColumn']);



// Send Email
Route::post('/send-mail', [EmailController::class, 'sendEmail']);


Route::get('/color', [ColorController::class, 'index']);
Route::get('/workspaces/{id}/boards', [ListController::class, 'getBoardsByWorkspace']);

Route::prefix('lists')->group(function () {
    Route::post('/{boardId}', [ListController::class, 'store']);
    Route::patch('/{id}/updateName', [ListController::class, 'updateName']);
    Route::patch('/{id}/closed', [ListController::class, 'updateClosed']);
    Route::get('/{boardId}', [ListController::class, 'index']);
    Route::put('/reorder', [ListController::class, 'reorder']);
    Route::put('/{id}/updateColor', [ListController::class, 'updateColor']);
    Route::post('/dragging', [ListController::class, 'dragging']);
    Route::get('/{id}/detail', [ListController::class, 'getListById']);
});

Route::get('/colors', [ColorController::class, 'index']);


Route::get('/boards', action: [BoardController::class, 'index']);

Route::post('/createBoard', [BoardController::class, 'store'])->middleware('auth:sanctum');
Route::get('/board/{id}', [BoardController::class, 'getBoard']);
Route::post('/createBoard', [BoardController::class, 'store'])->middleware('auth:sanctum');
// Routes quản lý bảng
Route::prefix('workspaces/{workspaceId}/boards')->group(function () {
    Route::get('/', [BoardController::class, 'show']);
    Route::get('{boardId}', [BoardController::class, 'show']);
    Route::put('{boardId}', [BoardController::class, 'update']);
    Route::delete('{boardId}', [BoardController::class, 'destroy']);
});


Route::prefix('boards/{id}/')->group(function () {
    Route::patch('thumbnail', [BoardController::class, 'updateThumbnail']);
    Route::patch('marked', [BoardController::class, 'updateIsMarked']);
    Route::patch('archive', [BoardController::class, 'updateArchive']);
    Route::patch('visibility', [BoardController::class, 'updateVisibility']);
    Route::get('creater', [BoardController::class, 'showCreated']);
});

// Routes cho thành viên bảng
Route::prefix('boards/{boardId}/members')->group(function () {
    Route::get('', [BoardMemberController::class, 'index']);
    Route::post('', [BoardMemberController::class, 'addMember']);
    Route::put('{userId}/role', [BoardMemberController::class, 'updateMemberRole']);
    Route::delete('{userId}', [BoardMemberController::class, 'leaveBoard']);
});
// Recent board cho user trong workspace
Route::middleware('auth:sanctum')->group(function () {
    Route::get('recent-boards', [RecentBoardController::class, 'index']);
    Route::post('recent-boards', [RecentBoardController::class, 'store']);
});


// Route cho bảng đã xóa
Route::get('/trashes', [BoardController::class, 'trash']);

///Comment
Route::get('/cards/{cardId}/comments', [CommentCardController::class, 'index']);
Route::post('/comments', [CommentCardController::class, 'addCommentIntoCard']);
Route::delete('/comments/{id}', [CommentCardController::class, 'destroy']);

// 📂 File đính kèm (Attachments)
Route::prefix('/{cardId}/attachments')->group(function () {
    Route::get('/', [AttachmentController::class, 'getAttachments']);
    Route::post('/upload', [AttachmentController::class, 'uploadAttachment']);
    Route::post('/uploadcover', [AttachmentController::class, 'uploadCover']);
    Route::delete('/{attachmentId}', [AttachmentController::class, 'deleteAttachment']);
    Route::patch('/{attachmentId}/update-cover', [AttachmentController::class, 'setCoverImage']);
});
// checklists
Route::get('/cards/{cardId}/checklists', [ChecklistController::class, 'index']);
Route::post('/cards/{cardId}/checklists', [ChecklistController::class, 'store']);
Route::put('/checklists/{id}', [ChecklistController::class, 'update']);
Route::delete('/checklists/{id}', [ChecklistController::class, 'destroy']);
// checklist_item
Route::get('/checklist/{checklistId}/item', [ChecklistItemController::class, 'index']);
Route::post('/checklist/{checklistId}/item', [ChecklistItemController::class, 'store']);
Route::put('/item/{id}/name', [ChecklistItemController::class, 'updateName']);
Route::put('/item/{id}/completed', [ChecklistItemController::class, 'updateStatus']);
