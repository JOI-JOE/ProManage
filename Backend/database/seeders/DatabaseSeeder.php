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

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // Tạo 50 users
        $users = User::factory()
            ->count(50)
            ->create();

        foreach ($users as $user) {
            // Tạo 5 workspaces cho mỗi user
            $workspaces = Workspace::factory()
                ->count(5)
                ->create([
                    'id_member_creator' => $user->id,
                ]);

            foreach ($workspaces as $workspace) {
                // Tạo 10 boards cho mỗi workspace
                $boards = Board::factory()
                    ->count(10)
                    ->create([
                        'workspace_id' => $workspace->id,
                        'created_by' => $user->id,
                    ]);

                foreach ($boards as $board) {
                    // Thêm 10 users random làm board members
                    $randomUsers = $users->random(10);
                    foreach ($randomUsers as $randomUser) {
                        BoardMember::create([
                            'board_id' => $board->id,
                            'user_id' => $randomUser->id,
                            'role' => 'member',
                        ]);
                    }

                    // Tạo 10 lists cho mỗi board
                    $lists = ListBoard::factory()
                        ->count(10)
                        ->sequence(fn ($sequence) => ['position' => $sequence->index + 1])
                        ->create([
                            'board_id' => $board->id,
                        ]);

                    foreach ($lists as $list) {
                        // Tạo 20 cards cho mỗi list
                        $cards = Card::factory()
                            ->count(20)
                            ->sequence(fn ($sequence) => ['position' => $sequence->index + 1])
                            ->create([
                                'list_board_id' => $list->id,
                            ]);

                        foreach ($cards as $card) {
                            // Tạo 10 attachments cho mỗi card
                            // Attachment::factory()
                            //     ->count(10)
                            //     ->create([
                            //         'card_id' => $card->id,
                            //     ]);

                            // Tạo 30 comments cho mỗi card
                            CommentCard::factory()
                                ->count(30)
                                ->create([
                                    'card_id' => $card->id,
                                    'user_id' => fn() => $users->random()->id,
                                ]);

                            // Tạo 3 checklists cho mỗi card
                            $checklists = Checklist::factory()
                                ->count(3)
                                ->create([
                                    'card_id' => $card->id,
                                ]);

                            foreach ($checklists as $checklist) {
                                // Tạo 10 checklist items cho mỗi checklist
                                $checklistItems = ChecklistItem::factory()
                                    ->count(10)
                                    ->create([
                                        'checklist_id' => $checklist->id,
                                    ]);

                                // foreach ($checklistItems as $item) {
                                //     // Assign 1 random user cho mỗi checklist item
                                //     ChecklistItemUser::create([
                                //         'checklist_item_id' => $item->id,
                                //         'user_id' => $users->random()->id,
                                //     ]);
                                // }
                            }
                        }
                    }
                }
            }
        }
    }
}