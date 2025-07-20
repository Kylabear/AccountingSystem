<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DvTransactionHistory extends Model
{
    protected $fillable = [
        'incoming_dv_id',
        'action_type',
        'action_description',
        'performed_by',
        'action_data',
        'status_before',
        'status_after',
        'notes',
    ];

    protected $casts = [
        'action_data' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the DV that this history entry belongs to
     */
    public function incomingDv(): BelongsTo
    {
        return $this->belongsTo(IncomingDv::class);
    }

    /**
     * Common action types as constants
     */
    const ACTION_TYPES = [
        'DV_RECEIVED' => 'DV Received',
        'DV_UPDATED' => 'DV Updated',
        'REVIEW_COMPLETED' => 'Review Completed',
        'CASH_ALLOCATION' => 'Cash Allocation',
        'BOX_C_CERTIFICATION' => 'Box C Certification',
        'APPROVAL_SENT' => 'Sent for Approval',
        'APPROVAL_RETURNED' => 'Returned from Approval',
        'INDEXING_COMPLETED' => 'Indexing Completed',
        'PAYMENT_METHOD_SET' => 'Payment Method Set',
        'E_NGAS_RECORDED' => 'E-NGAS Recorded',
        'CDJ_RECORDED' => 'CDJ Recorded',
        'LDDAP_CERTIFIED' => 'LDDAP Certified',
        'PROCESSING_COMPLETED' => 'Processing Completed',
        'RTS_ISSUED' => 'RTS Issued',
        'NORSA_ISSUED' => 'NORSA Issued',
        'STATUS_CHANGED' => 'Status Changed',
    ];

    /**
     * Create a new transaction history entry
     */
    public static function createEntry(
        int $incomingDvId,
        string $actionType,
        string $performedBy,
        array $actionData = [],
        ?string $statusBefore = null,
        ?string $statusAfter = null,
        ?string $notes = null
    ): self {
        return self::create([
            'incoming_dv_id' => $incomingDvId,
            'action_type' => $actionType,
            'action_description' => self::ACTION_TYPES[$actionType] ?? $actionType,
            'performed_by' => $performedBy,
            'action_data' => $actionData,
            'status_before' => $statusBefore,
            'status_after' => $statusAfter,
            'notes' => $notes,
        ]);
    }
}
