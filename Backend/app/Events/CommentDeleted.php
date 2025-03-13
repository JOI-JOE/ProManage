<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CommentDeleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $commentId;
    public $cardId;

    public function __construct($commentId, $cardId)
    {
        $this->commentId = $commentId;
        $this->cardId = $cardId;
    }

    public function broadcastOn()
    {
        return new Channel("card.{$this->cardId}"); // Gửi đến kênh theo cardId
    }

    public function broadcastAs()
    {
        return 'card.comment.deleted'; // Tên event
    }
}
