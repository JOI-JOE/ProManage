<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ChecklistItemController extends Controller
{
    public function store(Request $request, $checklistId)
    {
        // 1. Validate dữ liệu đầu vào
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // 2. Kiểm tra checklist tồn tại và lấy card ID
        $checklist = DB::table('checklists')->where('id', $checklistId)->first();
        if (!$checklist) {
            return response()->json(['message' => 'Checklist not found'], 404);
        }
        $card = \App\Models\Card::find($checklist->card_id);
        if (!$card) {
            return response()->json(['message' => 'Card not found'], 404);
        }

        // 3. Tạo checklist item mới
        $itemId = DB::table('checklist_items')->insertGetId([
            'checklist_id' => $checklistId,
            'name' => $validated['name'],
            'is_completed' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 4. Lấy lại checklist item vừa tạo
        $item = DB::table('checklist_items')->where('id', $itemId)->first();

        // 5. Ghi log khi tạo checklist item
        $user = auth()->user();
        $userName = $user ? $user->full_name : 'ai đó';
        activity()
            ->causedBy($user)
            ->performedOn($card)
            ->event('created_checklist_item')
            ->withProperties([
                'checklist_item_id' => $item->id,
                'checklist_item_name' => $item->name,
                'checklist_id' => $checklistId,
                'card_id' => $card->id,
            ])
            ->log("{$userName} đã thêm mục '{$item->name}' vào checklist trong card '{$card->title}'.");

        // 6. Trả về response
        return response()->json([
            'id' => $item->id,
            'checklist_id' => $item->checklist_id,
            'name' => $item->name,
            'is_completed' => (bool) $item->is_completed,
            'created_at' => $item->created_at,
            'updated_at' => $item->updated_at,
        ], 201);
    }

    public function update(Request $request, $checklistItemId)
    {
        // 1. Kiểm tra checklist item tồn tại và lấy card
        $item = DB::table('checklist_items')->where('id', $checklistItemId)->first();
        if (!$item) {
            return response()->json(['message' => 'Checklist item not found'], 404);
        }
        $checklist = DB::table('checklists')->where('id', $item->checklist_id)->first();
        if (!$checklist) {
            return response()->json(['message' => 'Checklist not found'], 404);
        }
        $card = \App\Models\Card::find($checklist->card_id);
        if (!$card) {
            return response()->json(['message' => 'Card not found'], 404);
        }

        // 2. Validate dữ liệu
        $validated = $this->validateChecklistItemUpdate($request);

        $user = auth()->user();
        $userName = $user ? $user->full_name : 'ai đó';

        // 3. Cập nhật từng trường nếu có trong request
        if (isset($validated['name'])) {
            $oldName = $item->name;
            $this->updateChecklistItemName($checklistItemId, $validated['name']);
            activity()
                ->causedBy($user)
                ->performedOn($card)
                ->event('updated_checklist_item_name')
                ->withProperties([
                    'checklist_item_id' => $checklistItemId,
                    'old_name' => $oldName,
                    'new_name' => $validated['name'],
                    'card_id' => $card->id,
                ])
                ->log("{$userName} đã cập nhật tên mục từ '{$oldName}' thành '{$validated['name']}' trong card '{$card->title}'.");
        }

        if (isset($validated['is_completed'])) {
            $oldStatus = $item->is_completed;
            $this->updateChecklistItemStatus($checklistItemId, $validated['is_completed']);
            activity()
                ->causedBy($user)
                ->performedOn($card)
                ->event('updated_checklist_item_status')
                ->withProperties([
                    'checklist_item_id' => $checklistItemId,
                    'old_status' => $oldStatus,
                    'new_status' => $validated['is_completed'],
                    'card_id' => $card->id,
                ])
                ->log("{$userName} đã cập nhật trạng thái mục '{$item->name}' thành '" . ($validated['is_completed'] ? 'hoàn thành' : 'chưa hoàn thành') . "' trong card '{$card->title}'.");
        }

        if (array_key_exists('start_date', $validated)) {
            $oldStartDate = $item->start_date;
            $this->updateChecklistItemStartDate($checklistItemId, $validated['start_date']);
            activity()
                ->causedBy($user)
                ->performedOn($card)
                ->event('updated_checklist_item_start_date')
                ->withProperties([
                    'checklist_item_id' => $checklistItemId,
                    'old_start_date' => $oldStartDate,
                    'new_start_date' => $validated['start_date'],
                    'card_id' => $card->id,
                ])
                ->log("{$userName} đã cập nhật ngày bắt đầu mục '{$item->name}' từ '" . ($oldStartDate ?? 'không có') . "' thành '" . ($validated['start_date'] ?? 'không có') . "' trong card '{$card->title}'.");
        }

        if (array_key_exists('end_date', $validated)) {
            $oldEndDate = $item->end_date;
            $this->updateChecklistItemEndDate($checklistItemId, $validated['end_date']);
            activity()
                ->causedBy($user)
                ->performedOn($card)
                ->event('updated_checklist_item_end_date')
                ->withProperties([
                    'checklist_item_id' => $checklistItemId,
                    'old_end_date' => $oldEndDate,
                    'new_end_date' => $validated['end_date'],
                    'card_id' => $card->id,
                ])
                ->log("{$userName} đã cập nhật ngày kết thúc mục '{$item->name}' từ '" . ($oldEndDate ?? 'không có') . "' thành '" . ($validated['end_date'] ?? 'không có') . "' trong card '{$card->title}'.");
        }

        if (array_key_exists('end_time', $validated)) {
            $oldEndTime = $item->end_time;
            $this->updateChecklistItemEndTime($checklistItemId, $validated['end_time']);
            activity()
                ->causedBy($user)
                ->performedOn($card)
                ->event('updated_checklist_item_end_time')
                ->withProperties([
                    'checklist_item_id' => $checklistItemId,
                    'old_end_time' => $oldEndTime,
                    'new_end_time' => $validated['end_time'],
                    'card_id' => $card->id,
                ])
                ->log("{$userName} đã cập nhật thời gian kết thúc mục '{$item->name}' từ '" . ($oldEndTime ?? 'không có') . "' thành '" . ($validated['end_time'] ?? 'không có') . "' trong card '{$card->title}'.");
        }

        if (array_key_exists('reminder', $validated)) {
            $oldReminder = $item->reminder;
            $this->updateChecklistItemReminder($checklistItemId, $validated['reminder']);
            activity()
                ->causedBy($user)
                ->performedOn($card)
                ->event('updated_checklist_item_reminder')
                ->withProperties([
                    'checklist_item_id' => $checklistItemId,
                    'old_reminder' => $oldReminder,
                    'new_reminder' => $validated['reminder'],
                    'card_id' => $card->id,
                ])
                ->log("{$userName} đã cập nhật nhắc nhở mục '{$item->name}' từ '" . ($oldReminder ?? 'không có') . "' thành '" . ($validated['reminder'] ?? 'không có') . "' trong card '{$card->title}'.");
        }

        if (array_key_exists('assignee', $validated)) {
            $oldAssignee = DB::table('checklist_item_user')
                ->where('checklist_item_id', $checklistItemId)
                ->value('user_id');
            $this->updateChecklistItemAssignee($checklistItemId, $validated['assignee']);
            $newAssigneeName = $validated['assignee'] ? \App\Models\User::find($validated['assignee'])->full_name : 'không có';
            $oldAssigneeName = $oldAssignee ? \App\Models\User::find($oldAssignee)->full_name : 'không có';
            activity()
                ->causedBy($user)
                ->performedOn($card)
                ->event('updated_checklist_item_assignee')
                ->withProperties([
                    'checklist_item_id' => $checklistItemId,
                    'old_assignee_id' => $oldAssignee,
                    'new_assignee_id' => $validated['assignee'],
                    'card_id' => $card->id,
                ])
                ->log("{$userName} đã cập nhật người được giao mục '{$item->name}' từ '{$oldAssigneeName}' thành '{$newAssigneeName}' trong card '{$card->title}'.");
        }

        return $this->buildChecklistItemResponse($checklistItemId);
    }

    private function validateChecklistItemUpdate(Request $request)
    {
        return $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'is_completed' => 'sometimes|boolean',
            'start_date' => 'sometimes|nullable|date',
            'end_date' => 'sometimes|nullable|date',
            'end_time' => 'sometimes|nullable|date_format:H:i:s',
            'reminder' => 'sometimes|nullable|date',
            'assignee' => 'sometimes|nullable|exists:users,id',
        ]);
    }

    private function updateChecklistItemName($id, $name)
    {
        DB::table('checklist_items')->where('id', $id)->update([
            'name' => $name,
            'updated_at' => now(),
        ]);
    }

    private function updateChecklistItemStatus($id, $status)
    {
        DB::table('checklist_items')->where('id', $id)->update([
            'is_completed' => $status,
            'updated_at' => now(),
        ]);
    }

    private function updateChecklistItemStartDate($id, $startDate)
    {
        DB::table('checklist_items')->where('id', $id)->update([
            'start_date' => $startDate,
            'updated_at' => now(),
        ]);
    }

    private function updateChecklistItemEndDate($id, $endDate)
    {
        DB::table('checklist_items')->where('id', $id)->update([
            'end_date' => $endDate,
            'updated_at' => now(),
        ]);
    }

    private function updateChecklistItemEndTime($id, $endTime)
    {
        DB::table('checklist_items')->where('id', $id)->update([
            'end_time' => $endTime,
            'updated_at' => now(),
        ]);
    }

    private function updateChecklistItemReminder($id, $reminder)
    {
        DB::table('checklist_items')->where('id', $id)->update([
            'reminder' => $reminder,
            'updated_at' => now(),
        ]);
    }

    private function updateChecklistItemAssignee($id, $userId)
    {
        // Xóa assignee hiện tại (nếu có)
        DB::table('checklist_item_user')->where('checklist_item_id', $id)->delete();

        // Thêm assignee mới nếu $userId không null
        if ($userId !== null) {
            DB::table('checklist_item_user')->insert([
                'checklist_item_id' => $id,
                'user_id' => $userId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    private function buildChecklistItemResponse($id)
    {
        $item = DB::table('checklist_items')->where('id', $id)->first();

        if (!$item) {
            return response()->json(['message' => 'Checklist item not found'], 404);
        }

        // Lấy assignee duy nhất (nếu có)
        $assignee = DB::table('checklist_item_user')
            ->where('checklist_item_id', $id)
            ->value('user_id');

        return response()->json([
            'id' => $item->id,
            'checklist_id' => $item->checklist_id,
            'name' => $item->name,
            'is_completed' => (bool) $item->is_completed,
            'start_date' => $item->start_date,
            'end_date' => $item->end_date,
            'end_time' => $item->end_time,
            'reminder' => $item->reminder,
            'assignee' => $assignee,
            'created_at' => $item->created_at,
            'updated_at' => $item->updated_at,
        ]);
    }

    public function delete($checklistItemId)
    {
        // 1. Kiểm tra checklist item tồn tại và lấy card
        $item = DB::table('checklist_items')->where('id', $checklistItemId)->first();
        if (!$item) {
            return response()->json(['message' => 'Checklist item not found'], 404);
        }
        $checklist = DB::table('checklists')->where('id', $item->checklist_id)->first();
        if (!$checklist) {
            return response()->json(['message' => 'Checklist not found'], 404);
        }
        $card = \App\Models\Card::find($checklist->card_id);
        if (!$card) {
            return response()->json(['message' => 'Card not found'], 404);
        }

        // 2. Ghi log trước khi xóa
        $user = auth()->user();
        $userName = $user ? $user->full_name : 'ai đó';
        activity()
            ->causedBy($user)
            ->performedOn($card)
            ->event('deleted_checklist_item')
            ->withProperties([
                'checklist_item_id' => $checklistItemId,
                'checklist_item_name' => $item->name,
                'checklist_id' => $item->checklist_id,
                'card_id' => $card->id,
            ])
            ->log("{$userName} đã xóa mục '{$item->name}' (ID: {$checklistItemId}) khỏi checklist trong card '{$card->title}'.");

        // 3. Xóa checklist item
        $deleted = DB::table('checklist_items')->where('id', $checklistItemId)->delete();

        if ($deleted) {
            return response()->json(['message' => 'Checklist item deleted'], 200);
        }

        return response()->json(['message' => 'Checklist item not found'], 404);
    }
}
