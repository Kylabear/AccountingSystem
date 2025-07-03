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
            $table->date('reallocation_date')->nullable()->after('is_reallocated');
            $table->string('reallocation_reason')->nullable()->after('reallocation_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('incoming_dvs', function (Blueprint $table) {
            $table->dropColumn(['reallocation_date', 'reallocation_reason']);
        });
    }
};
