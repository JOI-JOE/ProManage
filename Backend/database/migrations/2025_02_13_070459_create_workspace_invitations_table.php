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
            // <<<<<<< HEAD
            //             $table->id();
            //             $table->foreignId('id_workspace')
            //                 ->constrained('workspaces')
            //                 ->onUpdate('cascade')
            //                 ->onDelete('cascade');

            //             $table->foreignId('id_invited_member')
            //                 ->nullable()
            //                 ->constrained('users')
            //                 ->onUpdate('cascade')
            //                 ->onDelete('cascade');

            //             $table->foreignId('id_invited_by_member')
            //                 ->nullable()
            //                 ->constrained('users')
            //                 ->onUpdate('cascade')
            //                 ->onDelete('set null');

            //             $table->string('email')->nullable();
            //             $table->text('invitation_message')->nullable();
            //             $table->string('invite_token')->unique(); // Token để xác nhận lời mời
            //             $table->boolean('accept_unconfirmed')->default(false); // Cho phép tham gia khi chưa xác nhận?

            // =======
            $table->uuid('id')->primary();

            // Khóa ngoại đến bảng workspaces (UUID)
            $table->uuid('workspace_id');
            $table->foreign('workspace_id')->references('id')->on('workspaces')->onUpdate('cascade')->onDelete('cascade');

            // Khóa ngoại đến bảng users (UUID) - người được mời
            $table->uuid('invited_member_id')->nullable();
            $table->foreign('invited_member_id')->references('id')->on('users')->onUpdate('cascade')->onDelete('cascade');

            // Email của người được mời (nếu không có tài khoản)
            $table->string('email')->nullable();

            // Tin nhắn mời
            $table->text('invitation_message')->nullable();

            // Mã token mời (để kiểm tra xác nhận)
            $table->string('invite_token')->unique();

            // Cho phép chấp nhận mà không cần xác nhận email
            $table->boolean('accept_unconfirmed')->default(false);

            // Người gửi lời mời (UUID)
            $table->uuid('invited_by_member_id')->nullable();
            $table->foreign('invited_by_member_id')->references('id')->on('users')->onUpdate('cascade')->onDelete('set null');

            // >>>>>>> 5811da2c96ca779eb0e4496fcf9f49db5eb1cf77
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
