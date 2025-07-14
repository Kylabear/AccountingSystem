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
        Schema::table('incoming_dvs', function (Blueprint $table) {
            // Add both columns
            $table->text('reallocation_reason')->nullable();
            $table->boolean('is_reallocated')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('incoming_dvs', function (Blueprint $table) {
            $table->dropColumn(['reallocation_reason', 'is_reallocated']);
        });
    }
};
