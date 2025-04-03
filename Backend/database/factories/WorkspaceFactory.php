<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class WorkspaceFactory extends Factory
{
    public function definition()
    {
        $name = $this->faker->company();
        return [
            'id' => Str::uuid(),
            'name' => $name,
            'display_name' => $name,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}