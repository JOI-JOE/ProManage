<?php

namespace App\Http\Controllers\Api;

use App\Events\CardCommentAdded;
use App\Events\CommentDeleted;
use App\Events\CommentUpdated;
use App\Http\Controllers\Controller;
use App\Models\Card;
use App\Models\CommentCard;
use App\Notifications\CardNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class CommentCardController extends Controller
{
    //
    public function index($cardId)
    {

        $card = Card::find($cardId);
        if (!$card) {
            return response()->json(['message' => 'Card không tồn tại!'], 404);
        }

        $comments = CommentCard::where('card_id', $cardId)
            ->with('user:id,full_name')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($comments);
    }
    public function addCommentIntoCard(Request $request)
    {
        $rules = [
            'card_id' => 'required|exists:cards,id',
            'content' => 'required|string',
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Dữ liệu không hợp lệ!',
                'errors' => $validator->errors()
            ], 422);
        }

        $card = Card::find($request->card_id);
        if (!$card) {
            return response()->json(['message' => 'Card không tồn tại!'], 404);
        }

        $comment = CommentCard::create([
            'card_id' => $request->card_id,
            'user_id' => Auth::id(), // Sử dụng Auth::id() thay vì request user_id
            'content' => $request->content,
        ]);

        // $comment = CommentCard::with('user')->find($newComment->id);
        broadcast(new CardCommentAdded($comment))->toOthers();

        return response()->json([
            'status' => 'success',
            'message' => 'Bình luận đã được thêm!',
            'comment' => $comment
        ], 201);
    }

    // Xóa bình luận (chỉ cho phép người tạo bình luận hoặc admin xóa)
    public function destroy($id)
    {
        $comment = CommentCard::find($id);
        if (!$comment) {
            return response()->json(['message' => 'Bình luận không tồn tại'], 404);
        }

        if (Auth::id() !== $comment->user_id && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Bạn không có quyền xóa bình luận này'], 403);
        }

        $cardId = $comment->card_id; // Lưu lại cardId trước khi xóa
        $commentId = $comment->id;
        $comment->delete();

        broadcast(new CommentDeleted($commentId, $cardId))->toOthers();
        return response()->json(['message' => 'Bình luận đã bị xóa']);
    }

    public function update(Request $request, $id)
    {
        $comment = CommentCard::find($id);

        // Kiểm tra nếu bình luận không tồn tại
        if (!$comment) {
            return response()->json(['message' => 'Bình luận không tồn tại'], 404);
        }

        // Kiểm tra quyền sửa (chỉ cho phép chủ sở hữu hoặc admin chỉnh sửa)
        if (Auth::id() !== $comment->user_id && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Bạn không có quyền chỉnh sửa bình luận này'], 403);
        }

        // Validate dữ liệu
        $request->validate([
            'content' => 'required|string|max:500',
        ]);

        // Cập nhật nội dung bình luận
        $comment->update([
            'content' => $request->content,
        ]);

        broadcast(new CommentUpdated($comment))->toOthers();

        return response()->json([
            'message' => 'Bình luận đã được cập nhật!',
            'comment' => $comment
        ], 200);
    }
}
