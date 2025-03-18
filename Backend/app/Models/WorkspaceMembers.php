<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkspaceMembers extends Model
{
    use HasFactory;

    public $incrementing = false; // Không sử dụng auto-increment
    protected $keyType = 'string'; // UUID là kiểu string

    public $timestamps = false;

    // Static properties for member types
    public static $ADMIN = 'admin';
    public static $NORMAL = 'normal';
    public static $PENDING = 'pending';
    // protected $primaryKey = ['workspace_id', 'user_id']; // Khóa chính kép
    protected $fillable = [
        'id_workspace',
        'id_member',
        'member_type',
        'is_unconfirmed',
        'joined',
        'is_deactivated',
        'last_active',
    ];

    // Ép kiểu dữ liệu
    protected $casts = [
        'member_type' => 'string',
        'is_unconfirmed' => 'boolean',
        'joined' => 'boolean',
        'is_deactivated' => 'boolean',
        'last_active' => 'datetime',
    ];

    // Kiểm tra thành viên có đang hoạt động không
    public function isActive()
    {
        return !$this->is_deactivated && $this->joined;
    }

    // Kiểm tra thành viên có phải là admin không
    public function isAdmin()
    {
        return $this->member_type === self::$ADMIN;
    }

    public function workspace()
    {
        return $this->belongsTo(Workspace::class, 'workspace_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
