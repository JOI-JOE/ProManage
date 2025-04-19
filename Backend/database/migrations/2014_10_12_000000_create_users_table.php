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
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('user_name')->nullable();
            $table->string('full_name');
            $table->string('initials')->nullable();
            $table->string('image')->nullable();

            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password')->nullable();
            $table->enum('role', ['admin', 'member'])->default('member');
            $table->boolean('activity_block')->default(false);
            $table->string('github_id')->nullable();
            $table->string('github_avatar')->nullable();

            $table->rememberToken();
            $table->string('google_id')->nullable();
            // $table->string('google_access_token')->nullable();
            // $table->string('google_refresh_token')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
