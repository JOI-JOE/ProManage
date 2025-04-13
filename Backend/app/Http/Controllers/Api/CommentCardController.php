<?php

namespace App\Http\Controllers\Api;

use App\Events\CardCommentAdded;
use App\Events\CommentDeleted;
use App\Events\CommentUpdated;
use App\Http\Controllers\Controller;
use App\Models\Card;
use App\Models\CommentCard;
use App\Notifications\CardCommentNotification;
use App\Notifications\CardNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class CommentCardController extends Controller
{
    //
    public function index($cardId)
    {
        // Verify if the card exists
        $cardExists = DB::table('cards')
            ->where('id', $cardId)
            ->exists();

        if (!$cardExists) {
            return response()->json(['message' => 'Card không tồn tại!'], 404);
        }

        // Fetch comments with user data
        $comments = DB::table('comment_cards')
            ->select(
                'comment_cards.id',
                'comment_cards.content',
                'comment_cards.card_id',
                'comment_cards.user_id',
                'comment_cards.created_at',
                'comment_cards.updated_at',
                'users.id as user_id',
                'users.full_name',
                'users.initials',
                'users.user_name',
                'users.image',

            )
            ->join('users', 'comment_cards.user_id', '=', 'users.id')
            ->where('comment_cards.card_id', $cardId)
            ->orderBy('comment_cards.created_at', 'desc')
            ->get();

        // Transform the results to match the expected structure
        $formattedComments = $comments->map(function ($comment) {
            return [
                'id' => $comment->id,
                'content' => $comment->content,
                'card_id' => $comment->card_id,
                'member_id' => $comment->user_id,
                'created_at' => $comment->created_at,
                'updated_at' => $comment->updated_at,
                'member' => [
                    'id' => $comment->user_id,
                    'full_name' => $comment->full_name,
                    'user_name' => $comment->user_name,
                    'avatar' => $comment->image,
                    'initials' => $comment->initials,
                ],
            ];
        });

        return response()->json($formattedComments);
    }
    public function store(Request $request, $cardId)
    {
        try {
            // Verify if the card exists
            $cardExists = DB::table('cards')
                ->where('id', $cardId)
                ->exists();

            if (!$cardExists) {
                return response()->json(['message' => 'Card không tồn tại!'], 404);
            }

            // Check if user is authenticated
            if (!Auth::check()) {
                return response()->json(['message' => 'Bạn cần đăng nhập để tạo comment!'], 401);
            }

            // Validate request data
            $validated = $request->validate([
                'content' => 'required|string|max:1000',
            ]);

            // Create new comment
            $commentId = DB::table('comment_cards')
                ->insertGetId([
                    'content' => $validated['content'],
                    'card_id' => $cardId,
                    'user_id' => Auth::id(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

            // Fetch the created comment with user data
            $newComment = DB::table('comment_cards')
                ->select(
                    'comment_cards.id',
                    'comment_cards.content',
                    'comment_cards.card_id',
                    'comment_cards.user_id',
                    'comment_cards.created_at',
                    'comment_cards.updated_at',
                    'users.id as user_id',
                    'users.full_name',
                    'users.initials',
                    'users.user_name',
                    'users.image'
                )
                ->join('users', 'comment_cards.user_id', '=', 'users.id')
                ->where('comment_cards.id', $commentId)
                ->first();

            // Check if comment was retrieved successfully
            if (!$newComment) {
                throw new \Exception('Không thể lấy thông tin comment vừa tạo!');
            }

            // Format the response
            $formattedComment = [
                'id' => $newComment->id,
                'content' => $newComment->content,
                'card_id' => $newComment->card_id,
                'member_id' => $newComment->user_id,
                'created_at' => $newComment->created_at,
                'updated_at' => $newComment->updated_at,
                'member' => [
                    'id' => $newComment->user_id,
                    'full_name' => $newComment->full_name,
                    'user_name' => $newComment->user_name,
                    'avatar' => $newComment->image,
                    'initials' => $newComment->initials,
                ],
            ];

            return response()->json($formattedComment, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Handle validation errors
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ!',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Illuminate\Database\QueryException $e) {
            // Handle database errors (e.g., foreign key violation, connection issues)
            return response()->json([
                'message' => 'Lỗi cơ sở dữ liệu khi tạo comment!',
                'error' => env('APP_DEBUG', false) ? $e->getMessage() : null,
            ], 500);
        } catch (\Exception $e) {
            // Handle any other unexpected errors
            return response()->json([
                'message' => 'Đã xảy ra lỗi khi tạo comment!',
                'error' => env('APP_DEBUG', false) ? $e->getMessage() : null,
            ], 500);
        }
    }
    public function update(Request $request, $commentId)
    {
        // Verify if the comment exists
        $commentExists = DB::table('comment_cards')
            ->where('id', $commentId)
            ->exists();

        if (!$commentExists) {
            return response()->json(['message' => 'Comment không tồn tại!'], 404);
        }

        // Validate request data
        $validated = $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        // Update the comment
        DB::table('comment_cards')
            ->where('id', $commentId)
            ->update([
                'content' => $validated['content'],
                'updated_at' => now(),
            ]);

        // Fetch the updated comment with user data
        $updatedComment = DB::table('comment_cards')
            ->select(
                'comment_cards.id',
                'comment_cards.content',
                'comment_cards.card_id',
                'comment_cards.user_id',
                'comment_cards.created_at',
                'comment_cards.updated_at',
                'users.id as user_id',
                'users.full_name',
                'users.initials',
                'users.user_name',
                'users.image'
            )
            ->join('users', 'comment_cards.user_id', '=', 'users.id')
            ->where('comment_cards.id', $commentId)
            ->first();

        // Format the response
        $formattedComment = [
            'id' => $updatedComment->id,
            'content' => $updatedComment->content,
            'card_id' => $updatedComment->card_id,
            'member_id' => $updatedComment->user_id,
            'created_at' => $updatedComment->created_at,
            'updated_at' => $updatedComment->updated_at,
            'member' => [
                'id' => $updatedComment->user_id,
                'full_name' => $updatedComment->full_name,
                'user_name' => $updatedComment->user_name,
                'avatar' => $updatedComment->image,
                'initials' => $updatedComment->initials,
            ],
        ];

        return response()->json($formattedComment);
    }
    public function delete($commentId)
    {
        // Verify if the comment exists
        $commentExists = DB::table('comment_cards')
            ->where('id', $commentId)
            ->exists();

        if (!$commentExists) {
            return response()->json(['message' => 'Comment không tồn tại!'], 404);
        }

        // Delete the comment
        DB::table('comment_cards')
            ->where('id', $commentId)
            ->delete();

        return response()->json(['message' => 'Comment đã được xóa thành công!'], 200);
    }

    // public function addCommentIntoCard(Request $request)
    // {
    //     $rules = [
    //         'card_id' => 'required|exists:cards,id',
    //         'content' => 'required|string',
    //     ];

    //     $validator = Validator::make($request->all(), $rules);

    //     if ($validator->fails()) {
    //         return response()->json([
    //             'status' => 'error',
    //             'message' => 'Dữ liệu không hợp lệ!',
    //             'errors' => $validator->errors()
    //         ], 422);
    //     }

    //     $card = Card::find($request->card_id);
    //     if (!$card) {
    //         return response()->json(['message' => 'Card không tồn tại!'], 404);
    //     }

    //     $comment = CommentCard::create([
    //         'card_id' => $request->card_id,
    //         'user_id' => Auth::id(), // Sử dụng Auth::id() thay vì request user_id
    //         'content' => $request->content,
    //     ]);


    //     // $comment = CommentCard::with('user')->find($newComment->id);
    //     broadcast(new CardCommentAdded($comment))->toOthers();

    //     $users = $card->members; // Lấy danh sách thành viên liên quan trong card

    //     foreach ($users as $user) {
    //         // Không gửi cho người vừa comment
    //         if ($user->id !== Auth::id()) {
    //             $user->notify(new CardCommentNotification($comment));
    //         }
    //     }

    //     return response()->json([
    //         'status' => 'success',
    //         'message' => 'Bình luận đã được thêm!',
    //         'comment' => $comment
    //     ], 201);
    // }
    // // Xóa bình luận (chỉ cho phép người tạo bình luận hoặc admin xóa)
    // public function destroy($id)
    // {
    //     $comment = CommentCard::find($id);
    //     if (!$comment) {
    //         return response()->json(['message' => 'Bình luận không tồn tại'], 404);
    //     }

    //     if (Auth::id() !== $comment->user_id && Auth::user()->role !== 'admin') {
    //         return response()->json(['message' => 'Bạn không có quyền xóa bình luận này'], 403);
    //     }

    //     // Xóa notification liên quan đến comment


    //     $cardId = $comment->card_id; // Lưu lại cardId trước khi xóa
    //     $commentId = $comment->id;

    //     // Xóa notification liên quan đến comment
    //     DB::table('notifications')
    //         ->whereJsonContains('data->comment_id', $commentId)
    //         ->delete();

    //     $comment->delete();

    //     broadcast(new CommentDeleted($commentId, $cardId))->toOthers();
    //     return response()->json(['message' => 'Bình luận đã bị xóa']);
    // }
    // public function update(Request $request, $id)
    // {
    //     $comment = CommentCard::find($id);

    //     // Kiểm tra nếu bình luận không tồn tại
    //     if (!$comment) {
    //         return response()->json(['message' => 'Bình luận không tồn tại'], 404);
    //     }

    //     // Kiểm tra quyền sửa (chỉ cho phép chủ sở hữu hoặc admin chỉnh sửa)
    //     if (Auth::id() !== $comment->user_id && Auth::user()->role !== 'admin') {
    //         return response()->json(['message' => 'Bạn không có quyền chỉnh sửa bình luận này'], 403);
    //     }

    //     // Validate dữ liệu
    //     $request->validate([
    //         'content' => 'required|string|max:500',
    //     ]);

    //     // Cập nhật nội dung bình luận
    //     $comment->update([
    //         'content' => $request->content,
    //     ]);

    //     broadcast(new CommentUpdated($comment))->toOthers();

    //     return response()->json([
    //         'message' => 'Bình luận đã được cập nhật!',
    //         'comment' => $comment
    //     ], 200);
    // }
}
