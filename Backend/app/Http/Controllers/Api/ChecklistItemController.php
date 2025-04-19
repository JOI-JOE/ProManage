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

            broadcast(new ChecklistItemCreated($checklistItem, $card, auth()->user()))->toOthers();
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

        try {
            $item->delete();
            
            $card->touch();
            DB::commit();

            broadcast(new ChecklistItemDeleted($checklistItemId, $card))->toOthers();
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
            // Tìm checklist item cùng với card liên quan
            $item = ChecklistItem::with('checklist.card')->findOrFail($checklistItemId);
            $checklist = $item->checklist;
            $card = $checklist->card;

            $validated = $this->validateChecklistItemUpdate($request);
            $user = auth()->user();
            $userName = $user ? $user->full_name : 'Người dùng không xác định';

            $changes = []; // Chứa các thay đổi sẽ được log
            $logData = []; // Chứa thông tin cho log activity

            // Tạo mảng các thuộc tính cần được kiểm tra và cập nhật
            $attributes = [
                'name' => 'Tên',
                'is_completed' => 'Trạng thái',
                'start_date' => 'Ngày bắt đầu',
                'end_date' => 'Ngày kết thúc',
                'end_time' => 'Thời gian kết thúc',
                'reminder' => 'Nhắc nhở',
                'assignee' => 'Người được giao',
            ];

            // Xử lý từng thuộc tính và cập nhật
            foreach ($attributes as $field => $label) {
                if (array_key_exists($field, $validated)) {
                    $oldValue = $item->{$field};
                    $item->{$field} = $validated[$field];

                    $changes[$field] = [
                        'old' => $oldValue,
                        'new' => $validated[$field],
                        'label' => $label
                    ];

                    // Lưu log cho thay đổi
                    $logData[] = [
                        'field' => $field,
                        'old' => $oldValue,
                        'new' => $validated[$field],
                        'log' => "{$userName} đã cập nhật {$label} mục '{$item->name}' từ '" . ($oldValue ?? 'không có') . "' thành '" . ($validated[$field] ?? 'không có') . "' trong card '{$card->title}'"
                    ];
                }
            }

            // Cập nhật assignee
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

                // Ghi log cho assignee
                $logData[] = [
                    'field' => 'assignee',
                    'old' => $oldAssigneeName,
                    'new' => $newAssigneeName,
                    'log' => "{$userName} đã cập nhật người được giao mục '{$item->name}' từ '{$oldAssigneeName}' thành '{$newAssigneeName}' trong card '{$card->title}'"
                ];
            }

            // Lưu checklist item và log activity
            $item->save();

            // Log tất cả thay đổi đã được xác định
            foreach ($logData as $logItem) {
                activity()
                    ->causedBy($user)
                    ->performedOn($card)
                    ->event('updated_checklist_item_' . $logItem['field'])
                    ->withProperties([
                        'checklist_item_id' => $checklistItemId,
                        'old' => $logItem['old'],
                        'new' => $logItem['new'],
                        'card_id' => $card->id,
                    ])
                    ->log($logItem['log']);
            }

            // Trả về thông tin checklist item đã cập nhật
            $response = $this->buildChecklistItemResponse($checklistItemId);
            $checklistItemData = $response->getData(true);

            $card->touch();  // Cập nhật trường updated_at
            DB::commit();  // Cam kết thay đổi

            // Broadcast sự kiện
            broadcast(new ChecklistItemUpdated($checklistItemData, $card, auth()->user()))->toOthers();
            broadcast(new CardUpdated($card))->toOthers();

            return $response;
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Checklist item, Checklist or Card not found'], 404);
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
