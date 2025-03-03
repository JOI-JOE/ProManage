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
            $table->foreignId('id_workspace')
                ->constrained('workspaces')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreignId('id_invited_member')
                ->nullable()
                ->constrained('users')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreignId('id_invited_by_member')
                ->nullable()
                ->constrained('users')
                ->onUpdate('cascade')
                ->onDelete('set null');

            $table->string('email')->nullable();
            $table->text('invitation_message')->nullable();
            $table->string('invite_token')->unique(); // Token để xác nhận lời mời
            $table->boolean('accept_unconfirmed')->default(false); // Cho phép tham gia khi chưa xác nhận?

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
