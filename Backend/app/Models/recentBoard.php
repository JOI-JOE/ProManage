<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class recentBoard extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'board_id',
        // thêm các trường khác vào đây nếu cần thiết
    ];
}
