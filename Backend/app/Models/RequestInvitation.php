<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequestInvitation extends Model
{
    use HasFactory;
    protected $table = 'request_invitation';
    
    protected $fillable = [
        'user_id',
        'board_id',
        'status',
    ];
}
