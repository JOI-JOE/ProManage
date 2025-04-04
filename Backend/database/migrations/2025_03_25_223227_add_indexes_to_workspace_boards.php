<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        // Thêm index cho bảng workspace_members
        Schema::table('workspace_members', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('workspace_id');
        });

        // Thêm index cho bảng boards
        Schema::table('boards', function (Blueprint $table) {
            $table->index('workspace_id');
            $table->index('created_by');
        });

        // Thêm index cho bảng board_members
        Schema::table('board_members', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('board_id');
        });
    }

    public function down()
    {
        // Xóa index nếu rollback
        Schema::table('workspace_members', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['workspace_id']);
        });

        Schema::table('boards', function (Blueprint $table) {
            $table->dropIndex(['workspace_id']);
            $table->dropIndex(['created_by']);
        });

        Schema::table('board_members', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['board_id']);
        });
    }
};
