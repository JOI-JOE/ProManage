<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The primary key type.
     *
     * @var string
     */
    protected $keyType = 'string'; // ID sẽ là string thay vì integer

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false; // Không sử dụng auto-increment

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $primaryKey = 'id'; // Đảm bảo Laravel hiểu id là UUID
    protected $fillable = [
        'id',  // Đảm bảo có thể tạo ID UUID thủ công
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

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'id' => 'string',
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];


    protected $appends = ['similarity']; // Thêm trường similarity vào output JSON

    public function getSimilarityAttribute()
    {
        $queryText = request()->input('query', '');
        $idWorkspace = request()->input('idWorkspace', '');

        return app()->call('App\Http\Controllers\Api\WorkspaceInvitationsController@searchMembers', [
            'user' => $this,
            'queryText' => $queryText,
            'idWorkspace' => $idWorkspace
        ]);
    }
    /**
     * Get the workspaces associated with the user.
     */


    public function workspaces()
    {
        return $this->hasMany(Workspace::class, 'id_member_creator');
    }

    public function workspaceMember()
    {
        return $this->hasMany(WorkspaceMembers::class, 'user_id', 'id');
    }

    public function boardMember()
    {
        return $this->hasMany(BoardMember::class, 'user_id', 'id');
    }


    public function comments()
    {
        return $this->hasMany(CommentCard::class);  // Mỗi user có thể tạo nhiều bình luận
    }

    public function boardsMemmber()
    {
        return $this->belongsToMany(Board::class, 'board_member', 'user_id', 'board_id')
        ->withPivot('role');
    }
 
}
