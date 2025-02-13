<?php

use App\Http\Controllers\Admin\ColorController;
use App\Http\Controllers\Api\BoardController;
use App\Http\Controllers\Api\BoardMemberController;
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
        Route::post('/workspaces/{idWorkspace}/addMembers', 'addMembers');
    });

    Route::controller(WorkspaceInvitationsController::class)->group(function () {});
});


Route::get('/color', [ColorController::class, 'index']);

Route::prefix('lists')->group(function () {
    Route::post('/', [ListController::class, 'store']);
    Route::patch('/{id}/updateName', [ListController::class, 'updateName']);
    Route::patch('/{id}/closed', [ListController::class, 'updateClosed']);
    Route::get('/{boardId}', [ListController::class, 'index']); // Lấy danh sách theo board
    Route::put('/reorder', [ListController::class, 'reorder']); // Cập nhật vị trí kéo thả
    Route::put('/{id}/updateColor', [ListController::class, 'updateColor']);
});


Route::resource('boards', BoardController::class);
Route::get('/trashs', [BoardController::class, 'trash']);
Route::patch('/boards/{id}/thumbnail', [BoardController::class, 'updateThumbnail']);
Route::patch('/boards/{id}/marked', [BoardController::class, 'UpdateIs_marked']);
Route::patch('/boards/{id}/archive', [BoardController::class, 'UpdateArchive']);
Route::patch('/boards/{id}/visibility', [BoardController::class, 'updateVisibility']);

Route::post('/boards/{boardId}/members', [BoardMemberController::class, 'addMember']);
Route::put('/boards/{boardId}/members/{userId}/role', [BoardMemberController::class, 'updateMemberRole']);
