<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Tạo ra 10 user với role là member
        User::factory(50)->member()->create();

        // $user = User::create([
        //     'user_name' => 'newuser',
        //     'full_name' => 'John Doe',
        //     'email' => 'john.doe@example.com',
        //     'email_verified_at' => now(),
        //     'password' => Hash::make('password123'),  // Mã hóa mật khẩu
        //     'role' => 'member',
        //     'activity_block' => 1,  // Hoạt động
        // ]);
    }
}
