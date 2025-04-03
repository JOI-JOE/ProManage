<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class AttachmentFactory extends Factory
{
    public function definition()
    {
        $fileName = $this->faker->word() . '.pdf';
        return [
            'id' => Str::uuid(),
            'path_url' => '/storage/attachments/' . $fileName,
            'file_name_defaut' => $fileName,
            'file_name' => $fileName,
            'is_cover' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}