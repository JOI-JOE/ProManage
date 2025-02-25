<?php

namespace Database\Seeders;

use App\Models\Board;
use App\Models\recentBoard;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;


class RecentBoardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        // Lấy tất cả người dùng và bảng có sẵn
        $users = User::all();
        $boards = Board::all();

        foreach ($users as $user) {
            // Lặp qua từng người dùng và tạo các bản ghi gần đây giả cho họ
            $randomBoards = $boards->random(rand(1, 5)); // Chọn ngẫu nhiên từ 1 đến 5 bảng

            foreach ($randomBoards as $board) {
                recentBoard::create([
                    'user_id' => $user->id,
                    'board_id' => $board->id,
                    'last_accessed' => $faker->dateTimeThisYear() // Thời gian truy cập ngẫu nhiên trong năm nay
                ]);
            }
        }

    }
}
