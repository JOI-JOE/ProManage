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
        Schema::create('attachments', function (Blueprint $table) {
          
            $table->uuid('id')->primary();
            $table->uuid('card_id');
            $table->string('path_url');
            $table->string('file_name_defaut');
            $table->string('file_name')->unique(); /// Cho phép thay đổi
            $table->boolean('is_cover');
            $table->foreign('card_id')->references('id')->on('cards')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attachments');
    }
};
