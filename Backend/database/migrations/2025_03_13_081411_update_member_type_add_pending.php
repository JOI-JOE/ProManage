<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('workspace_members', function (Blueprint $table) {
            // Thêm giá trị 'pending' vào enum
            $table->enum('member_type', ['admin', 'normal', 'pending'])->default('pending')->change();
        });
    }

    public function down(): void
    {
        Schema::table('workspace_members', function (Blueprint $table) {
            // Nếu rollback, loại bỏ 'pending' và đặt về giá trị ban đầu
            $table->enum('member_type', ['admin', 'normal'])->default('normal')->change();
        });
    }
};
