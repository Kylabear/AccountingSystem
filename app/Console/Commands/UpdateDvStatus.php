<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\IncomingDv;

class UpdateDvStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'dvs:update-status {id} {status}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update a DV status for testing';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $id = $this->argument('id');
        $status = $this->argument('status');
        
        $dv = IncomingDv::find($id);
        
        if (!$dv) {
            $this->error("DV with ID {$id} not found.");
            return 1;
        }
        
        $oldStatus = $dv->status;
        $dv->update(['status' => $status]);
        
        $this->info("Updated DV {$id} ({$dv->dv_number}) from '{$oldStatus}' to '{$status}'");
        
        return 0;
    }
}
