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
          // Khóa chính là cặp (board_id, user_id)
    $table->uuid('board_id');
    $table->uuid('user_id');
    $table->primary(['board_id', 'user_id']); // Thiết lập primary key

    // Khóa ngoại
    $table->foreign('board_id')->references('id')->on('boards')->onDelete('cascade');
    $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

    // Loại thành viên: admin, member, viewer
    $table->enum('role', ['admin', 'member', 'viewer'])->default('member');

    // Trạng thái xác nhận (confirmed/unconfirmed)
    $table->boolean('is_unconfirmed')->default(false);

    // Trạng thái tham gia (joined/not joined)
    $table->boolean('joined')->default(false);

    // Trạng thái vô hiệu hóa (deactivated)
    $table->boolean('is_deactivated')->default(false);

    // Người giới thiệu (có thể null)
    $table->uuid('referrer_id')->nullable();
    $table->foreign('referrer_id')->references('id')->on('users')->onDelete('set null');

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
