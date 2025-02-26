<?php

namespace App\Http\Controllers\api;

use App\Events\CardCreate;
use App\Http\Controllers\Controller;
use App\Models\Card;
use App\Models\ListBoard;
use App\Models\User;
use App\Notifications\CardMemberAddedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CardController extends Controller
{// app/Http/Controllers/CardController.php



// public function move(Card $card, Request $request)
// {
//     DB::transaction(function () use ($card, $request) {
//         // Cập nhật column mới
//         $card->update([
//             'list_board_id' => $request->newListBoardId,
//             'position' => $request->position
//         ]);

//         // Cập nhật thứ tự các card trong column cũ
//         ListBoard::find($card->getOriginal('list_board_id'))
//             ->cards()
//             ->where('position', '>', $card->getOriginal('position'))
//             ->decrement('position');

//         // Cập nhật thứ tự các card trong column mới
//         ListBoard::find($request->newListBoardId)
//             ->cards()
//             ->where('position', '>=', $request->position)
//             ->increment('position');
//     });

//     return response()->json($card);
// }

 // Cập nhật vị trí của card trong cùng 1 column hoặc giữa 2 column
 public function updateCardPosition(Request $request)
 {
     $request->validate([
         'card_id' => 'required|exists:cards,id',
         'new_position' => 'required|integer|min:0',
         'new_list_board_id' => 'required|exists:list_boards,id'
     ]);

     DB::beginTransaction();
     try {
         $card = Card::findOrFail($request->card_id);

         // Nếu card được di chuyển sang một column khác
         if ($card->list_board_id !== $request->new_list_board_id) {
             // Giảm vị trí của các card trong column cũ (nếu cần)
             Card::where('list_board_id', $card->list_board_id)
                 ->where('position', '>', $card->position)
                 ->decrement('position');

             // Cập nhật column mới và vị trí mới
             $card->list_board_id = $request->new_list_board_id;
         }

         // Cập nhật vị trí của các card trong column mới
         Card::where('list_board_id', $request->new_list_board_id)
             ->where('position', '>=', $request->new_position)
             ->increment('position');

         // Cập nhật vị trí mới cho card
         $card->position = $request->new_position;
         $card->save();

         DB::commit();
         return response()->json([
             'message' => 'Cập nhật vị trí card thành công!',
             'card' => $card
         ], 200);
     } catch (\Exception $e) {
         DB::rollBack();
         return response()->json([
             'message' => 'Có lỗi xảy ra!',
             'error' => $e->getMessage()
         ], 500);
     }
 }
    // lấy thẻ theo danh sách
    public function getCardsByList($listId)
    {



        return response()->json([
            'status' => true,
            'data' => $cards
        ]);

        try {
            $cards = Card::where('list_board_id', $listId)
            ->where('is_archived', 0)
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
        $maxPosition = Card::where('list_board_id', $request->list_board_id)->max('position');

        $card = Card::create([
            'title' => $request->title,
            'list_board_id' => $request->list_board_id,
            'position' => $maxPosition ? $maxPosition + 1 : 1, // Nếu chưa có card nào thì position = 1
        ]);
        
        return response()->json($card);
        
    }
    // cập nhật tên
    public function updateName($cardId, Request $request)
    {
        $card = Card::find($cardId);
        $oldTitle = $card->title;


        $request->validate([
            'title' => 'required'
        ]);
        $oldTitle = $card->title;

        $card->update([
            'title' => $request->title
        ]);
        activity()
            ->causedBy(auth()->user())
            ->performedOn($card)
            ->event('updated_name')
            ->withProperties([
                'old_title' => $oldTitle,
                'new_title' => $card->title,
            ])
            ->log($card->getCustomDescription('updated_name'));




        return response()->json(
            [
                'status' => true,
                'data' => $card,
            ]
        );
    }
    // cập nhật mô tả
    public function updateDescription($cardId, Request $request,)
    {
        $card = Card::find($cardId);
        $request->validate([
            'description' => 'nullable|string|max:1000'
        ]);

        $card->update([
            'description' => $request->description
        ]);



        return response()->json([
            'message' => 'Mô tả đã được cập nhật thành công',
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
    public function removeMember($cardId,  $userID)
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
            'end_date'   => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
            'end_time'   => 'nullable|date_format:H:i',

        ]);

        $card = Card::findOrFail($cardId);

        // $card->start_date = $request->start_date;
        // $card->end_date = $request->end_date;
        // $card->end_time = $request->end_time;
        // dd($request->all());
        // $card->save();
        $card->update([
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'end_time' => $request->end_time,
        ]);
        activity()
            ->causedBy(auth()->user())
            ->performedOn($card)
            ->event('updated_datetime')
            ->withProperties([
                'card_title' => $card->title,
                'start_date' => $request->start_date,
                'end_date'   => $request->end_date,
                'end_time'   => $request->end_time,
            ])
            ->log($card->getCustomDescription('updated_datetime', $request->start_date, $request->end_date, $request->end_time));

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
}
