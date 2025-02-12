<?php

namespace Database\Seeders;

use App\Models\Board;
use App\Models\BoardUserPermission;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BoardUserPermissions extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $boards = Board::all();
        $users = User::all();

        // Duyệt qua các board và users để tạo fake data
        foreach ($boards as $board) {
            foreach ($users as $user) {
                BoardUserPermission::create([
                    'board_id' => $board->id,
                    'user_id' => $user->id,
                    'role' => $this->getRandomRole() // Gọi hàm để lấy một role ngẫu nhiên
                ]);
            }
        }
    }
    
    private function getRandomRole()
    {
        // Chọn ngẫu nhiên một role trong các role có sẵn
        $roles = ['admin', 'member', 'viewer'];
        return $roles[array_rand($roles)];
    }
}
