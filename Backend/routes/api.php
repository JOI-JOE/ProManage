<?php

use App\Http\Controllers\Admin\ColorController;
use App\Http\Controllers\Api\BoardController;
use App\Http\Controllers\Api\BoardMemberController;
use App\Http\Controllers\api\CardController;
use App\Http\Controllers\Api\CommentCardController;
use App\Http\Controllers\Api\ListController;
use App\Http\Controllers\Api\WorkspaceController;
use App\Http\Controllers\Api\WorkspaceInvitationsController;
use App\Http\Controllers\Api\WorkspaceMembersController;
use App\Http\Controllers\Auth\AuthController;
// use App\Http\Controllers\ColorController;
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

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});


Route::post('/register', [AuthController::class, 'handleRegister']);
Route::post('/login', [AuthController::class, 'handleLogin']);

Route::get('/auth/redirect', [AuthController::class, 'loginGitHub']);
Route::get('/auth/callback', [AuthController::class, 'handleLoginGitHub']);

Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);


Route::prefix('v1')->group(function () {
    Route::controller(WorkspaceController::class)->group(function () {
        // Get all workspace
        Route::get('/workspaces', 'index');
        // Get workspace by 
        Route::get('/workspaces/{id}', 'show');
        // Create new workspace
        Route::post('/workspaces', 'store');
        // Delete workspace
        Route::delete('/workspaces/{workspace}', 'destroy');

        // Update infor workspace
        Route::put('/workspaces/{workspace}', 'updateWorkspaceInfo')->name('wk.updateWorkspaceInfo');
    });

    Route::controller(WorkspaceMembersController::class)->group(function () {
        Route::get('/workspaces/{idWorkspace}/members', 'getAllWorkspaceMembersById');
        // https://trello.com/1/organization/678b57031faba8dd978f0dee/paidAccount/addMembersPriceQuotes
        Route::post('/workspaces/{idWorkspace}/addMembers', 'inviteMemberToWorkspace');
    });

    Route::controller(WorkspaceInvitationsController::class)->group(function () {
        Route::get("/search/members", 'searchNewMembersToWorkspace');
        Route::post('/workspace/{idWorkspace}/addMember',  'inviteMemberToWorkspace');

        // ở đây sẽ có hai trường hợp hợp
        // 1. nếu là id -> sẽ được add thẳng vào workspace + email
        // https://trello.com/1/organizations/678b57031faba8dd978f0dee/members/678d05e057279698f99306bf
        Route::put('workspaces/{idWorkspace}/members/{idMember}', 'sendInvitationById');

        // 2. nếu là email -> sẽ add vào workspace nhưng -> 1 là tài khoản đã có / 2 tài khoản chưa có trên trello
        // 
        // https://trello.com/1/organizations/678b57031faba8dd978f0dee/members
        Route::put('workspaces/{idWorkspace}/members', 'sendInvitationByEmail');
    });
});


Route::get('/color', [ColorController::class, 'index']);
Route::get('/workspaces/{id}/boards', [ListController::class, 'getBoardsByWorkspace']);

Route::prefix('lists')->group(function () {
    Route::post('/', [ListController::class, 'store']);
    Route::patch('/{id}/updateName', [ListController::class, 'updateName']);
    Route::patch('/{id}/closed', [ListController::class, 'updateClosed']);
    Route::get('/{boardId}', [ListController::class, 'index']); // Lấy danh sách theo board
    Route::put('/reorder', [ListController::class, 'reorder']); // Cập nhật vị trí kéo thả
    Route::put('/{id}/updateColor', [ListController::class, 'updateColor']);
    Route::post('/dragging', [ListController::class, 'dragging']);
});



Route::resource('boards', BoardController::class);

// Routes quản lý bảng
Route::prefix('boards/{id}/')->group(function () {
    Route::patch('thumbnail', [BoardController::class, 'updateThumbnail']);
    Route::patch('marked', [BoardController::class, 'updateIsMarked']);
    Route::patch('archive', [BoardController::class, 'updateArchive']);
    Route::patch('visibility', [BoardController::class, 'updateVisibility']);
    Route::get('creater', [BoardController::class, 'showCreated']);  // Route cho người tạo bảng 
});

// Routes cho thành viên bảng
Route::prefix('boards/{boardId}/members')->group(function () {
    Route::post('', [BoardMemberController::class, 'addMember']);
    Route::put('{userId}/role', [BoardMemberController::class, 'updateMemberRole']);
});

// Route cho bảng đã xóa
Route::get('/trashes', [BoardController::class, 'trash']);

/// Route card

Route::prefix('cards')->group(function () {
    Route::post('/', [CardController::class, 'store']);
    // Route::patch('/{id}/updateName', [ListController::class, 'updateName']);
    // Route::patch('/{id}/closed', [ListController::class, 'updateClosed']);
    // Route::get('/{boardId}', [ListController::class, 'index']); // Lấy danh sách theo board
    // Route::put('/reorder', [ListController::class, 'reorder']); // Cập nhật vị trí kéo thả
    // Route::put('/{id}/updateColor', [ListController::class, 'updateColor']);
    // Route::post('/dragging', [ListController::class, 'dragging']);
});



/// Route cho card

///Comment 

Route::get('/cards/{cardId}/comments', [CommentCardController::class, 'index']); // Lấy danh sách bình luận
Route::post('/comments', [CommentCardController::class, 'addCommentIntoCard']); // Thêm bình luận
Route::delete('/comments/{id}', [CommentCardController::class, 'destroy']); // Xóa bình luận

