<?php

namespace App\Notifications;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class ChecklistItemMemberNotification extends Notification implements ShouldBroadcast, ShouldQueue
{
    use Queueable;

    protected $checklistItem;
    protected $user;
    protected $action; // 'added' hoặc 'removed'
    protected $causer;

    public function __construct($checklistItem, $user, $action, $causer)
    {
        $this->checklistItem = $checklistItem;
        $this->user = $user;
        $this->action = $action;
        $this->causer = $causer;
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'message' => $this->action === 'added'
                ? "Đã chỉ định {$this->checklistItem->name} cho bạn trên danh sách công việc {$this->checklistItem->checklist->name}"
                : "{$this->user->full_name} đã bị xoá khỏi một checklist item.",
            'checklist_item_id' => $this->checklistItem->id,
            'checklist_item_name' => $this->checklistItem->name,
            'checklist_id' => $this->checklistItem->checklist->id,
            'checklist_name' => $this->checklistItem->checklist->name,
            'card_id' => $this->checklistItem->checklist->card->id,
            'card_title' => $this->checklistItem->checklist->card->title,
            'list_name' => $this->checklistItem->checklist->card->list->name,
            'list_id' => $this->checklistItem->checklist->card->list->id,
            'board_name' => $this->checklistItem->checklist->card->list->board->name,
            'board_id' => $this->checklistItem->checklist->card->list->board->id,
            'by_user' => [
                'id' => $this->causer->id,
                'full_name' => $this->causer->full_name,
            ],
            'action' => $this->action,
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage($this->toDatabase($notifiable));
    }

    public function broadcastOn()
    {
        return new PrivateChannel('App.Models.User.' . $this->user->id);
    }
}
