<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }
    function shouldReturnJson($request, Throwable $e)
    {
        // Kiểm tra nếu request là AJAX hoặc yêu cầu JSON
        if ($request->expectsJson()) {
            return true;
        }

        // Kiểm tra nếu lỗi có liên quan đến API (có thể dựa trên URL hoặc route name)
        if ($request->is('api/*')) {
            return true;
        }

        // Bạn có thể thêm các điều kiện kiểm tra khác nếu cần thiết
        return false;
    }
}
