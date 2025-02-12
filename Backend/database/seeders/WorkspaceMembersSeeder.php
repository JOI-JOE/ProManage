<?php

namespace Database\Seeders;

use App\Models\WorkspaceMembers;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class WorkspaceMembersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Tạo ra 10 workspace member
        WorkspaceMembers::factory(5)->create();
    }
}
