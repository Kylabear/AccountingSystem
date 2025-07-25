<?php

require_once __DIR__ . '/bootstrap/app.php';

use App\Models\IncomingDv;

$dv = IncomingDv::create([
    'transaction_type' => 'Purchase Request',
    'implementing_unit' => 'Test Unit',
    'dv_number' => 'TEST-DV-001',
    'payee' => 'Test Reallocation Payee',
    'account_number' => '12345',
    'amount' => 50000.00,
    'particulars' => 'Test DV for reallocation testing',
    'status' => 'processed',
    'cash_allocation_date' => '2025-01-15',
    'cash_allocation_number' => 'CA-TEST-001',
    'net_amount' => 48000.00,
    'allocated_by' => 'Test Allocator',
    'approval_out_date' => '2025-01-16',
    'approval_in_date' => '2025-01-17',
    'approved_by' => 'Test Approver',
    'indexing_date' => '2025-01-18',
    'indexed_by' => 'Test Indexer',
    'payment_method' => 'lddap',
    'payment_method_date' => '2025-01-19',
    'lddap_number' => 'LDDAP-001',
    'lddap_certified_date' => '2025-01-20',
    'lddap_certified_by' => 'Test LDDAP Officer',
    'processed_date' => '2025-01-21'
]);

echo "Test DV created with ID: " . $dv->id . "\n";
echo "DV Number: " . $dv->dv_number . "\n";
echo "Status: " . $dv->status . "\n";
echo "Payee: " . $dv->payee . "\n";
