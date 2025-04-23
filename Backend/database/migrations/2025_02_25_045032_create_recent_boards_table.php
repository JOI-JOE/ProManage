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
        Schema::create('recent_boards', function (Blueprint $table) {
        
                $table->id(); // ID tự tăng cho bảng activity
                $table->uuid('user_id'); // UUID của board
                $table->uuid('board_id'); // UUID của board
            
                $table->timestamp('last_accessed')->default(DB::raw('CURRENT_TIMESTAMP'));
            
                // Khóa ngoại
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
                $table->foreign('board_id')->references('id')->on('boards')->onDelete('cascade');
            
                $table->unique(['user_id', 'board_id']);

                $table->timestamps();
            });
            
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recent_boards');
    }
};
