<?php


use App\Http\Controllers\Api\AttachmentController;
use App\Http\Controllers\Api\BoardController;
use App\Http\Controllers\Api\BoardMemberController;
use App\Http\Controllers\Api\EmailController;
use App\Http\Controllers\api\CardController;
use App\Http\Controllers\Api\ChecklistController;
use App\Http\Controllers\Api\ChecklistItemController;
use App\Http\Controllers\Api\ColorController;
use App\Http\Controllers\Api\CommentCardController;
use App\Http\Controllers\Api\ListController;
use App\Http\Controllers\api\RecentBoardController;
use App\Http\Controllers\Api\WorkspaceController;
use App\Http\Controllers\Api\GoogleAuthController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Api\LabelController;
use App\Http\Controllers\Api\WorkspaceInvitationsController;
use App\Http\Controllers\Api\WorkspaceMembersController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

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

Route::post('/register', [AuthController::class, 'handleRegister']);

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


Route::middleware(['auth:sanctum'])->group(function () {
    Route::get("users/me", [AuthController::class, 'getUser']);

    Route::controller(WorkspaceController::class)->group(function () {
        Route::get('workspaces', 'index');
        // Route::get('workspaces/{id}/boards', 'show');
        Route::get('workspaces/{display_name}', 'showDetailWorkspace');
        Route::post('workspaces', 'store');
        Route::delete('workspaces/{workspace}', 'destroy');
        Route::put('workspaces/{workspace}', 'updateWorkspaceInfo')->name('wk.updateWorkspaceInfo');
    });
});



//     // Update infor workspace
//     Route::put('/workspaces/{workspace}', 'updateWorkspaceInfo')->name('wk.updateWorkspaceInfo');
// })->middleware(['auth:sanctum']);

Route::controller(WorkspaceMembersController::class)->group(function () {
    Route::get('/workspaces/{idWorkspace}/members', 'getAllWorkspaceMembersById');

    Route::post('/workspaces/{idWorkspace}/addMembers', 'inviteMemberToWorkspace');
});

Route::controller(WorkspaceInvitationsController::class)->group(function () {
    Route::get("/search/members", 'searchNewMembersToWorkspace');
    Route::post('/workspace/{idWorkspace}/addMember',  'inviteMemberToWorkspace');

    // ở đây sẽ có hai trường hợp hợp
    // 1. nếu là id -> sẽ được add thẳng vào workspace + email

    Route::put('workspaces/{idWorkspace}/members/{idMember}', 'sendInvitationById');

    // 2. nếu là email -> sẽ add vào workspace nhưng -> 1 là tài khoản đã có / 2 tài khoản chưa có trên trello
    //

    Route::put('workspaces/{idWorkspace}/members', 'sendInvitationByEmail');
});


// Send Email
Route::post('/send-mail', [EmailController::class, 'sendEmail']);


Route::get('/color', [ColorController::class, 'index']);
Route::get('/workspaces/{id}/boards', [ListController::class, 'getBoardsByWorkspace']);

Route::prefix('cards')->group(function () {
    Route::post('/', [CardController::class, 'store']);
    // Route::patch('/{id}/updateName', [ListController::class, 'updateName']);
    // Route::patch('/{id}/closed', [ListController::class, 'updateClosed']);
    // Route::get('/{boardId}', [ListController::class, 'index']); // Lấy danh sách theo board
    // Route::put('/reorder', [ListController::class, 'reorder']); // Cập nhật vị trí kéo thả
    // Route::put('/{id}/updateColor', [ListController::class, 'updateColor']);
    // Route::post('/dragging', [ListController::class, 'dragging']);

    // thêm thành viên vào thẻ
    Route::post('/{cardId}/members/email', [CardController::class, 'addMemberByEmail']);
    Route::delete('/{card}/members/{user}', [CardController::class, 'removeMember'])
        ->name('cards.removeMember'); // xóa thành viên ra khỏi thẻ
    Route::put('/{cardId}/dates', [CardController::class, 'updateDates']); // cập nhật ngày của thẻ
    Route::delete('/{cardId}/dates', [CardController::class, 'removeDates']);
});
Route::prefix('lists')->group(function () {
    Route::post('/{boardId}', [ListController::class, 'store']);
    Route::patch('/{id}/updateName', [ListController::class, 'updateName']);
    Route::patch('/{id}/closed', [ListController::class, 'updateClosed']);
    Route::get('/{boardId}', [ListController::class, 'index']); // Lấy danh sách theo board
    Route::put('/reorder', [ListController::class, 'reorder']); // Cập nhật vị trí kéo thả
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
    Route::get('/', [BoardController::class, 'show']); // Lấy danh sách boards
    // Route::post('/', [BoardController::class, 'store']); // Tạo board mới
    Route::get('{boardId}', [BoardController::class, 'show']); // Lấy thông tin chi tiết board
    Route::put('{boardId}', [BoardController::class, 'update']); // Cập nhật board
    Route::delete('{boardId}', [BoardController::class, 'destroy']); // Xóa board
});


Route::prefix('boards/{id}/')->group(function () {
    Route::patch('thumbnail', [BoardController::class, 'updateThumbnail']);
    Route::patch('marked', [BoardController::class, 'updateIsMarked']);
    Route::patch('archive', [BoardController::class, 'updateArchive']);
    Route::patch('visibility', [BoardController::class, 'updateVisibility']);
    Route::get('creater', [BoardController::class, 'showCreated']);  // Route cho người tạo bảng
});

// Routes cho thành viên bảng
Route::prefix('boards/{boardId}/members')->group(function () {
    Route::get('', [BoardMemberController::class, 'index']);
    // Route::get('', [BoardMemberController::class, 'getAllMembers']);
    Route::post('', [BoardMemberController::class, 'addMember']);
    Route::put('{userId}/role', [BoardMemberController::class, 'updateMemberRole']);
    Route::delete('{userId}', [BoardMemberController::class, 'leaveBoard']);
});


Route::middleware('auth:sanctum')->group(function () {
    Route::get('recent-boards', [RecentBoardController::class, 'index']);
    Route::post('recent-boards', [RecentBoardController::class, 'store']);
});
// Route cho bảng đã xóa
Route::get('/trashes', [BoardController::class, 'trash']);

/// Route card

Route::prefix('cards')->group(function () {
    Route::get('/{listId}/getCardsByList', [CardController::class, 'getCardsByList']);
    // routes/api.php
    Route::patch('/{cardId}/move', [CardController::class, 'moveCard']);
    Route::post('/update-position', [CardController::class, 'updateCardPosition']);
    Route::post('/', [CardController::class, 'store']);
    Route::put('/{cardId}/updatename', [CardController::class, 'updateName']);
    Route::put('/{cardID}/description', [CardController::class, 'updateDescription']);
    // Route::patch('/{id}/updateName', [ListController::class, 'updateName']);
    // Route::patch('/{id}/closed', [ListController::class, 'updateClosed']);
    // Route::get('/{boardId}', [ListController::class, 'index']); // Lấy danh sách theo board
    // Route::put('/reorder', [ListController::class, 'reorder']); // Cập nhật vị trí kéo thả
    // Route::put('/{id}/updateColor', [ListController::class, 'updateColor']);
    // Route::post('/dragging', [ListController::class, 'dragging']);
    Route::post('/{cardId}/members/email', [CardController::class, 'addMemberByEmail'])->name('card.addMember'); // thêm thành viên vào thẻ
    Route::delete('/{card}/members/{user}', [CardController::class, 'removeMember'])
        ->name('cards.removeMember'); // xóa thành viên ra khỏi thẻ
    Route::put('/{cardId}/dates', [CardController::class, 'updateDates']); // cập nhật ngày của thẻ
    Route::delete('/{cardId}/dates', [CardController::class, 'removeDates']); // xóa ngày
    Route::get('/{cardId}/labels', [LabelController::class, 'getLabels']); // danh sách nhãn trong thẻ
    Route::post('/{cardId}/labels', [LabelController::class, 'addLabelToCard']); // thêm nhãn vào thẻ

    Route::delete('/{cardId}/labels/{labelId}', [LabelController::class, 'removeLabelFromCard']); // xóa nhãn khỏi thẻ

    Route::get('/{cardId}/history', [CardController::class, 'getCardHistory']);
});
// cập nhật nhãn ,Vì trello sẽ không cập nhật nhãn theo thẻ
Route::put('/labels/{labelId}', [LabelController::class, 'updateLabel']);


///Comment
Route::get('/cards/{cardId}/comments', [CommentCardController::class, 'index']); // Lấy danh sách bình luận
Route::post('/comments', [CommentCardController::class, 'addCommentIntoCard']); // Thêm bình luận
Route::delete('/comments/{id}', [CommentCardController::class, 'destroy']); // Xóa bình luận

// 📂 File đính kèm (Attachments)
Route::prefix('/{cardId}/attachments')->group(function () {
    Route::get('/', [AttachmentController::class, 'getAttachments']); // Lấy danh sách tệp đính kèm
    Route::post('/upload', [AttachmentController::class, 'uploadAttachment']); // Upload tệp đính kèm
    Route::post('/uploadcover', [AttachmentController::class, 'uploadCover']); // tải ảnh bìa lên
    Route::delete('/{attachmentId}', [AttachmentController::class, 'deleteAttachment']); // Xóa tệp đính kèm
    Route::patch('/{attachmentId}/update-cover', [AttachmentController::class, 'setCoverImage']); // Đặt tệp làm ảnh bìa
});
// checklists
Route::get('/cards/{cardId}/checklists', [ChecklistController::class, 'index']); // lấy danh sách checkist theo card
Route::post('/cards/{cardId}/checklists', [ChecklistController::class, 'store']); // thêm mới checkist theo card
Route::put('/checklists/{id}', [ChecklistController::class, 'update']); // cập nhật checklist
Route::delete('cards/{cardId}/checklists/{id}', [ChecklistController::class, 'deleteChecklist']); // xóa checklists
// checklist_item
Route::get('/checklist/{checklistId}/item', [ChecklistItemController::class, 'index']); // lấy danh sách checkist theo card
Route::post('/checklist/{checklistId}/item', [ChecklistItemController::class, 'store']); // thêm mới checkist theo card
Route::put('/item/{id}/name', [ChecklistItemController::class, 'updateName']); // cập nhật tên của checklistitem
Route::put('/item/{id}/completed', [ChecklistItemController::class, 'updateStatus']);// cập nhật trạng thái hoàn thành của checklistitem

// Route::delete('/checklists/{id}', [ChecklistItemController::class, 'destroy']);// xóa checklists
Route::get('/users/{userId}/notifications', [CardController::class, 'getUserNotifications']);

// });

