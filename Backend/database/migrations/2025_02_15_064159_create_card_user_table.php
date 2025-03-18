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
            $table->foreignId('card_id')->constrained()->onDelete('cascade'); // Thẻ
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Người dùng
            $table->timestamp('assigned_at')->default(DB::raw('CURRENT_TIMESTAMP')); // Thời gian gắn thành viên
            
            ///// Primary key , Quan hệ nhiều nhiều bỏ hết timestamp 
            $table->primary(['card_id','user_id']);
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
