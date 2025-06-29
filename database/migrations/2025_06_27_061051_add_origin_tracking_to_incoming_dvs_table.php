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
            $table->string('rts_origin')->nullable()->after('rts_cycle_count'); // 'review' or 'box_c'
            $table->string('norsa_origin')->nullable()->after('norsa_cycle_count'); // 'review' or 'box_c'
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('incoming_dvs', function (Blueprint $table) {
            $table->dropColumn(['rts_origin', 'norsa_origin']);
        });
    }
};
