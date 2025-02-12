<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;


/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Workspace>
 */
class WorkspaceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->company();
        $displayName = Str::slug($name); // Generate a slug from the name
        $team_type = [
            'marketing' => 'Marketing',
            'business_crm' => 'Kinh doanh CRM',
            'small_business' => 'Doanh nghiệp nhỏ',
            'executive' => 'Điều hành',
            'engineering_it' => 'Kỹ thuật-CNTT',
            'human_resources' => 'Nhân sự',
            'other' => 'Khác',
        ];

        $randomTeamTypeKey = array_rand($team_type);


        return [
            'id_member_creator' => User::factory(), // Creates a related User model
            'name' => $name,
            'display_name' => $displayName . fake()->unique()->numberBetween(1, 1000), // Ensure uniqueness
            'desc' => fake()->paragraph(),
            'logo_hash' => fake()->sha256(), // Or generate a placeholder hash
            'logo_url' => fake()->imageUrl(),
            'permission_level' => fake()->randomElement(['private', 'public']),

            'board_invite_restrict' => fake()->randomElement(['any', 'admins', 'members', 'owner']),
            'org_invite_restrict' => null,
            'board_delete_restrict' => null,
            'board_visibility_restrict' => null,

            'team_type' => $randomTeamTypeKey, // Example: Add more types if needed
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }


    public function orgInviteRestrict(): static
    {
        return $this->state(fn(array $attributes) => [
            'org_invite_restrict' => fake()->randomElement(['@gmail.com', '@yahoo.com', '@hotmail.com']),
        ]);
    }

    public function public(): static
    {
        return $this->state(fn(array $attributes) => [
            'permission_level' => 'public',
        ]);
    }

    public function private(): static
    {
        return $this->state(fn(array $attributes) => [
            'permission_level' => 'private',
        ]);
    }
}
