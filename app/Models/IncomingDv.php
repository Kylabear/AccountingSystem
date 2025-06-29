<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IncomingDv extends Model
{
    protected $fillable = [
        'transaction_type',
        'implementing_unit',
        'dv_number',
        'payee',
        'account_number',
        'amount',
        'particulars',
        'fund_source',
        'ors_number',
        'uacs',
        'status',
        'rts_out_date',
        'rts_reason',
        'norsa_date',
        'norsa_number',
        'rts_history',
        'norsa_history',
        'rts_cycle_count',
        'norsa_cycle_count',
        'last_rts_date',
        'last_norsa_date',
        'rts_origin',
        'norsa_origin',
        'cash_allocation_date',
        'cash_allocation_number',
        'net_amount',
        'transaction_history',
        'allocated_by',
        'approval_out',
        'approval_out_date',
        'approval_in_date',
        'approved_by',
        'approval_status',
        // New workflow fields
        'indexing_date',
        'indexed_by',
        'payment_method',
        'lddap_number',
        'payment_method_date',
        'payment_method_set_by',
        'pr_out_date',
        'pr_in_date',
        'pr_out_by',
        'pr_in_by',
        'engas_number',
        'engas_date',
        'engas_recorded_by',
        'cdj_date',
        'cdj_details',
        'cdj_recorded_by',
        'lddap_certified_date',
        'lddap_certified_by',
        'processed_date',
    ];

    protected $casts = [
        'rts_history' => 'array',
        'norsa_history' => 'array',
        'transaction_history' => 'array',
        'last_rts_date' => 'datetime',
        'last_norsa_date' => 'datetime',
        'cash_allocation_date' => 'date',
        'approval_out_date' => 'datetime',
        'approval_in_date' => 'datetime',
        'indexing_date' => 'date',
        'payment_method_date' => 'date',
        'pr_out_date' => 'date',
        'pr_in_date' => 'date',
        'engas_date' => 'date',
        'cdj_date' => 'date',
        'lddap_certified_date' => 'date',
        'processed_date' => 'date',
    ];

    public function orsEntries()
    {
        return $this->hasMany(OrsEntry::class);
    }
}
