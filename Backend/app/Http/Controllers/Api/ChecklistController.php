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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Spatie\Activitylog\Models\Activity;

class ChecklistController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    // -----------------------------------------------------------------------------
    public function index($cardId)
    {
        // 1. Lấy tất cả checklists thuộc card_id
        $checklists = DB::table('checklists')
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
            ->where('checklists.card_id', $cardId)
            ->get();

        if ($checklists->isEmpty()) {
            return response()->json([]);
        }

        // 2. Lấy danh sách checklist items cho tất cả checklists
        $result = $checklists->map(function ($checklist) {
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
                ->where('checklist_items.checklist_id', $checklist->id)
                ->get()
                ->map(function ($item) {
                    // Lấy danh sách user IDs được assign cho checklist item
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

            // Trả về dữ liệu cho mỗi checklist
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
        });

        return $result;
    }

    public function delete($checklistId)
    {
        // 1. Kiểm tra xem checklist có tồn tại không
        $checklist = DB::table('checklists')
            ->where('id', $checklistId)
            ->first();

        if (!$checklist) {
            return response()->json(['message' => 'Checklist not found'], 404);
        }

        // 2. Xóa checklist (các checklist_items sẽ tự động bị xóa do CASCADE)
        $deleted = DB::table('checklists')
            ->where('id', $checklistId)
            ->delete();

        if ($deleted) {
            return response()->json(['message' => 'Checklist deleted successfully'], 200);
        }

        return response()->json(['message' => 'Failed to delete checklist'], 500);
    }

    public function update($checklistId, Request $request)
    {
        // 1. Kiểm tra xem checklist có tồn tại không
        $checklist = DB::table('checklists')
            ->where('id', $checklistId)
            ->first();

        if (!$checklist) {
            return response()->json(['message' => 'Checklist not found'], 404);
        }

        // 2. Validate dữ liệu đầu vào
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // 3. Cập nhật checklist
        $updated = DB::table('checklists')
            ->where('id', $checklistId)
            ->update([
                'name' => $validated['name'],
                'updated_at' => now(),
            ]);

        if (!$updated) {
            return response()->json(['message' => 'Failed to update checklist'], 500);
        }

        // 4. Lấy lại thông tin checklist sau khi cập nhật
        $updatedChecklist = DB::table('checklists')
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

        // 5. Lấy danh sách checklist items
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

        // 6. Trả về dữ liệu đã cập nhật
        return [
            'id' => $updatedChecklist->id,
            'card_id' => $updatedChecklist->card_id,
            'name' => $updatedChecklist->name,
            'total_items' => (int)$updatedChecklist->total_items,
            'completed_items' => (int)$updatedChecklist->completed_items,
            'items' => $checklistItems,
            'created_at' => $updatedChecklist->created_at,
            'updated_at' => $updatedChecklist->updated_at,
        ];
    }

    public function store(Request $request, $cardId)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $checklistId = DB::table('checklists')->insertGetId([
            'card_id' => $cardId,
            'name' => $validated['name'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $checklist = DB::table('checklists')
            ->select([
                'checklists.id',
                'checklists.card_id',
                'checklists.name',
                'checklists.created_at',
                'checklists.updated_at',
                DB::raw('0 as total_items'),
                DB::raw('0 as completed_items'),
            ])
            ->where('id', $checklistId)
            ->first();
        // 4. Trả về dữ liệu checklist vừa tạo
        return response()->json([
            'id' => $checklist->id,
            'card_id' => $checklist->card_id,
            'name' => $checklist->name,
            'total_items' => (int) $checklist->total_items,
            'completed_items' => (int) $checklist->completed_items,
            'items' => [], // mặc định chưa có
            'created_at' => $checklist->created_at,
            'updated_at' => $checklist->updated_at,
        ], 201);
    }

    //------------------------------------------------------------------------------------------

    // public function index($cardId)
    // {
    //     $card = Card::find($cardId);
    //     if (!$card) {
    //         return response()->json(['message' => 'Card không tồn tại!'], 404);
    //     }

    //     $checklists = CheckList::with('items')->where('card_id', $cardId)->get();

    //     return response()->json($checklists);
    // }

    /**
     * Store a newly created resource in storage.
     */
    // public function store(Request $request)
    // {
    //     $rules = [
    //         'card_id' => 'required|exists:cards,id',
    //         'name' => 'required|string',
    //     ];

    //     // Kiểm tra dữ liệu đầu vào
    //     $validator = Validator::make($request->all(), $rules);

    //     if ($validator->fails()) {
    //         return response()->json([
    //             'status' => 'error',
    //             'message' => 'Dữ liệu không hợp lệ!',
    //             'errors' => $validator->errors()
    //         ], 422);
    //     }

    //     // Tìm thẻ (card) theo ID
    //     $card = Card::find($request->card_id);
    //     if (!$card) {
    //         return response()->json(['message' => 'Card không tồn tại!'], 404);
    //     }

    //     // Tạo mới checklist
    //     $checklist = Checklist::create([
    //         'card_id' => $request->card_id,
    //         'name' => $request->name,
    //     ]);

    //     // Ghi lại lịch sử hoạt động
    //     $user_name = auth()->user()?->full_name ?? 'ai đó';

    //     $activity = activity()
    //         ->causedBy(auth()->user())
    //         ->performedOn($card)
    //         ->event('added_checklist')
    //         ->withProperties([
    //             'card_title' => $card->title,
    //             'checklist_id' => $checklist->id,
    //             'name' => $request->name,
    //         ])
    //         ->log("{$user_name} đã thêm danh sách công việc {$request->name} vào thẻ này");

    //     broadcast(new ChecklistCreated($checklist, $activity))->toOthers();

    //     return response()->json([
    //         'status' => 'success',
    //         'message' => 'Checklist đã được thêm!',
    //         'checklist' => $checklist
    //     ], 201);
    // }

    /**
     * Display the specified resource.
     */

    /**
     * Update the specified resource in storage.
     */
    // public function update(Request $request, $id)
    // {
    //     try {
    //         // Tìm checklist hoặc throw exception nếu không tìm thấy
    //         $checklist = Checklist::findOrFail($id);

    //         // Validate dữ liệu đầu vào
    //         $validatedData = $request->validate([
    //             'name' => 'required|string',
    //         ]);

    //         // Cập nhật checklist với dữ liệu đã validate
    //         $checklist->update($validatedData);

    //         broadcast(new ChecklistUpdated($checklist))->toOthers();

    //         // Trả về response thành công
    //         return response()->json([
    //             'status' => true,
    //             'message' => 'Sửa tên thành công',
    //             'data' => $checklist
    //         ], 200); // HTTP status code 200: OK

    //     } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
    //         // Xử lý khi không tìm thấy checklist
    //         return response()->json([
    //             'status' => false,
    //             'message' => 'Không tồn tại checklist với ID này',
    //         ], 404); // HTTP status code 404: Not Found

    //     } catch (\Exception $e) {
    //         // Xử lý các lỗi khác
    //         return response()->json([
    //             'status' => false,
    //             'message' => 'Có lỗi xảy ra khi cập nhật checklist',
    //             'error' => $e->getMessage(),
    //         ], 500); // HTTP status code 500: Internal Server Error
    //     }
    // }

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
