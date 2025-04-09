<?php
namespace App\Events;

use App\Models\Card;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;

class CardMoved implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $card;
    public $oldListId;
    public $newListId;

    public function __construct(Card $card, $oldListId, $newListId)
    {
        $this->card = $card;
        $this->oldListId = $oldListId;
        $this->newListId = $newListId;
    }

    public function broadcastOn()
    {
        return new Channel('boards.' . $this->card->listBoard->board_id);
    }

    public function broadcastAs()
    {
        return 'card.moved';
    }
}

