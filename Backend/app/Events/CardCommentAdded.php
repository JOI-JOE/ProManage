<?php

namespace App\Events;

use App\Models\CommentCard;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CardCommentAdded implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public $comment;

    public function __construct(CommentCard $comment)
    {
        $this->comment = $comment;
    }

    public function broadcastOn()
    {
        return ['card.' . $this->comment->card_id]; // Kênh Pusher
    }

    public function broadcastAs()
    {
        return 'card.comment.added'; // Tên sự kiện
    }
}
