<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChecklistItem extends Model
{
    use HasFactory;
    protected $fillable = ['checklist_id', 'name', 'start_date', 'end_date', 'is_completed'];

    public function checklist()
    {
        return $this->belongsTo(Checklist::class);
    }
}
