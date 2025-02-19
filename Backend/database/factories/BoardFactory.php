<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Board>
 */
class BoardFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->word,
            'thumbnail' => $this->faker->imageUrl(),
            'description' => $this->faker->paragraph,
            'is_marked' => $this->faker->boolean,

            'archive' => $this->faker->boolean,

            'closed' => false,
            'created_by' => User::factory(),

            'visibility' => $this->faker->randomElement(['public', 'private', 'member']),
            'workspace_id' => \App\Models\Workspace::factory(),
        ];
    }

    public function public(): static
    {
        return $this->state(fn(array $attributes) => [
            'visibility' => 'public',
        ]);
    }

    public function private(): static
    {
        return $this->state(fn(array $attributes) => [
            'visibility' => 'private',
        ]);
    }

    public function member(): static
    {
        return $this->state(fn(array $attributes) => [
            'visibility' => 'member',
        ]);
    }
}
