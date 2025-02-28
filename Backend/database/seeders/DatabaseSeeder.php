<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            // ListBoardSeeder::class,
            UserSeeder::class,
            WorkspaceSeeder::class,
            BoardSeeder::class,
            WorkspaceMembersSeeder::class,
            BoardUserPermissions::class,
            BoardMemberSeeder::class
        ]);
    }
}
