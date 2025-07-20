<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\IncomingDv;

class CheckTransactionHistories extends Command
{
    protected $signature = 'check:transaction-histories {dv_number?}';
    protected $description = 'Check transaction histories for DVs';

    public function handle()
    {
        $dvNumber = $this->argument('dv_number');
        
        if ($dvNumber) {
            $dv = IncomingDv::where('dv_number', $dvNumber)->with('transactionHistories')->first();
            if (!$dv) {
                $this->error("DV {$dvNumber} not found");
                return 1;
            }
            $dvs = collect([$dv]);
        } else {
            $dvs = IncomingDv::with('transactionHistories')->get();
        }

        foreach ($dvs as $dv) {
            $this->info("DV: {$dv->dv_number} (Status: {$dv->status})");
            $this->info("Transaction Histories: {$dv->transactionHistories->count()}");
            
            foreach ($dv->transactionHistories()->orderBy('created_at')->get() as $history) {
                $this->line("  - {$history->action_description} ({$history->created_at->format('Y-m-d H:i')}) by {$history->performed_by}");
            }
            
            $this->newLine();
        }
    }
}
