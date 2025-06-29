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
        Schema::create('ors_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('incoming_dv_id')->constrained()->onDelete('cascade');
            $table->string('ors_number')->nullable();
            $table->string('fund_source')->nullable();
            $table->string('uacs')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ors_entries');
    }
};
