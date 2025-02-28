<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_name',
        'full_name',
        'initials',
        'image',
        'email',
        'password',
        'role',
        'activity_block',
        'github_id',
        'google_id',
        'google_access_token',
        'google_refresh_token',
        'github_avatar',
        'google'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Get the workspaces associated with the user.
     */

    public function boards()
    {
        return $this->hasMany(Board::class, 'created_by');
    }

    public function workspaces()
    {
        return $this->hasMany(Workspace::class, 'id_member_creator');
    }

    public function workspaceMember()
    {
        return $this->hasOne(WorkspaceMembers::class, 'id_member');
    }
}
