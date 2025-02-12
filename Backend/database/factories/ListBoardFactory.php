<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ListBoard>
 */
class ListBoardFactory extends Factory
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
            'closed' =>$this->faker->boolean,
            'position' => $this->faker->numberBetween(1,10),
            'board_id' => 1,
            'color_id' => null,
        ];
    }
}
