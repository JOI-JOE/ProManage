<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateStartDateInCardsTable extends Migration
{
    public function up()
    {
        Schema::table('cards', function (Blueprint $table) {
            // Ví dụ: sửa kiểu dữ liệu của start_date thành datetime (tuỳ theo nhu cầu của bạn)
            $table->date(column: 'start_date')->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('cards', function (Blueprint $table) {
            // Ví dụ: đưa start_date về kiểu cũ (giả sử là date)
            $table->dateTime('start_date')->nullable()->change();
        });
    }
}
