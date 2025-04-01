<?php
namespace App\Events;

use App\Models\Board;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class BoardStatusChanged implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public $board;

    public function __construct(Board $board)
    {
        $this->board = $board;
    }

    // Xác định kênh phát sóng (private từng board)
    public function broadcastOn()
    {
        return new Channel('boards.' . $this->board->id);
    }

    // Tên sự kiện khi gửi sang frontend
    public function broadcastAs()
    {
        return 'BoardStatusUpdated';
    }
}
