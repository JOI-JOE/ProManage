<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
// use App\Models\Notification;

class NotificationController extends Controller
{
    public function getNotifications(Request $request)
    {
        $user = $request->user(); // Người dùng hiện tại qua Sanctum
    
        // Lấy tất cả thông báo
        $notifications = $user->notifications()
            ->orderBy('created_at', 'desc') // Sắp xếp mới nhất trước
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'data' => $notification->data, // Dữ liệu thông báo (board_id, message, v.v.)
                    'read_at' => $notification->read_at,
                    'created_at' => $notification->created_at,
                ];
            });
    
        return response()->json([
            'success' => true,
            'data' => $notifications,
        ]);
    }

    // public function markAsRead(Request $request)
    // {
    //     $notification = Notification::find($request->id);
    //     if ($notification) {
    //         $notification->update(['read_at' => now()]);
    //     }
    //     return response()->json(['message' => 'Notification marked as read']);
    // }
}
