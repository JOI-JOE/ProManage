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
        'joined',
        'is_deactivated',
        'id_member_referrer',
        'last_active',
    ];

    public function workspace()
    {
        return $this->belongsTo(Workspace::class, 'id_workspace');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'id_member'); // 'id_member' is the foreign key
    }
}
