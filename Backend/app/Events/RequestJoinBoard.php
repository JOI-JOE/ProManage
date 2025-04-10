<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RequestJoinBoard implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $board_id;
    public $user_id;
    public $user_name;
    public $request_id;
    public $admin_ids; // Danh sách admin để gửi riêng

    public function __construct($board_id, $user_id, $user_name, $request_id, $admin_ids)
    {
        $this->board_id = $board_id;
        $this->user_id = $user_id;
        $this->user_name = $user_name;
        $this->request_id = $request_id;
        $this->admin_ids = $admin_ids; // Truyền danh sách admin IDs
    }

    public function broadcastOn()
    {
        // Trả về mảng các private channel cho từng admin

        return array_map(function ($adminId) {
            return new PrivateChannel("App.Models.User.{$adminId}");
        }, $this->admin_ids);
    }

    public function broadcastWith()
    {
        $user = User::find($this->user_id);
        return [
            'board_id' => $this->board_id,
            'user_id' => $this->user_id,
            'user_name' => $this->user_name,
            'request_id' => $this->request_id,
            'email' => $user ? $user->email : null,
            'message' => "Người dùng {$this->user_name} đã gửi yêu cầu tham gia bảng.",
        ];
    }
}
