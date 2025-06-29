<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\IncomingDv;

class TestApprovalWorkflow extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:approval-workflow';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create test data for approval workflow testing';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Setting up approval workflow test data...');
        
        // Create some DVs in for_approval status
        $dvData = [
            [
                'transaction_type' => 'Professional/General/Job Order Services',
                'implementing_unit' => 'AMAD',
                'dv_number' => '2025-06-12345',
                'payee' => 'John Doe Consulting',
                'account_number' => 'ACC-001-2025',
                'amount' => 15000.00,
                'particulars' => 'Professional services for system development',
                'status' => 'for_approval',
            ],
            [
                'transaction_type' => 'Equipment/Machinery/Motor Vehicles/Furniture and Fixtures',
                'implementing_unit' => 'AFD',
                'dv_number' => '2025-06-12346',
                'payee' => 'Office Supply Co.',
                'account_number' => 'ACC-002-2025',
                'amount' => 8500.00,
                'particulars' => 'Purchase of office equipment and furniture',
                'status' => 'for_approval',
            ],
            [
                'transaction_type' => 'Communication (Telephone/Internet)',
                'implementing_unit' => 'PMED',
                'dv_number' => '2025-06-12347',
                'payee' => 'TeleCom Services Inc.',
                'account_number' => 'ACC-003-2025',
                'amount' => 3200.00,
                'particulars' => 'Monthly internet and telephone services',
                'status' => 'for_approval',
                'approval_out' => true,
                'approval_out_date' => now()->subDays(2),
            ],
        ];
        
        foreach ($dvData as $data) {
            $dv = IncomingDv::create($data);
            $this->info("Created DV: {$dv->dv_number} - {$dv->payee}");
        }
        
        $this->info('Approval workflow test data created successfully!');
        $this->info('You now have:');
        $this->info('- 2 DVs ready for "Out" action');
        $this->info('- 1 DV ready for "In" action (already sent out)');
        
        return 0;
    }
}
