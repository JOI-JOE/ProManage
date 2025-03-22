<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendChecklistItemNotification;
use App\Models\ChecklistItem;
use App\Models\User;
use App\Notifications\ChecklistItemMemberNotification;
use Illuminate\Http\Request;
use App\Events\ChecklistItemMemberUpdated;

class ChecklistItemMemberController extends Controller
{

    public function getMembers($id)
    {
        $item = ChecklistItem::with('members')->findOrFail($id);
        return response()->json([
            'success' => true,
            'data' => $item->members
        ]);
    }

    public function toggleMember(Request $request, $id)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $userId = $request->user_id;
        $checklistItem = ChecklistItem::find($id);
        $user = User::findOrFail($userId);


        $isMember = $checklistItem->members()->where('user_id', $userId)->exists();

        if ($isMember) {
            // Nếu đã là thành viên → xoá khỏi checklist item
            $checklistItem->members()->detach($userId);

            broadcast(new ChecklistItemMemberUpdated($checklistItem, $user, 'removed'))->toOthers();


            // $user->notify(new ChecklistItemMemberNotification($checklistItem, $user, 'removed')); 

            
            return response()->json([
                'message' => 'Đã xoá thành viên khỏi checklist item.',
                'removed_user_id' => $userId,
            ]);
        } else {
            // Nếu chưa có → thay thế thành viên cũ và gán user mới
            $checklistItem->members()->sync([$userId]);

            broadcast(new ChecklistItemMemberUpdated($checklistItem, $user, 'added'))->toOthers();

            // $user->notify(new ChecklistItemMemberNotification($checklistItem, $user, 'added')); 

            SendChecklistItemNotification::dispatch($checklistItem, $user, 'added', auth()->user());

            return response()->json([
                'message' => 'Đã thêm thành viên (và thay thế thành viên cũ nếu có).',
                'member' => User::find($userId),
            ]);
        }
    }

}
