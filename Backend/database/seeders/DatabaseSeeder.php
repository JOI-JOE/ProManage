<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Workspace;
use App\Models\Board;
use App\Models\ListBoard;
use App\Models\Card;
use App\Models\Checklist;
use App\Models\ChecklistItem;
use App\Models\Attachment;
use App\Models\CommentCard;
use App\Models\BoardMember;
use App\Models\ChecklistItemUser;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run()
    {

        $colors = [
            [
                'name' => 'black',
                'hex_code' => '',
            ],
            [
                'name' => 'black_dark',
                'hex_code' => '',
            ],
            [
                'name' => 'black_light',
                'hex_code' => '',
            ],
            [
                'name' => 'blue',
                'hex_code' => '',
            ],
            [
                'name' => 'blue_dark',
                'hex_code' => '',
            ],
            [
                'name' => 'blue_light',
                'hex_code' => '',
            ],
            // xanh lá cây
            [
                'name' => 'green',
                'hex_code' => '#4bce97',
            ],
            // xanh lá cây nhạt
            [
                'name' => 'green_light',
                'hex_code' => '#baf3db',
            ],
            // xanh lá cây đậm
            [
                'name' => 'green_dark',
                'hex_code' => '#1f845a',
            ],

            [
                'name' => 'lime',
                'hex_code' => '',
            ],
            [
                'name' => 'lime_dark',
                'hex_code' => '',
            ],
            [
                'name' => 'lime_light',
                'hex_code' => '',
            ],
            [
                'name' => 'orange',
                'hex_code' => '',
            ],
            [
                'name' => 'orange_dark',
                'hex_code' => '',
            ],
            [
                'name' => 'orange_light',
                'hex_code' => '',
            ],
            [
                'name' => 'pink',
                'hex_code' => '',
            ],
            [
                'name' => 'pink_dark',
                'hex_code' => '',
            ],
            [
                'name' => 'pink_light',
                'hex_code' => '',
            ],
            [
                'name' => 'purple',
                'hex_code' => '',
            ],
            [
                'name' => 'purple_dark',
                'hex_code' => '',
            ],
            [
                'name' => 'purple_light',
                'hex_code' => '',
            ],
            [
                'name' => 'red',
                'hex_code' => '',
            ],
            [
                'name' => 'red_dark',
                'hex_code' => '',
            ],
            [
                'name' => 'red_light',
                'hex_code' => '',
            ],
            [
                'name' => 'sky',
                'hex_code' => '',
            ],
            [
                'name' => 'sky_dark',
                'hex_code' => '',
            ],
            [
                'name' => 'sky_light',
                'hex_code' => '',
            ],
            [
                'name' => 'yellow',
                'hex_code' => '#E2B003',
            ],
            [
                'name' => 'yellow_dark',
                'hex_code' => '',
            ],
            [
                'name' => 'yellow_light',
                'hex_code' => '',
            ],
        ];

        $basic_color = [
            // xanh lá cây
            [
                'name' => 'green',
                'hex_code' => '#4bce97',
            ],
            // vàng
            [
                'name' => 'yellow',
                'hex_code' => '#e2b203',
            ],
            // cam
            [
                'name' => 'orange',
                'hex_code' => '#faa53d',
            ],
            // đỏ
            [
                'name' => 'red',
                'hex_code' => '#f87462',
            ],
            // tím 
            [
                'name' => 'purple',
                'hex_code' => '#9f8fef',
            ],
            // xanh nước biển
            [
                'name' => 'blue',
                'hex_code' => '#579dff',
            ],
        ];

        foreach ($basic_color as $color) {
            DB::table('colors')->insert([
                'color'    => $color['name'],
                'hex_code' => $color['hex_code'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
