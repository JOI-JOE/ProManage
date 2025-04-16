<?php

namespace App\Http\Controllers\Api;

use App\Events\CommentCreated;
use App\Events\CommentUpdated;
use App\Events\CommentDeleted;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CommentCardController extends Controller
{
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
                'users.image'
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
            $card = \App\Models\Card::find($cardId);
            if (!$card) {
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

            // Ghi log khi tạo comment
            $user = auth()->user();
            $userName = $user ? $user->full_name : 'ai đó';
            activity()
                ->causedBy($user)
                ->performedOn($card)
                ->event('created_comment')
                ->withProperties([
                    'comment_id' => $newComment->id,
                    'content' => $newComment->content,
                    'card_id' => $cardId,
                ])
                ->log("{$userName} đã thêm bình luận vào card '{$card->title}'.");

            // Broadcast to others
            broadcast(new CommentCreated($formattedComment, $card, $user))->toOthers();

            return response()->json($formattedComment, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ!',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Illuminate\Database\QueryException $e) {
            return response()->json([
                'message' => 'Lỗi cơ sở dữ liệu khi tạo comment!',
                'error' => env('APP_DEBUG', false) ? $e->getMessage() : null,
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Đã xảy ra lỗi khi tạo comment!',
                'error' => env('APP_DEBUG', false) ? $e->getMessage() : null,
            ], 500);
        }
    }

    public function update(Request $request, $commentId)
    {
        try {
            // Verify if the comment exists and fetch card
            $comment = DB::table('comment_cards')
                ->where('id', $commentId)
                ->first();

            if (!$comment) {
                return response()->json(['message' => 'Comment không tồn tại!'], 404);
            }

            $card = \App\Models\Card::find($comment->card_id);
            if (!$card) {
                return response()->json(['message' => 'Card không tồn tại!'], 404);
            }

            // Check if user is authenticated
            if (!Auth::check()) {
                return response()->json(['message' => 'Bạn cần đăng nhập để chỉnh sửa comment!'], 401);
            }

            // Check if the authenticated user owns the comment
            if ($comment->user_id !== Auth::id()) {
                return response()->json(['message' => 'Bạn không có quyền chỉnh sửa comment này!'], 403);
            }

            // Validate request data
            $validated = $request->validate([
                'content' => 'required|string|max:1000',
            ]);

            // Ghi log trước khi cập nhật
            $user = auth()->user();
            $userName = $user ? $user->full_name : 'ai đó';
            activity()
                ->causedBy($user)
                ->performedOn($card)
                ->event('updated_comment')
                ->withProperties([
                    'comment_id' => $commentId,
                    'old_content' => $comment->content,
                    'new_content' => $validated['content'],
                    'card_id' => $card->id,
                ])
                ->log("{$userName} đã chỉnh sửa bình luận trong card '{$card->title}'.");

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

            // Broadcast to others
            broadcast(new CommentUpdated($formattedComment, $card, $user))->toOthers();

            return response()->json($formattedComment);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ!',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Đã xảy ra lỗi khi cập nhật comment!',
                'error' => env('APP_DEBUG', false) ? $e->getMessage() : null,
            ], 500);
        }
    }

    public function delete($commentId)
    {
        try {
            // Verify if the comment exists and fetch card
            $comment = DB::table('comment_cards')
                ->where('id', $commentId)
                ->first();

            if (!$comment) {
                return response()->json(['message' => 'Comment không tồn tại!'], 404);
            }

            $card = \App\Models\Card::find($comment->card_id);
            if (!$card) {
                return response()->json(['message' => 'Card không tồn tại!'], 404);
            }

            // Check if user is authenticated
            if (!Auth::check()) {
                return response()->json(['message' => 'Bạn cần đăng nhập để xóa comment!'], 401);
            }

            // Check if the authenticated user owns the comment
            if ($comment->user_id !== Auth::id()) {
                return response()->json(['message' => 'Bạn không có quyền xóa comment này!'], 403);
            }

            // Ghi log trước khi xóa
            $user = auth()->user();
            $userName = $user ? $user->full_name : 'ai đó';
            activity()
                ->causedBy($user)
                ->performedOn($card)
                ->event('deleted_comment')
                ->withProperties([
                    'comment_id' => $commentId,
                    'content' => $comment->content,
                    'card_id' => $card->id,
                ])
                ->log("{$userName} đã xóa bình luận khỏi card '{$card->title}'.");

            // Broadcast to others
            broadcast(new CommentDeleted($commentId, $card->id, $user ? $user->id : null))->toOthers();

            // Delete the comment
            DB::table('comment_cards')
                ->where('id', $commentId)
                ->delete();

            return response()->json(['message' => 'Comment đã được xóa thành công!'], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Đã xảy ra lỗi khi xóa comment!',
                'error' => env('APP_DEBUG', false) ? $e->getMessage() : null,
            ], 500);
        }
    }
}
