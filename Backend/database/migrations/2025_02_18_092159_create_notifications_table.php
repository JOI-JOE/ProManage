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
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->uuid('notifiable_id'); // Thay vì morphs, dùng uuid
            $table->string('notifiable_type'); // Giữ string cho type
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        
            // Tạo index cho notifiable_id và notifiable_type
            $table->index(['notifiable_id', 'notifiable_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
