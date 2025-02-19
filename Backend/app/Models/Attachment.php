<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attachment extends Model
{
    use HasFactory;
    protected $fillable = [
        'path_url',
        'file_name_defaut',
        'file_name',
        'is_cover',
        'card_id',
    ];
}
