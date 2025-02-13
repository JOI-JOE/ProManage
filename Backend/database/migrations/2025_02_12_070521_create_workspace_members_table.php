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
        Schema::create('workspace_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_workspace')->constrained('workspaces')->onUpdate('cascade')->onDelete('cascade');
            $table->foreignId('id_member')->constrained('users')->onUpdate('cascade')->onDelete('cascade');
            $table->enum('member_type', ['admin', 'normal'])->default('admin');

            $table->boolean('is_unconfirmed')->default(false);
            $table->boolean('joined')->default(false);
            $table->boolean('is_deactivated')->default(false);

            $table->boolean('activity_blocked')->default(false);
            $table->foreignId('id_member_referrer')->nullable()->constrained('users')->onUpdate('cascade')->onDelete('set null');

            $table->timestamp('last_active')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workspace_members');
    }
};
