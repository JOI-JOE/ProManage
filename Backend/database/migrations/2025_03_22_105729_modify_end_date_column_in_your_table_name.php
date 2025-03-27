<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('checklist_items', function (Blueprint $table) {
            $table->date('end_date')->nullable()->change(); // Chuyển kiểu dữ liệu thành DATE
        });
    }

    public function down()
    {
        Schema::table('checklist_items', function (Blueprint $table) {
            $table->dateTime('end_date')->nullable()->change(); // Khôi phục lại kiểu DATETIME nếu rollback
        });
    }
};
