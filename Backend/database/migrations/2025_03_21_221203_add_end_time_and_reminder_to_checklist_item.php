<?php



use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('checklist_items', function (Blueprint $table) {
            $table->time('end_time')->nullable()->after('updated_at');
            $table->dateTime('reminder')->nullable()->after('end_time');
        });
    }

    public function down(): void
    {
        Schema::table('checklist_items', function (Blueprint $table) {
            $table->dropColumn(['end_time', 'reminder']);
        });
    }
};
