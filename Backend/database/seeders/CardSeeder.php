<?php

namespace Database\Seeders;

use DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        for ($i = 0; $i < 5; $i++) {
            DB::table('cards')->insert([
                'id' => Str::uuid(),
                'title' => 'carrd ' . ($i + 1),
                'closed' => (bool)random_int(0, 1),
                'position' => $i + 1,
              
            ]);
        }
    }
}
