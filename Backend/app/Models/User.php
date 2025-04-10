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
        'biography',
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


     public function workspaces_2()
    {
        return $this->hasMany(Workspace::class, 'id_member_creator')->with(['boards' => function ($query) {
            $query->where('closed', false);
        }]);
    }

    public function boards()
    {
        return $this->hasMany(Board::class, 'created_by');
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

    public function guestWorkspaces()
    {
        return Workspace::whereHas('boards.boardMembers', function ($query) {
            $query->where('user_id', $this->id);
        })->where('id_member_creator', '!=', $this->id);
    }


    // Quan hệ để lấy Guest Workspaces
    //    / Trong User.php
    // public function guestWorkspaces()
    // {
    //     $userId = $this->id;
    
    //     // Lấy danh sách ID các board mà user tham gia (thành viên hoặc quản trị)
    //     $boardIds = $this->boardsMember->pluck('id')->toArray();
    
    //     Log::info('User ID: ' . $userId);
    //     Log::info('Board IDs: ' . json_encode($boardIds));
    
    //     // Nếu không có board nào thì trả về collection rỗng
    //     if (empty($boardIds)) {
    //         Log::info('User has no boards, returning empty collection.');
    //         return collect([]);
    //     }
    
    //     // Truy vấn lấy danh sách các workspace có chứa các board này (loại bỏ trùng)
    //     $workspaces = Workspace::whereHas('boards', function ($query) use ($boardIds) {
    //             $query->whereIn('boards.id', $boardIds);
    //         })
    //         ->select('id', 'name')  // Lấy cả id và name của workspace
    //         ->distinct()            // Loại bỏ trùng lặp
    //         ->get();                // Trả về collection thay vì chỉ danh sách tên
    
    //     Log::info('Workspaces: ' . json_encode($workspaces));
    
    //     return $workspaces;
    // }
}
