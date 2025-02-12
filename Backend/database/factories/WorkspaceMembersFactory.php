<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WorkspaceMembers>
 */
class WorkspaceMembersFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id_workspace' => \App\Models\Workspace::factory(),
            'id_member' => \App\Models\User::factory(),
            'member_type' => $this->faker->randomElement(['admin', 'normal']),
            // 'is_unconfirmed' => $this->faker->boolean,
            // 'is_deactivated' => $this->faker->boolean,
            // 'activity_blocked' => $this->faker->boolean,
            'id_member_referrer' => rand(1, 10),
            'last_active' => $this->faker->dateTime,
        ];
    }
}
