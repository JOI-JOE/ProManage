<?php

namespace App\Http\Controllers\Api;

use App\Events\CardUpdated;
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

            $card->touch();
            DB::commit();

            broadcast(new ChecklistItemCreated($checklistItem, $card))->toOthers();
            broadcast(new CardUpdated($card))->toOthers();

            return response()->json($checklistItem->fresh(), 201);
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

        $item->delete();
        try {
            $card->touch();
            DB::commit();

            broadcast(new ChecklistItemDeleted($checklistItemId, $checklist->id, $card))->toOthers();
            broadcast(new CardUpdated($card))->toOthers();

            return response()->json(['message' => 'Checklist item deleted'], 200);
        } catch (\Exception $e) {
            Log::error('Failed to delete checklist item: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to delete checklist item'], 500);
        }
    }

    public function update(Request $request, $checklistItemId)
    {
        try {
            // Lấy checklist item và quan hệ liên quan
            $item = ChecklistItem::with('checklist.card')->findOrFail($checklistItemId);
            $checklist = $item->checklist;
            $card = $checklist->card;

            $validated = $this->validateChecklistItemUpdate($request);
            $user = auth()->user();
            $userName = $user?->full_name ?? 'Người dùng không xác định';

            $logData = [];

            // Danh sách field cần kiểm tra
            $attributes = [
                'name' => 'Tên',
                'is_completed' => 'Trạng thái',
                'start_date' => 'Ngày bắt đầu',
                'end_date' => 'Ngày kết thúc',
                'end_time' => 'Thời gian kết thúc',
                'reminder' => 'Nhắc nhở',
            ];

            foreach ($attributes as $field => $label) {
                if (array_key_exists($field, $validated) && $validated[$field] !== $item->{$field}) {
                    $old = $item->{$field};
                    $item->{$field} = $validated[$field];

                    $logData[] = [
                        'field' => $field,
                        'old' => $old,
                        'new' => $validated[$field],
                        'log' => "{$userName} đã cập nhật {$label} mục '{$item->name}' từ '" . ($old ?? 'không có') . "' thành '" . ($validated[$field] ?? 'không có') . "' trong card '{$card->title}'"
                    ];
                }
            }

            // Gán assignee nếu có
            if (array_key_exists('assignee', $validated)) {
                $oldAssigneeId = DB::table('checklist_item_user')
                    ->where('checklist_item_id', $checklistItemId)
                    ->value('user_id');

                $this->updateChecklistItemAssignee($checklistItemId, $validated['assignee']);

                $userIdsToFetch = array_filter([$oldAssigneeId, $validated['assignee']]);
                $users = \App\Models\User::whereIn('id', $userIdsToFetch)->pluck('full_name', 'id');

                $oldAssigneeName = $users[$oldAssigneeId] ?? 'không có';
                $newAssigneeName = $users[$validated['assignee']] ?? 'không có';

                $logData[] = [
                    'field' => 'assignee',
                    'old' => $oldAssigneeName,
                    'new' => $newAssigneeName,
                    'log' => "{$userName} đã cập nhật người được giao mục '{$item->name}' từ '{$oldAssigneeName}' thành '{$newAssigneeName}' trong card '{$card->title}'"
                ];
            }

            $item->save();
            $card->touch();

            // Ghi activity log
            foreach ($logData as $log) {
                activity()
                    ->causedBy($user)
                    ->performedOn($card)
                    ->event("updated_checklist_item_{$log['field']}")
                    ->withProperties([
                        'checklist_item_id' => $checklistItemId,
                        'old' => $log['old'],
                        'new' => $log['new'],
                        'card_id' => $card->id,
                    ])
                    ->log($log['log']);
            }

            DB::commit();

            // Gửi sự kiện realtime
            $response = $this->buildChecklistItemResponse($checklistItemId);
            broadcast(new ChecklistItemUpdated($item, $card))->toOthers();
            broadcast(new CardUpdated($card))->toOthers();

            return $response;
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Checklist item, Checklist hoặc Card không tồn tại'], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Lỗi khi cập nhật checklist item: ' . $e->getMessage());
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
