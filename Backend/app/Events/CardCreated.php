<?php

namespace App\Events;

use App\Models\Card;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CardCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $card;

    public function __construct(Card $card)
    {
        $this->card = $card;
    }

    public function broadcastOn(): array
    {
        try {
            if (!$this->card->relationLoaded('list_board')) {
                $this->card->load('list_board');
            }
            $boardId = $this->card->list_board->board_id ?? null;

            return [new Channel('board.' . $boardId)];
        } catch (\Exception $e) {
            Log::error('Failed to determine broadcast channel for CardCreated: ' . $e->getMessage());
            return [];
        }
    }

    public function broadcastAs()
    {
        return 'card.created';
    }

    public function broadcastWith()
    {
        $data = [
            'id' => $this->card->id,
            'list_board_id' => $this->card->list_board_id,
            'title' => $this->card->title,
            'position' => $this->card->position,
        ];

        Log::info('CardCreated event hau', $data);

        return $data;
    }

    public function broadcastWhen(): bool
    {
        return !empty($this->broadcastOn());
    }
}
