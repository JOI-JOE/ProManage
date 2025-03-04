<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Card;
use App\Models\CheckList;
use Illuminate\Http\Request;

class ChecklistController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($cardId)
    {
        $checklists = CheckList::where('card_id', $cardId)->get();
        return response()->json([
            'status' => true,
            'data' => $checklists
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store($cardId,Request $request)
    {
        $card=Card::find($cardId);
        if(!$card){
            return response()->json([
                'status' => false,
                'message' => 'không tìm thấy id card',

            ]);

        }
        $request->validate([
            'name' => 'required|string',

        ]);

        $checklist = Checklist::create([
            'name'=>$request->name,
            'card_id'=>$cardId,
        ]);
        $user_name = auth()->user()?->user_name ?? 'ai đó';

        activity()
        ->causedBy(auth()->user())
        ->performedOn($card)
        ->event('added_checklist_item')
        ->withProperties([
            'card_title'   => $card->title,
            'checklist_id' => $checklist->id,
            'name'        => $request->name,
        ])
        ->log("{$user_name} đã thêm mục việc cần làm: {$request->name}");

        return response()->json([
            'status' => true,
            'message' => 'thêm mới thành công',
            'data' => $checklist
        ], 201);
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $checklist = Checklist::findOrFail($id);
        if(!$checklist){
            return response()->json([
                'status' => false,
                'message' => 'không tồn tại id',


            ]);
        }
        $request->validate([
            'name' => 'required|string',

        ]);

        $checklist->update($request->all());

        return response()->json([
            'status' => true,
            'message' => 'sửa tên thành công',
            'data' => $checklist
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function deleteChecklist($cardId, $checklistId)
    {
        $card = Card::findOrFail($cardId);
        $checklist = Checklist::where('card_id', $cardId)->findOrFail($checklistId);
        $user_name = auth()->user()?->user_name ?? 'ai đó';

        // Lưu nội dung checklist trước khi xóa để ghi log
        $checklistTitle = $checklist->name;

        // Xóa checklist
        $checklist->delete();

        // Ghi log lịch sử hoạt động
        activity()
            ->causedBy(auth()->user())
            ->performedOn($card)
            ->event('deleted_checklist_item')
            ->withProperties([
                'card_title' => $card->title,
                'title'      => $checklistTitle,
            ])
            ->log("{$user_name} đã xóa mục checklist: {$checklistTitle}");

        return response()->json([
            'message' => 'Mục checklist đã được xóa thành công!',
        ]);
    }

}
