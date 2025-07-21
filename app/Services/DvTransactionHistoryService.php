<?php

namespace App\Services;

use App\Models\IncomingDv;
use App\Models\DvTransactionHistory;
use Illuminate\Support\Facades\Auth;

class DvTransactionHistoryService
{
    /**
     * Record when a DV is initially received/created
     */
    public function recordDvReceived(IncomingDv $dv, ?string $performedBy = null): DvTransactionHistory
    {
        return DvTransactionHistory::createEntry(
            incomingDvId: $dv->id,
            actionType: 'DV_RECEIVED',
            performedBy: $performedBy ?? Auth::user()?->name ?? 'System',
            actionData: [
                'dv_number' => $dv->dv_number,
                'amount' => $dv->amount,
                'payee' => $dv->payee,
                'particulars' => $dv->particulars,
            ],
            statusAfter: $dv->status
        );
    }

    /**
     * Record when review is completed
     */
    public function recordReviewCompleted(IncomingDv $dv, string $newStatus, ?string $performedBy = null, array $additionalData = []): DvTransactionHistory
    {
        return DvTransactionHistory::createEntry(
            incomingDvId: $dv->id,
            actionType: 'REVIEW_COMPLETED',
            performedBy: $performedBy ?? Auth::user()?->name ?? 'System',
            actionData: array_merge([
                'dv_number' => $dv->dv_number,
            ], $additionalData),
            statusBefore: $dv->status,
            statusAfter: $newStatus
        );
    }

    /**
     * Record when a DV is updated/modified
     */
    public function recordDvUpdated(IncomingDv $dv, array $details = [])
    {
        return DvTransactionHistory::createEntry(
            incomingDvId: $dv->id,
            actionType: 'DV_UPDATED',
            performedBy: Auth::user()?->name ?? 'Unknown User',
            actionData: array_merge([
                'dv_number' => $dv->dv_number,
            ], $details)
        );
    }

    /**
     * Record cash allocation
     */
    public function recordCashAllocation(IncomingDv $dv, array $allocationData, ?string $performedBy = null): DvTransactionHistory
    {
        return DvTransactionHistory::createEntry(
            incomingDvId: $dv->id,
            actionType: 'CASH_ALLOCATION',
            performedBy: $performedBy ?? Auth::user()?->name ?? 'System',
            actionData: [
                'dv_number' => $dv->dv_number,
                'amount' => $dv->amount,
                'net_amount' => $allocationData['net_amount'],
                'cash_allocation_number' => $allocationData['cash_allocation_number'],
                'cash_allocation_date' => $allocationData['cash_allocation_date'],
            ],
            statusBefore: $dv->status,
            statusAfter: 'for_box_c'
        );
    }

    /**
     * Record Box C certification
     */
    public function recordBoxCCertification(IncomingDv $dv, ?string $performedBy = null): DvTransactionHistory
    {
        return DvTransactionHistory::createEntry(
            incomingDvId: $dv->id,
            actionType: 'BOX_C_CERTIFICATION',
            performedBy: $performedBy ?? Auth::user()?->name ?? 'System',
            actionData: [
                'dv_number' => $dv->dv_number,
                'certification_date' => now()->toDateString(),
            ],
            statusBefore: $dv->status,
            statusAfter: 'for_approval'
        );
    }

    /**
     * Record when sent for approval
     */
    public function recordApprovalSent(IncomingDv $dv, ?string $performedBy = null): DvTransactionHistory
    {
        return DvTransactionHistory::createEntry(
            incomingDvId: $dv->id,
            actionType: 'APPROVAL_SENT',
            performedBy: $performedBy ?? Auth::user()?->name ?? 'System',
            actionData: [
                'dv_number' => $dv->dv_number,
                'sent_date' => now()->toDateString(),
            ],
            statusBefore: $dv->status
        );
    }

    /**
     * Record when returned from approval
     */
    public function recordApprovalReturned(IncomingDv $dv, string $approvedBy, ?string $performedBy = null): DvTransactionHistory
    {
        return DvTransactionHistory::createEntry(
            incomingDvId: $dv->id,
            actionType: 'APPROVAL_RETURNED',
            performedBy: $performedBy ?? Auth::user()?->name ?? 'System',
            actionData: [
                'dv_number' => $dv->dv_number,
                'approved_by' => $approvedBy,
                'return_date' => now()->toDateString(),
            ],
            statusBefore: $dv->status,
            statusAfter: 'for_indexing'
        );
    }

    /**
     * Record indexing completion
     */
    public function recordIndexingCompleted(IncomingDv $dv, ?string $performedBy = null): DvTransactionHistory
    {
        return DvTransactionHistory::createEntry(
            incomingDvId: $dv->id,
            actionType: 'INDEXING_COMPLETED',
            performedBy: $performedBy ?? Auth::user()?->name ?? 'System',
            actionData: [
                'dv_number' => $dv->dv_number,
                'indexing_date' => now()->toDateString(),
            ],
            statusBefore: $dv->status,
            statusAfter: 'for_payment'
        );
    }

    /**
     * Record when DV processing is completed
     */
    public function recordProcessingCompleted(IncomingDv $dv, ?string $performedBy = null): DvTransactionHistory
    {
        return DvTransactionHistory::createEntry(
            incomingDvId: $dv->id,
            actionType: 'PROCESSING_COMPLETED',
            performedBy: $performedBy ?? Auth::user()?->name ?? 'System',
            actionData: [
                'dv_number' => $dv->dv_number,
            ],
            statusBefore: $dv->status,
            statusAfter: 'processed'
        );
    }

    /**
     * Record payment method selection
     */
    public function recordPaymentMethodSet(IncomingDv $dv, string $paymentMethod, array $additionalData = [], ?string $performedBy = null): DvTransactionHistory
    {
        return DvTransactionHistory::createEntry(
            incomingDvId: $dv->id,
            actionType: 'PAYMENT_METHOD_SET',
            performedBy: $performedBy ?? Auth::user()?->name ?? 'System',
            actionData: array_merge([
                'dv_number' => $dv->dv_number,
                'payment_method' => $paymentMethod,
            ], $additionalData),
            statusBefore: $dv->status,
            statusAfter: 'for_engas'
        );
    }

    /**
     * Record E-NGAS recording
     */
    public function recordEngasRecorded(IncomingDv $dv, string $engasNumber, string $engasDate, ?string $performedBy = null): DvTransactionHistory
    {
        return DvTransactionHistory::createEntry(
            incomingDvId: $dv->id,
            actionType: 'E_NGAS_RECORDED',
            performedBy: $performedBy ?? Auth::user()?->name ?? 'System',
            actionData: [
                'dv_number' => $dv->dv_number,
                'engas_number' => $engasNumber,
                'engas_date' => $engasDate,
            ],
            statusBefore: $dv->status,
            statusAfter: 'for_cdj'
        );
    }

    /**
     * Record CDJ recording
     */
    public function recordCdjRecorded(IncomingDv $dv, string $cdjDate, ?string $performedBy = null): DvTransactionHistory
    {
        return DvTransactionHistory::createEntry(
            incomingDvId: $dv->id,
            actionType: 'CDJ_RECORDED',
            performedBy: $performedBy ?? Auth::user()?->name ?? 'System',
            actionData: [
                'dv_number' => $dv->dv_number,
                'cdj_date' => $cdjDate,
            ],
            statusBefore: $dv->status,
            statusAfter: 'for_lddap'
        );
    }

    /**
     * Record LDDAP certification
     */
    public function recordLddapCertified(IncomingDv $dv, ?string $performedBy = null): DvTransactionHistory
    {
        return DvTransactionHistory::createEntry(
            incomingDvId: $dv->id,
            actionType: 'LDDAP_CERTIFIED',
            performedBy: $performedBy ?? Auth::user()?->name ?? 'System',
            actionData: [
                'dv_number' => $dv->dv_number,
                'lddap_certified_date' => now()->toDateString(),
            ],
            statusBefore: $dv->status,
            statusAfter: 'processed'
        );
    }

    /**
     * Record RTS (Return to Sender)
     */
    public function recordRtsIssued(IncomingDv $dv, string $reason, string $rtsDate, ?string $performedBy = null): DvTransactionHistory
    {
        return DvTransactionHistory::createEntry(
            incomingDvId: $dv->id,
            actionType: 'RTS_ISSUED',
            performedBy: $performedBy ?? Auth::user()?->name ?? 'System',
            actionData: [
                'dv_number' => $dv->dv_number,
                'rts_reason' => $reason,
                'rts_date' => $rtsDate,
            ],
            statusBefore: $dv->status,
            notes: $reason
        );
    }

    /**
     * Record NORSA (Notice of Reason for Settlement Adjustment)
     */
    public function recordNorsaIssued(IncomingDv $dv, string $norsaNumber, string $norsaDate, ?string $performedBy = null): DvTransactionHistory
    {
        return DvTransactionHistory::createEntry(
            incomingDvId: $dv->id,
            actionType: 'NORSA_ISSUED',
            performedBy: $performedBy ?? Auth::user()?->name ?? 'System',
            actionData: [
                'dv_number' => $dv->dv_number,
                'norsa_number' => $norsaNumber,
                'norsa_date' => $norsaDate,
            ],
            statusBefore: $dv->status
        );
    }

    /**
     * Record general status change (use sparingly, prefer specific methods)
     */
    public function recordStatusChange(IncomingDv $dv, string $oldStatus, string $newStatus, ?string $performedBy = null, ?string $reason = null): DvTransactionHistory
    {
        return DvTransactionHistory::createEntry(
            incomingDvId: $dv->id,
            actionType: 'STATUS_CHANGED',
            performedBy: $performedBy ?? Auth::user()?->name ?? 'System',
            actionData: [
                'dv_number' => $dv->dv_number,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
            ],
            statusBefore: $oldStatus,
            statusAfter: $newStatus,
            notes: $reason
        );
    }

    /**
     * Migrate existing DVs that don't have proper transaction history
     */
    public function migrateExistingDv(IncomingDv $dv): void
    {
        // Only create initial entry if no history exists
        if ($dv->transactionHistories()->count() === 0) {
            $this->recordDvReceived($dv, 'System - Migration');
        }
    }
}
