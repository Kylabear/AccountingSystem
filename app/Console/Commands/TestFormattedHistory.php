<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\IncomingDv;

class TestFormattedHistory extends Command
{
    protected $signature = 'test:formatted-history {dv_number}';
    protected $description = 'Test formatted transaction history output for frontend';

    public function handle()
    {
        $dvNumber = $this->argument('dv_number');
        $dv = IncomingDv::where('dv_number', $dvNumber)->first();
        
        if (!$dv) {
            $this->error("DV {$dvNumber} not found");
            return 1;
        }

        $this->info("Testing Formatted Transaction History for DV: {$dv->dv_number}");
        $this->info("=======================================================");

        $formattedHistory = $dv->formatted_transaction_history;
        
        $this->info("Count: " . count($formattedHistory));
        $this->newLine();

        foreach ($formattedHistory as $index => $entry) {
            $entryNum = $index + 1;
            $this->info("Entry #{$entryNum}:");
            $this->line("  Type: {$entry['type']}");
            $this->line("  Action: {$entry['action']}");
            $this->line("  Date: {$entry['date']}");
            $this->line("  User: {$entry['user']}");
            $this->line("  Status: {$entry['status_before']} → {$entry['status_after']}");
            
            if (!empty($entry['details'])) {
                $this->line("  Details: " . json_encode($entry['details']));
            }
            
            $this->newLine();
        }
    }
}
