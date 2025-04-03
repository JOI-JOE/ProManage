<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CardFactory extends Factory
{
    public function definition()
    {
        return [
            'id' => Str::uuid(),
            'title' => $this->faker->sentence(4),
            'position' => 1,
            'is_completed' => false,
            'is_archived' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}