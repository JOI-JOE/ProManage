<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BoardStar extends Model
{
    use HasFactory;

    protected $table = 'board_stars';
    public $incrementing = false; // UUID không tự ptăng
    protected $keyType = 'string'; // UUID là kiểu string

    protected $fillable = ['id', 'user_id', 'board_id'];

    /**
     * Lấy thông tin user liên quan
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Lấy thông tin board liên quan
     */
    public function board(): BelongsTo
    {
        return $this->belongsTo(Board::class);
    }
}
