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
            // Remove the old cdj_type column and add cdj_details
            $table->dropColumn('cdj_type');
            $table->text('cdj_details')->nullable()->after('cdj_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('incoming_dvs', function (Blueprint $table) {
            // Reverse the changes
            $table->dropColumn('cdj_details');
            $table->string('cdj_type')->nullable()->after('cdj_date');
        });
    }
};
