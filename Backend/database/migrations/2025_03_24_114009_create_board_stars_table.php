<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('board_stars', function (Blueprint $table) {
            $table->uuid('id')->primary(); // Sử dụng UUID làm khóa chính
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignUuid('board_id')->constrained('boards')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['user_id', 'board_id']); // Đảm bảo mỗi user chỉ star một board một lần
        });
    }

    public function down()
    {
        Schema::dropIfExists('board_stars');
    }
};
