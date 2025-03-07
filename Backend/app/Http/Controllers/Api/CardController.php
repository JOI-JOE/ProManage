<?php

namespace App\Http\Controllers\api;

use App\Events\ActivityEvent;
use App\Events\CardCreate;
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
        $validator = Validator::make($request->all(), [
            'columnId' => 'required|uuid|exists:list_boards,id', // Thêm ,id vào exists rule
            'position' => 'required|numeric',
            'title' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Create a new card
        $card = Card::create([
            'list_board_id' => $request->columnId, // Sử dụng columnId đã được validate
            'position' => $request->position,
            'title' => $request->title,
        ]);


        return response()->json($card, 201); // 201 Created
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
            $userName = auth()->user()?->user_name ?? 'ai đó';

            activity()
                ->causedBy(auth()->user())
                ->performedOn($card)
                ->event('updated_name')
                ->withProperties([
                    'old_title' => $oldTitle,
                    'new_title' => $card->title,
                ])
                ->log("{$userName} đã cập nhật tên thẻ từ '{$oldTitle}' thành '{$card->title}'.");
            return response()->json(
                [
                    'status' => true,
                    'data' => $card,
                ]
            );
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
        $userIds = $cards->users->pluck('id')->toArray();
        $userName = auth()->user()?->user_name ?? 'ai đó';
        $request->validate([
            'email' => 'required|email'
        ]);
        // Nếu email không tồn tại trong hệ thống, trả về lỗi
        if (!$user) {
            return response()->json(['message' => 'Email không tồn tại trong hệ thống'], 404);
        }
        $cards = Card::findOrFail($cardId);
        $userByCard = $cards->users->pluck('id')->toArray();
        // Kiểm tra nếu user đã có trong thẻ chưa
        if (!$cards->users()->where('users.id', $user->id)->exists()) {
            $cards->users()->attach($user->id);
            // Tạo hoạt động (ví dụ: ai đó cập nhật thẻ)
            $activity = [
                'message' => $userName . " đã cập nhật thẻ: " . $cards->title,
                'timestamp' => now(),
            ];
            // ghi lại hoạt động
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
            broadcast(new ActivityEvent($activity, $cardId, $userByCard));
            // Gửi thông báo
            $user->notify(new CardNotification('add_member', $cards));
            return response()->json(['message' => 'Đã thêm thành viên vào thẻ và gửi thông báo'], 200);
        }

        return response()->json(['message' => 'Người dùng đã có trong thẻ'], 400);
    }
    // thành viên khỏi card
    public function removeMember($cardId,  $userID)
    {
        $card = Card::find($cardId);
        $user = User::find($userID);
        $user_name = auth()->user()?->user_name ?? 'ai đó';

        // Kiểm tra xem user có trong thẻ không
        if (!$card->users()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'message' => 'Người dùng không tồn tại trong thẻ này'
            ], 404);
        }
        // Xóa user khỏi thẻ
        $card->users()->detach($user->id);
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

        Log::info('Người dùng đăng nhập:', ['user' => auth()->user()]);

        $card = Card::findOrFail($cardId);
        $user_name = auth()->user()->user_name ?? 'ai đó';

        // Validate các trường nhập
        $request->validate([
            'start_date' => 'nullable|date_format:Y-m-d',
            'end_date'   => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
            'end_time'   => 'nullable|date_format:H:i',
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
        $card = Card::with(['activities' => function ($query) {
            $query->orderByDesc('created_at'); // Sắp xếp bản ghi mới nhất lên đầu
        }])->find($cardId);

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
            'tasks' => $card->checklists->flatMap(function ($checklist) {
                return $checklist->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'name' => $item->name,
                        'completed' => (bool) $item->completed,
                    ];
                });
            })->toArray(), // Lấy danh sách công việc từ checklists
        ]);
    }
}
