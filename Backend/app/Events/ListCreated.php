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

class ListCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $list;

    // Khởi tạo event với thông tin list
    public function __construct(ListBoard $list)
    {
        $this->list = $list;
    }

    // Chỉ định channel để phát sự kiện
    public function broadcastOn()
    {
        return new Channel('board.' . $this->list->board_id); 
    }

    // Đặt tên sự kiện
    public function broadcastAs()
    {
        return 'list.created';
    }

    // Dữ liệu sẽ được phát đi
    public function broadcastWith()
    {
        return [
            'newList' => $this->list,
        ];
    }
}
