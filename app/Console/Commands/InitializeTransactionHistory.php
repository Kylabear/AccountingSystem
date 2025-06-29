<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\IncomingDv;

class InitializeTransactionHistory extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'dvs:init-history';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Initialize transaction history for existing DVs';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Initializing transaction history for existing DVs...');
        
        $dvs = IncomingDv::whereNull('transaction_history')
            ->orWhere('transaction_history', '[]')
            ->orWhere('transaction_history', '')
            ->get();
        
        $this->info("Found {$dvs->count()} DVs without transaction history.");
        
        $progressBar = $this->output->createProgressBar($dvs->count());
        
        foreach ($dvs as $dv) {
            $transactionHistory = [];
            
            // Add initial receipt entry
            $transactionHistory[] = [
                'action' => 'DV Received',
                'user' => 'System',
                'date' => $dv->created_at->toDateString(),
                'details' => [
                    'initial_status' => 'for_review',
                    'amount' => $dv->amount,
                ]
            ];
            
            // Add cash allocation if exists
            if ($dv->cash_allocation_date) {
                $transactionHistory[] = [
                    'action' => 'Cash Allocation',
                    'user' => $dv->allocated_by ?? 'Unknown User',
                    'date' => $dv->cash_allocation_date->toDateString(),
                    'details' => [
                        'cash_allocation_number' => $dv->cash_allocation_number,
                        'net_amount' => $dv->net_amount,
                        'original_amount' => $dv->amount,
                    ]
                ];
            }
            
            // Add RTS entries if any
            if ($dv->rts_history) {
                foreach ($dv->rts_history as $rts) {
                    $transactionHistory[] = [
                        'action' => 'RTS (Return to Sender)',
                        'user' => 'System',
                        'date' => $rts['date'],
                        'details' => [
                            'rts_reason' => $rts['reason'],
                        ]
                    ];
                    
                    if (isset($rts['returned_date']) && $rts['returned_date']) {
                        $transactionHistory[] = [
                            'action' => 'Returned from RTS',
                            'user' => 'System',
                            'date' => $rts['returned_date'],
                            'details' => []
                        ];
                    }
                }
            }
            
            // Add NORSA entries if any
            if ($dv->norsa_history) {
                foreach ($dv->norsa_history as $norsa) {
                    $transactionHistory[] = [
                        'action' => 'NORSA Submission',
                        'user' => 'System',
                        'date' => $norsa['date'],
                        'details' => [
                            'norsa_number' => $norsa['number'],
                        ]
                    ];
                    
                    if (isset($norsa['returned_date']) && $norsa['returned_date']) {
                        $transactionHistory[] = [
                            'action' => 'Returned from NORSA',
                            'user' => 'System',
                            'date' => $norsa['returned_date'],
                            'details' => []
                        ];
                    }
                }
            }
            
            // Sort by date
            usort($transactionHistory, function($a, $b) {
                return strcmp($a['date'], $b['date']);
            });
            
            $dv->update(['transaction_history' => $transactionHistory]);
            $progressBar->advance();
        }
        
        $progressBar->finish();
        $this->newLine();
        $this->info("Transaction history initialized for {$dvs->count()} DVs.");
        
        return 0;
    }
}
