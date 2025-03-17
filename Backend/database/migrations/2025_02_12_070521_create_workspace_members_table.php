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
            $table->uuid('id')->primary(); // ID riêng để dễ tham chiếu
            $table->uuid('workspace_id');
            $table->uuid('user_id');

            $table->enum('member_type', ['admin', 'normal'])->default('normal');
            $table->boolean('is_unconfirmed')->default(false);
            $table->boolean('joined')->default(false);
            $table->boolean('is_deactivated')->default(false);
            $table->timestamp('last_active')->nullable();

            // Thêm unique để đảm bảo không trùng user trong cùng một workspace
            $table->unique(['workspace_id', 'user_id']);

            // Khóa ngoại
            $table->foreign('workspace_id')->references('id')->on('workspaces')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
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
