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
        Schema::create('board_members', function (Blueprint $table) {
            $table->id();

            // Khóa ngoại đến bảng boards
            $table->foreignId('board_id')
                ->constrained('boards')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            // Khóa ngoại đến bảng users (thành viên)
            $table->foreignId('user_id')
                ->constrained('users')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            // Loại thành viên: admin, member, viewer
            $table->enum('role', ['admin', 'member', 'viewer'])
                ->default('member'); // Mặc định là 'member'

            // Trạng thái xác nhận (confirmed/unconfirmed)
            $table->boolean('is_unconfirmed')->default(false); // Mặc định là false (đã xác nhận)

            // Trạng thái tham gia (joined/not joined)
            $table->boolean('joined')->default(false); // Mặc định là false (chưa tham gia)

            // Trạng thái vô hiệu hóa (deactivated)
            $table->boolean('is_deactivated')->default(false); // Mặc định là false (không bị vô hiệu hóa)

            // Khóa ngoại đến người giới thiệu (nếu có)
            $table->foreignId('referrer_id')
                ->nullable()
                ->constrained('users')
                ->onUpdate('cascade')
                ->onDelete('set null');

            // Thời gian hoạt động gần nhất
            $table->timestamp('last_active')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('board_members');
    }
};
