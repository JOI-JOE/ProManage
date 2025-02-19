<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Card;
use App\Models\Label;
use Illuminate\Http\Request;

class LabelController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    // lấy danh sách nhãn của 1 thẻ
    public function getLabels($cardId)
    {
        try {

            $card = Card::findOrFail($cardId);
            $labels = $card->labels()->get(['id', 'title', 'color_id']);
            return response()->json([
                'message' => 'lấy nhãn thành công',
                'status' => true,
                'data' => $labels
            ]);
            //code...
        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'lấy nhãn không thành công',
                'status' => false,

            ]);
            //throw $th;
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    // thêm  nhãn vào thẻ
    public function addLabelToCard(Request $request, $cardId)
    {

        $request->validate([
            'title' => 'required|string|max:255',
            'color_id' => 'required|exists:colors,id', // Chọn màu từ bảng `colors`

        ]);

        $card = Card::findOrFail($cardId);
        $board_id = $card->list->board->id;
        // Kiểm tra xem nhãn đã tồn tại chưa (tránh trùng lặp)
        $label = Label::where([
            'title' => $request->title,
            'color_id' => $request->color_id,
            'board_id' => $board_id
        ])->first();


        // Tạo nhãn với màu được chọn

        if (!$label) {
            // Nếu chưa có, tạo mới
            $label = Label::create([
                'title' => $request->title,
                'color_id' => $request->color_id,
                'board_id' => $board_id,
            ]);
        }

        // Gán nhãn vào thẻ
        $card->labels()->attach($label->id);

        return response()->json(['message' => 'Đã thêm nhãn vào thẻ', 'label' => $label->load('color')]);
    }
    public function updateLabel(Request $request, $labelId)
    {
        try {
            $request->validate([
                'title' => 'required|string|max:255',
                'color_id' => 'required|exists:colors,id',
            ]);

            // Tìm nhãn cần cập nhật
            $label = Label::findOrFail($labelId);

            // Cập nhật thông tin nhãn
            $label->update([
                'title' => $request->title,
                'color_id' => $request->color_id,
            ]);

            return response()->json([
                'message' => 'Cập nhật nhãn thành công',
                'status' => true,
                'label' => $label->load('color'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Đã xảy ra lỗi, vui lòng thử lại',
                'status' => false,

            ], 500);
        }
    }




    /**
     * Display the specified resource.
     */


    /**
     * Update the specified resource in storage.
     */


    /**
     * Remove the specified resource from storage.
     */
    public function removeLabelFromCard($cardId, $labelId)
    {
        try {
            $card = Card::findOrFail($cardId);
            $label = $card->labels()->where('labels.id', $labelId)->firstOrFail();

            // Xóa mối quan hệ giữa thẻ và nhãn (chỉ detach, không xóa nhãn khỏi database)
            $card->labels()->detach($labelId);

            return response()->json([
                'message' => 'Đã xóa nhãn khỏi thẻ',
                'status' => true,
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'Xóa nhãn không thành công',
                'status' => false,
            ]);
        }
    }
}
