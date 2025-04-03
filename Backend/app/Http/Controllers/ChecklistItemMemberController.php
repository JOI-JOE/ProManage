<?php

namespace App\Http\Controllers;

use App\Models\ChecklistItem;
use App\Models\User;
use Illuminate\Http\Request;

class ChecklistItemMemberController extends Controller
{
    public function toggleMember(Request $request, ChecklistItem $checklistItem)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $userId = $request->user_id;

        $isMember = $checklistItem->members()->where('user_id', $userId)->exists();

        if ($isMember) {
            // Nếu đã là thành viên → xoá khỏi checklist item
            $checklistItem->members()->detach($userId);

            return response()->json([
                'message' => 'Đã xoá thành viên khỏi checklist item.',
                'removed_user_id' => $userId,
            ]);
        } else {
            // Nếu chưa có → thay thế thành viên cũ và gán user mới
            $checklistItem->members()->sync([$userId]);

            return response()->json([
                'message' => 'Đã thêm thành viên (và thay thế thành viên cũ nếu có).',
                'member' => User::find($userId),
            ]);
        }
    }

}
