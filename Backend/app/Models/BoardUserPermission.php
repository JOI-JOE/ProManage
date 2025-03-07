<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BoardUserPermission extends Model
{
    use HasFactory;

    protected $fillable = [
        'board_id',
        'user_id',
        'role',
    ];

    // Cấu hình quan hệ với bảng boards và users
    public function board()
    {
        return $this->belongsTo(Board::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
