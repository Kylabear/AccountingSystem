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
        'lddap_number',
        'lddap_certified_date',
        'lddap_certified_by',
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
        // Old data fields for reallocation
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
        'isReallocationView',
    ];

    protected $casts = [
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
        'lddap_certified_date' => 'date',
        'ca_rts_out_date' => 'date',
        'ca_rts_in_date' => 'date',
        'ca_norsa_out_date' => 'date',
        'ca_norsa_in_date' => 'date',
        'bc_rts_out_date' => 'date',
        'bc_rts_in_date' => 'date',
        'bc_norsa_out_date' => 'date',
        'bc_norsa_in_date' => 'date',
        // Old data field casts for reallocation
        'old_approval_out' => 'boolean',
        'old_cash_allocation_date' => 'date',
        'old_approval_out_date' => 'date',
        'old_approval_in_date' => 'date',
        'old_indexing_date' => 'date',
        'old_payment_method_date' => 'date',
        'old_pr_out_date' => 'date',
        'old_pr_in_date' => 'date',
        'old_engas_date' => 'date',
        'old_cdj_date' => 'date',
        'old_lddap_certified_date' => 'date',
        'old_processed_date' => 'date',
        'isReallocationView' => 'boolean',
    ];

    public function orsEntries()
    {
        return $this->hasMany(OrsEntry::class);
    }

    /**
     * Get the transaction history for this DV
     */
    public function transactionHistories()
    {
        return $this->hasMany(DvTransactionHistory::class)->orderBy('created_at', 'asc');
    }

    /**
     * Get formatted transaction history for frontend
     */
    public function getFormattedTransactionHistoryAttribute()
    {
        return $this->transactionHistories->map(function ($history) {
            return [
                'type' => $history->action_description,
                'action' => $history->action_type,
                'date' => $history->created_at->toDateString(),
                'created_at' => $history->created_at->toISOString(),
                'by' => $history->performed_by,
                'user' => $history->performed_by,
                'status_before' => $history->status_before,
                'status_after' => $history->status_after,
                'notes' => $history->notes,
                // Include action_data fields at the root level for easy access
                'amount' => $history->action_data['amount'] ?? null,
                'net_amount' => $history->action_data['net_amount'] ?? null,
                'dv_number' => $history->action_data['dv_number'] ?? null,
                'allocation_number' => $history->action_data['allocation_number'] ?? null,
                'cash_allocation_number' => $history->action_data['cash_allocation_number'] ?? null,
                'engas_number' => $history->action_data['engas_number'] ?? null,
                'e_ngas_number' => $history->action_data['engas_number'] ?? null,
                'description' => $history->notes,
                'details' => $history->action_data,
            ];
        })->toArray();
    }

    /**
     * Accessor for lddap_date to maintain backward compatibility
     * Maps to lddap_certified_date for frontend consistency
     */
    public function getLddapDateAttribute()
    {
        return $this->lddap_certified_date;
    }
}
