<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\IncomingDv;

class TestRtsNorsaWorkflow extends Command
{
    protected $signature = 'test:rts-norsa-workflow';
    protected $description = 'Test RTS/NORSA workflow by creating sample DVs in different states';

    public function handle()
    {
        $this->info('Creating test DVs for RTS/NORSA workflow...');

        // Create DV in for_rts_in status with review origin
        $dvRtsReview = IncomingDv::create([
            'transaction_type' => 'Professional/General/Job Order Services',
            'implementing_unit' => 'RAED',
            'dv_number' => '2025-06-11111',
            'payee' => 'Sample RTS from Review',
            'account_number' => '1234567890',
            'amount' => 15000.00,
            'particulars' => 'Testing RTS cycle from For Review status',
            'status' => 'for_rts_in',
            'rts_origin' => 'review',
            'rts_history' => [
                [
                    'date' => '2025-06-27',
                    'reason' => 'Missing required documents',
                    'returned_date' => null
                ]
            ],
            'rts_cycle_count' => 1,
            'last_rts_date' => '2025-06-27',
            'transaction_history' => [
                [
                    'action' => 'DV Received',
                    'user' => 'System Test',
                    'date' => '2025-06-27',
                    'details' => ['status' => 'for_review']
                ],
                [
                    'action' => 'RTS (Return to Sender)',
                    'user' => 'Test User',
                    'date' => '2025-06-27',
                    'details' => ['status' => 'for_rts_in', 'rts_reason' => 'Missing required documents', 'rts_count' => 1]
                ]
            ]
        ]);

        // Create DV in for_norsa_in status with review origin
        $dvNorsaReview = IncomingDv::create([
            'transaction_type' => 'Communication (Telephone/Internet)',
            'implementing_unit' => 'SAAD',
            'dv_number' => '2025-06-22222',
            'payee' => 'Sample NORSA from Review',
            'account_number' => '9876543210',
            'amount' => 8500.00,
            'particulars' => 'Testing NORSA cycle from For Review status',
            'status' => 'for_norsa_in',
            'norsa_origin' => 'review',
            'norsa_history' => [
                [
                    'date' => '2025-06-27',
                    'number' => 'NORSA-2025-001',
                    'returned_date' => null
                ]
            ],
            'norsa_cycle_count' => 1,
            'last_norsa_date' => '2025-06-27',
            'transaction_history' => [
                [
                    'action' => 'DV Received',
                    'user' => 'System Test',
                    'date' => '2025-06-27',
                    'details' => ['status' => 'for_review']
                ],
                [
                    'action' => 'NORSA Submission',
                    'user' => 'Test User',
                    'date' => '2025-06-27',
                    'details' => ['status' => 'for_norsa_in', 'norsa_number' => 'NORSA-2025-001', 'norsa_count' => 1]
                ]
            ]
        ]);

        // Create DV in for_rts_in status with box_c origin  
        $dvRtsBoxC = IncomingDv::create([
            'transaction_type' => 'Supplies (office and other supplies)',
            'implementing_unit' => 'REGULATORY',
            'dv_number' => '2025-06-33333',
            'payee' => 'Sample RTS from Box C',
            'account_number' => '5555666677',
            'amount' => 25000.00,
            'particulars' => 'Testing RTS cycle from For Box C status',
            'status' => 'for_rts_in',
            'rts_origin' => 'box_c',
            'cash_allocation_date' => '2025-06-26',
            'cash_allocation_number' => '2025-06-33333',
            'net_amount' => 24500.00,
            'rts_history' => [
                [
                    'date' => '2025-06-27',
                    'reason' => 'Incorrect certification',
                    'returned_date' => null
                ]
            ],
            'rts_cycle_count' => 1,
            'last_rts_date' => '2025-06-27',
            'transaction_history' => [
                [
                    'action' => 'DV Received',
                    'user' => 'System Test',
                    'date' => '2025-06-26',
                    'details' => ['status' => 'for_review']
                ],
                [
                    'action' => 'Cash Allocation',
                    'user' => 'Test User',
                    'date' => '2025-06-26',
                    'details' => ['status' => 'for_box_c', 'cash_allocation_number' => '2025-06-33333', 'net_amount' => 24500.00]
                ],
                [
                    'action' => 'RTS (Return to Sender)',
                    'user' => 'Test User',
                    'date' => '2025-06-27',
                    'details' => ['status' => 'for_rts_in', 'rts_reason' => 'Incorrect certification', 'rts_count' => 1]
                ]
            ]
        ]);

        // Create DV in for_norsa_in status with box_c origin
        $dvNorsaBoxC = IncomingDv::create([
            'transaction_type' => 'Equipment/Machinery/Motor Vehicles/Furniture and Fixtures',
            'implementing_unit' => 'RESEARCH',
            'dv_number' => '2025-06-44444',
            'payee' => 'Sample NORSA from Box C',
            'account_number' => '7777888899',
            'amount' => 120000.00,
            'particulars' => 'Testing NORSA cycle from For Box C status',
            'status' => 'for_norsa_in',
            'norsa_origin' => 'box_c',
            'cash_allocation_date' => '2025-06-26',
            'cash_allocation_number' => '2025-06-44444',
            'net_amount' => 118000.00,
            'norsa_history' => [
                [
                    'date' => '2025-06-27',
                    'number' => 'NORSA-2025-002',
                    'returned_date' => null
                ]
            ],
            'norsa_cycle_count' => 1,
            'last_norsa_date' => '2025-06-27',
            'transaction_history' => [
                [
                    'action' => 'DV Received',
                    'user' => 'System Test',
                    'date' => '2025-06-26',
                    'details' => ['status' => 'for_review']
                ],
                [
                    'action' => 'Cash Allocation',
                    'user' => 'Test User',
                    'date' => '2025-06-26',
                    'details' => ['status' => 'for_box_c', 'cash_allocation_number' => '2025-06-44444', 'net_amount' => 118000.00]
                ],
                [
                    'action' => 'NORSA Submission',
                    'user' => 'Test User',
                    'date' => '2025-06-27',
                    'details' => ['status' => 'for_norsa_in', 'norsa_number' => 'NORSA-2025-002', 'norsa_count' => 1]
                ]
            ]
        ]);

        $this->info('Test DVs created successfully!');
        $this->info("RTS from Review: ID {$dvRtsReview->id}");
        $this->info("NORSA from Review: ID {$dvNorsaReview->id}");
        $this->info("RTS from Box C: ID {$dvRtsBoxC->id}");
        $this->info("NORSA from Box C: ID {$dvNorsaBoxC->id}");
        $this->info('');
        $this->info('These should appear in:');
        $this->info('- For Review tab: RTS from Review, NORSA from Review');
        $this->info('- For Box C tab: RTS from Box C, NORSA from Box C');
        $this->info('- With proper cycle indicators on the DV cards');

        return 0;
    }
}
