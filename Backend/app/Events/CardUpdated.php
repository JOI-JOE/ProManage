<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log; // Import Log Facade

class CardUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $card;
    public $eventType;

    /**
     * Tạo một sự kiện mới.
     */
    public function __construct($card, string $eventType)
    {
        $this->card = is_array($card) ? (object) $card : $card; // Hỗ trợ array & object
        $this->eventType = $eventType;
    }

    /**
     * Xác định kênh broadcast.
     */
    public function broadcastOn(): array
    {
        // Kiểm tra nếu listBoard tồn tại
        $boardId = $this->card->listBoard->board_id ?? null;

        return $boardId ? [new Channel('board.' . $boardId)] : [];
    }

    /**
     * Xác định tên sự kiện broadcast.
     */
    public function broadcastAs(): string
    {
        return $this->eventType;
    }

    /**
     * Dữ liệu gửi đi khi phát sự kiện.
     */
    public function broadcastWith(): array
    {
        Log::info('Kéo thả code', [
            'card' => $this->card->position,
        ]);
        return [
            'id'        => $this->card->id ?? null,
            'columnId'  => $this->card->list_board_id ?? null,
            'title'     => $this->card->title ?? '',
            'position'  => $this->card->position ?? 0,
        ];
    }
}
