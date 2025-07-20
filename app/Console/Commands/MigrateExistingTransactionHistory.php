<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\IncomingDv;
use App\Services\DvTransactionHistoryService;
use App\Models\User;
use Carbon\Carbon;

class MigrateExistingTransactionHistory extends Command
{
    protected $signature = 'migrate:transaction-history 
                            {--dry-run : Show what would be migrated without making changes}
                            {--reset : Reset existing transaction histories before migration}
                            {--force : Migrate all DVs even if they have transaction histories}';
    protected $description = 'Migrate existing DVs to have proper transaction history based on their current status and data';

    private $service;
    private $systemUser;

    public function handle()
    {
        $this->service = new DvTransactionHistoryService();
        $this->systemUser = User::first()?->name ?? 'System Migration';
        
        $dryRun = $this->option('dry-run');
        $reset = $this->option('reset');
        $force = $this->option('force');
        
        $this->info('Migrating Existing DV Transaction Histories');
        $this->info('==========================================');
        
        if ($dryRun) {
            $this->warn('DRY RUN MODE - No changes will be made');
        }
        
        if ($reset) {
            $this->warn('RESET MODE - Existing transaction histories will be deleted');
        }
        
        $this->newLine();

        // Get DVs based on options
        if ($force || $reset) {
            $dvs = IncomingDv::with('transactionHistories')->get();
        } else {
            $dvs = IncomingDv::with('transactionHistories')->get()->filter(function ($dv) {
                return $dv->transactionHistories->isEmpty();
            });
        }

        $this->info("Found {$dvs->count()} DVs to process");
        $this->newLine();

        if ($dvs->count() === 0) {
            $this->info('No DVs to migrate. Use --force to migrate all DVs regardless of existing histories.');
            return 0;
        }

        $progressBar = $this->output->createProgressBar($dvs->count());
        $progressBar->start();

        $migrated = 0;
        $errors = 0;

        foreach ($dvs as $dv) {
            try {
                if (!$dryRun) {
                    if ($reset) {
                        $dv->transactionHistories()->delete();
                    }
                    $this->migrateTransactionHistoryForDv($dv);
                } else {
                    $this->showMigrationPlan($dv);
                }
                $migrated++;
            } catch (\Exception $e) {
                $this->error("Error migrating DV {$dv->dv_number}: " . $e->getMessage());
                $errors++;
            }
            
            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);

        if ($dryRun) {
            $this->info("DRY RUN COMPLETE - {$migrated} DVs would be migrated");
        } else {
            $this->info("MIGRATION COMPLETE - {$migrated} DVs migrated successfully");
        }
        
        if ($errors > 0) {
            $this->error("{$errors} DVs had errors during migration");
        }

        return 0;
    }

    private function migrateTransactionHistoryForDv(IncomingDv $dv)
    {
        $createdAt = $dv->created_at;
        
        // 1. DV Received - always the first entry
        $this->createHistoryEntry($dv, 'DV_RECEIVED', $createdAt, [
            'dv_number' => $dv->dv_number,
            'amount' => $dv->amount,
            'payee' => $dv->payee,
            'particulars' => $dv->particulars
        ]);

        // 2. Review completed (if status shows it's past review)
        if (in_array($dv->status, [
            'for_cash_allocation', 'for_box_c', 'for_approval', 
            'for_indexing', 'for_payment', 'for_engas', 
            'for_cdj', 'for_lddap', 'processed'
        ])) {
            $this->createHistoryEntry($dv, 'REVIEW_COMPLETED', $createdAt->addMinutes(5), [
                'dv_number' => $dv->dv_number
            ], 'for_review', 'for_cash_allocation');
        }

        // 3. Cash allocation (if has allocation data)
        if ($dv->cash_allocation_date || $dv->cash_allocation_number || $dv->net_amount) {
            $allocationDate = $dv->cash_allocation_date ? Carbon::parse($dv->cash_allocation_date) : $createdAt->addMinutes(10);
            $this->createHistoryEntry($dv, 'CASH_ALLOCATION', $allocationDate, [
                'dv_number' => $dv->dv_number,
                'cash_allocation_number' => $dv->cash_allocation_number,
                'net_amount' => $dv->net_amount,
                'allocated_by' => $dv->allocated_by
            ]);
        }

        // 4. Box C certification (if past box_c status)
        if (in_array($dv->status, [
            'for_approval', 'for_indexing', 'for_payment', 
            'for_engas', 'for_cdj', 'for_lddap', 'processed'
        ])) {
            $this->createHistoryEntry($dv, 'BOX_C_CERTIFICATION', $createdAt->addMinutes(15));
        }

        // 5. Approval workflow (if has approval data)
        if ($dv->approval_out_date) {
            $this->createHistoryEntry($dv, 'APPROVAL_SENT', Carbon::parse($dv->approval_out_date));
        }
        
        if ($dv->approval_in_date) {
            $this->createHistoryEntry($dv, 'APPROVAL_RETURNED', Carbon::parse($dv->approval_in_date), [
                'approved_by' => $dv->approved_by
            ], 'for_approval', 'for_indexing');
        }

        // 6. Indexing (if has indexing data)
        if ($dv->indexing_date || in_array($dv->status, [
            'for_payment', 'for_engas', 'for_cdj', 'for_lddap', 'processed'
        ])) {
            $indexingDate = $dv->indexing_date ? Carbon::parse($dv->indexing_date) : $createdAt->addMinutes(25);
            $this->createHistoryEntry($dv, 'INDEXING_COMPLETED', $indexingDate, [
                'indexed_by' => $dv->indexed_by
            ]);
        }

        // 7. Payment method (if has payment method)
        if ($dv->payment_method) {
            $paymentDate = $dv->payment_method_date ? Carbon::parse($dv->payment_method_date) : $createdAt->addMinutes(30);
            $this->createHistoryEntry($dv, 'PAYMENT_METHOD_SET', $paymentDate, [
                'payment_method' => $dv->payment_method,
                'lddap_number' => $dv->lddap_number,
                'payment_method_set_by' => $dv->payment_method_set_by
            ]);
        }

        // 8. E-NGAS (if has engas data)
        if ($dv->engas_number) {
            $engasDate = $dv->engas_date ? Carbon::parse($dv->engas_date) : $createdAt->addMinutes(35);
            $this->createHistoryEntry($dv, 'E_NGAS_RECORDED', $engasDate, [
                'engas_number' => $dv->engas_number,
                'engas_recorded_by' => $dv->engas_recorded_by
            ]);
        }

        // 9. CDJ (if has CDJ data)
        if ($dv->cdj_date) {
            $this->createHistoryEntry($dv, 'CDJ_RECORDED', Carbon::parse($dv->cdj_date), [
                'cdj_recorded_by' => $dv->cdj_recorded_by
            ]);
        }

        // 10. LDDAP (if has LDDAP data)
        if ($dv->lddap_certified_date) {
            $this->createHistoryEntry($dv, 'LDDAP_CERTIFIED', Carbon::parse($dv->lddap_certified_date), [
                'lddap_certified_by' => $dv->lddap_certified_by
            ]);
        }

        // 11. Processing completed (if status is processed)
        if ($dv->status === 'processed' && $dv->processed_date) {
            $this->createHistoryEntry($dv, 'PROCESSING_COMPLETED', Carbon::parse($dv->processed_date), [
                'processed_date' => $dv->processed_date
            ], null, 'processed');
        }

        // 12. Handle RTS/NORSA histories if they exist
        if ($dv->rts_history && is_array($dv->rts_history)) {
            foreach ($dv->rts_history as $rts) {
                if (isset($rts['date'])) {
                    $this->createHistoryEntry($dv, 'RTS_ISSUED', Carbon::parse($rts['date']), [
                        'rts_reason' => $rts['reason'] ?? null,
                        'origin' => $rts['origin'] ?? 'review'
                    ]);
                }
            }
        }

        if ($dv->norsa_history && is_array($dv->norsa_history)) {
            foreach ($dv->norsa_history as $norsa) {
                if (isset($norsa['date'])) {
                    $this->createHistoryEntry($dv, 'NORSA_ISSUED', Carbon::parse($norsa['date']), [
                        'norsa_number' => $norsa['number'] ?? null,
                        'origin' => $norsa['origin'] ?? 'review'
                    ]);
                }
            }
        }
    }

    private function createHistoryEntry(IncomingDv $dv, string $actionType, Carbon $date, array $actionData = [], ?string $statusBefore = null, ?string $statusAfter = null)
    {
        \App\Models\DvTransactionHistory::create([
            'incoming_dv_id' => $dv->id,
            'action_type' => $actionType,
            'action_description' => \App\Models\DvTransactionHistory::ACTION_TYPES[$actionType] ?? $actionType,
            'performed_by' => $this->determinePerformedBy($dv, $actionType),
            'action_data' => $actionData,
            'status_before' => $statusBefore,
            'status_after' => $statusAfter,
            'created_at' => $date,
            'updated_at' => $date,
        ]);
    }

    private function determinePerformedBy(IncomingDv $dv, string $actionType): string
    {
        switch ($actionType) {
            case 'CASH_ALLOCATION':
                return $dv->allocated_by ?? $this->systemUser;
            case 'INDEXING_COMPLETED':
                return $dv->indexed_by ?? $this->systemUser;
            case 'PAYMENT_METHOD_SET':
                return $dv->payment_method_set_by ?? $this->systemUser;
            case 'E_NGAS_RECORDED':
                return $dv->engas_recorded_by ?? $this->systemUser;
            case 'CDJ_RECORDED':
                return $dv->cdj_recorded_by ?? $this->systemUser;
            case 'LDDAP_CERTIFIED':
                return $dv->lddap_certified_by ?? $this->systemUser;
            case 'APPROVAL_RETURNED':
                return $dv->approved_by ?? $this->systemUser;
            default:
                return $this->systemUser;
        }
    }

    private function showMigrationPlan(IncomingDv $dv)
    {
        $this->info("DV: {$dv->dv_number} (Status: {$dv->status})");
        
        $entries = [];
        $entries[] = 'DV_RECEIVED';
        
        if (in_array($dv->status, ['for_cash_allocation', 'for_box_c', 'for_approval', 'for_indexing', 'for_payment', 'for_engas', 'for_cdj', 'for_lddap', 'processed'])) {
            $entries[] = 'REVIEW_COMPLETED';
        }
        
        if ($dv->cash_allocation_date || $dv->cash_allocation_number) {
            $entries[] = 'CASH_ALLOCATION';
        }
        
        if (in_array($dv->status, ['for_approval', 'for_indexing', 'for_payment', 'for_engas', 'for_cdj', 'for_lddap', 'processed'])) {
            $entries[] = 'BOX_C_CERTIFICATION';
        }
        
        if ($dv->approval_out_date) $entries[] = 'APPROVAL_SENT';
        if ($dv->approval_in_date) $entries[] = 'APPROVAL_RETURNED';
        if ($dv->indexing_date) $entries[] = 'INDEXING_COMPLETED';
        if ($dv->payment_method) $entries[] = 'PAYMENT_METHOD_SET';
        if ($dv->engas_number) $entries[] = 'E_NGAS_RECORDED';
        if ($dv->cdj_date) $entries[] = 'CDJ_RECORDED';
        if ($dv->lddap_certified_date) $entries[] = 'LDDAP_CERTIFIED';
        if ($dv->status === 'processed') $entries[] = 'PROCESSING_COMPLETED';
        
        $this->line('  Would create: ' . implode(' → ', $entries));
        $this->newLine();
    }
}
