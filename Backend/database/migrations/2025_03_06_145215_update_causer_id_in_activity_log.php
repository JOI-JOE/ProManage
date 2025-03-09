<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('activity_log', function (Blueprint $table) {
            $table->char('causer_id', 36)->nullable()->change(); // Tạm thời cho phép NULL
        });

        // Cập nhật tất cả giá trị NULL thành một UUID ngẫu nhiên
        DB::statement("UPDATE activity_log SET causer_id = UUID() WHERE causer_id IS NULL");

        Schema::table('activity_log', function (Blueprint $table) {
            $table->char('causer_id', 36)->nullable(false)->change(); // Đặt lại NOT NULL
        });
    }

    public function down(): void
    {
        Schema::table('activity_log', function (Blueprint $table) {
            $table->unsignedBigInteger('causer_id')->nullable(false)->change();
        });
    }
};
