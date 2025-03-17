<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->index(['user_name', 'full_name', 'email'], 'idx_users_search');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_users_search'); // Xóa index khi rollback
        });
    }
};
