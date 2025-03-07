<?php

namespace Database\Seeders;

use App\Models\Board;
use App\Models\recentBoard;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;

class RecentBoardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Lấy danh sách user IDs và board IDs có sẵn
        $userIds = DB::table('users')->pluck('id')->toArray();
        $boardIds = DB::table('boards')->pluck('id')->toArray();

        // Kiểm tra nếu chưa có users hoặc boards thì không seed
        if (empty($userIds) || empty($boardIds)) {
            return;
        }

        // Tạo 50 records cho bảng recent_boards
        for ($i = 0; $i < 50; $i++) {
            DB::table('recent_boards')->insert([
                'user_id' => $userIds[array_rand($userIds)], // Chọn user ngẫu nhiên
                'board_id' => $boardIds[array_rand($boardIds)], // Chọn board ngẫu nhiên
                'last_accessed' => Carbon::now()->subDays(random_int(1, 30)), // Lấy thời gian truy cập trong vòng 30 ngày
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
