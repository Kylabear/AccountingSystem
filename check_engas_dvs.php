<?php

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

echo "DVs in for_engas status:\n";
$engasDvs = App\Models\IncomingDv::where('status', 'for_engas')->get();
foreach ($engasDvs as $dv) {
    echo "ID: {$dv->id} | DV: {$dv->dv_number} | Payee: {$dv->payee}\n";
}
if ($engasDvs->count() === 0) {
    echo "No DVs found in for_engas status.\n";
}
