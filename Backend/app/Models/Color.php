<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Color extends Model
{
    use HasFactory;
    protected $fillable=['hex_code'];
    public function labels()
    {
        return $this->hasMany(Label::class);
    }
}
