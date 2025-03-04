<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkspaceMembers extends Model
{
    use HasFactory;
    public $incrementing = false; // Không sử dụng auto-increment
    protected $keyType = 'string'; // UUID là kiểu string
    protected $primaryKey = ['id_workspace', 'id_member']; // Đặt khóa chính kép


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
        return $this->belongsTo(Workspace::class, 'workspace_id'); // 'workspace_id' is the foreign key
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id'); // 'id_member' is the foreign key
    }
}
