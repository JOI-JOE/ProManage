<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * invitation_type =>nó phân biệt lời mời là để bạn làm admin hay normal
     */
    public function up(): void
    {
        Schema::create('workspace_invitations', function (Blueprint $table) {
            $table->id();

            // Khóa ngoại đến bảng workspaces
            $table->foreignId('workspace_id')
                ->constrained('workspaces')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            // Khóa ngoại đến bảng users (người được mời)
            $table->foreignId('invited_user_id')
                ->constrained('users')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            // Mã băm (dsc) để xác định lời mời
            $table->string('invitation_token')->unique(); // Thay thế dsc bằng invitation_token

            // Tin nhắn mời
            $table->text('invitation_message')->nullable();

            // Loại lời mời (normal, special, ...)
            $table->string('invitation_type')->default('normal');

            // Trạng thái chấp nhận (pending, accepted, rejected)
            $table->enum('invitation_status', ['pending', 'accepted', 'rejected'])->default('pending');

            // Thời gian hết hạn của lời mời (tùy chọn)
            $table->timestamp('expires_at')->nullable();

            // Người gửi lời mời (tùy chọn)
            $table->foreignId('invited_by_user_id')
                ->nullable()
                ->constrained('users')
                ->onUpdate('cascade')
                ->onDelete('set null');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workspace_invitations');
    }
};
