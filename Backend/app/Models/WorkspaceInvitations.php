<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkspaceInvitations extends Model
{
    use HasFactory;
    protected $table = 'workspace_invitations'; // Xác định tên bảng đúng
    protected $fillable = [
        'id_workspace',
        'id_invited_member',
        'email',
        'invitation_message',
        'invite_token',
        'accept_unconfirmed',
        'id_invited_by_member',
    ];

    public function workspace()
    {
        return $this->belongsTo(Workspace::class, 'id_workspace');
    }

    public function invitedMember()
    {
        return $this->belongsTo(User::class, 'id_invited_member');
    }

    public function invitedBy()
    {
        return $this->belongsTo(User::class, 'id_invited_by_member');
    }
}
