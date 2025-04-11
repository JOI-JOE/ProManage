<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class BoardInvitation extends Model
{
    use HasFactory;

    protected $table = 'invite_boards'; // Tên bảng trong database

    protected $primaryKey = 'id';
    public $incrementing = false; // Do UUID không tự tăng
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'board_id',
        'invited_member_id',
        'email',
        'invite_token',
        'status',
        'invitation_message',
        'invited_by',
        'accept_unconfirmed',
    ];

    protected $casts = [
        'accept_unconfirmed' => 'boolean',
    ];

    /**
     * Boot function để tự động tạo UUID cho ID
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($invite) {
            $invite->id = (string) Str::uuid();
        });
    }

    /**
     * Mối quan hệ: Lời mời thuộc về một bảng
     */
    public function board()
    {
        return $this->belongsTo(Board::class);
    }

    /**
     * Mối quan hệ: Người nhận lời mời (nếu có tài khoản)
     */
    public function invitedMember()
    {
        return $this->belongsTo(User::class, 'invited_member_id');
    }

    /**
     * Mối quan hệ: Người gửi lời mời
     */
    public function invitedByUser()
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    /**
     * Kiểm tra xem lời mời có còn hiệu lực hay không
     */
    public function isExpired(): bool
    {
        return $this->status === 'expired';
    }
}
