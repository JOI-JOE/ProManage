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
        Schema::create('invite_boards', function (Blueprint $table) {
            $table->uuid('id')->primary();
        
            // Khóa ngoại đến bảng boards (UUID)
            $table->uuid('board_id');
            $table->foreign('board_id')->references('id')->on('boards')->onUpdate('cascade')->onDelete('cascade');
        
            // Người được mời (UUID hoặc Email nếu chưa có tài khoản)
            $table->uuid('invited_member_id')->nullable()->index(); // Thêm index để tối ưu tìm kiếm
            $table->foreign('invited_member_id')->references('id')->on('users')->onUpdate('cascade')->onDelete('cascade');
        
            $table->string('email', 255)->nullable()->index(); // Index giúp tìm kiếm email nhanh hơn
        
            // Mã token mời (để xác nhận)
            $table->string('invite_token', 64)->unique();
        
            // Trạng thái lời mời: pending, accepted, declined, expired
            $table->enum('status', ['pending', 'accepted', 'declined', 'expired'])->default('pending')->index();
        
            // Tin nhắn mời (Giữ nguyên vì có thể chứa nội dung dài)
            $table->string('invitation_message', 500)->nullable();
        
            // Người gửi lời mời (UUID)
            $table->uuid('invited_by')->nullable();
            $table->foreign('invited_by')->references('id')->on('users')->onUpdate('cascade')->onDelete('set null');

            $table->json('rejected_by')->nullable();
            // Lưu ID người từ chối lời mời, có thể là nhiều người 
        
            // Cho phép chấp nhận mà không cần xác nhận email
            $table->boolean('accept_unconfirmed')->default(false);
        
            $table->timestamps();
        
            // Thêm index cho các truy vấn thường dùng
            $table->index(['board_id', 'status']);
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('board_invitations');
    }
};
