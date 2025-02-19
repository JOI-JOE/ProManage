<?php

namespace Database\Seeders;

use App\Models\Board;
use App\Models\BoardMember;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BoardMemberSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        $boards = Board::all();

        foreach ($boards as $board) {
            foreach ($users as $user) {
                BoardMember::create([
                    'board_id' => $board->id,
                    'user_id' => $user->id,
                    'role' => $this->getRandomRole(),
                    'is_unconfirmed' => rand(0, 1),
                    'joined' => rand(0, 1),
                    'is_deactivated' => rand(0, 1),
                    'referrer_id' => $users->random()->id,
                    'last_active' => now()->subDays(rand(0, 10)),
                ]);
            }
        }
    }
    private function getRandomRole()
    {
        $roles = ['admin', 'member', 'viewer'];
        return $roles[array_rand($roles)];
    }
}
