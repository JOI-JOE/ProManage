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
        Schema::create('cards', function (Blueprint $table) {
            $table->uuid('id')->primary(); // Sử dụng UUID thay vì id tự tăng
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->string('thumbnail', 255)->nullable();
            $table->integer('position');
        
            // Thời gian bắt đầu và kết thúc
            $table->dateTime('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->time('end_time')->nullable();
        
            // Trạng thái card
            $table->boolean('is_completed')->default(false);
            $table->boolean('is_archived')->default(false);
        
            // Liên kết đến bảng list_boards bằng UUID
            $table->uuid('list_board_id');
            $table->foreign('list_board_id')->references('id')->on('list_boards')->onUpdate('cascade')->onDelete('cascade');
        
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cards');
    }
};
