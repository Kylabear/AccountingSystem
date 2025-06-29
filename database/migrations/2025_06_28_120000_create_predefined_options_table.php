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
        Schema::create('predefined_options', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // 'fund_source', 'transaction_type', 'implementing_unit'
            $table->string('value');
            $table->boolean('is_predefined')->default(true); // true for system predefined, false for user added
            $table->timestamps();
            
            $table->unique(['type', 'value']);
            $table->index(['type', 'is_predefined']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('predefined_options');
    }
};
