<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('incoming_dvs', function (Blueprint $table) {
            // For Indexing stage
            $table->date('indexing_date')->nullable();
            $table->string('indexed_by')->nullable();
            
            // For Mode of Payment stage
            $table->string('payment_method')->nullable(); // 'check', 'lddap', 'payroll'
            $table->string('lddap_number')->nullable();
            $table->date('payment_method_date')->nullable();
            $table->string('payment_method_set_by')->nullable();
            
            // For Payroll Register (PR) specific fields
            $table->date('pr_out_date')->nullable();
            $table->date('pr_in_date')->nullable();
            $table->string('pr_out_by')->nullable();
            $table->string('pr_in_by')->nullable();
            
            // For E-NGAS Recording stage
            $table->string('engas_number')->nullable();
            $table->date('engas_date')->nullable();
            $table->string('engas_recorded_by')->nullable();
            
            // For CDJ Recording stage
            $table->date('cdj_date')->nullable();
            $table->string('cdj_type')->nullable(); // 'ada' or 'check'
            $table->string('cdj_recorded_by')->nullable();
            
            // For LDDAP Certification stage
            $table->date('lddap_certified_date')->nullable();
            $table->string('lddap_certified_by')->nullable();
            
            // Final processing completion
            $table->date('processed_date')->nullable();
        });
    }

    public function down()
    {
        Schema::table('incoming_dvs', function (Blueprint $table) {
            $table->dropColumn([
                'indexing_date', 'indexed_by',
                'payment_method', 'lddap_number', 'payment_method_date', 'payment_method_set_by',
                'pr_out_date', 'pr_in_date', 'pr_out_by', 'pr_in_by',
                'engas_number', 'engas_date', 'engas_recorded_by',
                'cdj_date', 'cdj_type', 'cdj_recorded_by',
                'lddap_certified_date', 'lddap_certified_by',
                'processed_date'
            ]);
        });
    }
};
