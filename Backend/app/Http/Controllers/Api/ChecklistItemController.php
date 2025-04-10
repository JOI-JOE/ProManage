<?php

namespace App\Http\Controllers\Api;

use App\Events\ChecklistItemCreated;
use App\Events\ChecklistItemDeleted;
use App\Events\ChecklistItemToggle;
use App\Events\ChecklistItemUpdated;
use App\Http\Controllers\Controller;
use App\Jobs\SendReminderNotificationChecklistItem;
use App\Models\CheckList;
use App\Models\ChecklistItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ChecklistItemController extends Controller
{

    /// ------------------------------------------------
    public function store(Request $request, $checklistId)
    {
        // 1. Validate dữ liệu đầu vào
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // 2. Tạo checklist item mới
        $itemId = DB::table('checklist_items')->insertGetId([
            'checklist_id' => $checklistId,
            'name' => $validated['name'],
            'is_completed' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 3. Lấy lại checklist item vừa tạo
        $item = DB::table('checklist_items')->where('id', $itemId)->first();

        // 4. Trả về response
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
        $validated = $this->validateChecklistItemUpdate($request);

        // Cập nhật từng trường nếu có trong request
        if (isset($validated['name'])) {
            $this->updateChecklistItemName($checklistItemId, $validated['name']);
        }

        if (isset($validated['is_completed'])) {
            $this->updateChecklistItemStatus($checklistItemId, $validated['is_completed']);
        }

        if (array_key_exists('start_date', $validated)) {
            $this->updateChecklistItemStartDate($checklistItemId, $validated['start_date']);
        }

        if (array_key_exists('end_date', $validated)) {
            $this->updateChecklistItemEndDate($checklistItemId, $validated['end_date']);
        }

        if (array_key_exists('end_time', $validated)) {
            $this->updateChecklistItemEndTime($checklistItemId, $validated['end_time']);
        }

        if (array_key_exists('reminder', $validated)) {
            $this->updateChecklistItemReminder($checklistItemId, $validated['reminder']);
        }

        if (array_key_exists('assignee', $validated)) { // Đổi từ 'assignees' thành 'assignee'
            $this->updateChecklistItemAssignee($checklistItemId, $validated['assignee']);
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
            'assignee' => 'sometimes|nullable|exists:users,id', // Chỉ một user_id, có thể null
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
            ->value('user_id'); // Lấy giá trị user_id duy nhất hoặc null

        return response()->json([
            'id' => $item->id,
            'checklist_id' => $item->checklist_id,
            'name' => $item->name,
            'is_completed' => (bool) $item->is_completed,
            'start_date' => $item->start_date,
            'end_date' => $item->end_date,
            'end_time' => $item->end_time,
            'reminder' => $item->reminder,
            'assignee' => $assignee, // Trả về một user_id hoặc null
            'created_at' => $item->created_at,
            'updated_at' => $item->updated_at,
        ]);
    }

    ///-----------------------------------------------------------
    /**
     * Display a listing of the resource.
     */
    // Lấy checklist_item theo checklist
    // public function getChecklistItems($checklistId)
    // {
    //     $checklist = CheckList::find($checklistId);

    //     return response()->json([
    //         'message'=>"lấy dữ liệu thành công",
    //         'status' => 'success',
    //         'data' => $checklist->items // Sử dụng quan hệ items từ model Checklist
    //     ], 200);
    // }

    // /**
    //  * Store a newly created resource in storage.
    //  */
    // public function store(Request $request)
    // {
    //     $validatedData = $request->validate([
    //         'checklist_id' => 'required|exists:checklists,id',
    //         'name' => 'required|string',
    //     ]);

    //     // Tạo mới CheckListItem
    //     $checklistItem = ChecklistItem::create($validatedData);

    //     // Log::info("🚀 Gọi broadcast ChecklistItemCreated");
    //     broadcast(new ChecklistItemCreated($checklistItem))->toOthers();

    //     return response()->json([
    //         'status' => true,
    //         'message' => 'Thêm mục checklist thành công!',
    //         'data' => $checklistItem
    //     ], 201);
    // }
    // public function show($itemId)
    // {
    //     $checklistItem = ChecklistItem::find($itemId);



    //     return response()->json($checklistItem);
    // }

    // /**
    //  * Display the specified resource.
    //  */


    // /**
    //  * Update the specified resource in storage.
    //  */
    // public function updateName(Request $request, $id)
    // {
    //     // Validate dữ liệu đầu vào
    //     $validated = $request->validate([
    //         'name' => 'required|string|max:255',
    //     ]);

    //     // Tìm ChecklistItem và cập nhật tên
    //     $item = ChecklistItem::findOrFail($id);
    //     $item->update(['name' => $validated['name']]);

    //     broadcast(new ChecklistItemUpdated($item))->toOthers();

    //     // Trả về phản hồi JSON
    //     return response()->json([
    //         'status' => true,
    //         'message' => 'Cập nhật thành công',
    //         'data' => $item
    //     ], 200); // HTTP status code 200 (OK)
    // }
    // // hàm tính toán phần trăm
    // public function calculateCompletionRate($checklistId)
    // {
    //     $totalItems = ChecklistItem::where('checklist_id', $checklistId)->count();
    //     // lấy tổng số checklist_item theo checklist_id
    //     $completedItems = ChecklistItem::where('checklist_id', $checklistId)->where('is_completed', true)->count();
    //     // lấy tổng số checklist_item theo checklist_id có trạng thái hoàn thành bằng true

    //     return $totalItems > 0 ? round(($completedItems / $totalItems) * 100, 2) : 0;
    //     // nếu $totalItem>0 thì tính toán  và làm tròn 2 số thập phân còn ngược lại thì trả về o%
    // }
    // // cập nhật trạng thái hoàn thành
    // public function toggleCompletionStatus($id)
    // {
    //     try {
    //         // Tìm item hoặc trả về lỗi nếu không tồn tại
    //         $item = ChecklistItem::findOrFail($id);

    //         $checklist = $item->checklist;
    //         if (!$checklist) {
    //             return response()->json([
    //                 'status' => false,
    //                 'message' => 'Checklist không tồn tại',
    //             ], 404);
    //         }

    //         // Lấy card từ checklist
    //         $card = $checklist->card;

    //         // Đảo ngược trạng thái hiện tại (false -> true, true -> false)
    //         $newStatus = !$item->is_completed;
    //         $item->update([
    //             'is_completed' => $newStatus,
    //         ]);

    //         // Lấy thông tin user
    //         $user_name = auth()->user()?->full_name ?? 'ai đó';
    //         $statusText = $newStatus ? 'hoàn tất' : 'chưa hoàn tất';

    //         // Ghi log nếu trạng thái thay đổi
    //         $activity = activity()
    //             ->causedBy(auth()->user())
    //             ->performedOn($card)
    //             ->event('updated_checklist_status')
    //             ->withProperties([
    //                 'checklist_id' => $item->checklist_id,
    //                 'item_title' => $item->name,
    //                 'status' => $statusText,
    //             ])
    //             ->log("{$user_name} đã đánh dấu {$item->name} là {$statusText} ở thẻ này");

    //         // Tính phần trăm hoàn thành của checklist chứa item này
    //         // $completionRate = $this->calculateCompletionRate($item->checklist_id) . '%';

    //         broadcast(new ChecklistItemToggle($item, $card->id, $activity));

    //         return response()->json([
    //             'status' => true,
    //             'message' => 'Cập nhật trạng thái thành công',
    //             'data' => $item,
    //             // 'completion_rate' => $completionRate,
    //         ]);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'status' => false,
    //             'message' => 'Lỗi khi cập nhật trạng thái',
    //             'error' => $e->getMessage(),
    //         ], 500);
    //     }
    // }


    // /**
    //  * Remove the specified resource from storage.
    //  */
    // public function destroy($id)
    // {
    //     // Tìm ChecklistItem theo id, nếu không tìm thấy sẽ tự động trả về lỗi 404
    //     $item = ChecklistItem::findOrFail($id);
    //     $cardId = $item->checklist->card_id;

    //     // Xóa ChecklistItem
    //     $item->delete();

    //     broadcast(new ChecklistItemDeleted($id, $cardId))->toOthers();

    //     // Trả về phản hồi thành công
    //     return response()->json([
    //         'status' => true,
    //         'message' => 'Xóa ChecklistItem thành công!',
    //     ], 200);
    // }
    // public function updateDate(Request $request, $id)
    // {
    //     $request->validate([
    //         'endDate' => 'nullable|date',
    //         'endTime' => 'nullable|date_format:H:i',
    //         'reminder' => 'nullable|string|max:255',
    //     ]);
    //     // Log::info($request->all());

    //     // Tìm checklist item theo ID
    //     $item = ChecklistItem::find($id);

    //     // if (!$item) {
    //     //     return response()->json(['message' => 'Checklist item không tồn tại'], 404);
    //     // }

    //     // Cập nhật ngày, giờ kết thúc và nhắc nhở
    //     // $item->end_date = $request->endDate ;
    //     // $item->end_time = $request->endTime ;
    //     // $item->reminder = $request->reminder;
    //     // Log::info('Before save:', [
    //     //     'end_date' => $item->end_date,
    //     //     'end_time' => $item->end_time,
    //     //     'reminder' => $item->reminder,
    //     // ]);


    //     $item->update($request->all());
    //     if (!empty($item->reminder) && strtotime($item->reminder)) {
    //         // dispatch(new SendReminderNotification($card))->delay(now()->addMinutes(1));
    //         // Log::info("📌 Job được lên lịch chạy vào: " . Carbon::parse($item->reminder));

    //         dispatch(new SendReminderNotificationChecklistItem($item))->delay(Carbon::parse($item->reminder));
    //     }


    //     return response()->json([
    //         'message' => 'Cập nhật checklist item thành công',
    //         'item' => $item
    //     ], 200);

    // }
    // public function getChecklistItemDate($id)
    // {
    //     $checklistItem = ChecklistItem::select([
    //             'end_date',
    //             'end_time',
    //             'reminder'
    //         ])
    //         ->where('id', $id)
    //         ->first();

    //     // if (!$checklistItem) {
    //     //     return response()->json(['message' => 'Checklist item không tồn tại'], 404);
    //     // }

    //     return response()->json([
    //         'message'=>"lấy ngày giờ checklist_item thành công",
    //         'data'=>$checklistItem,

    //     ]);
    // }
}
