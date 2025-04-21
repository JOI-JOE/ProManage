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
use Illuminate\Support\Facades\Log;

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
            'message'=>"lấy dữ liệu thành công",
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

        // Log::info("🚀 Gọi broadcast ChecklistItemCreated");
        broadcast(new ChecklistItemCreated($checklistItem))->toOthers();

        return response()->json([
            'status' => true,
            'message' => 'Thêm mục checklist thành công!',
            'data' => $checklistItem
        ], 201);
    }
    public function show($itemId)
    {
        $checklistItem = ChecklistItem::find($itemId);



        return response()->json($checklistItem);
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

        broadcast(new ChecklistItemUpdated($item))->toOthers();

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

            $checklist = $item->checklist;
            if (!$checklist) {
                return response()->json([
                    'status' => false,
                    'message' => 'Checklist không tồn tại',
                ], 404);
            }

            // Lấy card từ checklist
            $card = $checklist->card;

            // Đảo ngược trạng thái hiện tại (false -> true, true -> false)
            $newStatus = !$item->is_completed;
            $item->update([
                'is_completed' => $newStatus,
            ]);

            // Lấy thông tin user
            $user_name = auth()->user()?->full_name ?? 'ai đó';
            $statusText = $newStatus ? 'hoàn tất' : 'chưa hoàn tất';

            // Ghi log nếu trạng thái thay đổi
            $activity = activity()
                ->causedBy(auth()->user())
                ->performedOn($card)
                ->event('updated_checklist_status')
                ->withProperties([
                    'checklist_id' => $item->checklist_id,
                    'item_title' => $item->name,
                    'status' => $statusText,
                    'card_id' => $card->id,
                    'card_title' => $card->title, // thêm dòng này
                    'board_id' => $card->list->board->id, // thêm dòng này
                    'board_name' => $card->list->board->name,
                    ])
                ->log("{$user_name} đã đánh dấu {$item->name} là {$statusText} ở thẻ này");

            // Tính phần trăm hoàn thành của checklist chứa item này
            // $completionRate = $this->calculateCompletionRate($item->checklist_id) . '%';

            broadcast(new ChecklistItemToggle($item, $card->id, $activity));

            return response()->json([
                'status' => true,
                'message' => 'Cập nhật trạng thái thành công',
                'data' => $item,
                // 'completion_rate' => $completionRate,
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
        $cardId = $item->checklist->card_id;

        // Xóa ChecklistItem
        $item->delete();

        broadcast(new ChecklistItemDeleted($id, $cardId))->toOthers();

        // Trả về phản hồi thành công
        return response()->json([
            'status' => true,
            'message' => 'Xóa ChecklistItem thành công!',
        ], 200);
    }

    public function updateDate(Request $request, $id)
    {
        $request->validate([
            'endDate' => 'nullable|date',
            'endTime' => 'nullable|date_format:H:i',
            'reminder' => 'nullable|string|max:255',
        ]);
        // Log::info($request->all());

        // Tìm checklist item theo ID
        $item = ChecklistItem::find($id);

        // if (!$item) {
        //     return response()->json(['message' => 'Checklist item không tồn tại'], 404);
        // }

        // Cập nhật ngày, giờ kết thúc và nhắc nhở
        // $item->end_date = $request->endDate ;
        // $item->end_time = $request->endTime ;
        // $item->reminder = $request->reminder;
        // Log::info('Before save:', [
        //     'end_date' => $item->end_date,
        //     'end_time' => $item->end_time,
        //     'reminder' => $item->reminder,
        // ]);


        $item->update($request->all());
        if (!empty($item->reminder) && strtotime($item->reminder)) {
            // dispatch(new SendReminderNotification($card))->delay(now()->addMinutes(1));
            // Log::info("📌 Job được lên lịch chạy vào: " . Carbon::parse($item->reminder));

            dispatch(new SendReminderNotificationChecklistItem($item))->delay(Carbon::parse($item->reminder));
        }


        return response()->json([
            'message' => 'Cập nhật checklist item thành công',
            'item' => $item
        ], 200);

    }
    public function removeDates($itemId)
    {
        $item = ChecklistItem::findOrFail($itemId);
        $item->end_date = null;
        $item->end_time = null;
        $item->reminder = null;
        $item->save();

        return response()->json([
            'message' => 'Đã xóa ngày bắt đầu & ngày kết thúc khỏi thẻ!',
            'data' => $item,

        ]);
    }
    public function getChecklistItemDate($id)
    {
        $checklistItem = ChecklistItem::select([
                'end_date',
                'end_time',
                'reminder'
            ])
            ->where('id', $id)
            ->first();

        // if (!$checklistItem) {
        //     return response()->json(['message' => 'Checklist item không tồn tại'], 404);
        // }

        return response()->json([
            'message'=>"lấy ngày giờ checklist_item thành công",
            'data'=>$checklistItem,

        ]);
    }
}
