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
            $table->date('rts_out_date')->nullable();
            $table->text('rts_reason')->nullable();
            $table->date('norsa_date')->nullable();
            $table->string('norsa_number')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('incoming_dvs', function (Blueprint $table) {
            $table->dropColumn(['rts_out_date', 'rts_reason', 'norsa_date', 'norsa_number']);
        });
    }
};
