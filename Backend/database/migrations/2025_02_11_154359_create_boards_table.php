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
        Schema::create('boards', function (Blueprint $table): void {
            $table->id();
            $table->string("name");
            $table->string('thumbnail')->nullable();
            $table->text('description')->nullable();

            $table->boolean('is_marked'); // Đánh dấu bảng nổi bật
            $table->boolean('archive'); // Lưu trữ bảng: 0 là hiện, 1 là lưu trữ
            $table->boolean('closed')->default(false); // Lưu trữ rác: 0 là hiện, 1 là xóa
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            
            $table->enum('visibility', ['public', 'private', 'member']);
            $table->foreignId('workspace_id')->constrained('workspaces');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('boards');
        Schema::table('boards', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropColumn('created_by');
        });
    }
};
