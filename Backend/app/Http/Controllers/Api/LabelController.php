<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Card;
use App\Models\Color;
use App\Models\Label;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
            $labels = $card->labels()->with('color')->get(['id', 'title', 'color_id']);
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
    // hiển thị nhãn theo bảng
    public function getLabelsByBoard($boardId)
    {
        // Lấy tất cả nhãn thuộc bảng (board) cụ thể
        $labels = Label::where('board_id', $boardId)->with('color')->get();

        return response()->json([
            'data' => $labels
        ]);
    }





    /**
     * Store a newly created resource in storage.
     */
    public function createLabel(Request $request, $boardId)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'color' => 'required|string|max:7', // Người dùng chọn màu bất kỳ (mã hex, ví dụ: #FF5733)
        ]);

        // Kiểm tra xem màu có tồn tại chưa, nếu chưa thì tạo mới
        $color = Color::firstOrCreate(['hex_code' => $request->color]);

        // Kiểm tra xem nhãn đã tồn tại chưa
        $label = Label::where([
            'title' => $request->title,
            'color_id' => $color->id,
            'board_id' => $boardId
        ])->first();

        // Nếu chưa có, tạo mới
        if (!$label) {
            $label = Label::create([
                'title' => $request->title,
                'color_id' => $color->id,
                'board_id' => $boardId,
            ]);
        }

        return response()->json(['message' => 'Nhãn đã được tạo', 'label' => $label->load('color')]);
    }
    public function updateAddAndRemove(Request $request, $cardID)
    {
        $card = Card::find($cardID);
        $request->validate([
            'label_id' => 'required|exists:labels,id',
            'action' => 'required|in:add,remove'
        ]);

        if ($request->action === 'add') {
            $card->labels()->syncWithoutDetaching([$request->label_id]);
        } else {
            $card->labels()->detach($request->label_id);
        }

        return response()->json(['message' => 'Updated successfully', 'labels' => $card->labels]);
    }

    // thêm  nhãn vào thẻ
    public function updateLabelName(Request $request, $labelId)
    {
        try {
            $request->validate([
                'title' => 'required|string|max:255',
            ]);

            // Tìm nhãn cần cập nhật
            $label = Label::findOrFail($labelId);

            // Cập nhật thông tin nhãn
            $label->update([
                'title' => $request->title,
            ]);

            return response()->json([
                'message' => 'Cập nhật tên  nhãn thành công',
                'status' => true,
                'label' => $label,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Đã xảy ra lỗi, vui lòng thử lại',
                'status' => false,

            ], 500);
        }
    }
    public function deleteLabelByBoard($labelId)
    {

        DB::table('card_label')->where('label_id', $labelId)->delete();

        // Xóa label
        Label::findOrFail($labelId)->delete();

        return response()->json(['message' => 'Label deleted successfully']);

        return response()->json(['message' => 'Label deleted successfully'], 200);
    }
}
