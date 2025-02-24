<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CheckList extends Model
{
    use HasFactory;
    protected $table = 'checklists';
    protected $fillable = ['name', 'card_id'];

    public function card()
    {
        return $this->belongsTo(Card::class);
    }

    public function items()
    {
        return $this->hasMany(ChecklistItem::class);
    }
}
