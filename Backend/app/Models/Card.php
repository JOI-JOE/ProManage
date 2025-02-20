<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Card extends Model
{
    use HasFactory;
    protected $fillable = [
        'title',
        'description',
        'thumbnail',
        'position',
        'start_date',
        'end_date',
        'end_time',
        'is_completed',
        'is_archived',
        'list_board_id',

    ];
    public function users()
    {
        return $this->belongsToMany(User::class, 'card_user');
    }
<<<<<<< HEAD
=======
    public function list() {
        return $this->belongsTo(ListBoard::class,'list_board_id');
    }
    public function labels()
    {
        return $this->belongsToMany(Label::class, 'card_label');
    }
>>>>>>> d580ef7cd5022addf6dfc03089e75e225905beda
}
