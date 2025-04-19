<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('cards', function (Blueprint $table) {
            $table->index(['list_board_id', 'position'], 'cards_list_position_index');
            $table->index(['list_board_id', 'is_archived'], 'cards_list_archived_index');
        });

        Schema::table('list_boards', function (Blueprint $table) {
            // Index phục vụ truy vấn theo board và sắp xếp
            $table->index(['board_id', 'position'], 'list_boards_board_position_index');
            // Index phục vụ truy vấn lọc
            $table->index(['board_id', 'closed'], 'list_boards_board_closed_index');
        });

        // Bảng card_user
        Schema::table('card_user', function (Blueprint $table) {
            $table->index('card_id', 'card_user_card_index');
            $table->index('user_id', 'card_user_user_index');
        });

        // Bảng card_label
        Schema::table('card_label', function (Blueprint $table) {
            $table->index('card_id', 'card_label_card_index');
            $table->index('label_id', 'card_label_label_index');
        });

        // Bảng checklists
        Schema::table('checklists', function (Blueprint $table) {
            $table->index('card_id', 'checklists_card_index');
        });

        // Bảng checklist_items
        Schema::table('checklist_items', function (Blueprint $table) {
            $table->index('checklist_id', 'checklist_items_checklist_index');
            $table->index('is_completed', 'checklist_items_completed_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('card_list', function (Blueprint $table) {
            //
        });
    }
};
