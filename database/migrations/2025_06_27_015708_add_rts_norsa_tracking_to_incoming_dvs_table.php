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
            // RTS and NORSA tracking - JSON fields to store multiple cycles
            $table->json('rts_history')->nullable(); // Stores array of RTS cycles
            $table->json('norsa_history')->nullable(); // Stores array of NORSA cycles
            $table->integer('rts_cycle_count')->default(0); // Track number of RTS cycles
            $table->integer('norsa_cycle_count')->default(0); // Track number of NORSA cycles
            $table->timestamp('last_rts_date')->nullable(); // Last RTS date for quick queries
            $table->timestamp('last_norsa_date')->nullable(); // Last NORSA date for quick queries
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('incoming_dvs', function (Blueprint $table) {
            $table->dropColumn([
                'rts_history',
                'norsa_history', 
                'rts_cycle_count',
                'norsa_cycle_count',
                'last_rts_date',
                'last_norsa_date'
            ]);
        });
    }
};
