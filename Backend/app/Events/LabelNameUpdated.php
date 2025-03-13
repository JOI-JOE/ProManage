<?php

namespace App\Events;

use App\Models\Label;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LabelNameUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $label;

    public function __construct(Label $label)
    {
        $this->label = $label;
    }

    public function broadcastOn()
    {
        return new Channel('board.' . $this->label->board_id);
    }

    public function broadcastAs()
    {
        return 'label.nameUpdated';
    }
}
