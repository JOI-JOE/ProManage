<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ListBoardFactory extends Factory
{
    public function definition()
    {
        return [
            'id' => Str::uuid(),
            'name' => $this->faker->word(),
            'closed' => false,
            'position' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}