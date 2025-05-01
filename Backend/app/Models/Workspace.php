<?php

namespace App\Models;

use App\Events\WorkspaceUpdate;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Workspace extends Model
{
    use HasFactory;
    protected $primaryKey = 'id'; // Đặt UUID làm khóa chính
    public $incrementing = false; // Vô hiệu hóa tự động tăng ID
    protected $keyType = 'string'; // Định dạng khóa chính là chuỗi

    protected $fillable = [
        'id', // Thêm UUID vào danh sách fillable
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

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    public static function generateUniqueName($display_name): string
    {
        $parts = explode(" ", strtolower(trim($display_name)));
        if (count($parts) < 2) return strtolower($display_name); // Nếu chỉ có 1 phần, dùng nguyên tên

        $usernameBase = $parts[count($parts) - 2] . $parts[count($parts) - 1]; // Lấy 2 phần cuối
        $username = $usernameBase;
        $counter = 1;

        // Kiểm tra trùng lặp
        while (self::where('name', $username)->exists()) {
            $username = $usernameBase . $counter;
            $counter++;
        }

        return $username;
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'workspace_members', 'workspace_id', 'user_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'id_member_creator');
    }

    public function boards()
    {
        return $this->hasMany(Board::class, 'workspace_id');
    }
    public function markedBoards()
    {
        return $this->hasMany(Board::class)->where('is_marked', 1);
    }

    public function members()
    {
        return $this->hasMany(WorkspaceMembers::class, 'workspace_id');
    }
    ///quoc 26/4
    public function members2()
    {
       return $this->belongsToMany(User::class, 'workspace_members', 'workspace_id', 'user_id');
    }
    protected $dispatchesEvents = [
        'created' => WorkspaceUpdate::class,
        'updated' => WorkspaceUpdate::class
    ];
}
