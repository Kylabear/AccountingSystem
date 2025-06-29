<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\IncomingDv;
use App\Models\PredefinedOption;

echo "=== DV Analytics Test ===" . PHP_EOL;

// Check total DVs
$totalDvs = IncomingDv::count();
echo "Total DVs: $totalDvs" . PHP_EOL;

// Check fund sources
$fundSources = IncomingDv::distinct()->pluck('fund_source')->filter()->toArray();
echo "Fund Sources in DVs: " . implode(', ', $fundSources) . PHP_EOL;

// Check transaction types
$transactionTypes = IncomingDv::distinct()->pluck('transaction_type')->filter()->toArray();
echo "Transaction Types in DVs: " . implode(', ', $transactionTypes) . PHP_EOL;

// Check implementing units
$implementingUnits = IncomingDv::distinct()->pluck('implementing_unit')->filter()->toArray();
echo "Implementing Units in DVs: " . implode(', ', $implementingUnits) . PHP_EOL;

// Check predefined options
$predefinedCount = PredefinedOption::count();
echo "Predefined Options: $predefinedCount" . PHP_EOL;

// Check statuses
$statuses = IncomingDv::distinct()->pluck('status')->filter()->toArray();
echo "Statuses: " . implode(', ', $statuses) . PHP_EOL;

echo "=== End Test ===" . PHP_EOL;
