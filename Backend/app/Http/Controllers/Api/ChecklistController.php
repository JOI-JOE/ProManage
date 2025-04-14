<?php

namespace App\Http\Controllers\Api;

use App\Events\ChecklistCreated;
use App\Events\ChecklistDeleted;
use App\Events\ChecklistUpdated;
use App\Http\Controllers\Controller;
use App\Models\Card;
use App\Models\CheckList;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Spatie\Activitylog\Models\Activity;

class ChecklistController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($cardId)
    {
        $card = Card::find($cardId);
        if (!$card) {
            return response()->json(['message' => 'Card không tồn tại!'], 404);
        }

        $checklists = CheckList::with('items')->where('card_id', $cardId)->get();

        return response()->json($checklists);

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $rules = [
            'card_id' => 'required|exists:cards,id',
            'name' => 'required|string',
        ];

        // Kiểm tra dữ liệu đầu vào
        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Dữ liệu không hợp lệ!',
                'errors' => $validator->errors()
            ], 422);
        }

        // Tìm thẻ (card) theo ID
        $card = Card::find($request->card_id);
        if (!$card) {
            return response()->json(['message' => 'Card không tồn tại!'], 404);
        }

        // Tạo mới checklist
        $checklist = Checklist::create([
            'card_id' => $request->card_id,
            'name' => $request->name,
        ]);

        // Ghi lại lịch sử hoạt động
        $user_name = auth()->user()?->full_name ?? 'ai đó';

        $activity = activity()
            ->causedBy(auth()->user())
            ->performedOn($card)
            ->event('added_checklist')
            ->withProperties([
                'card_title' => $card->title,
                'card_id' => $card->id,
                'checklist_id' => $checklist->id,
                'name' => $request->name,
                'board_id' => $card->list->board->id, // thêm dòng này
                'board_name' => $card->list->board->name,
            ])
            ->log("{$user_name} đã thêm danh sách công việc {$request->name} vào thẻ này");

        broadcast(new ChecklistCreated($checklist, $activity))->toOthers();

        return response()->json([
            'status' => 'success',
            'message' => 'Checklist đã được thêm!',
            'checklist' => $checklist
        ], 201);
    }


    /**
     * Display the specified resource.
     */

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            // Tìm checklist hoặc throw exception nếu không tìm thấy
            $checklist = Checklist::findOrFail($id);

            // Validate dữ liệu đầu vào
            $validatedData = $request->validate([
                'name' => 'required|string',
            ]);

            // Cập nhật checklist với dữ liệu đã validate
            $checklist->update($validatedData);

            broadcast(new ChecklistUpdated($checklist))->toOthers();

            // Trả về response thành công
            return response()->json([
                'status' => true,
                'message' => 'Sửa tên thành công',
                'data' => $checklist
            ], 200); // HTTP status code 200: OK

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            // Xử lý khi không tìm thấy checklist
            return response()->json([
                'status' => false,
                'message' => 'Không tồn tại checklist với ID này',
            ], 404); // HTTP status code 404: Not Found

        } catch (\Exception $e) {
            // Xử lý các lỗi khác
            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra khi cập nhật checklist',
                'error' => $e->getMessage(),
            ], 500); // HTTP status code 500: Internal Server Error
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    // public function deleteChecklist($cardId, $checklistId)
    // {
    //     $card = Card::findOrFail($cardId);
    //     $checklist = Checklist::where('card_id', $cardId)->findOrFail($checklistId);
    //     $user_name = auth()->user()?->user_name ?? 'ai đó';

    //     // Lưu nội dung checklist trước khi xóa để ghi log
    //     $checklistTitle = $checklist->name;

    //     // Xóa checklist
    //     $checklist->delete();

    //     // Ghi log lịch sử hoạt động
    //     activity()
    //         ->causedBy(auth()->user())
    //         ->performedOn($card)
    //         ->event('deleted_checklist_item')
    //         ->withProperties([
    //             'card_title' => $card->title,
    //             'title' => $checklistTitle,
    //         ])
    //         ->log("{$user_name} đã xóa mục checklist: {$checklistTitle}");

    //     return response()->json([
    //         'message' => 'Mục checklist đã được xóa thành công!',
    //     ]);
    // }

    public function deleteChecklist($id)
    {
        $checklist = Checklist::find($id);

        if (!$checklist) {
            return response()->json(['message' => 'Checklist không tồn tại'], 404);
        }

        // Chỉ cho phép người tạo checklist hoặc admin được xóa
        // if (Auth::id() !== $checklist->user_id && Auth::user()->role !== 'admin') {
        //     return response()->json(['message' => 'Bạn không có quyền xóa checklist này'], 403);
        // }


        $user_name = auth()->user()?->full_name ?? 'ai đó';
        $card = $checklist->card; // Giả sử checklist có quan hệ với card

        $hasCompletedItem = $checklist->items()->where('is_completed', true)->exists();


        $checklistId = $checklist->id;
        $cardId = $checklist->card_id;
        $activity = null;

        $checklist->delete();

        if (!$hasCompletedItem) {
            // Nếu không có item nào hoàn thành → Xóa activity của hàm tạo checklist
            Activity::where('event', 'added_checklist')
                ->where('subject_id', $card->id)
                ->where('subject_type', Card::class)
                ->whereJsonContains('properties->checklist_id', intval($checklist->id))
                ->delete();
        } else {
            // Nếu có ít nhất một item đã hoàn thành → Ghi lại activity xóa checklist
            $activity =  activity()
                ->causedBy(auth()->user())
                ->performedOn($card)
                ->event('deleted_checklist')
                ->withProperties([
                    'card_title' => $card->title,
                    'checklist_id' => $id,
                    'name' => $checklist->name,
                ])
                ->log("{$user_name} đã bỏ danh sách công việc {$checklist->name} khỏi thẻ này");

        }

        broadcast(new ChecklistDeleted($checklistId, $cardId, $activity))->toOthers();


        return response()->json(['message' => 'Checklist đã bị xóa thành công']);
    }


}
