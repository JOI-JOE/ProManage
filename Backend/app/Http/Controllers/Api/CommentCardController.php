<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CommentCard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CommentCardController extends Controller
{
    //
    public function index($cardId)
    {
        $comments = CommentCard::where('card_id', $cardId)
            ->with('user:id,full_name') // Lấy thông tin user
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($comments);
    }
    



    public function addCommentIntoCard(Request $request){

         // Tạo rules cho validation
    $rules = [
        'card_id' => 'required|exists:cards,id',
        'content' => 'required|string',
    ];

    // Thực hiện validate
    $validator = Validator::make($request->all(), $rules);

    // Nếu validate thất bại, trả về lỗi
    if ($validator->fails()) {
        return response()->json([
            'status' => 'error',
            'message' => 'Dữ liệu không hợp lệ!',
            'errors' => $validator->errors()
        ], 422);
    }

    // Lưu bình luận vào database
    $comment = CommentCard::create([
        'card_id' => $request->card_id,
        'user_id' => $request->user_id, // Hoặc `Auth::id()` nếu muốn lấy user đang đăng nhập
        'content' => $request->content,
    ]);

    return response()->json([
        'status' => 'success',
        'message' => 'Bình luận đã được thêm!',
        'comment' => $comment
    ], 201);

    }

    // Xóa bình luận (chỉ cho phép người tạo bình luận hoặc admin xóa)
    public function destroy($id)
    {
        $comment = CommentCard::findOrFail($id);

        if (Auth::id() !== $comment->user_id && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Bạn không có quyền xóa bình luận này'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Bình luận đã bị xóa']);
    }

    
}
