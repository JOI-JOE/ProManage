<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BoardMember extends Model
{
    use HasFactory;


    protected $fillable = [
        'board_id',
        'user_id',
        'role',
        'is_unconfirmed',
        'joined',
        'is_deactivated',
        'referrer_id',
        'last_active',
    ];

    
    public function board()
    {
        return $this->belongsTo(Board::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
