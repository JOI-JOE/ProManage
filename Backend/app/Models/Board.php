<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Board extends Model
{
    use HasFactory;

    protected $fillable = [
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
}
