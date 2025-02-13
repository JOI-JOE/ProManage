<?php

namespace App\Models;

use App\Events\UpdateInfoWorkspace;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Workspace extends Model
{
    use HasFactory;

    protected $fillable = [
        'id_member_creator',
        'name',
        'display_name',
        'desc',
        'logo_hash',
        'logo_url',
        'permission_level',
        'board_invite_restrict',
        'org_invite_restrict',
        'board_delete_restrict',
        'board_visibility_restrict',
        'team_type',
    ];


    public function user()
    {
        return $this->belongsTo(User::class, 'id_member_creator');
    }

    public function boards()
    {
        return $this->hasMany(Board::class);
    }

    protected $dispatchesEvents = [
        'updated' => UpdateInfoWorkspace::class,
    ];
}
