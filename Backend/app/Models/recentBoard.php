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
        'last_accessed'
    ];

    public function board()
    {
        return $this->belongsTo(Board::class);
    }

    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }
}
