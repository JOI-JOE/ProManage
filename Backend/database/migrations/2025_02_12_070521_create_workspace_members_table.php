<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * 
     */
    public function up(): void
    {
        Schema::create('workspace_members', function (Blueprint $table) {
            $table->id();

            // Khóa ngoại đến bảng workspaces
            $table->foreignId('id_workspace')
                ->constrained('workspaces')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            // Khóa ngoại đến bảng users (thành viên)
            $table->foreignId('id_member')
                ->constrained('users')
                ->onUpdate('cascade')
                ->onDelete('cascade');


            // Loại thành viên: admin hoặc normal
            $table->enum('member_type', ['admin', 'normal'])
                ->default('normal'); // Mặc định là 'normal'

            // Trạng thái xác nhận (confirmed/unconfirmed)
            $table->boolean('is_unconfirmed')->default(false); // Mặc định là true (chưa xác nhận)

            // Trạng thái tham gia (joined/not joined)
            $table->boolean('joined')->default(false); // Mặc định là false (chưa tham gia)

            // Trạng thái vô hiệu hóa (deactivated)
            $table->boolean('is_deactivated')->default(value: false); // Mặc định là false (không bị vô hiệu hóa)

            // Khóa ngoại đến người giới thiệu (nếu có)
            $table->foreignId('id_member_referrer')
                ->nullable()
                ->constrained('users')
                ->onUpdate('cascade')
                ->onDelete('set null');

            // Thời gian hoạt động gần nhất
            $table->timestamp('last_active')->nullable();

            // Timestamps (created_at và updated_at)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workspace_members');
    }
};
