<?php

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

echo "DVs in for_cdj status:\n";
$cdjDvs = App\Models\IncomingDv::where('status', 'for_cdj')->get();
foreach ($cdjDvs as $dv) {
    echo "ID: {$dv->id} | DV: {$dv->dv_number} | Payee: {$dv->payee}\n";
}
if ($cdjDvs->count() === 0) {
    echo "No DVs found in for_cdj status.\n";
}
