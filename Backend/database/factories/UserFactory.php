<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    public function definition()
    {
        return [
            'id' => Str::uuid(),
            'full_name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'password' => 123456789,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}