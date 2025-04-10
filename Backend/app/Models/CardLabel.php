<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CardLabel extends Model
{
    use HasFactory;
    public $incrementing = false; // Không tự động tăng ID
    protected $primaryKey = ['card_id', 'label_id']; // Khóa chính kép

    protected $fillable = ['card_id', 'label_id'];


    public function card()
    {
        return $this->belongsTo(Card::class);
    }

    public function label()
    {
        return $this->belongsTo(Label::class);
    }
}
