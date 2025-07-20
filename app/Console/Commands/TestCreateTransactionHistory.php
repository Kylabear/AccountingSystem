<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\IncomingDv;
use App\Services\DvTransactionHistoryService;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class TestCreateTransactionHistory extends Command
{
    protected $signature = 'test:create-transaction-history';
    protected $description = 'Test creating transaction history entries';

    public function handle()
    {
        $this->info('Testing Transaction History Creation');
        $this->info('==================================');
        $this->newLine();

        // Get first DV and user
        $dv = IncomingDv::first();
        $user = User::first();
        
        if (!$dv || !$user) {
            $this->error('❌ Need at least one DV and one user in database');
            return 1;
        }
        
        $this->info('✅ Found DV: ' . $dv->dv_number);
        $this->info('✅ Found User: ' . $user->name);
        $this->newLine();
        
        // Set auth user for the service
        Auth::login($user);
        
        // Test the service
        $service = new DvTransactionHistoryService();
        
        try {
            // Create a test transaction history entry
            $history = $service->recordDvReceived($dv, $user->name);
            
            $this->info('✅ Created transaction history entry:');
            $this->info('ID: ' . $history->id);
            $this->info('Action: ' . $history->action_type);
            $this->info('Description: ' . $history->action_description);
            $this->info('Performed by: ' . $history->performed_by);
            $this->info('Created at: ' . $history->created_at);
            $this->newLine();
            
            // Test formatted output
            $formattedHistories = $dv->fresh()->formatted_transaction_history;
            $this->info('Formatted transaction histories count: ' . count($formattedHistories ?? []));
            
            if (!empty($formattedHistories)) {
                $this->info('Latest entry: ' . json_encode($formattedHistories[0]));
            }
            
            $this->info('✅ Transaction history system is fully functional!');
            
        } catch (\Exception $e) {
            $this->error('❌ Error creating transaction history: ' . $e->getMessage());
            return 1;
        }
        
        return 0;
    }
}
