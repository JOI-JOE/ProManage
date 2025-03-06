<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('activity_log', function (Blueprint $table) {
            if (Schema::hasColumn('activity_log', 'subject_id')) {
                $table->{$this->isMySql8OrHigher() ? 'uuid' : 'string'}('subject_id', $this->isMySql8OrHigher() ? null : 36)->change();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('activity_log', function (Blueprint $table) {
            // Nếu cần, bạn có thể thêm code để hoàn tác thay đổi ở đây.
        });
    }

    protected function isMySql8OrHigher()
    {
        return DB::getDriverName() === 'mysql' && version_compare(DB::getPdo()->getAttribute(PDO::ATTR_SERVER_VERSION), '8.0.0', '>=');
    }
};
