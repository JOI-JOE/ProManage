<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MemberRemovedFromBoard implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $board_id;
    public $user_id; // User bị xóa
    public $user_name; // Tên của user bị xóa
    public $member_ids; // Danh sách tất cả thành viên trong bảng

    public function __construct($board_id, $user_id, $user_name, $member_ids)
    {
        $this->board_id = $board_id;
        $this->user_id = $user_id;
        $this->user_name = $user_name;
        $this->member_ids = $member_ids;
    }
    public function broadcastOn()
    {
        // Gửi tới kênh private của tất cả thành viên
        return array_map(function ($memberId) {
            return new PrivateChannel("App.Models.User.{$memberId}");
        }, $this->member_ids);
    }

    public function broadcastWith()
    {
        return [
            'board_id' => $this->board_id,
            'user_id' => $this->user_id,
            'user_name' => $this->user_name,
            'message' => "Thành viên {$this->user_name} (ID: {$this->user_id}) đã rời khỏi bảng.",
        ];
    }
}
