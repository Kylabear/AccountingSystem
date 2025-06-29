<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\IncomingDv;

class TestFullWorkflow extends Command
{
    protected $signature = 'test:full-workflow';
    protected $description = 'Create test DVs for each workflow stage';

    public function handle()
    {
        $this->info('Creating test DVs for full workflow demonstration...');

        // Create a DV for each major workflow stage
        $stages = [
            [
                'status' => 'for_indexing',
                'payee' => 'Sample Company for Indexing',
                'dv_number' => '2025-06-00001',
                'amount' => 50000.00,
                'net_amount' => 48000.00,
                'transaction_history' => [
                    ['action' => 'Received', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'Review Done', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'Cash Allocation', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'Box C Certified', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'Returned from approval', 'user' => 'Admin', 'date' => '2025-06-28'],
                ]
            ],
            [
                'status' => 'for_payment',
                'payee' => 'Tech Solutions for Payment',
                'dv_number' => '2025-06-00002',
                'amount' => 75000.00,
                'net_amount' => 73000.00,
                'indexing_date' => '2025-06-28',
                'indexed_by' => 'Admin',
                'transaction_history' => [
                    ['action' => 'Received', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'Review Done', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'Cash Allocation', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'Box C Certified', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'Returned from approval', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'Indexed', 'user' => 'Admin', 'date' => '2025-06-28'],
                ]
            ],
            [
                'status' => 'out_to_cashiering',
                'payee' => 'Payroll Services Corp',
                'dv_number' => '2025-06-00003',
                'amount' => 120000.00,
                'net_amount' => 118000.00,
                'indexing_date' => '2025-06-28',
                'indexed_by' => 'Admin',
                'payment_method' => 'payroll',
                'pr_out_date' => '2025-06-28',
                'pr_out_by' => 'Admin',
                'transaction_history' => [
                    ['action' => 'Received', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'Review Done', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'Cash Allocation', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'Box C Certified', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'Returned from approval', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'Indexed', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'Set to Payroll Register', 'user' => 'Admin', 'date' => '2025-06-28'],
                ]
            ],
            [
                'status' => 'for_engas',
                'payee' => 'Engineering Services Inc',
                'dv_number' => '2025-06-00004',
                'amount' => 85000.00,
                'net_amount' => 83000.00,
                'indexing_date' => '2025-06-28',
                'indexed_by' => 'Admin',
                'payment_method' => 'check',
                'payment_method_date' => '2025-06-28',
                'payment_method_set_by' => 'Admin',
                'transaction_history' => [
                    ['action' => 'Received', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'Review Done', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'Cash Allocation', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'Box C Certified', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'Returned from approval', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'Indexed', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'Payment method set: Check', 'user' => 'Admin', 'date' => '2025-06-28'],
                ]
            ],
            [
                'status' => 'for_cdj',
                'payee' => 'Medical Supply Company',
                'dv_number' => '2025-06-00005',
                'amount' => 95000.00,
                'net_amount' => 92000.00,
                'indexing_date' => '2025-06-28',
                'indexed_by' => 'Admin',
                'payment_method' => 'lddap',
                'lddap_number' => 'LDDAP-2025-001',
                'payment_method_date' => '2025-06-28',
                'payment_method_set_by' => 'Admin',
                'engas_number' => 'ENG-2025-001',
                'engas_date' => '2025-06-28',
                'engas_recorded_by' => 'Admin',
                'transaction_history' => [
                    ['action' => 'Received', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'Review Done', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'Cash Allocation', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'Box C Certified', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'Returned from approval', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'Indexed', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'Payment method set: Lddap', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'E-NGAS Recorded', 'user' => 'Admin', 'date' => '2025-06-28'],
                ]
            ],
            [
                'status' => 'for_lddap',
                'payee' => 'Construction Materials Ltd',
                'dv_number' => '2025-06-00006',
                'amount' => 150000.00,
                'net_amount' => 148000.00,
                'indexing_date' => '2025-06-28',
                'indexed_by' => 'Admin',
                'payment_method' => 'lddap',
                'lddap_number' => 'LDDAP-2025-002',
                'payment_method_date' => '2025-06-28',
                'payment_method_set_by' => 'Admin',
                'engas_number' => 'ENG-2025-002',
                'engas_date' => '2025-06-28',
                'engas_recorded_by' => 'Admin',
                'cdj_date' => '2025-06-28',
                'cdj_type' => 'ada',
                'cdj_recorded_by' => 'Admin',
                'transaction_history' => [
                    ['action' => 'Received', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'Review Done', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'Cash Allocation', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'Box C Certified', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'Returned from approval', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'Indexed', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'Payment method set: Lddap', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'E-NGAS Recorded', 'user' => 'Admin', 'date' => '2025-06-28'],
                    ['action' => 'CDJ Recorded', 'user' => 'Admin', 'date' => '2025-06-28'],
                ]
            ]
        ];

        foreach ($stages as $stage) {
            $dv = IncomingDv::create([
                'transaction_type' => 'Professional/General/Job Order Services',
                'implementing_unit' => 'AMAD',
                'dv_number' => $stage['dv_number'],
                'payee' => $stage['payee'],
                'account_number' => '1234567890',
                'amount' => $stage['amount'],
                'particulars' => 'Test DV for ' . $stage['status'] . ' workflow stage',
                'status' => $stage['status'],
                'net_amount' => $stage['net_amount'] ?? null,
                'cash_allocation_date' => isset($stage['net_amount']) ? '2025-06-28' : null,
                'cash_allocation_number' => isset($stage['net_amount']) ? 'CA-2025-' . substr($stage['dv_number'], -3) : null,
                'allocated_by' => isset($stage['net_amount']) ? 'Admin' : null,
                'transaction_history' => $stage['transaction_history'],
                'indexing_date' => $stage['indexing_date'] ?? null,
                'indexed_by' => $stage['indexed_by'] ?? null,
                'payment_method' => $stage['payment_method'] ?? null,
                'lddap_number' => $stage['lddap_number'] ?? null,
                'payment_method_date' => $stage['payment_method_date'] ?? null,
                'payment_method_set_by' => $stage['payment_method_set_by'] ?? null,
                'pr_out_date' => $stage['pr_out_date'] ?? null,
                'pr_out_by' => $stage['pr_out_by'] ?? null,
                'engas_number' => $stage['engas_number'] ?? null,
                'engas_date' => $stage['engas_date'] ?? null,
                'engas_recorded_by' => $stage['engas_recorded_by'] ?? null,
                'cdj_date' => $stage['cdj_date'] ?? null,
                'cdj_type' => $stage['cdj_type'] ?? null,
                'cdj_recorded_by' => $stage['cdj_recorded_by'] ?? null,
            ]);

            $this->info("Created DV {$dv->dv_number} for {$stage['status']} stage");
        }

        $this->info('Test DVs created successfully!');
        $this->info('You can now test each workflow stage:');
        $this->info('• For Indexing - Click on DV to enter indexing date');
        $this->info('• For Mode of Payment - Select payment method (Check/LDDAP/Payroll)');
        $this->info('• Out to Cashiering - Use "In" button when DV returns');
        $this->info('• For E-NGAS Recording - Enter E-NGAS number');
        $this->info('• For CDJ Recording - Select journal type and date');
        $this->info('• For LDDAP Certification - Click "Certified" to complete');
    }
}
