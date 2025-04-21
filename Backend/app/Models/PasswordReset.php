<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PasswordReset extends Model
{
    // Cấu hình bảng tương ứng
    protected $table = 'password_resets';

    // Các trường cần điền khi tạo hoặc cập nhật
    protected $fillable = ['email', 'token', 'created_at'];

    // Tắt timestamp nếu không cần
    public $timestamps = false;
}
