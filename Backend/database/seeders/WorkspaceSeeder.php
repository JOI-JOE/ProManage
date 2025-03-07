<?php

namespace Database\Seeders;

use App\Models\Workspace;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WorkspaceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Tạo ra 10 workspace với visibility là public
        // Workspace::factory(10)->public()->create();
        $userIds = DB::table('users')->pluck('id')->toArray();

        if (empty($userIds)) {
            throw new \Exception("Không tìm thấy user nào trong bảng users. Hãy chạy UserSeeder trước.");
        }

        // Tạo 10 workspaces
        for ($i = 0; $i < 10; $i++) {
            DB::table('workspaces')->insert([
                'id' => Str::uuid(),
                'id_member_creator' => $userIds[array_rand($userIds)], // Lấy user ngẫu nhiên làm creator
                'name' => 'Workspace ' . ($i + 1),
                'display_name' => 'workspace-' . ($i + 1),
                'desc' => 'Mô tả workspace ' . ($i + 1),
                'logo_hash' => Str::random(64),
                'logo_url' => 'https://via.placeholder.com/640x480.png/00AAFF?text=Workspace+' . ($i + 1),
                'permission_level' => 'public',
                'board_invite_restrict' => 'members',
                'org_invite_restrict' => json_encode([]),
                'board_delete_restrict' => json_encode([]),
                'board_visibility_restrict' => json_encode([]),
                'team_type' => 'business_crm',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }
    }
}
