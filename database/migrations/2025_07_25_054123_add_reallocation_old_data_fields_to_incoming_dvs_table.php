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
            // Old cash allocation data
            $table->date('old_cash_allocation_date')->nullable();
            $table->string('old_cash_allocation_number')->nullable();
            $table->decimal('old_net_amount', 12, 2)->nullable();
            $table->string('old_allocated_by')->nullable();
            
            // Old approval data
            $table->boolean('old_approval_out')->default(false);
            $table->date('old_approval_out_date')->nullable();
            $table->date('old_approval_in_date')->nullable();
            $table->string('old_approved_by')->nullable();
            
            // Old indexing data
            $table->date('old_indexing_date')->nullable();
            $table->string('old_indexed_by')->nullable();
            
            // Old payment method data
            $table->enum('old_payment_method', ['lddap', 'payroll_register'])->nullable();
            $table->date('old_payment_method_date')->nullable();
            $table->string('old_payment_method_set_by')->nullable();
            $table->string('old_lddap_number')->nullable();
            
            // Old payroll register data
            $table->date('old_pr_out_date')->nullable();
            $table->date('old_pr_in_date')->nullable();
            $table->string('old_pr_out_by')->nullable();
            $table->string('old_pr_in_by')->nullable();
            
            // Old ENGAS data
            $table->string('old_engas_number')->nullable();
            $table->date('old_engas_date')->nullable();
            $table->string('old_engas_recorded_by')->nullable();
            
            // Old CDJ data
            $table->date('old_cdj_date')->nullable();
            $table->text('old_cdj_details')->nullable();
            $table->string('old_cdj_recorded_by')->nullable();
            
            // Old LDDAP certification data
            $table->date('old_lddap_certified_date')->nullable();
            $table->string('old_lddap_certified_by')->nullable();
            
            // Old processed data
            $table->date('old_processed_date')->nullable();
            
            // Reallocation flags
            $table->boolean('isReallocationView')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('incoming_dvs', function (Blueprint $table) {
            // Drop old data fields
            $table->dropColumn([
                'old_cash_allocation_date',
                'old_cash_allocation_number',
                'old_net_amount',
                'old_allocated_by',
                'old_approval_out',
                'old_approval_out_date',
                'old_approval_in_date',
                'old_approved_by',
                'old_indexing_date',
                'old_indexed_by',
                'old_payment_method',
                'old_payment_method_date',
                'old_payment_method_set_by',
                'old_lddap_number',
                'old_pr_out_date',
                'old_pr_in_date',
                'old_pr_out_by',
                'old_pr_in_by',
                'old_engas_number',
                'old_engas_date',
                'old_engas_recorded_by',
                'old_cdj_date',
                'old_cdj_details',
                'old_cdj_recorded_by',
                'old_lddap_certified_date',
                'old_lddap_certified_by',
                'old_processed_date',
                'isReallocationView'
            ]);
        });
    }
};
