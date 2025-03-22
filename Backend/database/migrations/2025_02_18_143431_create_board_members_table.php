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
        Schema::create('board_members', function (Blueprint $table) {
            $table->uuid('id')->primary(); // ID riêng
            $table->uuid('board_id');
            $table->uuid('user_id');

            $table->enum('role', ['admin', 'member', 'viewer'])->default('member');
            $table->boolean('is_unconfirmed')->default(false);
            $table->boolean('joined')->default(false);
            $table->boolean('is_deactivated')->default(false);
            $table->uuid('referrer_id')->nullable();
            $table->timestamp('last_active')->nullable();

            // Đảm bảo không có user nào trùng trong cùng một board
            $table->unique(['board_id', 'user_id']);

            // Khóa ngoại
            $table->foreign('board_id')->references('id')->on('boards')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('referrer_id')->references('id')->on('users')->onDelete('set null');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('board_members');
    }
};
