<?php

namespace App\Http\Controllers\api;

use App\Events\CardCreate;
use App\Events\CardCreated;
use App\Events\CardDescriptionUpdated;
use App\Events\CardNameUpdated;
use App\Http\Controllers\Controller;
use App\Models\Card;
use App\Models\ListBoard;
use App\Models\User;
use App\Notifications\CardMemberAddedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Events\CardPositionUpdated;
use App\Events\ColumnPositionUpdated;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class CardController extends Controller
{// app/Http/Controllers/CardController.php





 // Cập nhật vị trí của card trong cùng 1 column hoặc giữa 2 column
 public function updateCardPosition(Request $request)
 {
    Log::info('Dữ liệu nhận được:', $request->all());

    $validated = $request->validate([
        'id' => 'required|exists:cards,id',
        'new_position' => 'required|integer|min:0',
        'new_list_board_id' => 'required|exists:list_boards,id',
    ]);

    DB::beginTransaction();
    try {
        $card = Card::findOrFail($validated['id']);

        // Nếu card di chuyển sang column khác
        if ($card->list_board_id !== $validated['new_list_board_id']) {
            // Giảm vị trí của các card trong column cũ
            Card::where('list_board_id', $card->list_board_id)
                ->where('position', '>', $card->position)
                ->decrement('position');

            // Cập nhật column mới và vị trí mới
            $card->update([
                'list_board_id' => $validated['new_list_board_id'],
                'position' => $validated['new_position']
            ]);
        } else {
            // Nếu card di chuyển trong cùng một column
            if ($card->position < $validated['new_position']) {
                // Di chuyển xuống: giảm vị trí các card từ (vị trí cũ + 1) đến vị trí mới
                Card::where('list_board_id', $card->list_board_id)
                    ->whereBetween('position', [$card->position + 1, $validated['new_position']])
                    ->decrement('position');
            } else {
                // Di chuyển lên: tăng vị trí các card từ vị trí mới đến (vị trí cũ - 1)
                Card::where('list_board_id', $card->list_board_id)
                    ->whereBetween('position', [$validated['new_position'], $card->position - 1])
                    ->increment('position');
            }

            // Cập nhật vị trí mới cho card
            $card->update(['position' => $validated['new_position']]);
        }

        DB::commit();

        return response()->json([
            'message' => 'Cập nhật vị trí card thành công!',
            'card' => $card
        ], 200);
    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('Lỗi khi cập nhật vị trí card:', ['error' => $e->getMessage()]);

        return response()->json([
            'message' => 'Có lỗi xảy ra!',
            'error' => $e->getMessage()
        ], 500);
    }
}
    // lấy thẻ theo danh sách
    public function getCardsByList($listId)
    {

        try {
            $cards = Card::where('list_board_id', $listId)
                ->where('is_archived', 0)
                ->withCount('comments')
                ->get();
            return response()->json([
                'status'=>true,
                'message'=>'Lấy dữ liệu card thành công', 
                'data'=>$cards
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'status'=>false,
                'message'=>'Có lỗi lấy dữ liệu cardcard', 
                // 'data'=>$cards
            ]);
        }
    }
    public function store(Request $request)
    {
        // 📌 Validate request
        $validator = Validator::make($request->all(), [
            'columnId' => 'required|uuid|exists:list_boards,id',
            'position' => 'required|numeric',
            'title' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // 📌 Tạo card mới
        $card = Cache::remember("card_{$request->columnId}_{$request->title}", 10, function () use ($request) {
            return Card::create([
                'list_board_id' => $request->columnId,
                'position' => $request->position,
                'title' => $request->title,
            ]);
        });

        // 📌 Broadcast event để cập nhật realtime
        broadcast(new CardCreated($card))->toOthers();

        return response()->json($card, 201);
    }
    // cập nhật tên
    public function updateName($cardId, Request $request)
    {
        $card = Card::find($cardId);
        $oldTitle = $card->title;

        $request->validate([
            'title' => 'required'
        ]);

        if ($oldTitle !== $request->title) {
            $card->update([
                'title' => $request->title
            ]);

            broadcast(new CardNameUpdated($card, $oldTitle))->toOthers();

            return response()->json([
                'status' => true,
                'data' => $card,
            ]);
        }
    }
    // cập nhật mô tả
    public function updateDescription($cardId, Request $request)
    {
        $card = Card::findOrFail($cardId);

        $request->validate([
            'description' => 'nullable|string|max:1000'
        ]);

        $description = $request->input('description');

        // Kiểm tra nếu description là null, rỗng, hoặc chỉ chứa <p><br></p>
        if (is_null($description) || $description === "" || trim(strip_tags($description)) === "") {
            $card->update(['description' => null]);
            $message = 'Mô tả đã được xóa thành công';
        } else {
            // Loại bỏ các thẻ <p><br></p> nếu chỉ chứa chúng
            $cleanDescription = trim(strip_tags($description, '<p><br>'));
            if ($cleanDescription === "<p><br></p>" || $cleanDescription === "") {
                $card->update(['description' => null]);
                $message = 'Mô tả đã được xóa thành công';
            } else {
                $card->update(['description' => $description]);
                $message = 'Mô tả đã được cập nhật thành công';
            }
        }

        broadcast(new CardDescriptionUpdated($card))->toOthers();

        return response()->json([
            'message' => $message,
            'card' => $card
        ]);
    }

    // thêm người dùng vào thẻ

    public function addMemberByEmail(Request $request, $cardId)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $user = User::where('email', $request->email)->first();

        // Nếu email không tồn tại trong hệ thống, trả về lỗi
        if (!$user) {
            return response()->json(['message' => 'Email không tồn tại trong hệ thống'], 404);
        }

        $cards = Card::findOrFail($cardId);



        // Kiểm tra nếu user đã có trong thẻ chưa
        if (!$cards->users()->where('users.id', $user->id)->exists()) {
            $cards->users()->attach($user->id);
            // ghi lại hoạt động

            activity()
                ->causedBy(auth()->user())
                ->performedOn($cards)
                ->event('added_member')
                ->withProperties([
                    'card_title' => $cards->title,
                    'member_name' => $user->user_name,
                ])
                ->log($cards->getCustomDescription('added_member', $user->user_name));


            // Gửi thông báo
            $user->notify(new CardMemberAddedNotification($cards));



            return response()->json(['message' => 'Đã thêm thành viên vào thẻ và gửi thông báo'], 200);
        }

        return response()->json(['message' => 'Người dùng đã có trong thẻ'], 400);
    }
    // thành viên khỏi card
    public function removeMember($cardId, $userID)
    {
        $card = Card::find($cardId);
        $user = User::find($userID);
        // dd($card,$user);
        // Kiểm tra xem user có trong thẻ không
        if (!$card->users()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'message' => 'Người dùng không tồn tại trong thẻ này'
            ], 404);
        }

        // Xóa user khỏi thẻ
        $card->users()->detach($user->id);
        activity()
            ->causedBy(auth()->user())
            ->performedOn($card)
            ->event('removed_member')
            ->withProperties([
                'card_title' => $card->title,
                'member_name' => $user->user_name,
            ])
            ->log($card->getCustomDescription('added_member', $user->user_name));

        return response()->json([
            'message' => 'Đã xóa thành viên khỏi thẻ thành công',
            'status' => true,

        ]);
    }

    public function updateDates(Request $request, $cardId)
    {


        $request->validate([
            'start_date' => 'nullable|date_format:Y-m-d',
            'end_date' => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
            'end_time' => 'nullable|date_format:H:i',
        ]);

        // Kiểm tra sự thay đổi của ngày kết thúc và giờ kết thúc
        $changes = [];


        // Kiểm tra sự thay đổi giữa giá trị trong request và giá trị hiện tại trong cơ sở dữ liệu
        if ($request->has('end_date') && $request->end_date !== $card->end_date) {
            $changes['end_date'] = $request->end_date;
        }

        if ($request->has('end_time') && $request->end_time !== $card->end_time) {
            $changes['end_time'] = $request->end_time;
        }
        $card->update($changes);

        // Nếu có sự thay đổi
        if (isset($changes)) {
            // Cập nhật thẻ với các thay đổi
            $logMessage = "{$user_name} đã cập nhật ";

            if (isset($changes['end_date']) && isset($changes['end_time'])) {
                $logMessage .= "ngày kết thúc thành {$changes['end_date']} và giờ kết thúc thành {$changes['end_time']}, ";
            } elseif (isset($changes['end_date'])) {
                $logMessage .= "ngày kết thúc thành {$changes['end_date']}, ";
            } elseif (isset($changes['end_time'])) {
                $logMessage .= "giờ kết thúc thành {$changes['end_time']}, ";
            }

            // Loại bỏ dấu phẩy cuối cùng
            $logMessage = rtrim($logMessage, ', ');

            // Ghi log hoạt động
            activity()
                ->causedBy(auth()->user())
                ->performedOn($card)
                ->event('updated_datetime')
                ->withProperties(array_merge(['card_title' => $card->title], $changes))
                ->log($logMessage);

            // Lấy tất cả người dùng liên quan đến thẻ, trừ người dùng đang đăng nhập
            $users = $card->users()->where('id', '!=', auth()->id())->get();

            // Gửi thông báo cho tất cả người dùng trừ người dùng đang đăng nhập
            foreach ($users as $user) {
                $user->notify(new CardNotification('update_datetime', $card, [], $user_name));
            }
        }

        return response()->json([
            'message' => 'Cập nhật ngày và giờ thành công!',
            'data' => $card,
        ]);
    }
    public function removeDates($cardId)
    {
        $card = Card::findOrFail($cardId);
        $card->start_date = null;
        $card->end_date = null;
        $card->end_time = null;
        $card->save();

        return response()->json([
            'message' => 'Đã xóa ngày bắt đầu & ngày kết thúc khỏi thẻ!',
            'data' => $card,
        ]);
    }
    // lấy lịch sử hoạt động
    public function getCardHistory($cardId)
    {
        $card = Card::with([
            'activities' => function ($query) {
                $query->orderByDesc('created_at'); // Sắp xếp bản ghi mới nhất lên đầu
            }
        ])->find($cardId);

        if (!$card) {
            return response()->json(['message' => 'Card không tồn tại'], 404);
        }

        return response()->json($card->activities);
    }
    public function getUserNotifications($userId)
    {
        $notifications = DatabaseNotification::where('notifiable_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'notifications' => $notifications
        ]);
    }

    public function show($id)
    {
        $card = Card::with(['list.board', 'checklists.items'])->findOrFail($id);
        return response()->json([
            'id' => $card->id,
            'title' => $card->title,
            'description' => $card->description ?? '',
            'listName' => $card->list->name ?? '', // Lấy tên danh sách chứa card
            'boardName' => $card->list->board->name ?? '', // Lấy tên board

        ]);
    }


    //// Lưu trữ , khôi phục thẻ, xóa vĩnh viễn
    public function toggleArchive($id)
    {
        try {
            // Tìm card theo ID, nếu không có sẽ ném lỗi 404
            $card = Card::findOrFail($id);

            // Chuyển đổi trạng thái lưu trữ
            $card->is_archived = !$card->is_archived;
            $card->save();

            return response()->json([
                'message' => 'Card archive status updated successfully',
                'is_archived' => $card->is_archived,
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Card not found',
            ], 404);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'An error occurred while updating the card',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getArchivedCardsByBoard($boardId)
    {
        try {
            // Lấy danh sách ID thuộc boardId
            $listIds = ListBoard::where('board_id', $boardId)->pluck('id');

            // Lấy các thẻ đã lưu trữ trong danh sách đó
            $archivedCards = Card::whereIn('list_board_id', $listIds)
                ->where('is_archived', 1)
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Lấy danh sách thẻ đã lưu trữ thành công!',
                'data' => $archivedCards
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra!'
            ], 500);
        }
    }

    public function delete($id)
    {
        try {
            // Tìm card theo ID, nếu không có sẽ ném lỗi 404
            $card = Card::findOrFail($id);

            // Xóa card
            $card->delete();

            return response()->json([
                'message' => 'Card deleted successfully',
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Card not found',
            ], 404);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'An error occurred while deleting the card',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
