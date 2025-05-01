<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'full_name' => 'nullable|string|max:50|unique:users,full_name,' . $user->id,
            'biography' => 'nullable|string|max:500',
        ]);

        // Cập nhật thông tin
        $user->full_name = $validated['full_name'] ?? $user->full_name;
        $user->biography = $validated['biography'] ?? $user->biography;
        $user->save();

        return response()->json([
            'message' => 'Cập nhật thông tin thành công!',
            'user' => $user,
        ]);
    }

    public function getUserById()
    {
        $user = Auth::user();

        return response()->json([
            'user' => $user,
        ]);
    }
}
