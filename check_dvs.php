<?php

use App\Models\IncomingDv;

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

echo "All DVs with dates:\n";
echo "===================\n";

$dvs = IncomingDv::orderBy('id')->get();
foreach ($dvs as $dv) {
    echo "ID: {$dv->id} | DV: {$dv->dv_number} | Status: {$dv->status}\n";
    echo "  Created: {$dv->created_at}\n";
    echo "  Updated: {$dv->updated_at}\n";
    if ($dv->cash_allocation_date) echo "  Cash Alloc: {$dv->cash_allocation_date}\n";
    if ($dv->approval_out_date) echo "  Approval Out: {$dv->approval_out_date}\n";
    if ($dv->box_c_date) echo "  Box C: {$dv->box_c_date}\n";
    echo "---\n";
}
