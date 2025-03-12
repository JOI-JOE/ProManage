<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Label extends Model
{
    use HasFactory;
    protected $fillable = [
        'title',
        'board_id',
        'color_id',
    ];
    public function cards()
    {
        return $this->belongsToMany(Card::class, 'card_label', 'label_id', 'card_id');
    }
    public function color()
    {
        return $this->belongsTo(Color::class);
    }
    public function cardLabels()
    {
        return $this->hasMany(CardLabel::class);
    }
}
