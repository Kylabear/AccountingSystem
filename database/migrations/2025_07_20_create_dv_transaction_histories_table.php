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
        Schema::create('dv_transaction_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('incoming_dv_id')->constrained('incoming_dvs')->onDelete('cascade');
            $table->string('action_type'); // e.g., 'DV_RECEIVED', 'CASH_ALLOCATION', 'E_NGAS_RECORDED'
            $table->string('action_description'); // Human readable description
            $table->string('performed_by'); // Username who performed the action
            $table->json('action_data')->nullable(); // Additional data like amounts, numbers, etc.
            $table->string('status_before')->nullable(); // Status before this action
            $table->string('status_after')->nullable(); // Status after this action
            $table->text('notes')->nullable(); // Additional notes or reasons
            $table->timestamps(); // This provides created_at for exact timing
            
            // Indexes for better performance
            $table->index(['incoming_dv_id', 'created_at']);
            $table->index('action_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dv_transaction_histories');
    }
};
