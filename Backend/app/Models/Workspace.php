<?php

namespace App\Models;

use App\Events\WorkspaceUpdate;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Workspace extends Model
{
    use HasFactory;

    protected $fillable = [
        'id_member_creator',
        'name',
        'display_name',
        'desc',
        'logo_hash',
        'logo_url',
        'permission_level',
        'board_invite_restrict',
        'org_invite_restrict',
        'board_delete_restrict',
        'board_visibility_restrict',
        'team_type',
    ];

    public static function generateUniqueName($display_name): string
    {
        $parts = explode(" ", strtolower(trim($display_name)));
        if (count($parts) < 2) return strtolower($display_name); // Nếu chỉ có 1 phần, dùng nguyên tên

        $usernameBase = $parts[count($parts) - 2] . $parts[count($parts) - 1]; // Lấy 2 phần cuối
        $username = $usernameBase;
        $counter = 1;

        // Kiểm tra trùng lặp
        while (self::where('name', $username)->exists()) {
            $username = $usernameBase . $counter;
            $counter++;
        }

        return $username;
    }


    public function user()
    {
        return $this->belongsTo(User::class, 'id_member_creator');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'id_member_creator');
    }

    public function boards()
    {
        return $this->hasMany(Board::class);
    }

    public function members()
    {
        return $this->hasMany(WorkspaceMembers::class, 'id_workspace');
    }

    protected $dispatchesEvents = [
        'created' => WorkspaceUpdate::class,
        'updated' => WorkspaceUpdate::class
    ];
}
