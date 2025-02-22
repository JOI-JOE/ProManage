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
    public function index(Checklist $checklist)
    {
        return response()->json([
            'status' => 'success',
            'data' => $checklist->items
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request,  $checklistId)
    {
        $checklist = CheckList::find($checklistId);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'checklist_id' => 'integer|exists:checklists,id',
            'is_completed' => 'boolean'
        ]);

        $item = ChecklistItem::create([
            'name' => $validated['name'],
            'checklist_id' => $checklist->id,
            'is_completed' => false,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'thêm mới thành công',
            'data' => $item
        ]);
    }

    /**
     * Display the specified resource.
     */


    /**
     * Update the specified resource in storage.
     */
    public function updateName(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $item = ChecklistItem::findOrFail($id);
        $item->update([
            'name' => $validated['name'],
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Cập nhật thành công',
            'data' => $item
        ]);
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
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'is_completed' => 'boolean',
        ]);

        $item = ChecklistItem::findOrFail($id);
        $item->update([
            'is_completed' => $validated['is_completed'],
        ]);

        $completionRate = $this->calculateCompletionRate($item->checklist_id).'%';

        return response()->json([
            'status' => true,
            'message' => 'Cập nhật trạng thái thành công',
            'data'=>$item,
            'completion_rate' => $completionRate // tính phần trăm
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        
        //
    }
}
