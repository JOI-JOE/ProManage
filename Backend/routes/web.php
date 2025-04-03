<?php

// use App\Http\Controllers\UserController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ColorController;
use App\Http\Controllers\Auth\AuthController;
use App\Models\User;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    $userId = '18016799-2e6c-45cc-9f14-06e64cf424f4';
    $user = User::find($userId);

    return view('welcome');
});

// Route::resource('users',UserController::class);




Route::get('/auth/redirect', [AuthController::class, 'loginGitHub']);
Route::get('/auth/callback', [AuthController::class, 'handleLoginGitHub']);

Route::prefix('admin')->as('admin.')->group(function(){

    Route::get('/', function () {
        return view('admin.dashboard');
    });

    Route::prefix('users')
        ->as('users.')
        ->group(function () {
            Route::get('/', [UserController::class, 'index'])->name('index');
            Route::get('create', [UserController::class, 'create'])->name('create');
            Route::post('store', [UserController::class, 'store'])->name('store');
            Route::get('show/{user}', [UserController::class, 'show'])->name('show');
            Route::get('{user}/edit', [UserController::class, 'edit'])->name('edit');
            Route::put('{user}/update', [UserController::class, 'update'])->name('update');
            Route::delete('{user}/destroy', [UserController::class, 'destroy'])->name('destroy');


            Route::get('import', [UserController::class, 'import'])->name('import');
            Route::post('import', [UserController::class, 'importExcelData'])->name('importExcelData');

            Route::get('export', [UserController::class, 'export'])->name('export');

            Route::get('search', [UserController::class, 'search'])->name('search');
        });
    Route::prefix('colors')
        ->as('colors.')
        ->group(function () {
            Route::get('/', [ColorController::class, 'index'])->name('index');
            Route::get('create', [ColorController::class, 'create'])->name('create');
            Route::post('store', [ColorController::class, 'store'])->name('store');

            Route::get('{color}/edit', [ColorController::class, 'edit'])->name('edit');
            Route::put('{color}/update', [ColorController::class, 'update'])->name('update');
            Route::delete('{color}/destroy', [ColorController::class, 'destroy'])->name('destroy');
        });
});
