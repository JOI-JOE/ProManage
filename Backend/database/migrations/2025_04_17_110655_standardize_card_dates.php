<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class StandardizeCardDates extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Chuẩn hóa cột end_date thành định dạng DATE
        // DB::table('cards')
        //     ->whereNotNull('end_date')
        //     ->whereRaw('end_date != DATE(end_date)')
        //     ->update([
        //         'end_date' => DB::raw('DATE(end_date)'),
        //     ]);

        // // Chuẩn hóa cột end_time thành định dạng TIME
        // DB::table('cards')
        //     ->whereNotNull('end_time')
        //     ->whereRaw('end_time != TIME(end_time)')
        //     ->update([
        //         'end_time' => DB::raw('TIME(end_time)'),
        //     ]);

        Schema::table('cards', function (Blueprint $table) {
            $table->index('end_date');
            $table->index('reminder');
        });
    }


    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Không rollback vì đây là chuẩn hóa dữ liệu, không thay đổi cấu trúc
    }
}
