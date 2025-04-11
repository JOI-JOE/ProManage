<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\PasswordResetMail;
use App\Models\PasswordReset;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function sendResetLink(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['error' => 'Email không tồn tại'], 400);
        }

        $token = Str::random(10);

        // Lưu mã code vào bảng password_resets
        PasswordReset::updateOrInsert(
            ['email' => $request->email],
            ['token' => $token, 'created_at' => now()]
        );

        // Gửi email chứa mã code
        Mail::to($request->email)->send(new PasswordResetMail($token));

        return response()->json(['message' => 'Mã xác thực đã được gửi qua email'], 200);
    }
    public function checkResetCode(Request $request)
    {
        $email = $request->email;
        $code = $request->code;
        // Kiểm tra mã code và email trong bảng password_resets
        $reset = PasswordReset::where('email', $email)
            ->where('token', $code)
            ->first();

        if (!$reset) {
            return response()->json(['error' => 'Mã xác thực không đúng'], 400);
        }

        return response()->json(['message' => 'Mã xác thực hợp lệ'], 200);
        // Nếu mã xác thực hợp lệ, trả về đối tượng reset để tiếp tục xử lý
    }
    public function updatePassword(Request $request)
    {
        $email = $request->email;
        $password = $request->password;

        // Cập nhật mật khẩu của người dùng
        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json(['error' => 'Người dùng không tồn tại'], 404);
        }

        $user->password = bcrypt($password);
        $user->save();

        // Xóa mã code khỏi bảng password_resets sau khi đổi mật khẩu
        PasswordReset::where('email', $email)->delete();

        return response()->json(['message' => 'Mật khẩu đã được cập nhật'], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
}
