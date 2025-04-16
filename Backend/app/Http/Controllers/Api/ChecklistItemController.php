<?php

namespace App\Http\Controllers\Api;

use App\Events\ChecklistItemCreated;
use App\Events\ChecklistItemUpdated;
use App\Events\ChecklistItemDeleted;
use App\Http\Controllers\Controller;
use App\Models\Card;
use App\Models\Checklist;
use App\Models\ChecklistItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ChecklistItemController extends Controller
{
    public function store(Request $request, $checklistId)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $checklist = Checklist::find($checklistId);
        if (!$checklist) {
            return response()->json(['message' => 'Checklist not found'], 404);
        }

        $card = Card::find($checklist->card_id);
        if (!$card) {
            return response()->json(['message' => 'Card not found'], 404);
        }

        try {
            $checklistItem = ChecklistItem::create([
                'checklist_id' => $checklistId,
                'name' => $validated['name'],
                'is_completed' => false,
            ]);

            broadcast(new ChecklistItemCreated($checklistItem, $card, auth()->user()))->toOthers();

            return response()->json([
                'id' => $checklistItem->id,
                'checklist_id' => $checklistItem->checklist_id,
                'name' => $checklistItem->name,
                'is_completed' => $checklistItem->is_completed,
                'start_date' => $checklistItem->start_date,
                'end_date' => $checklistItem->end_date,
                'end_time' => $checklistItem->end_time,
                'reminder' => $checklistItem->reminder,
                'assignee' => null,
                'created_at' => $checklistItem->created_at,
                'updated_at' => $checklistItem->updated_at,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to create checklist item: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to create checklist item'], 500);
        }
    }

    public function delete($checklistItemId)
    {
        $item = ChecklistItem::find($checklistItemId);
        if (!$item) {
            return response()->json(['message' => 'Checklist item not found'], 404);
        }

        $checklist = Checklist::find($item->checklist_id);
        if (!$checklist) {
            return response()->json(['message' => 'Checklist not found'], 404);
        }

        $card = Card::find($checklist->card_id);
        if (!$card) {
            return response()->json(['message' => 'Card not found'], 404);
        }

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

        try {
            $item->delete();

            broadcast(new ChecklistItemDeleted(
                $checklistItemId,
                $item->checklist_id,
                $card->id,
                $user ? $user->id : null
            ))->toOthers();

            return response()->json(['message' => 'Checklist item deleted'], 200);
        } catch (\Exception $e) {
            Log::error('Failed to delete checklist item: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to delete checklist item'], 500);
        }
    }

    public function update(Request $request, $checklistItemId)
    {
        $item = ChecklistItem::find($checklistItemId);
        if (!$item) {
            return response()->json(['message' => 'Checklist item not found'], 404);
        }

        $checklist = Checklist::find($item->checklist_id);
        if (!$checklist) {
            return response()->json(['message' => 'Checklist not found'], 404);
        }

        $card = Card::find($checklist->card_id);
        if (!$card) {
            return response()->json(['message' => 'Card not found'], 404);
        }

        $validated = $this->validateChecklistItemUpdate($request);
        $user = auth()->user();
        $userName = $user ? $user->full_name : 'Người dùng không xác định';

        try {
            if (isset($validated['name'])) {
                $oldName = $item->name;
                $item->name = $validated['name'];
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
                $item->is_completed = $validated['is_completed'];
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
                $item->start_date = $validated['start_date'];
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
                $item->end_date = $validated['end_date'];
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
                $item->end_time = $validated['end_time'];
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
                $item->reminder = $validated['reminder'];
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
                $newAssigneeName = $validated['assignee']
                    ? \App\Models\User::find($validated['assignee'])->full_name ?? 'không xác định'
                    : 'không có';
                $oldAssigneeName = $oldAssignee
                    ? \App\Models\User::find($oldAssignee)->full_name ?? 'không xác định'
                    : 'không có';
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

            $item->save();

            $response = $this->buildChecklistItemResponse($checklistItemId);
            $checklistItemData = $response->getData(true);

            broadcast(new ChecklistItemUpdated($checklistItemData, $card, auth()->user()))->toOthers();

            return $response;
        } catch (\Exception $e) {
            Log::error('Failed to update checklist item: ' . $e->getMessage());
            return response()->json(['message' => 'Không thể cập nhật mục do lỗi'], 500);
        }
    }

    private function validateChecklistItemUpdate(Request $request)
    {
        return $request->validate([
            'name' => 'sometimes|string|max:255',
            'is_completed' => 'sometimes|boolean',
            'start_date' => 'sometimes|nullable|date',
            'end_date' => 'sometimes|nullable|date',
            'end_time' => 'sometimes|nullable|date_format:H:i:s',
            'reminder' => 'sometimes|nullable|date',
            'assignee' => 'sometimes|nullable|exists:users,id',
        ], [
            'name.max' => 'Tên mục không được vượt quá 255 ký tự.',
            'start_date.date' => 'Ngày bắt đầu phải là định dạng ngày hợp lệ.',
            'end_date.date' => 'Ngày kết thúc phải là định dạng ngày hợp lệ.',
            'end_time.date_format' => 'Thời gian kết thúc phải có định dạng H:i:s.',
            'reminder.date' => 'Nhắc nhở phải là định dạng ngày hợp lệ.',
            'assignee.exists' => 'Người được giao không tồn tại.',
        ]);
    }

    private function updateChecklistItemAssignee($id, $userId)
    {
        DB::table('checklist_item_user')->where('checklist_item_id', $id)->delete();

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
        try {
            $item = ChecklistItem::find($id);
            if (!$item) {
                return response()->json(['message' => 'Checklist item not found'], 404);
            }

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
        } catch (\Exception $e) {
            Log::error('Failed to build checklist item response: ' . $e->getMessage());
            return response()->json(['message' => 'Server error'], 500);
        }
    }
}
