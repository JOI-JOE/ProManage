<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CommentDeleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $commentId;
    public $cardId;
    public $userId;

    public function __construct($commentId, $cardId, $userId)
    {
        $this->commentId = $commentId;
        $this->cardId = $cardId;
        $this->userId = $userId;
    }

    public function broadcastOn()
    {
        return new Channel('card.' . $this->cardId);
    }

    public function broadcastAs()
    {
        return 'comment.deleted';
    }

    public function broadcastWith()
    {
        $data = [
            'comment_id' => $this->commentId,
            'card_id' => $this->cardId,
            'user_id' => $this->userId,
        ];
        Log::info('Broadcasting comment.deleted:', $data);
        return $data;
    }
}
