<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Attachment extends Model
{
    use HasFactory;
    public $incrementing = false; // Không dùng auto-increment
    protected $keyType = 'string'; // UUID là string

    protected $fillable = [
        'path_url',
        'file_name_defaut',
        'file_name',
        'is_cover',
        'card_id',
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

    public function card()
    {
        return $this->belongsTo(Card::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
