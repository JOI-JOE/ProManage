<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkspaceMembers extends Model
{
    use HasFactory;
    public $incrementing = false; // Không sử dụng auto-increment
    protected $keyType = 'string'; // UUID là kiểu string
    protected $primaryKey = ['workspace_id', 'id_member']; // Đặt khóa chính kép
    // Static properties for member types
    public $timestamps = false;
    public static $ADMIN = 'admin';
    public static $NORMAL = 'normal';
    protected $fillable = [
        'workspace_id',
        'user_id',
        'member_type',
        'is_unconfirmed',
        'joined',
        'is_deactivated',
        // 'id_member_referrer',
        'last_active',
    ];

    // Phương thức kiểm tra thành viên có đang hoạt động không
    public function isActive()
    {
        return !$this->is_deactivated && $this->joined;
    }

    // Phương thức kiểm tra thành viên có phải là admin không
    public function isAdmin()
    {
        return $this->member_type === 'admin';
    }

    public function workspace()
    {
        return $this->belongsTo(Workspace::class, 'workspace_id'); // 'workspace_id' is the foreign key
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id'); // 'id_member' is the foreign key
    }
}
