<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ListBoard extends Model
{
    use HasFactory;
    protected $table = 'list_boards';
    protected $primaryKey = 'id'; 
    public $incrementing = false; // Vô hiệu hóa tự động tăng
    protected $keyType = 'string'; // UUID là kiểu string


    protected $fillable = [
        'name',
        'closed',
        'position',
        'board_id',
        'color_id',
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

    public function color()
    {
        return $this->belongsTo(Color::class);
    }
    public function cards()
    {
        return $this->hasMany(Card::class, 'list_board_id', 'id');
    }
}
