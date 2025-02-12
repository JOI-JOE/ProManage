<?php

use App\Http\Controllers\Api\ColorController;
use App\Http\Controllers\Api\ListController;
use App\Http\Controllers\Api\WorkspaceController;
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
    });
});







































Route::get('/color',[ColorController::class,'index']);

Route::post('/lists', [ListController::class, 'store']);

Route::patch('/lists/{id}/updateName', [ListController::class, 'updateName']);

Route::patch('/lists/{id}/closed', [ListController::class, 'updateClosed']);




Route::get('/lists/{boardId}', [ListController::class, 'index']); // Lấy danh sách theo board

Route::put('/lists/reorder', [ListController::class, 'reorder']); // Cập nhật vị trí kéo thả

Route::put('/lists/{id}/updateColor', [ListController::class, 'updateColor']); 

