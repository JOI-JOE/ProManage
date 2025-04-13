<?php

namespace App\Http\Controllers\api;

use App\Events\CardArchiveToggled;
use App\Events\CardCreated;
use App\Events\CardDeleted;
use App\Events\CardDescriptionUpdated;
use App\Events\CardNameUpdated;
use App\Http\Controllers\Controller;
use App\Models\Card;
use App\Models\ListBoard;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Jobs\SendReminderNotificationCard;
use Carbon\Carbon;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class CardController extends Controller
{ // app/Http/Controllers/CardController.php

    //-------------------------------------------------------------------
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
    public function show($cardId)
    {
        // 1. Lấy thông tin cơ bản của card cùng với list board
        $card = DB::table('cards')
            ->select([
                'cards.id',
                'cards.title',
                'cards.description',
                'cards.thumbnail',
                'cards.position',
                'cards.start_date',
                'cards.end_date',
                'cards.end_time',
                'cards.reminder',
                'cards.is_completed',
                'cards.is_archived',
                'cards.list_board_id',
                'list_boards.name as list_board_name',
                DB::raw('(SELECT COUNT(*) FROM comment_cards WHERE comment_cards.card_id = cards.id) as comment_count'),
                DB::raw('(SELECT COUNT(*) FROM attachments WHERE attachments.card_id = cards.id) as attachment_count'),
                DB::raw('(
                SELECT COUNT(*) 
                FROM checklists cl 
                JOIN checklist_items cli ON cl.id = cli.checklist_id 
                WHERE cl.card_id = cards.id
            ) as total_checklist_items'),
                DB::raw('(
                SELECT COUNT(*) 
                FROM checklists cl 
                JOIN checklist_items cli ON cl.id = cli.checklist_id 
                WHERE cl.card_id = cards.id AND cli.is_completed = 1
            ) as completed_checklist_items')
            ])
            ->join('list_boards', 'cards.list_board_id', '=', 'list_boards.id')
            ->where('cards.id', $cardId)
            ->where('cards.is_archived', 0)
            ->first();

        if (!$card) {
            return response()->json(['message' => 'Card not found'], 404);
        }

        // 2. Lấy labels
        $labels = DB::table('card_label')
            ->join('labels', 'card_label.label_id', '=', 'labels.id')
            ->select('labels.id as label_id', 'labels.title', 'labels.color_id')
            ->where('card_label.card_id', $cardId)
            ->get()
            ->map(function ($label) {
                return [
                    'id' => $label->label_id,
                    'name' => $label->title,
                    'color' => $label->color_id,
                ];
            });

        $labelIds = $labels->pluck('id');

        // 3. Lấy member IDs
        $memberIds = DB::table('card_user')
            ->where('card_user.card_id', $cardId)
            ->pluck('user_id');

        // 4. Lấy checklists IDs
        $checklistsIds = DB::table('checklists')
            ->where('card_id', $cardId)
            ->pluck('id');

        // 5. Trả về dữ liệu
        return [
            'id' => $card->id,
            'title' => $card->title,
            'description' => $card->description,
            'thumbnail' => $card->thumbnail,
            'position' => (float)$card->position,
            'is_archived' => (bool)$card->is_archived,
            'list_board_id' => $card->list_board_id,
            'list_board_name' => $card->list_board_name,
            'labelId' => $labelIds,
            'labels' => $labels,
            'membersId' => $memberIds,
            'checklistsId' => $checklistsIds, // Chỉ trả về mảng checklistsId
            'badges' => [
                'attachments' => (int)$card->attachment_count,
                'comments' => (int)$card->comment_count,
                'start' => $card->start_date,
                'due' => $card->end_date,
                'dueTime' => $card->end_time,
                'dueReminder' => $card->reminder,
                'dueComplete' => (bool)$card->is_completed,
                'checkItems' => (int)$card->total_checklist_items,
                'checkItemsChecked' => (int)$card->completed_checklist_items,
                'description' => !empty($card->description),
            ],
        ];
    }
    public function update(Request $request, $cardId)
    {
        $validatedData = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|nullable|string',
            'thumbnail' => 'sometimes|nullable|string|max:255',
            'position' => 'sometimes|numeric|min:0',
            'start_date' => 'sometimes|nullable|date',
            'end_date' => 'sometimes|nullable|date',
            'end_time' => 'sometimes|nullable|date_format:H:i',
            'reminder' => 'sometimes|nullable|date',
            'is_completed' => 'sometimes|boolean',
            'is_archived' => 'sometimes|boolean',
        ]);

        if (isset($validatedData['title'])) {
            $this->updateCardTitle($cardId, $validatedData['title']);
        }

        if (array_key_exists('description', $validatedData)) {
            $this->updateCardDescription($cardId, $validatedData['description']);
        }

        if (array_key_exists('thumbnail', $validatedData)) {
            $this->updateCardThumbnail($cardId, $validatedData['thumbnail']);
        }

        if (isset($validatedData['position'])) {
            $this->updateCardPosition($cardId, $validatedData['position']);
        }

        // Gộp xử lý ngày giờ
        $this->updateCardDates($cardId, $validatedData);

        if (isset($validatedData['is_completed'])) {
            $this->updateCardIsCompleted($cardId, $validatedData['is_completed']);
        }

        if (isset($validatedData['is_archived'])) {
            $this->updateCardIsArchived($cardId, $validatedData['is_archived']);
        }

        $card = DB::table('cards')->where('id', $cardId)->first();

        return response()->json([
            'message' => 'Card updated successfully.',
            'card' => $card
        ]);
    }
    private function updateCardDates($cardId, $validatedData)
    {
        $updates = [];

        if (array_key_exists('start_date', $validatedData)) {
            $updates['start_date'] = $validatedData['start_date'];
        }

        if (array_key_exists('end_date', $validatedData)) {
            $updates['end_date'] = $validatedData['end_date'];
        }

        if (array_key_exists('end_time', $validatedData)) {
            $updates['end_time'] = $validatedData['end_time'];
        }

        if (array_key_exists('reminder', $validatedData)) {
            $updates['reminder'] = $validatedData['reminder'];
        }

        if (!empty($updates)) {
            DB::table('cards')->where('id', $cardId)->update($updates);
        }
    }
    // Các hàm còn lại giữ nguyên
    private function updateCardTitle($cardId, $title)
    {
        DB::table('cards')->where('id', $cardId)->update(['title' => $title]);
    }

    private function updateCardDescription($cardId, $description)
    {
        DB::table('cards')->where('id', $cardId)->update(['description' => $description]);
    }

    private function updateCardThumbnail($cardId, $thumbnail)
    {
        DB::table('cards')->where('id', $cardId)->update(['thumbnail' => $thumbnail]);
    }

    private function updateCardPosition($cardId, $position)
    {
        DB::table('cards')->where('id', $cardId)->update(['position' => $position]);
    }

    private function updateCardIsCompleted($cardId, $isCompleted)
    {
        DB::table('cards')->where('id', $cardId)->update(['is_completed' => $isCompleted]);
    }

    private function updateCardIsArchived($cardId, $isArchived)
    {
        DB::table('cards')->where('id', $cardId)->update(['is_archived' => $isArchived]);
    }

    public function destroy($cardId)
    {
        // 📌 Kiểm tra sự tồn tại
        $card = DB::table('cards')->where('id', $cardId)->first();

        if (!$card) {
            return response()->json(['message' => 'Card not found'], 404);
        }

        try {
            DB::table('cards')->where('id', $cardId)->delete();

            return response()->json(['message' => 'Card deleted successfully.'], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to delete card.',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    //-------------------------------------------------------------------


    // ---------------------------------------------
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
}
