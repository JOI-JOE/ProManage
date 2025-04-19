<?php

namespace App\Events;

use App\Models\Card;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CommentUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $comment;
    public $card;
    public $user;

    public function __construct($comment, Card $card, $user)
    {
        $this->comment = $comment;
        $this->card = $card;
        $this->user = $user;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('card.' . $this->card->id),
        ];
    }

    public function broadcastAs()
    {
        return 'comment.updated';
    }

    public function broadcastWith(): array
    {
        $data = [
            'comment' => [
                'id' => $this->comment['id'],
                'content' => $this->comment['content'],
                'card_id' => $this->comment['card_id'],
                'member_id' => $this->comment['member_id'],
                'created_at' => $this->comment['created_at'],
                'updated_at' => $this->comment['updated_at'],
                'member' => [
                    'id' => $this->comment['member']['id'],
                    'full_name' => $this->comment['member']['full_name'],
                    'user_name' => $this->comment['member']['user_name'],
                    'avatar' => $this->comment['member']['avatar'],
                    'initials' => $this->comment['member']['initials'],
                ],
            ],
            'card_id' => $this->card->id,
            'user_id' => $this->user ? $this->user->id : null,
        ];
        Log::info('Broadcasting comment.updated:', $data);
        return $data;
    }
}
