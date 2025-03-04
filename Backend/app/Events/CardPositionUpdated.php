<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CardPositionUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $cardId;
    public $sourceListId;
    public $targetListId;
    public $position;
    public $sourceListCards;
    public $targetListCards;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct($cardId, $sourceListId, $targetListId, $position, $sourceListCards, $targetListCards)
    {
        $this->cardId = $cardId;
        $this->sourceListId = $sourceListId;
        $this->targetListId = $targetListId;
        $this->position = $position;
        $this->sourceListCards = $sourceListCards;
        $this->targetListCards = $targetListCards;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        return new PrivateChannel('card-position-updated');
    }
}
