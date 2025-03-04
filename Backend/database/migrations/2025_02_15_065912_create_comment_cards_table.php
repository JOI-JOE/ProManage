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
        Schema::create('comment_cards', function (Blueprint $table) {
            $table->id(); // ID số nguyên tự tăng cho comment
            $table->string('content');
        
            $table->uuid('card_id'); // UUID của card
            $table->uuid('user_id'); // UUID của user
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        
            $table->foreign('card_id')->references('id')->on('cards')->onDelete('cascade');
        
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comment_cards');
    }
};
