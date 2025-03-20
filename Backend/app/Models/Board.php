<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Board extends Model
{
    use HasFactory;
    public $incrementing = false; // Không dùng auto-increment
    protected $keyType = 'string'; // UUID là string


    protected $fillable = [
        'id',             // ID của board
        'name',           // Tên của board
        'thumbnail',      // Ảnh thu nhỏ của board
        'description',    // Mô tả của board
        'is_marked',      // Trạng thái đánh dấu (boolean)
        'archive',        // Trạng thái lưu trữ (boolean)
        'closed',         // Trạng thái xóa lưu trữ (boolean)
        'created_by',         // Lưu người tạo bảngbảng
        'visibility',     // Tính công khai (public hoặc private)
        'workspace_id',   // ID của workspace liên quan
    ];



    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid(); // Gán UUID khi tạo mới
            }
        });
    }
    /**
     * Mối quan hệ giữa Board và Workspace (một Board thuộc về một Workspace).
     */
    public function workspace()
    {
        return $this->belongsTo(Workspace::class, 'workspace_id');  // Liên kết với model Workspace
    }

    public function listBoards()
    {
        return $this->hasMany(ListBoard::class, 'board_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'user_id'); // 'created_by' là trường ngoại trong bảng 'boards'
    }
    public function lists()
    {
        return $this->hasMany(ListBoard::class, 'board_id');
    }


    // public function members()
    // {
    //     return $this->belongsToMany(User::class, 'board_members', 'board_id', 'user_id')
    //         ->withPivot('role', 'is_unconfirmed', 'joined', 'is_deactivated')
    //         ->withTimestamps();
    // }

    public function members()
    {
        return $this->belongsToMany(User::class, 'board_members', 'board_id', 'user_id')
                    ->withPivot('role', 'is_unconfirmed', 'joined', 'is_deactivated');
    }


    public function activeMembers()
    {
        return $this->members()
            ->wherePivot('is_unconfirmed', false)
            ->wherePivot('joined', true)
            ->wherePivot('is_deactivated', false);
    }

    public function cards()
    {
        return $this->hasMany(Card::class);
    }
}
