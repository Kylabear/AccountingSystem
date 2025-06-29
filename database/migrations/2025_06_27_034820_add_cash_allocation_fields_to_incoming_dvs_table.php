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
            $table->date('cash_allocation_date')->nullable();
            $table->string('cash_allocation_number')->nullable();
            $table->decimal('net_amount', 15, 2)->nullable();
            $table->json('transaction_history')->nullable();
            $table->string('allocated_by')->nullable(); // user who performed cash allocation
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('incoming_dvs', function (Blueprint $table) {
            $table->dropColumn([
                'cash_allocation_date',
                'cash_allocation_number', 
                'net_amount',
                'transaction_history',
                'allocated_by'
            ]);
        });
    }
};
