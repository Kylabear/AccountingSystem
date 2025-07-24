<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update DVs that have the old for_bc_norsa_in status to use the new unified system
        DB::table('incoming_dvs')
            ->where('status', 'for_bc_norsa_in')
            ->update([
                'status' => 'for_norsa_in',
                'norsa_origin' => 'box_c',
                'updated_at' => now()
            ]);

        // Also update any for_bc_rts_in status to use the new unified system
        DB::table('incoming_dvs')
            ->where('status', 'for_bc_rts_in')
            ->update([
                'status' => 'for_rts_in',
                'rts_origin' => 'box_c',
                'updated_at' => now()
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverse the changes if needed
        DB::table('incoming_dvs')
            ->where('status', 'for_norsa_in')
            ->where('norsa_origin', 'box_c')
            ->update([
                'status' => 'for_bc_norsa_in',
                'norsa_origin' => null,
                'updated_at' => now()
            ]);

        DB::table('incoming_dvs')
            ->where('status', 'for_rts_in')
            ->where('rts_origin', 'box_c')
            ->update([
                'status' => 'for_bc_rts_in',
                'rts_origin' => null,
                'updated_at' => now()
            ]);
    }
};
