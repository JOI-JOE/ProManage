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

            // Còn đây là khi có tài khoản thì sẽ lấy id: 
            $table->foreignId('invited_member_id')
                ->nullable()
                ->constrained('users')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            // Khi mà chưa có tài khoản thì sẽ lấy @email vì
            $table->string('email')->nullable();

            // Tin nhắn mời
            $table->text('invitation_message')->nullable();

            // Mã hash để xác thực lời mời
            // https: //id.atlassian.com/login?application=trello&continue=https%3A%2F%2Ftrello.com%2Fauth%2Fatlassian%2Fcallback%3FreturnUrl%3D%252Forg%252F678b57031faba8dd978f0dee%26display%3D%26aaOnboarding%3D%26updateEmail%3D%26traceId%3D%26ssoVerified%3D%26createMember%3D%26jiraInviteLink%3D&email=haungodang2003%40gmail.com&restrict=true
            // $table->string('dsc_hash', 255)->unique();

            // Nếu TRUE, thành viên được thêm ngay lập tức
            $table->boolean('accept_unconfirmed')->default(false);

            // Người gửi lời mời (tùy chọn)
            $table->foreignId('invited_by_member_id')
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
