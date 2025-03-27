<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ChecklistFactory extends Factory
{
    public function definition()
    {
        return [
            'name' => $this->faker->word(),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}