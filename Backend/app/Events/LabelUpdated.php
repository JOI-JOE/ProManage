<?php

namespace App\Events;

use App\Models\Card;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class LabelUpdated implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public $card;
    public $labels;

    public function __construct(Card $card)
    {
        $this->card = $card;
        $this->labels = $card->labels()->get(); // Lấy danh sách nhãn mới nhất
    }

    public function broadcastOn()
    {
        return new Channel('card.' . $this->card->id);
    }

    public function broadcastAs()
    {
        return 'label.updated'; // Tên sự kiện sẽ lắng nghe trên frontend
    }
}
