<?php

namespace App\Http\Controllers\api;

use App\Events\ActivityEvent;
use App\Events\CardArchiveToggled;
use App\Events\CardCreate;
use App\Events\CardCreated;
use App\Events\CardDeleted;
use App\Events\CardDescriptionUpdated;
use App\Events\CardNameUpdated;
use App\Http\Controllers\Controller;
use App\Models\Card;
use App\Models\ListBoard;
use App\Models\User;
use App\Notifications\CardNotification;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Events\CardPositionUpdated;
use App\Events\ColumnPositionUpdated;
use App\Jobs\SendReminderNotification;
use App\Jobs\SendReminderNotificationCard;
use Carbon\Carbon;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class CardController extends Controller
{ // app/Http/Controllers/CardController.php
    public function getCardsByList($listId)
    {
        try {
            $cards = Card::where('list_board_id', $listId)
                ->where('is_archived', 0)
                ->withCount('comments')
                ->get();
            return response()->json([
                'status' => true,
                'message' => 'Lấy dữ liệu card thành công',
                'data' => $cards
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => 'Có lỗi lấy dữ liệu cardcard',
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
        $user = User::where('email', $request->email)->first();
        $cards = Card::findOrFail($cardId);
        // $userIds = $cards->users->pluck('id')->toArray();
        $userName = auth()->user()?->user_name ?? 'ai đó';
        $request->validate([
            'email' => 'required|email'
        ]);
        // Nếu email không tồn tại trong hệ thống, trả về lỗi
        if (!$user) {
            return response()->json(['message' => 'Email không tồn tại trong hệ thống'], 404);
        }
        $cards = Card::findOrFail($cardId);
        // $userByCard = $cards->users->pluck('id')->toArray();
        // Kiểm tra nếu user đã có trong thẻ chưa
        if (!$cards->members()->wherePivot('users.id', $user->id)->exists()) {
            $cards->members()->attach($user->id);

            activity()
                ->causedBy(auth()->user())
                ->performedOn($cards)
                ->event('addmember')
                ->withProperties([
                    'card_id' => $cards->id,
                    'added_user' => $user->id,
                    'added_user_email' => $user->email,
                ])
                ->log("{$userName} đã thêm  {$user->user_name} vào thẻ.");
            // broadcast(new ActivityEvent($activity, $cardId, $userByCard));
            // // Gửi thông báo
            // $user->notify(new CardNotification('add_member', $cards));
            // return response()->json(['message' => 'Đã thêm thành viên vào thẻ và gửi thông báo'], 200);
        } else {
            return response()->json(['message' => 'Người dùng đã có trong thẻ'], 400);
        }
    }
    // thành viên khỏi card
    public function removeMember($cardId, $userID)
    {
        $card = Card::find($cardId);
        $user = User::find($userID);
        $user_name = auth()->user()?->user_name ?? 'ai đó';

        // Kiểm tra xem user có trong thẻ không
        if (!$card->members()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'message' => 'Người dùng không tồn tại trong thẻ này'
            ], 404);
        }
        // Xóa user khỏi thẻ
        $card->members()->detach($user->id);
        // Kiểm tra xem người thực hiện có phải là chính user bị xóa không

        activity()
            ->causedBy(auth()->user())
            ->performedOn($card)
            ->event('remove_member')
            ->withProperties([
                'card_id' => $card->id,
                'removed_user_id' => $user->id,
                'removed_user_email' => $user->email,

            ])
            ->log(
                "{$user_name} đã xóa {$user->user_name} khỏi thẻ."
            );


        return response()->json([
            'message' => 'Đã xóa thành viên khỏi thẻ thành công',
            'status' => true,

        ]);
    }
    public function updateDates(Request $request, $cardId)
    {
        $card = Card::findOrFail($cardId);
        $user_name = auth()->user()->user_name ?? 'ai đó';

        // Validate các trường nhập
        $request->validate([
            'start_date' => 'nullable|date_format:Y-m-d',
            'end_date'   => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
            'end_time'   => 'nullable|date_format:H:i',
            'reminder'   => 'nullable|string', // Kiểm tra reminder dưới dạng chuỗi để xử lý linh hoạt
        ]);

        $changes = [];

        // Cập nhật start_date nếu thay đổi
        if ($request->has('start_date') && $request->start_date !== $card->start_date) {
            $card->start_date = $request->start_date;
        }

        // Cập nhật end_date nếu thay đổi
        if ($request->has('end_date') && $request->end_date !== $card->end_date) {
            $changes['end_date'] = $request->end_date;
        }

        // Cập nhật end_time nếu thay đổi
        if ($request->has('end_time') && $request->end_time !== $card->end_time) {
            $changes['end_time'] = $request->end_time;
        }
        if ($request->has('reminder') && $request->reminder !== $card->reminder) {
            $card->reminder = $request->reminder;
        }



        // Cập nhật dữ liệu vào database
        $card->update(array_merge($changes, ['start_date' => $card->start_date]));

        // Nếu có sự thay đổi, ghi log và gửi thông báo
        if (!empty($changes)) {
            $logMessage = "{$user_name} đã chuyển ";

            if (isset($changes['end_date']) && isset($changes['end_time'])) {
                $logMessage .= "ngày hết hạn thẻ này sang {$changes['end_date']} lúc {$changes['end_time']}, ";
            } else if (isset($changes['end_date'])) {
                $logMessage .= "ngày hết hạn thẻ này sang {$changes['end_date']}, ";
            } else if (isset($changes['end_time'])) {
                $logMessage .= "giờ kết thúc sang {$changes['end_time']}, ";
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

            // Gửi thông báo đến tất cả người dùng liên quan
            // $users = $card->users()->where('id', '!=', auth()->id())->get();
            // foreach ($users as $user) {
            //     $user->notify(new CardNotification('update_datetime', $card, [], $user_name));
            // }

            Log::info("📌 Job được lên lịch chạy vào: " . Carbon::parse($card->reminder));

        }
        if (!empty($card->reminder) && strtotime($card->reminder)) {
            // dispatch(new SendReminderNotification($card))->delay(now()->addMinutes(1));

            dispatch(new SendReminderNotificationCard($card))->delay(Carbon::parse($card->reminder));
        }


        return response()->json([
            'message' => 'Cập nhật ngày, giờ và nhắc nhở thành công!',
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

            broadcast(new CardArchiveToggled($card))->toOthers();

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
            $boardId = $card->list->board_id;

            // Xóa card
            $card->delete();

            broadcast(new CardDeleted($id, $boardId))->toOthers();

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
    public function getSchedule($cardId)
    {
        $card = Card::findOrFail($cardId);
        return response()->json([
            'start_date' => $card->start_date,
            'end_date'   => $card->end_date,
            'end_time'   => $card->end_time,
            'reminder'   => $card->reminder,
        ]);
    }
    public function getCardsByUserBoards($id)
{
    $user = User::findOrFail($id);

    $boards = $user->boards()->with([
        'workspace',
        'lists' => function ($q) {
            $q->with([
                'cards' => function ($q) {
                    $q->where('is_archived', false)->with('labels');
                }
            ]);
        }
    ])->get();

    // Format lại dữ liệu để trả về danh sách thẻ với đầy đủ thông tin
    $cards = [];

    foreach ($boards as $board) {
        foreach ($board->lists as $list) {
            foreach ($list->cards as $card) {
                $cards[] = [
                    'id' => $card->id,
                    'title' => $card->title,
                    'end_date' => $card->end_date,
                    'list_name' => $list->name,
                    'labels' => $card->labels->map(fn($label) => ['name' => $label->name, 'color' => $label->color]),
                    'board_name' => $board->name,
                    'board_thumbnail' => $board->thumbnail,
                    'workspace_name' => $board->workspace->name ?? '',
                ];
            }
        }
    }

    return response()->json([
        'cards' => $cards,
    ]);
}


}
