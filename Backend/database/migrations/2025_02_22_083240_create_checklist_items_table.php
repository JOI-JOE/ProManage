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
        Schema::create('checklist_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('checklist_id')->constrained()->onDelete('cascade'); // Liên kết với checklist
            $table->string('name'); // Tên của mục trong checklist
            $table->dateTime('start_date')->nullable(); // Thời gian bắt đầuđầu
            $table->dateTime('end_date')->nullable(); //Hạn cuối làm việc của thẻ
            $table->boolean('is_completed')->default(false); // Trạng thái hoàn thành của mục
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('checklist_items');
    }
};
