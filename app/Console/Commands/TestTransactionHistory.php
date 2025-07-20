<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\IncomingDv;
use App\Services\DvTransactionHistoryService;
use App\Models\DvTransactionHistory;

class TestTransactionHistory extends Command
{
    protected $signature = 'test:transaction-history';
    protected $description = 'Test the transaction history system';

    public function handle()
    {
        $this->info('Testing Transaction History System');
        $this->info('==================================');
        $this->newLine();

        // Get first DV
        $dv = IncomingDv::with('transactionHistories')->first();
        
        if (!$dv) {
            $this->error('❌ No DVs found in database');
            return 1;
        }
        
        $this->info('✅ Found DV: ' . $dv->dv_number);
        $this->info('Current status: ' . $dv->status);
        $this->newLine();
        
        // Check transaction histories
        $historiesCount = $dv->transactionHistories()->count();
        $this->info('Database transaction histories count: ' . $historiesCount);
        
        // Test formatted transaction history
        $formattedHistories = $dv->formatted_transaction_history;
        $this->info('Formatted transaction histories count: ' . count($formattedHistories ?? []));
        $this->newLine();
        
        if (!empty($formattedHistories)) {
            $this->info('Recent Transaction History:');
            $this->info('-------------------------');
            
            // Show last 3 entries
            $recent = array_slice($formattedHistories, -3);
            foreach ($recent as $entry) {
                $this->info('• ' . $entry['action'] . ' - ' . $entry['date'] . ' by ' . $entry['user']);
            }
            $this->newLine();
        }
        
        // Test service availability
        $service = new DvTransactionHistoryService();
        $this->info('✅ DvTransactionHistoryService instantiated successfully');
        
        // Check if we have any transaction histories at all
        $totalHistories = DvTransactionHistory::count();
        $this->info('Total transaction histories in database: ' . $totalHistories);
        
        if ($totalHistories > 0) {
            $this->info('✅ Transaction history system is working!');
        } else {
            $this->warn('⚠️  No transaction histories found - system is ready but no data yet');
        }
        
        return 0;
    }
}
