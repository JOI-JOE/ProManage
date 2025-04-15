<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ChecklistController extends Controller
{
    /**
     * Hàm phụ để lấy thông tin checklist và các items của nó
     */
    private function getChecklistWithItems($checklistId)
    {
        // Lấy thông tin checklist
        $checklist = DB::table('checklists')
            ->select([
                'checklists.id',
                'checklists.card_id',
                'checklists.name',
                'checklists.created_at',
                'checklists.updated_at',
                DB::raw('(
                    SELECT COUNT(*) 
                    FROM checklist_items 
                    WHERE checklist_items.checklist_id = checklists.id
                ) as total_items'),
                DB::raw('(
                    SELECT COUNT(*) 
                    FROM checklist_items 
                    WHERE checklist_items.checklist_id = checklists.id 
                    AND checklist_items.is_completed = 1
                ) as completed_items')
            ])
            ->where('checklists.id', $checklistId)
            ->first();

        if (!$checklist) {
            return null;
        }

        // Lấy danh sách checklist items
        $checklistItems = DB::table('checklist_items')
            ->select([
                'checklist_items.id',
                'checklist_items.name',
                'checklist_items.start_date',
                'checklist_items.end_date',
                'checklist_items.end_time',
                'checklist_items.reminder',
                'checklist_items.is_completed',
                'checklist_items.created_at',
                'checklist_items.updated_at',
            ])
            ->where('checklist_items.checklist_id', $checklistId)
            ->get()
            ->map(function ($item) {
                $assignees = DB::table('checklist_item_user')
                    ->where('checklist_item_id', $item->id)
                    ->pluck('user_id');

                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'start_date' => $item->start_date,
                    'end_date' => $item->end_date,
                    'end_time' => $item->end_time,
                    'reminder' => $item->reminder,
                    'is_completed' => (bool)$item->is_completed,
                    'assignees' => $assignees,
                    'created_at' => $item->created_at,
                    'updated_at' => $item->updated_at,
                ];
            });

        return [
            'id' => $checklist->id,
            'card_id' => $checklist->card_id,
            'name' => $checklist->name,
            'total_items' => (int)$checklist->total_items,
            'completed_items' => (int)$checklist->completed_items,
            'items' => $checklistItems,
            'created_at' => $checklist->created_at,
            'updated_at' => $checklist->updated_at,
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index($cardId)
    {
        // Kiểm tra card tồn tại
        $cardExists = DB::table('cards')->where('id', $cardId)->exists();
        if (!$cardExists) {
            return response()->json(['message' => 'Card not found'], 404);
        }

        // Lấy tất cả checklists thuộc card_id
        $checklists = DB::table('checklists')
            ->select('id')
            ->where('card_id', $cardId)
            ->get();

        if ($checklists->isEmpty()) {
            return response()->json([]);
        }

        // Lấy chi tiết từng checklist
        $result = $checklists->map(function ($checklist) {
            return $this->getChecklistWithItems($checklist->id);
        })->filter(); // Loại bỏ các giá trị null (nếu checklist không tồn tại)

        return response()->json($result);
    }

/**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, $cardId)
    {
        // Kiểm tra card tồn tại
        $cardModel = \App\Models\Card::find($cardId);
        if (!$cardModel) {
            return response()->json(['message' => 'Card not found'], 404);
        }

        // Validate dữ liệu
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // Tạo checklist mới
        $checklistId = DB::table('checklists')->insertGetId([
            'card_id' => $cardId,
            'name' => $validated['name'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Ghi log
        $user = auth()->user();
        $userName = $user ? $user->full_name : 'ai đó';
        activity()
            ->causedBy($user)
            ->performedOn($cardModel)
            ->event('created_checklist')
            ->withProperties(['checklist_name' => $validated['name'], 'checklist_id' => $checklistId])
            ->log("{$userName} đã tạo checklist '{$validated['name']}' cho card '{$cardModel->title}'");

        // Lấy thông tin checklist để trả về
        $checklistData = [
            'id' => $checklistId,
            'card_id' => $cardId,
            'name' => $validated['name'],
            'total_items' => 0,
            'completed_items' => 0,
            'items' => [],
            'created_at' => now(),
            'updated_at' => now(),
        ];

        return response()->json($checklistData, 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update($checklistId, Request $request)
    {
        // Kiểm tra checklist tồn tại
        $checklist = DB::table('checklists')
            ->where('id', $checklistId)
            ->first();

        if (!$checklist) {
            return response()->json(['message' => 'Checklist not found'], 404);
        }

        // Kiểm tra card tồn tại
        $cardModel = \App\Models\Card::find($checklist->card_id);
        if (!$cardModel) {
            return response()->json(['message' => 'Card not found'], 404);
        }

        // Validate dữ liệu
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // Lưu trạng thái cũ để ghi log
        $oldAttributes = [
            'name' => $checklist->name,
        ];

        // Cập nhật checklist
        $updated = DB::table('checklists')
            ->where('id', $checklistId)
            ->update([
                'name' => $validated['name'],
                'updated_at' => now(),
            ]);

        if (!$updated) {
            return response()->json(['message' => 'Failed to update checklist'], 500);
        }

        // Ghi log
        $user = auth()->user();
        $userName = $user ? $user->full_name : 'ai đó';
        activity()
            ->causedBy($user)
            ->performedOn($cardModel)
            ->event('updated_checklist')
            ->withProperties([
                'checklist_id' => $checklistId,
                'old' => $oldAttributes,
                'new' => ['name' => $validated['name']],
            ])
            ->log("{$userName} đã cập nhật checklist '{$oldAttributes['name']}' thành '{$validated['name']}' trong card '{$cardModel->title}'.");

        // Lấy thông tin checklist sau khi cập nhật
        $updatedChecklist = $this->getChecklistWithItems($checklistId);
        if (!$updatedChecklist) {
            return response()->json(['message' => 'Failed to retrieve updated checklist'], 500);
        }

        return response()->json($updatedChecklist);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function delete($checklistId)
    {
        // Kiểm tra checklist tồn tại
        $checklist = DB::table('checklists')
            ->where('id', $checklistId)
            ->first();

        if (!$checklist) {
            return response()->json(['message' => 'Checklist not found'], 404);
        }

        // Kiểm tra card tồn tại
        $cardModel = \App\Models\Card::find($checklist->card_id);
        if (!$cardModel) {
            return response()->json(['message' => 'Card not found'], 404);
        }

        // Ghi log trước khi xóa
        $user = auth()->user();
        $userName = $user ? $user->full_name : 'ai đó';
        activity()
            ->causedBy($user)
            ->performedOn($cardModel)
            ->event('deleted_checklist')
            ->withProperties(['checklist_name' => $checklist->name, 'checklist_id' => $checklistId])
            ->log("{$userName} đã xóa checklist '{$checklist->name}' trong card '{$cardModel->title}'.");

        // Xóa checklist
        $deleted = DB::table('checklists')
            ->where('id', $checklistId)
            ->delete();

        if ($deleted) {
            return response()->json(['message' => 'Checklist deleted successfully'], 200);
        }

        return response()->json(['message' => 'Failed to delete checklist'], 500);
    }


}
