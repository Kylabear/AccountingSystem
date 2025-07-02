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
        'status',
        'is_reallocated',
        'transaction_history',
        'cash_allocation_date',
        'cash_allocation_number',
        'net_amount',
        'cash_allocation_processed_date',
        'box_c_date',
        'approval_out_date',
        'approval_in_date',
        'approved_by',
        'indexing_date',
        'engas_date',
        'cdj_date',
        'lddap_date',
        'payment_method',
        'check_no',
        'processed_date',
        'ca_rts_out_date',
        'ca_rts_in_date',
        'ca_rts_reason',
        'ca_norsa_out_date',
        'ca_norsa_in_date',
        'ca_norsa_number',
        'ca_norsa_reason',
        'bc_rts_out_date',
        'bc_rts_in_date',
        'bc_rts_reason',
        'bc_norsa_out_date',
        'bc_norsa_in_date',
        'bc_norsa_number',
        'bc_norsa_reason',
    ];

    protected $casts = [
        'transaction_history' => 'array',
        'is_reallocated' => 'boolean',
        'cash_allocation_date' => 'date',
        'processed_date' => 'date',
        'cash_allocation_processed_date' => 'date',
        'box_c_date' => 'date',
        'approval_out_date' => 'date',
        'approval_in_date' => 'date',
        'indexing_date' => 'date',
        'engas_date' => 'date',
        'cdj_date' => 'date',
        'lddap_date' => 'date',
        'ca_rts_out_date' => 'date',
        'ca_rts_in_date' => 'date',
        'ca_norsa_out_date' => 'date',
        'ca_norsa_in_date' => 'date',
        'bc_rts_out_date' => 'date',
        'bc_rts_in_date' => 'date',
        'bc_norsa_out_date' => 'date',
        'bc_norsa_in_date' => 'date',
    ];

    public function orsEntries()
    {
        return $this->hasMany(OrsEntry::class);
    }
}
