<?php
namespace Database\Factories;

use App\Models\Card;
use App\Models\ListBoard; // Nếu `list_board_id` là khóa ngoại tham chiếu đến bảng `list_boards`
use Faker\Generator as Faker;
use Illuminate\Database\Eloquent\Factories\Factory;

class CardFactory extends Factory
{
    protected $model = Card::class;

    public function definition()
    {
        return [
            'title' => $this->faker->word,
            'description' => $this->faker->sentence,
            'position' => $this->faker->randomDigitNotNull,
            'list_board_id' =>2 , // Tạo một bản ghi ListBoard mới cho `list_board_id`
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}

