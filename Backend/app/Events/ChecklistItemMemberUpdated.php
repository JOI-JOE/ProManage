<?php

namespace App\Events;

use App\Models\ChecklistItem;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChecklistItemMemberUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $checklistItem;
    public $user;
    public $action; // "added" hoặc "removed"

    public function __construct($checklistItem, $user, $action)
    {
        $this->checklistItem = $checklistItem;
        $this->user = $user;
        $this->action = $action;
    }

    public function broadcastOn()
    {

        return new Channel("checklist-item.{$this->checklistItem->id}");

    }

    public function broadcastAs()
    {
        return 'ChecklistItemMemberUpdated';
    }
}