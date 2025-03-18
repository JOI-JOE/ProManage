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

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    protected $casts = [
        'id' => 'string', // Đảm bảo ID luôn là string khi trả về JSON
    ];


    public function workspace()
    {
        return $this->belongsTo(Workspace::class, 'workspace_id');
    }

    // public function invitedBy()
    // {
    //     return $this->belongsTo(User::class, 'id_invited_by_member');
    // }
}
