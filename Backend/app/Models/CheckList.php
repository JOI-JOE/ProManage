<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Checklist extends Model
{
    use HasFactory;

    protected $fillable = [
        'card_id',
        'name',
    ];

    public function card()
    {
        return $this->belongsTo(Card::class, 'card_id');
    }

    public function checklist_items()
    {
        return $this->hasMany(ChecklistItem::class, 'checklist_id');
    }
}
