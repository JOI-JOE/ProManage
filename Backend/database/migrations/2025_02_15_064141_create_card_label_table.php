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
        Schema::create('card_label', function (Blueprint $table) {
            $table->uuid('card_id'); // UUID của card
            $table->foreignId('label_id')->constrained('labels'); // ID số nguyên của label
        
            $table->foreign('card_id')->references('id')->on('cards')->onDelete('cascade');
            $table->primary(['card_id', 'label_id']); // Đặt khóa chính là cặp card_id và label_id
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('card_label');
    }
};
