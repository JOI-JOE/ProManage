<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('card_user', function (Blueprint $table) {
            $table->uuid('card_id'); // UUID của card
            $table->uuid('user_id'); // UUID của card
           

    $table->timestamp('assigned_at')->default(DB::raw('CURRENT_TIMESTAMP')); // Thời gian gắn thành viên
    $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
    $table->foreign('card_id')->references('id')->on('cards')->onDelete('cascade');
    $table->primary(['card_id', 'user_id']); // Định nghĩa khóa chính
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('card_user');
    }
};
