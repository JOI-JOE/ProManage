<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BoardStars extends Model
{
    use HasFactory;

    protected $table = 'board_stars';
    public $incrementing = false;
    protected $keyType = 'string';
}
