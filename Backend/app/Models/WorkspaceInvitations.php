<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkspaceInvitations extends Model
{
    use HasFactory;

    protected $fillable = [
        'workspace_id',
        'invited_member_id',
        'email',
        'invitation_message',
        'invite_token',
        'accept_unconfirmed',
        'invited_by_member_id',
    ];


    public function workspace()
    {
        return $this->belongsTo(Workspace::class, 'workspace_id');
    }

    public function invitedUser()
    {
        return $this->belongsTo(User::class, 'invited_member_id');
    }
}
