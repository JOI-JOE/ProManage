<?php

namespace App\Events;

use App\Models\Card;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CardCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $card;

    /**
     * Tạo một instance event.
     *
     * @param Card $card
     */
    public function __construct(Card $card)
    {
        $this->card = $card;
    }

    /**
     * Xác định channel để broadcast.
     *
     * @return Channel
     */
    public function broadcastOn()
    {
        // Kiểm tra xem có tồn tại list_board và board_id hay không
        if ($this->card->list_board) {
            return new Channel('board.' . $this->card->list_board->board_id);
        }
        return new Channel('board.default'); // Channel mặc định nếu không có list_board
    }

    /**
     * Xác định tên sự kiện để broadcast.
     *
     * @return string
     */
    public function broadcastAs()
    {
        return 'card.created';
    }

    /**
     * Dữ liệu sẽ được gửi cùng với sự kiện.
     *
     * @return array
     */
    public function broadcastWith()
    {
        $card = $this->card;

        $cardData = [
            'id' => $card->id,
            'title' => $card->title,
            'thumbnail' => $card->thumbnail,
            'position' =>  $card->position,
            'list_board_id' => $card->list_board_id,
            'is_archived' => (bool) $card->is_archived,
            'is_completed' => (bool) $card->is_completed,
        ];

        return $cardData;
    }
}
