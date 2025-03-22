<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('list_boards', function (Blueprint $table) {
            $table->decimal('position', 12, 6)->change();
        });

        Schema::table('cards', function (Blueprint $table) {
            $table->decimal('position', 12, 6)->change();
        });
    }

    public function down(): void
    {
        Schema::table('list_boards', function (Blueprint $table) {
            $table->integer('position')->change();
        });

        Schema::table('cards', function (Blueprint $table) {
            $table->integer('position')->change();
        });
    }
};
