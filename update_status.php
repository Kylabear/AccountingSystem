<?php

require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->boot();

use App\Models\IncomingDv;

echo "Current DVs status:\n";
IncomingDv::select('id', 'dv_number', 'status')->get()->each(function($dv) {
    echo "{$dv->id}: {$dv->dv_number} - {$dv->status}\n";
});

// Update first DV to for_cash_allocation status
$dv = IncomingDv::find(1);
if ($dv) {
    $dv->update(['status' => 'for_cash_allocation']);
    echo "\nUpdated DV {$dv->id} ({$dv->dv_number}) to for_cash_allocation status.\n";
} else {
    echo "\nNo DV found with ID 1.\n";
}
