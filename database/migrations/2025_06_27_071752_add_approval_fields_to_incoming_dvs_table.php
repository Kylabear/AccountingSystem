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
            $table->boolean('approval_out')->default(false)->after('allocated_by'); // Whether the document is out for signing
            $table->timestamp('approval_out_date')->nullable()->after('approval_out'); // When it was sent out for approval
            $table->timestamp('approval_in_date')->nullable()->after('approval_out_date'); // When it was returned from approval
            $table->string('approved_by')->nullable()->after('approval_in_date'); // Who processed the approval
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('incoming_dvs', function (Blueprint $table) {
            $table->dropColumn(['approval_out', 'approval_out_date', 'approval_in_date', 'approved_by']);
        });
    }
};
