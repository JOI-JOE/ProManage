<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Log;
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
    // protected $appends = ['similarity']; // Thêm trường similarity vào output JSON

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


    // public function workspaces()
    // {
    //     return $this->hasMany(Workspace::class, 'id_member_creator');
    // }

    public function boards()
    {
        return $this->hasMany(Board::class, 'created_by');
    }

    public function boardStars()
    {
        return $this->hasMany(BoardStar::class, 'user_id');
    }
    public function workspaceMember()
    {
        return $this->hasMany(WorkspaceMembers::class, 'user_id', 'id');
    }

    public function boardMembers()
    {
        return $this->hasMany(BoardMember::class, 'user_id', 'id');
    }

    public function comments()
    {
        return $this->hasMany(CommentCard::class);  // Mỗi user có thể tạo nhiều bình luận
    }

    public function boardsMember()
    {
        return $this->belongsToMany(Board::class, 'board_members', 'user_id', 'board_id')
            ->withPivot('role')
            ->wherePivot('role', 'member');
    }

    public function boardMember()
    {
        return $this->hasMany(BoardMember::class, 'user_id', 'id');
    }

    // / Quan hệ với Workspaces chính thức (User là member)
    public function workspaces()
    {
        return $this->belongsToMany(Workspace::class, 'workspace_members', 'user_id', 'workspace_id')
            ->withPivot('member_type'); // Nếu có cột role
    }


    // Quan hệ để lấy Guest Workspaces
    //    / Trong User.php
    public function guestWorkspaces()
    {
        $userId = $this->id;
        Log::info('User ID: ' . $userId);
        Log::info('BoardsMember IDs: ' . json_encode($this->boardsMember->pluck('id')->toArray()));

        $query = Workspace::whereHas('boards', function ($query) {
            $query->whereIn('boards.id', $this->boardsMember->pluck('id'));
        })->whereDoesntHave('members', function ($query) use ($userId) {
            $query->where('workspace_members.user_id', $userId);
        })->with(['boards' => function ($query) {
            $query->whereIn('id', $this->boardsMember->pluck('id'));
        }]);

        Log::info('SQL: ' . $query->toSql());
        Log::info('Bindings: ' . json_encode($query->getBindings()));
        Log::info('Result: ' . json_encode($query->get()->toArray()));
        return $query;
    }


    public function checklistItems()
    {
        return $this->belongsToMany(ChecklistItem::class, 'checklist_item_user', 'user_id', 'checklist_item_id');
    }
}
