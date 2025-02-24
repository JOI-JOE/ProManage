<?php

namespace App\Events;

use App\Models\ListBoard;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ListArchived implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public $list;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct(ListBoard $list)
    {
        $this->list = $list;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return Channel|array
     */
    public function broadcastOn()
    {
        return new Channel('list.' . $this->list->id);
    }

    /**
     * Get the name of the event.
     *
     * @return string
     */
    public function broadcastAs()
    {
        return 'list.archived';
    }
}
