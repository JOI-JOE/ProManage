<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ListBoard extends Model
{
    use HasFactory;
    protected $table = 'list_boards';


    protected $fillable = [
        'name',
        'closed',
        'position',
        'board_id',
        'color_id',
    ];

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
        return $this->hasMany(Card::class, 'list_id');
    }
}
