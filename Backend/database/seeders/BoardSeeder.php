<?php

namespace Database\Seeders;

use App\Models\Board;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BoardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Tạo ra 10 board với visibility là public
        // Board::factory(4)->create();
        $userIds = DB::table('users')->pluck('id')->toArray();
        
        // Lấy danh sách workspace IDs có sẵn
        $workspaceIds = DB::table('workspaces')->pluck('id')->toArray();

        // Kiểm tra nếu chưa có workspace hoặc user thì không seed
        if (empty($userIds) || empty($workspaceIds)) {
            return;
        }

        // Tạo 15 boards
        for ($i = 0; $i < 15; $i++) {
            DB::table('boards')->insert([
                'id' => Str::uuid(),
                'name' => 'Board ' . ($i + 1),
                'thumbnail' => 'https://via.placeholder.com/640x480.png/00AAFF?text=Board+' . ($i + 1),
                'description' => 'Mô tả board ' . ($i + 1),
                'is_marked' => (bool)random_int(0, 1),
                'archive' => (bool)random_int(0, 1),
                'closed' => (bool)random_int(0, 1),
                'created_by' => $userIds[array_rand($userIds)], // Chọn user ngẫu nhiên làm creator
                'visibility' => ['public', 'private', 'workspace'][array_rand(['public', 'private', 'workspace'])],
                'workspace_id' => $workspaceIds[array_rand($workspaceIds)], // Chọn workspace ngẫu nhiên
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }
    }
}
