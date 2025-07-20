<?php

require_once 'bootstrap/app.php';

use App\Models\IncomingDv;
use App\Services\DvTransactionHistoryService;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

// Boot Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    echo "Testing Transaction History System\n";
    echo "==================================\n\n";

    // Get first DV
    $dv = IncomingDv::with('transactionHistories')->first();
    
    if (!$dv) {
        echo "❌ No DVs found in database\n";
        exit(1);
    }
    
    echo "✅ Found DV: " . $dv->dv_number . "\n";
    echo "Current status: " . $dv->status . "\n\n";
    
    // Check transaction histories
    $historiesCount = $dv->transactionHistories()->count();
    echo "Database transaction histories count: " . $historiesCount . "\n";
    
    // Test formatted transaction history
    $formattedHistories = $dv->formatted_transaction_history;
    echo "Formatted transaction histories count: " . count($formattedHistories ?? []) . "\n\n";
    
    if (!empty($formattedHistories)) {
        echo "Recent Transaction History:\n";
        echo "-------------------------\n";
        
        // Show last 3 entries
        $recent = array_slice($formattedHistories, -3);
        foreach ($recent as $entry) {
            echo "• " . $entry['action'] . " - " . $entry['date'] . " by " . $entry['user'] . "\n";
        }
        echo "\n";
    }
    
    // Test service availability
    $service = new DvTransactionHistoryService();
    echo "✅ DvTransactionHistoryService instantiated successfully\n";
    
    // Check if we have any transaction histories at all
    $totalHistories = \App\Models\DvTransactionHistory::count();
    echo "Total transaction histories in database: " . $totalHistories . "\n";
    
    if ($totalHistories > 0) {
        echo "✅ Transaction history system is working!\n";
    } else {
        echo "⚠️  No transaction histories found - system is ready but no data yet\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
