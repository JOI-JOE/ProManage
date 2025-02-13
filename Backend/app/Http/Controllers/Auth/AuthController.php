<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{


    ///// Login
    public function handleLogin(Request $request)
    {

        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        // Kiểm tra xem email có tồn tại không
        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'Email không tồn tại'], 404);
        }

        // Kiểm tra mật khẩu
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Mật khẩu không đúng'], 401);
        }

        // $user = Auth::user();

        // Tạo token sau khi xác thực thành công
        $token = $user->createToken('auth_token')->plainTextToken;
        
        $user = Auth::user();
        // Auth::login($user);
        return response()->json([
            'message' => 'Đăng nhập thành công',
            'token' => $token,
            'user' => $user

        ]);
    }



    // Register
    public function handleRegister(Request $request)
    {
        // Validate dữ liệu đầu vào
        $validated = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'user_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validated->fails()) {
            return response()->json(['errors' => $validated->errors()], 400);
        }

        // Tạo người dùng mới
        $user = User::create([
            'full_name' => $request->full_name,
            'user_name' => $request->user_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Tạo token cho người dùng mới
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }

    ////// Logout
    public function logout(Request $request)
    {

        //   Auth::logout();

        //   request()->session()->invalidate();

        //   request()->session()->regenerateToken();

        //   return redirect()->route('home');
        $request->user()->tokens()->delete(); // Xóa tất cả token của user
        return response()->json(['message' => 'Logged out successfully']);
    }
}
