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
        Schema::create('workspaces', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('id_member_creator'); // Chỉnh lại kiểu dữ liệu UUID
        
            $table->string('name');
            $table->string('display_name')->unique();
            $table->text('desc')->nullable();
            $table->string('logo_hash')->nullable();
            $table->string('logo_url')->nullable();
        
            $table->enum('permission_level', ['private', 'public'])->default('private');
            $table->enum('board_invite_restrict', ['any', 'admins', 'members', 'owner'])->default('any');
            $table->json('org_invite_restrict')->nullable();
            $table->json('board_delete_restrict')->nullable();
            $table->json('board_visibility_restrict')->nullable();
            $table->string('team_type')->nullable();
        
            $table->timestamps();
        
            // Thêm khóa ngoại đúng kiểu UUID
            $table->foreign('id_member_creator')->references('id')->on('users')->onUpdate('cascade')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workspaces');
    }
};
