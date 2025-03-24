<?php

namespace Database\Seeders;

use App\Models\Board;
use App\Models\BoardMember;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BoardMemberSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $userIds = DB::table('users')->pluck('id')->toArray();
        
        // Lấy danh sách board IDs có sẵn
        $boardIds = DB::table('boards')->pluck('id')->toArray();

        // Kiểm tra nếu chưa có board hoặc user thì không seed
        if (empty($userIds) || empty($boardIds)) {
            return;
        }

        // Gán mỗi user vào ít nhất một board
        foreach ($userIds as $userId) {
            $assignedBoards = (array) array_rand(array_flip($boardIds), random_int(1, min(5, count($boardIds))));

            foreach ($assignedBoards as $boardId) {
                DB::table('board_members')->insert([
                    'board_id' => $boardId,
                    'user_id' => $userId,
                    'role' => ['admin', 'member', 'viewer'][array_rand(['admin', 'member', 'viewer'])],
                    'is_unconfirmed' => (bool)random_int(0, 1),
                    'joined' => true,
                    'is_deactivated' => false,
                    'referrer_id' => random_int(0, 1) ? $userIds[array_rand($userIds)] : null,
                    'last_active' => Carbon::now()->subDays(random_int(0, 30)),
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ]);
            }
        }
    }
    
}
