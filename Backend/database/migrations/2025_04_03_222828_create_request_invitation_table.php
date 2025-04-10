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
        Schema::create('request_invitation', function (Blueprint $table) {
            $table->uuid('id');
            $table->uuid('user_id');
            $table->uuid('board_id');
            $table->enum('status', ['pending', 'accepted', 'rejected'])->default('pending');
            // Khóa ngoại
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('board_id')->references('id')->on('boards')->onDelete('cascade');
            $table->unique(['board_id', 'user_id']); // Không cho gửi yêu cầu trùng
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('request_invitation');
    }
};
