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
        Schema::create('incoming_dvs', function (Blueprint $table) {
            $table->id();
            $table->string('dv_number');
            $table->string('payee');
            $table->string('account_number')->nullable();
            $table->decimal('amount', 15, 2);
            $table->string('particulars');
            $table->string('fund_source')->nullable();
            $table->string('ors_number')->nullable();
            $table->string('uacs')->nullable();
            $table->string('transaction_type');
            $table->string('implementing_unit');
            $table->string('status')->default('recents'); // default tab
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('incoming_dvs');
    }
};
