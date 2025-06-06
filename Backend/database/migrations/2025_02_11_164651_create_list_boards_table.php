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
        Schema::create('list_boards', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 255);
            $table->boolean('closed')->default(false);
            $table->integer('position');
        
            $table->uuid('board_id');
            $table->foreign('board_id')->references('id')->on('boards')->onDelete('cascade');
        
            // Nếu bảng colors vẫn dùng ID số nguyên thì giữ nguyên foreignId()
            $table->foreignId('color_id')->nullable()->constrained('colors');
        
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lists');
    }
};
