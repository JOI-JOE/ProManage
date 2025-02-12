<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkspaceMembers extends Model
{
    use HasFactory;

    protected $fillable = [
        'id_workspace',
        'id_member',
        'member_type',
        'is_unconfirmed',
        'is_deactivated',
        'activity_blocked',
        'id_member_referrer',
        'last_active',
    ];

    public function workspace()
    {
        return $this->belongsTo(Workspace::class, 'id_workspace');
    }

    public function member()
    {
        return $this->belongsTo(User::class, 'id_member');
    }
}
