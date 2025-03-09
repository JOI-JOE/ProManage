<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CheckList;
use App\Models\ChecklistItem;
use Illuminate\Http\Request;

class ChecklistItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    // Lấy checklist_item theo checklist
    public function getChecklistItems($checklistId)
    {
        $checklist = CheckList::find($checklistId);

        return response()->json([
            'status' => 'success',
            'data' => $checklist->items // Sử dụng quan hệ items từ model Checklist
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'checklist_id' => 'required|exists:checklists,id',
            'name' => 'required|string',
        ]);

        // Tạo mới CheckListItem
        $checklistItem = ChecklistItem::create($validatedData);

        return response()->json([
            'status' => true,
            'message' => 'Thêm mục checklist thành công!',
            'data' => $checklistItem
        ], 201);
    }

    /**
     * Display the specified resource.
     */


    /**
     * Update the specified resource in storage.
     */
    public function updateName(Request $request, $id)
    {
        // Validate dữ liệu đầu vào
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // Tìm ChecklistItem và cập nhật tên
        $item = ChecklistItem::findOrFail($id);
        $item->update(['name' => $validated['name']]);

        // Trả về phản hồi JSON
        return response()->json([
            'status' => true,
            'message' => 'Cập nhật thành công',
            'data' => $item
        ], 200); // HTTP status code 200 (OK)
    }
    // hàm tính toán phần trăm
    public function calculateCompletionRate($checklistId)
    {
        $totalItems = ChecklistItem::where('checklist_id', $checklistId)->count();
        // lấy tổng số checklist_item theo checklist_id
        $completedItems = ChecklistItem::where('checklist_id', $checklistId)->where('is_completed', true)->count();
        // lấy tổng số checklist_item theo checklist_id có trạng thái hoàn thành bằng true

        return $totalItems > 0 ? round(($completedItems / $totalItems) * 100, 2) : 0;
        // nếu $totalItem>0 thì tính toán  và làm tròn 2 số thập phân còn ngược lại thì trả về o%
    }
    // cập nhật trạng thái hoàn thành
    public function toggleCompletionStatus($id)
    {
        try {
            // Tìm item hoặc trả về lỗi nếu không tồn tại
            $item = ChecklistItem::findOrFail($id);

            // Đảo ngược trạng thái hiện tại (false -> true, true -> false)
            $newStatus = !$item->is_completed;
            $item->update([
                'is_completed' => $newStatus,
            ]);

            // Lấy thông tin user
            $user_name = auth()->user()?->user_name ?? 'ai đó';
            $statusText = $newStatus ? 'hoàn tất' : 'chưa hoàn tất';

            // Ghi log nếu trạng thái thay đổi
            // activity()
            //     ->causedBy(auth()->user())
            //     ->performedOn($item->checklist)
            //     ->event('updated_checklist_status')
            //     ->withProperties([
            //         'checklist_id' => $item->checklist_id,
            //         'item_title' => $item->name,
            //         'status' => $statusText,
            //     ])
            //     ->log("{$user_name} đã đánh dấu '{$item->name}' là {$statusText}");

            // Tính phần trăm hoàn thành của checklist chứa item này
            $completionRate = $this->calculateCompletionRate($item->checklist_id) . '%';

            return response()->json([
                'status' => true,
                'message' => 'Cập nhật trạng thái thành công',
                'data' => $item,
                'completion_rate' => $completionRate,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi cập nhật trạng thái',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        // Tìm ChecklistItem theo id, nếu không tìm thấy sẽ tự động trả về lỗi 404
        $item = ChecklistItem::findOrFail($id);

        // Xóa ChecklistItem
        $item->delete();

        // Trả về phản hồi thành công
        return response()->json([
            'status' => true,
            'message' => 'Xóa ChecklistItem thành công!',
        ], 200);
    }
}
