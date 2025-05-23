<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CardMemberUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $card;
    public $user;
    public $action; // "added" hoặc "removed"
    public $activity; // Thêm dữ liệu activity

    public function __construct($card, $user, $action, $activity)
    {
        $this->card = $card;
        $this->user = $user;
        $this->action = $action;
        $this->activity = $activity;
    }

    public function broadcastOn()
    {
        return new Channel("card.{$this->card->id}");
    }

    public function broadcastAs()
    {
        return 'CardMemberUpdated';
    }
}
