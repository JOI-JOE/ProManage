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
        $user = User::create([
            'user_name' => 'thai4',
            'full_name' => 'thai4',
            'email' => 'thai4@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password123'),  // Mã hóa mật khẩu
            'role' => 'member',
            'activity_block' => 1,  // Hoạt động
        ]);
    
        // Tạo token cho user
        $token = $user->createToken('YourAppName')->plainTextToken;
    
        // Ghi token vào cơ sở dữ liệu hoặc in ra
        // Ví dụ ghi token vào cột google_access_token trong bảng users
        $user->google_access_token = $token;
        $user->save();
    
        // In token ra màn hình (hoặc lưu vào cơ sở dữ liệu như trên)
        echo "Token for user {$user->full_name}: " . $token . PHP_EOL;
    }
}
