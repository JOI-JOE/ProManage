<?php

namespace Database\Seeders;

use App\Models\ListBoard;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ListBoardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // ListBoard::factory(5)->create();
        $boardIds = DB::table('boards')->pluck('id')->toArray();

        // Lấy danh sách color IDs có sẵn
        $colorIds = DB::table('colors')->pluck('id')->toArray();

        // Kiểm tra nếu chưa có boards thì không seed
        if (empty($boardIds)) {
            return;
        }

        // Tạo 30 lists
        for ($i = 0; $i < 5; $i++) {
            DB::table('list_boards')->insert([
                'id' => Str::uuid(),
                'name' => 'List ' . ($i + 1),
                'closed' => (bool)random_int(0, 1),
                'position' => $i + 1,
                'board_id' => $boardIds[array_rand($boardIds)], // Chọn board ngẫu nhiên
                'color_id' => $colorIds ? $colorIds[array_rand($colorIds)] : null, // Chọn color ngẫu nhiên
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
