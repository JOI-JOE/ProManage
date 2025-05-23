<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class WorkspaceInvitations extends Model
{
    use HasFactory;
    protected $primaryKey = 'id'; // Đặt UUID làm khóa chính
    public $incrementing = false; // Vô hiệu hóa tự động tăng ID
    protected $keyType = 'string'; // Định dạng khóa chính là chuỗi


    protected $fillable = [
        'id',
        'workspace_id',
        'invited_member_id',
        'email',
        'invitation_message',
        'invite_token',
        'accept_unconfirmed',
        'invited_by_member_id',
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

    protected $casts = [
        'id' => 'string', // Đảm bảo ID luôn là string khi trả về JSON
    ];


    public function workspace()
    {
        return $this->belongsTo(Workspace::class, 'workspace_id');
    }

    public function inviter()
    {
        return $this->belongsTo(User::class, 'invited_by_member_id');
    }
}
