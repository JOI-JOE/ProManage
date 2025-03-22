<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class BoardMember extends Model
{
    use HasFactory;

    // protected $primaryKey = 'id'; // Đặt UUID làm khóa chính
    public $incrementing = false; // Vô hiệu hóa tự động tăng ID

    protected $fillable = [
        'id',
        'board_id',
        'user_id',
        'role',
        'is_unconfirmed',
        'joined',
        'is_deactivated',
        'referrer_id',
        'last_active',
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

    public function board()
    {
        return $this->belongsTo(Board::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function members()
    {
        return $this->belongsTo(User::class);
    }
}
