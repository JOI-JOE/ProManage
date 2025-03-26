<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ChecklistItemFactory extends Factory
{
    public function definition()
    {
        return [
            'name' => $this->faker->sentence(3),
            'is_completed' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}