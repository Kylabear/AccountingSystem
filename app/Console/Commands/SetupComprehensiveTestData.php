<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\IncomingDv;
use App\Models\OrsEntry;

class SetupComprehensiveTestData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:comprehensive-data';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create comprehensive test data with complete workflow information';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Setting up comprehensive test data...');
        
        // Create a DV that has gone through complete workflow
        $dv = IncomingDv::create([
            'transaction_type' => 'Communication (Telephone/Internet)',
            'implementing_unit' => 'AMAD',
            'dv_number' => '2025-06-99999',
            'payee' => 'PLDT Inc.',
            'account_number' => 'ACC-PLDT-2025',
            'amount' => 2564.00,
            'particulars' => 'payment of tel. bill (number) with account number (account number)',
            'status' => 'for_approval',
            'cash_allocation_date' => '2025-06-27',
            'cash_allocation_number' => '25-02-00116',
            'net_amount' => 2604.00,
            'allocated_by' => 'Juan Dela Cruz',
            'rts_history' => [
                [
                    'date' => '2025-02-23',
                    'reason' => 'for obligation',
                    'returned_date' => '2025-03-01',
                    'reviewed_by' => 'Maria Santos',
                    'staff_in_charge' => 'Pedro Garcia',
                    'review_date' => '2025-03-18',
                    'origin' => 'review'
                ]
            ],
            'transaction_history' => [
                [
                    'action' => 'Received',
                    'user' => 'System',
                    'date' => '2025-02-17',
                    'details' => []
                ],
                [
                    'action' => 'Initial review done',
                    'user' => 'Maria Santos',
                    'date' => '2025-02-20',
                    'details' => []
                ],
                [
                    'action' => 'RTS',
                    'user' => 'Maria Santos',
                    'date' => '2025-02-23',
                    'details' => ['rts_reason' => 'for obligation']
                ],
                [
                    'action' => 'Return after RTS',
                    'user' => 'System',
                    'date' => '2025-03-01',
                    'details' => []
                ],
                [
                    'action' => 'Review completed',
                    'user' => 'Maria Santos',
                    'date' => '2025-03-18',
                    'details' => []
                ],
                [
                    'action' => 'Cash allocation completed',
                    'user' => 'Juan Dela Cruz',
                    'date' => '2025-06-27',
                    'details' => [
                        'cash_allocation_number' => '25-02-00116',
                        'net_amount' => 2604.00
                    ]
                ],
                [
                    'action' => 'Box C certification completed',
                    'user' => 'Ana Rodriguez',
                    'date' => '2025-06-27',
                    'details' => []
                ]
            ]
        ]);
        
        // Create ORS entries for this DV
        OrsEntry::create([
            'incoming_dv_id' => $dv->id,
            'ors_number' => '02-01101101-2024-04-002261',
            'fund_source' => 'GASS-GMS',
            'uacs' => '50202010-02'
        ]);
        
        OrsEntry::create([
            'incoming_dv_id' => $dv->id,
            'ors_number' => '02-01101101-2024-04-002262',
            'fund_source' => 'STO ICTMS',
            'uacs' => '50213990-99'
        ]);
        
        $this->info("Created comprehensive DV: {$dv->dv_number} - {$dv->payee}");
        $this->info('The DV includes:');
        $this->info('- Complete workflow history from Received to For Approval');
        $this->info('- RTS cycle with detailed information');
        $this->info('- Cash allocation details');
        $this->info('- ORS entries with Fund Source and UACS');
        $this->info('- Box C certification information');
        
        return 0;
    }
}
