<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class BoardFactory extends Factory
{
    public function definition()
    {
        return [
            'id' => Str::uuid(),
            'name' => $this->faker->sentence(3),
            'visibility' => 'private',
            'is_marked' => false,
            'archive' => false,
            'closed' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}