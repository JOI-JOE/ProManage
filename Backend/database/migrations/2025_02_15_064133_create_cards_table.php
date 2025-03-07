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
            $table->id();
            $table->string('title',255);
            $table->text('description')->nullable();
            $table->string('thumbnail',255)->nullable();
            $table->integer('position');

            $table->dateTime('start_date')->nullable(); // Thời gian bắt đầu
            $table->date('end_date')->nullable(); // Chỉ lưu ngày kết thúc
            $table->time('end_time')->nullable(); // Chỉ lưu giờ trong ngày kết thúc
            //Hạn cuối làm việc của thẻ
     
            $table->boolean('is_completed')->default(false);
            $table->boolean('is_archived')->default(false);// lưu trữ card
            $table->foreignId('list_board_id')->constrained('list_boards');
             
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
