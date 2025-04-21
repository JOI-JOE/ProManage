<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSettingsTable extends Migration
{
    public function up()
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('site_name')->default('Trello Clone'); // Tên website
            $table->string('logo')->nullable(); // Logo URL
            $table->text('description')->nullable(); // Mô tả ngắn
            $table->string('contact_email')->default('support@example.com'); // Email liên hệ
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('settings');
    }
}
