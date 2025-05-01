<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class WorkspaceMemberTypeChangedNotification extends Notification
{
    use Queueable;

    protected $workspaceId;
    protected $workspaceName;
    protected $changerName;
    protected $newType;

    public function __construct($workspaceId, $workspaceName, $changerName, $newType)
    {
        $this->workspaceId = $workspaceId;
        $this->workspaceName = $workspaceName;
        $this->changerName = $changerName;
        $this->newType = $newType;
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    public function toArray($notifiable)
    {
        $roleText = $this->newType === 'admin' ? 'quản trị viên' : 'thành viên';

        return [
            'workspace_id' => $this->workspaceId,
            'workspace_name' => $this->workspaceName,
            'changer_name' => $this->changerName,
            'message' => $this->changerName . ' đã thay đổi vai trò của bạn trong workspace "' . $this->workspaceName . '" thành ' . $roleText . '.',
            'new_type' => $this->newType,
            'type' => 'workspace_role_changed',
        ];
    }

    public function toBroadcast($notifiable)
    {
        $roleText = $this->newType === 'admin' ? 'quản trị viên' : 'thành viên thường';

        return new BroadcastMessage([
            'workspace_id' => $this->workspaceId,
            'workspace_name' => $this->workspaceName,
            'changer_name' => $this->changerName,
            'message' => $this->changerName . ' đã thay đổi vai trò của bạn trong workspace "' . $this->workspaceName . '" thành ' . $roleText . '.',
            'new_type' => $this->newType,
            'type' => 'workspace_role_changed',
            'created_at' => now()->toDateTimeString(),
        ]);
    }
}
