<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\IncomingDv;
use App\Models\OrsEntry;
use App\Models\PredefinedOption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class IncomingDvController extends Controller
{
    //
    public function index()
    {
        // First, ensure all DVs have transaction history
        $this->ensureTransactionHistory();
        
        $dvs = IncomingDv::with('orsEntries')->latest()->get();

        return Inertia::render('IncomingDvs', [
            'dvs' => $dvs,
            'auth' => [
                'user' => \Illuminate\Support\Facades\Auth::user()
            ]
        ]);
    }
    
    /**
     * Ensure all DVs have transaction history initialized
     */
    private function ensureTransactionHistory()
    {
        $dvs = IncomingDv::whereNull('transaction_history')
                        ->orWhere('transaction_history', '[]')
                        ->orWhere('transaction_history', '{}')
                        ->get();
        
        foreach ($dvs as $dv) {
            $this->initializeDvTransactionHistory($dv);
        }
    }
      /**
     * Initialize transaction history for a single DV
     */
    private function initializeDvTransactionHistory($dv)
    {
        $transactionHistory = [];
        
        // Add initial receipt entry (oldest)
        $transactionHistory[] = [
            'action' => 'DV Received',
            'user' => 'System',
            'date' => $dv->created_at->toDateString(),
            'details' => [
                'initial_status' => 'for_review',
                'amount' => $dv->amount,
                'dv_number' => $dv->dv_number,
            ]
        ];
        
        // Add cash allocation if exists (chronologically after receipt)
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
        
        // Add approval entries if they exist
        if ($dv->approval_out_date) {
            $transactionHistory[] = [
                'action' => 'Sent out for approval',
                'user' => 'System',
                'date' => $dv->approval_out_date->toDateString(),
                'details' => []
            ];
        }
        
        if ($dv->approval_in_date) {
            $transactionHistory[] = [
                'action' => 'Returned from approval',
                'user' => $dv->approved_by ?? 'System',
                'date' => $dv->approval_in_date->toDateString(),
                'details' => []
            ];
        }
        
        // Add indexing if exists
        if ($dv->indexing_date) {
            $transactionHistory[] = [
                'action' => 'Indexed',
                'user' => $dv->indexed_by ?? 'System',
                'date' => $dv->indexing_date->toDateString(),
                'details' => []
            ];
        }
        
        // Add payment method if set
        if ($dv->payment_method && $dv->payment_method_date) {
            $transactionHistory[] = [
                'action' => 'Payment method set: ' . ucfirst($dv->payment_method),
                'user' => $dv->payment_method_set_by ?? 'System',
                'date' => $dv->payment_method_date->toDateString(),
                'details' => [
                    'payment_method' => $dv->payment_method,
                    'lddap_number' => $dv->lddap_number ?? null,
                ]
            ];
        }
        
        // Add payroll entries if applicable
        if ($dv->pr_out_date) {
            $transactionHistory[] = [
                'action' => 'Sent to Cashiering (Payroll)',
                'user' => $dv->pr_out_by ?? 'System',
                'date' => $dv->pr_out_date->toDateString(),
                'details' => []
            ];
        }
        
        if ($dv->pr_in_date) {
            $transactionHistory[] = [
                'action' => 'Returned from Cashiering',
                'user' => $dv->pr_in_by ?? 'System',
                'date' => $dv->pr_in_date->toDateString(),
                'details' => []
            ];
        }
        
        // Add E-NGAS if recorded
        if ($dv->engas_number && $dv->engas_date) {
            $transactionHistory[] = [
                'action' => 'E-NGAS Recorded',
                'user' => $dv->engas_recorded_by ?? 'System',
                'date' => $dv->engas_date->toDateString(),
                'details' => ['engas_number' => $dv->engas_number]
            ];
        }
        
        // Add CDJ if recorded
        if ($dv->cdj_date) {
            $transactionHistory[] = [
                'action' => 'CDJ Recorded',
                'user' => $dv->cdj_recorded_by ?? 'System',
                'date' => $dv->cdj_date->toDateString(),
                'details' => []
            ];
        }
        
        // Add LDDAP certification if done
        if ($dv->lddap_certified_date) {
            $transactionHistory[] = [
                'action' => 'LDDAP Certified',
                'user' => $dv->lddap_certified_by ?? 'System',
                'date' => $dv->lddap_certified_date->toDateString(),
                'details' => []
            ];
        }
        
        // Add final processed status if completed
        if ($dv->status === 'processed' && $dv->processed_date) {
            $transactionHistory[] = [
                'action' => 'Processing Complete',
                'user' => $dv->lddap_certified_by ?? 'System',
                'date' => $dv->processed_date->toDateString(),
                'details' => []
            ];
        }
        
        // Sort transaction history by date to ensure chronological order
        usort($transactionHistory, function($a, $b) {
            return strcmp($a['date'], $b['date']);
        });

        $dv->update(['transaction_history' => $transactionHistory]);
    }
    
    public function store(Request $request)
    {
        $validated = Validator::make($request->all(), [
            'transaction_type' => 'required|string|max:255',
            'implementing_unit' => 'nullable|string|max:255',
            'dv_number' => 'required|string|max:255',
            'payee' => 'required|string|max:255',
            'account_number' => 'nullable|string|max:255',
            'amount' => 'required|numeric|min:0',
            'particulars' => 'required|string',
            'ors_entries' => 'array',
            'ors_entries.*.ors_number' => 'nullable|string|max:255',
            'ors_entries.*.fund_source' => 'nullable|string|max:255',
            'ors_entries.*.uacs' => 'nullable|string|max:255',
        ])->validate();

        $dv = IncomingDv::create([
            'transaction_type' => $validated['transaction_type'],
            'implementing_unit' => $validated['implementing_unit'],
            'dv_number' => $validated['dv_number'],
            'payee' => $validated['payee'],
            'account_number' => $validated['account_number'],
            'amount' => $validated['amount'],
            'particulars' => $validated['particulars'],
            'status' => 'for_review', // New DVs start at for_review status
        ]);

        // Auto-add new options to predefined options if they don't exist
        if (!empty($validated['transaction_type'])) {
            PredefinedOption::addOptionIfNotExists(PredefinedOption::TYPE_TRANSACTION_TYPE, $validated['transaction_type']);
        }
        if (!empty($validated['implementing_unit'])) {
            PredefinedOption::addOptionIfNotExists(PredefinedOption::TYPE_IMPLEMENTING_UNIT, $validated['implementing_unit']);
        }

        if (!empty($validated['ors_entries'])) {
            foreach ($validated['ors_entries'] as $entry) {
                if ($entry['ors_number'] || $entry['fund_source'] || $entry['uacs']) {
                    $dv->orsEntries()->create($entry);
                    
                    // Auto-add fund source if provided
                    if (!empty($entry['fund_source'])) {
                        PredefinedOption::addOptionIfNotExists(PredefinedOption::TYPE_FUND_SOURCE, $entry['fund_source']);
                    }
                }
            }
        }

        return redirect()->route('incoming-dvs');
    }

    public function update(Request $request, $id)
    {
        $dv = IncomingDv::findOrFail($id);
        
        $validated = Validator::make($request->all(), [
            'transaction_type' => 'required|string|max:255',
            'implementing_unit' => 'nullable|string|max:255',
            'dv_number' => 'required|string|max:255',
            'payee' => 'required|string|max:255',
            'account_number' => 'nullable|string|max:255',
            'amount' => 'required|numeric|min:0',
            'particulars' => 'required|string',
            'ors_entries' => 'array',
            'ors_entries.*.ors_number' => 'nullable|string|max:255',
            'ors_entries.*.fund_source' => 'nullable|string|max:255',
            'ors_entries.*.uacs' => 'nullable|string|max:255',
        ])->validate();

        // Update DV details (exclude dates as requested)
        $dv->update([
            'transaction_type' => $validated['transaction_type'],
            'implementing_unit' => $validated['implementing_unit'],
            'dv_number' => $validated['dv_number'],
            'payee' => $validated['payee'],
            'account_number' => $validated['account_number'],
            'amount' => $validated['amount'],
            'particulars' => $validated['particulars'],
        ]);

        // Auto-add new options to predefined options if they don't exist
        if (!empty($validated['transaction_type'])) {
            PredefinedOption::addOptionIfNotExists(PredefinedOption::TYPE_TRANSACTION_TYPE, $validated['transaction_type']);
        }
        if (!empty($validated['implementing_unit'])) {
            PredefinedOption::addOptionIfNotExists(PredefinedOption::TYPE_IMPLEMENTING_UNIT, $validated['implementing_unit']);
        }

        // Update ORS entries
        $dv->orsEntries()->delete(); // Remove existing entries
        if (!empty($validated['ors_entries'])) {
            foreach ($validated['ors_entries'] as $entry) {
                if ($entry['ors_number'] || $entry['fund_source'] || $entry['uacs']) {
                    $dv->orsEntries()->create($entry);
                    
                    // Auto-add fund source if provided
                    if (!empty($entry['fund_source'])) {
                        PredefinedOption::addOptionIfNotExists(PredefinedOption::TYPE_FUND_SOURCE, $entry['fund_source']);
                    }
                }
            }
        }

        // Add transaction history entry
        $currentUser = \Illuminate\Support\Facades\Auth::user()->name ?? 'Unknown User';
        $transactionHistory = $dv->transaction_history ?? [];
        $transactionHistory[] = [
            'action' => 'DV Details Updated',
            'user' => $currentUser,
            'timestamp' => now()->toDateTimeString(),
            'details' => 'DV details were modified'
        ];
        $dv->update(['transaction_history' => $transactionHistory]);

        return redirect()->route('incoming-dvs');
    }

    public function updateStatus(Request $request, $id)
    {
        $dv = IncomingDv::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'required|string',
            'rts_out_date' => 'nullable|date',
            'rts_reason' => 'nullable|string',
            'norsa_date' => 'nullable|date',
            'norsa_number' => [
                'nullable',
                'string',
                'regex:/^\d{4}-\d{2}-\d{5}$/',
                function ($attribute, $value, $fail) {
                    if ($value) {
                        $parts = explode('-', $value);
                        if (count($parts) === 3) {
                            $year = (int)$parts[0];
                            $month = (int)$parts[1];
                            if ($year < 2020 || $year > (date('Y') + 1) || $month < 1 || $month > 12) {
                                $fail('The NORSA number has an invalid year or month.');
                            }
                        }
                    }
                }
            ],
            'rts_origin' => 'nullable|string',
            'norsa_origin' => 'nullable|string',
        ]);

        // Get current user
        $currentUser = Auth::user()->name ?? 'Unknown User';

        // Update transaction history
        $transactionHistory = $dv->transaction_history ?? [];
        
        // Determine action description based on status
        $actionMap = [
            'for_review' => 'Review Done',
            'for_cash_allocation' => 'Review Done',
            'for_box_c' => 'Box C Certification',
            'for_approval' => 'Approval Process',
            'for_indexing' => 'Indexing Process',
            'for_payment' => 'Payment Processing',
            'for_engas' => 'E-NGAS Recording',
            'for_cdj' => 'CDJ Recording',
            'for_lddap' => 'LDDAP Certification',
            'processed' => 'Processed',
        ];

        $action = $actionMap[$validated['status']] ?? 'Status Update';

        $transactionHistory[] = [
            'action' => $action,
            'user' => $currentUser,
            'date' => now()->toDateString(),
            'details' => [
                'status' => $validated['status'],
                'rts_reason' => $validated['rts_reason'] ?? null,
                'norsa_number' => $validated['norsa_number'] ?? null,
            ]
        ];

        $dv->update([
            'status' => $validated['status'],
            'rts_out_date' => $validated['rts_out_date'] ?? null,
            'rts_reason' => $validated['rts_reason'] ?? null,
            'norsa_date' => $validated['norsa_date'] ?? null,
            'norsa_number' => $validated['norsa_number'] ?? null,
            'rts_origin' => $validated['rts_origin'] ?? null,
            'norsa_origin' => $validated['norsa_origin'] ?? null,
            'transaction_history' => $transactionHistory,
        ]);

        return response()->json(['success' => true, 'message' => 'DV status updated successfully.']);
    }

    public function updateRtsNorsa(Request $request, $id)
    {
        $dv = IncomingDv::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string',
            'rts_history' => 'nullable|array',
            'norsa_history' => 'nullable|array',
            'rts_cycle_count' => 'nullable|integer',
            'norsa_cycle_count' => 'nullable|integer',
            'last_rts_date' => 'nullable|date',
            'last_norsa_date' => 'nullable|date',
            'rts_origin' => 'nullable|string',
            'norsa_origin' => 'nullable|string',
        ]);

        // Get current user
        $currentUser = Auth::user()->name ?? 'Unknown User';

        // Update transaction history
        $transactionHistory = $dv->transaction_history ?? [];
        
        // Determine action based on status and histories
        $action = 'Status Update';
        $details = ['status' => $validated['status']];

        // Determine origin for new RTS/NORSA cycles
        $updateData = [
            'status' => $validated['status'],
            'rts_history' => $validated['rts_history'] ?? [],
            'norsa_history' => $validated['norsa_history'] ?? [],
            'rts_cycle_count' => $validated['rts_cycle_count'] ?? 0,
            'norsa_cycle_count' => $validated['norsa_cycle_count'] ?? 0,
            'last_rts_date' => $validated['last_rts_date'] ?? null,
            'last_norsa_date' => $validated['last_norsa_date'] ?? null,
            'transaction_history' => [],
        ];

        if ($validated['rts_history'] && count($validated['rts_history']) > count($dv->rts_history ?? [])) {
            $action = 'RTS (Return to Sender)';
            $latestRts = end($validated['rts_history']);
            $details['rts_reason'] = $latestRts['reason'] ?? null;
            $details['rts_count'] = $validated['rts_cycle_count'];
            
            // Set origin when starting new RTS cycle
            if ($validated['status'] === 'for_rts_in') {
                $updateData['rts_origin'] = $validated['rts_origin'] ?? 'review';
            }
        } elseif ($validated['norsa_history'] && count($validated['norsa_history']) > count($dv->norsa_history ?? [])) {
            $action = 'NORSA Submission';
            $latestNorsa = end($validated['norsa_history']);
            $details['norsa_number'] = $latestNorsa['number'] ?? null;
            $details['norsa_count'] = $validated['norsa_cycle_count'];
            
            // Set origin when starting new NORSA cycle
            if ($validated['status'] === 'for_norsa_in') {
                $updateData['norsa_origin'] = $validated['norsa_origin'] ?? 'review';
            }
        } elseif ($validated['status'] === 'for_review') {
            $action = 'Returned from RTS/NORSA';
        } elseif ($validated['status'] === 'for_cash_allocation') {
            $action = 'Review Done';
        }

        $transactionHistory[] = [
            'action' => $action,
            'user' => $currentUser,
            'date' => now()->toDateString(),
            'details' => $details
        ];

        $updateData['transaction_history'] = $transactionHistory;

        $dv->update($updateData);

        return response()->json(['success' => true, 'message' => 'DV RTS/NORSA status updated successfully.']);
    }

    public function updateCashAllocation(Request $request, $id)
    {
        $dv = IncomingDv::findOrFail($id);

        $validated = $request->validate([
            'cash_allocation_date' => 'required|date',
            'cash_allocation_number' => 'required|string|max:255',
            'net_amount' => 'required|numeric|min:0.01',
        ]);

        // Get current user (you might need to adjust this based on your auth system)
        $currentUser = Auth::user()->name ?? 'Unknown User';

        // Update transaction history
        $transactionHistory = $dv->transaction_history ?? [];
        $transactionHistory[] = [
            'action' => 'Cash Allocation',
            'user' => $currentUser,
            'date' => now()->toDateString(),
            'details' => [
                'cash_allocation_number' => $validated['cash_allocation_number'],
                'net_amount' => $validated['net_amount'],
                'original_amount' => $dv->amount,
            ]
        ];

        // For reallocated DVs, add reallocation info to transaction history
        if ($dv->is_reallocated) {
            $transactionHistory[] = [
                'action' => 'Cash Reallocation Completed',
                'user' => $currentUser,
                'date' => now()->toDateString(),
                'details' => [
                    'new_cash_allocation_number' => $validated['cash_allocation_number'],
                    'new_net_amount' => $validated['net_amount'],
                    'original_amount' => $dv->amount,
                    'reallocation_date' => $dv->reallocation_date,
                    'reallocation_reason' => $dv->reallocation_reason
                ]
            ];
        }

        $dv->update([
            'cash_allocation_date' => $validated['cash_allocation_date'],
            'cash_allocation_number' => $validated['cash_allocation_number'],
            'net_amount' => $validated['net_amount'],
            'allocated_by' => $currentUser,
            'transaction_history' => $transactionHistory,
            'status' => 'for_box_c', // Move to next status after cash allocation
            'is_reallocated' => false, // Clear reallocated flag to allow normal workflow progression
        ]);

        return redirect()->back()->with('success', 'Cash allocation completed successfully.');
    }

    public function updateBoxCStatus(Request $request, $id)
    {
        $dv = IncomingDv::findOrFail($id);

        $validated = $request->validate([
            'action' => 'required|string|in:certify,rts,norsa',
            'rts_out_date' => 'nullable|date',
            'rts_reason' => 'nullable|string',
            'norsa_date' => 'nullable|date',
            'norsa_number' => 'nullable|string',
        ]);

        // Get current user
        $currentUser = Auth::user()->name ?? 'Unknown User';

        // Update transaction history
        $transactionHistory = $dv->transaction_history ?? [];

        switch ($validated['action']) {
            case 'certify':
                $transactionHistory[] = [
                    'action' => 'Box C Certified',
                    'user' => $currentUser,
                    'date' => now()->toDateString(),
                    'details' => []
                ];
                
                $dv->update([
                    'status' => 'for_approval',
                    'transaction_history' => $transactionHistory,
                ]);
                break;

            case 'rts':
                $rtsHistory = $dv->rts_history ?? [];
                $rtsHistory[] = [
                    'date' => $validated['rts_out_date'],
                    'reason' => $validated['rts_reason'],
                    'returned_date' => null,
                    'origin' => 'box_c'
                ];

                $transactionHistory[] = [
                    'action' => 'RTS from Box C',
                    'user' => $currentUser,
                    'date' => now()->toDateString(),
                    'details' => [
                        'rts_reason' => $validated['rts_reason'],
                        'origin' => 'box_c'
                    ]
                ];

                $dv->update([
                    'status' => 'for_rts_in',
                    'rts_history' => $rtsHistory,
                    'rts_cycle_count' => ($dv->rts_cycle_count ?? 0) + 1,
                    'last_rts_date' => $validated['rts_out_date'],
                    'rts_origin' => 'box_c',
                    'transaction_history' => $transactionHistory,
                ]);
                break;

            case 'norsa':
                $norsaHistory = $dv->norsa_history ?? [];
                $norsaHistory[] = [
                    'date' => $validated['norsa_date'],
                    'number' => $validated['norsa_number'],
                    'returned_date' => null,
                    'origin' => 'box_c'
                ];

                $transactionHistory[] = [
                    'action' => 'NORSA from Box C',
                    'user' => $currentUser,
                    'date' => now()->toDateString(),
                    'details' => [
                        'norsa_number' => $validated['norsa_number'],
                        'origin' => 'box_c'
                    ]
                ];

                $dv->update([
                    'status' => 'for_norsa_in',
                    'norsa_history' => $norsaHistory,
                    'norsa_cycle_count' => ($dv->norsa_cycle_count ?? 0) + 1,
                    'last_norsa_date' => $validated['norsa_date'],
                    'norsa_origin' => 'box_c',
                    'transaction_history' => $transactionHistory,
                ]);
                break;
        }

        return response()->json(['success' => true, 'message' => 'Box C action completed successfully.']);
    }

    public function initializeTransactionHistory()
    {
        $dvs = IncomingDv::whereNull('transaction_history')
                        ->orWhere('transaction_history', '[]')
                        ->orWhere('transaction_history', '{}')
                        ->get();
        
        $count = 0;
        foreach ($dvs as $dv) {
            $this->initializeDvTransactionHistory($dv);
            $count++;
        }
        
        return response()->json(['message' => "Transaction history initialized for {$count} DVs"]);
    }
    
    public function updateApprovalOut(Request $request, IncomingDv $dv)
    {
        // Validate the request
        $validated = Validator::make($request->all(), [
            'out_date' => 'required|date',
        ])->validate();
        
        // Update the DV status and approval fields
        $updateData = [
            'approval_out' => true,
            'approval_out_date' => $validated['out_date'],
            'approval_in_date' => null, // Clear any previous in date
            'approval_status' => 'out', // Set approval status to 'out'
        ];
        
        // Add to transaction history
        $transactionHistory = $dv->transaction_history ?? [];
        $transactionHistory[] = [
            'action' => 'Sent out for approval',
            'user' => Auth::user()->name ?? 'System',
            'date' => $validated['out_date'],
            'details' => []
        ];
        $updateData['transaction_history'] = $transactionHistory;
        
        $dv->update($updateData);
        
        return response()->json([
            'success' => true,
            'message' => 'DV sent out for approval successfully',
            'dv' => $dv->fresh()
        ]);
    }
    
    public function updateApprovalIn(Request $request, IncomingDv $dv)
    {
        // Validate the request
        $validated = Validator::make($request->all(), [
            'in_date' => 'required|date',
        ])->validate();
        
        // Update the DV status and approval fields
        $updateData = [
            'approval_out' => false,
            'approval_in_date' => $validated['in_date'],
            'approval_status' => 'in', // Set approval status to 'in'
            'status' => 'for_indexing', // Move to next stage
            'approved_by' => Auth::user()->name ?? 'System',
        ];
        
        // Add to transaction history
        $transactionHistory = $dv->transaction_history ?? [];
        $transactionHistory[] = [
            'action' => 'Returned from approval',
            'user' => Auth::user()->name ?? 'System',
            'date' => $validated['in_date'],
            'details' => []
        ];
        $transactionHistory[] = [
            'action' => 'Moved to indexing',
            'user' => Auth::user()->name ?? 'System',
            'date' => $validated['in_date'],
            'details' => []
        ];
        $updateData['transaction_history'] = $transactionHistory;
        
        $dv->update($updateData);
        
        return response()->json([
            'success' => true,
            'message' => 'DV returned from approval and moved to indexing',
            'dv' => $dv->fresh()
        ]);
    }
    
    public function updateIndexing(Request $request, IncomingDv $dv)
    {
        $validated = $request->validate([
            'indexing_date' => 'required|date',
        ]);
        
        $currentUser = Auth::user()->name ?? 'Unknown User';
        
        // Update transaction history
        $transactionHistory = $dv->transaction_history ?? [];
        $transactionHistory[] = [
            'action' => 'Indexed',
            'user' => $currentUser,
            'date' => $validated['indexing_date'],
            'details' => []
        ];
        
        $dv->update([
            'indexing_date' => $validated['indexing_date'],
            'indexed_by' => $currentUser,
            'status' => 'for_payment',
            'transaction_history' => $transactionHistory,
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'DV indexed successfully',
            'dv' => $dv->fresh()
        ]);
    }
    
    public function updatePaymentMethod(Request $request, IncomingDv $dv)
    {
        $validated = $request->validate([
            'payment_method' => 'required|string|in:check,lddap,payroll',
            'lddap_number' => 'nullable|required_if:payment_method,lddap|string',
        ]);
        
        $currentUser = Auth::user()->name ?? 'Unknown User';
        $today = now()->toDateString();
        
        // Update transaction history
        $transactionHistory = $dv->transaction_history ?? [];
        
        $nextStatus = 'for_engas'; // Default next status
        
        if ($validated['payment_method'] === 'payroll') {
            // For payroll, go to cashiering first
            $nextStatus = 'out_to_cashiering';
            $transactionHistory[] = [
                'action' => 'Set to Payroll Register',
                'user' => $currentUser,
                'date' => $today,
                'details' => ['payment_method' => 'payroll']
            ];
            
            $dv->update([
                'payment_method' => $validated['payment_method'],
                'payment_method_date' => $today,
                'payment_method_set_by' => $currentUser,
                'status' => $nextStatus,
                'pr_out_date' => $today,
                'pr_out_by' => $currentUser,
                'transaction_history' => $transactionHistory,
            ]);
        } else {
            // For check or LDDAP, go directly to E-NGAS
            $details = ['payment_method' => $validated['payment_method']];
            if ($validated['payment_method'] === 'lddap') {
                $details['lddap_number'] = $validated['lddap_number'];
            }
            
            $transactionHistory[] = [
                'action' => 'Payment method set: ' . ucfirst($validated['payment_method']),
                'user' => $currentUser,
                'date' => $today,
                'details' => $details
            ];
            
            $updateData = [
                'payment_method' => $validated['payment_method'],
                'payment_method_date' => $today,
                'payment_method_set_by' => $currentUser,
                'status' => $nextStatus,
                'transaction_history' => $transactionHistory,
            ];
            
            if ($validated['payment_method'] === 'lddap') {
                $updateData['lddap_number'] = $validated['lddap_number'];
            }
            
            $dv->update($updateData);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Payment method set successfully',
            'dv' => $dv->fresh()
        ]);
    }
    
    public function updatePayrollIn(Request $request, IncomingDv $dv)
    {
        $validated = $request->validate([
            'in_date' => 'required|date',
        ]);
        
        $currentUser = Auth::user()->name ?? 'Unknown User';
        
        // Update transaction history
        $transactionHistory = $dv->transaction_history ?? [];
        $transactionHistory[] = [
            'action' => 'Returned from Cashiering',
            'user' => $currentUser,
            'date' => $validated['in_date'],
            'details' => []
        ];
        
        $dv->update([
            'pr_in_date' => $validated['in_date'],
            'pr_in_by' => $currentUser,
            'status' => 'for_engas',
            'transaction_history' => $transactionHistory,
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'DV returned from cashiering successfully',
            'dv' => $dv->fresh()
        ]);
    }
    
    public function updateEngas(Request $request, IncomingDv $dv)
    {
        $validated = $request->validate([
            'engas_number' => [
                'required',
                'string',
                'regex:/^(\d{4})-(\d{2})-(\d{5})$/',
                function ($attribute, $value, $fail) {
                    // Validate the format components
                    if (preg_match('/^(\d{4})-(\d{2})-(\d{5})$/', $value, $matches)) {
                        $year = (int)$matches[1];
                        $month = (int)$matches[2];
                        $serial = (int)$matches[3];
                        
                        if ($year < 2020 || $year > 2030) {
                            $fail('The year in E-NGAS number must be between 2020 and 2030.');
                        }
                        
                        if ($month < 1 || $month > 12) {
                            $fail('The month in E-NGAS number must be between 01 and 12.');
                        }
                        
                        if ($serial === 0) {
                            $fail('The serial number in E-NGAS number cannot be 00000.');
                        }
                    } else {
                        $fail('The E-NGAS number format must be YYYY-MM-XXXXX (e.g., 2025-06-00001).');
                    }
                }
            ],
            'engas_date' => 'required|date',
        ], [
            'engas_number.regex' => 'The E-NGAS number format must be YYYY-MM-XXXXX (e.g., 2025-06-00001).',
            'engas_number.required' => 'The E-NGAS number is required.',
        ]);
        
        $currentUser = Auth::user()->name ?? 'Unknown User';
        
        // Update transaction history
        $transactionHistory = $dv->transaction_history ?? [];
        $transactionHistory[] = [
            'action' => 'E-NGAS Recorded',
            'user' => $currentUser,
            'date' => $validated['engas_date'],
            'details' => ['engas_number' => $validated['engas_number']]
        ];
        
        $dv->update([
            'engas_number' => $validated['engas_number'],
            'engas_date' => $validated['engas_date'],
            'engas_recorded_by' => $currentUser,
            'status' => 'for_cdj',
            'transaction_history' => $transactionHistory,
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'E-NGAS number recorded successfully',
            'dv' => $dv->fresh()
        ]);
    }
    
    public function updateCdj(Request $request, IncomingDv $dv)
    {
        $validated = $request->validate([
            'cdj_date' => 'required|date',
        ]);
        
        $currentUser = Auth::user()->name ?? 'Unknown User';
        
        // Update transaction history
        $transactionHistory = $dv->transaction_history ?? [];
        $transactionHistory[] = [
            'action' => 'CDJ Recorded',
            'user' => $currentUser,
            'date' => $validated['cdj_date'],
        ];
        
        $dv->update([
            'cdj_date' => $validated['cdj_date'],
            'cdj_recorded_by' => $currentUser,
            'status' => 'for_lddap',
            'transaction_history' => $transactionHistory,
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'CDJ recording completed successfully',
            'dv' => $dv->fresh()
        ]);
    }
    
    public function certifyLddap(Request $request, IncomingDv $dv)
    {
        $currentUser = Auth::user()->name ?? 'Unknown User';
        $today = now()->toDateString();
        
        // Update transaction history
        $transactionHistory = $dv->transaction_history ?? [];
        $transactionHistory[] = [
            'action' => 'LDDAP Certified',
            'user' => $currentUser,
            'date' => $today,
            'details' => []
        ];
        $transactionHistory[] = [
            'action' => 'Processing Complete',
            'user' => $currentUser,
            'date' => $today,
            'details' => []
        ];
        
        $dv->update([
            'lddap_certified_date' => $today,
            'lddap_certified_by' => $currentUser,
            'status' => 'processed',
            'processed_date' => $today,
            'transaction_history' => $transactionHistory,
        ]);
        
        // Instead of JSON response, redirect to detailed view
        return redirect()->route('dv.details', ['dv' => $dv->id])
            ->with('success', 'DV processing completed successfully');
    }
    
    public function showDetails(IncomingDv $dv)
    {
        // Load related data
        $dv->load('orsEntries');
        
        return Inertia::render('DvDetailsPage', [
            'dv' => $dv
        ]);
    }
    
    public function downloadDv(IncomingDv $dv, Request $request)
    {
        // Only allow download for processed DVs
        if ($dv->status !== 'processed') {
            return redirect()->back()->with('error', 'Only processed DVs can be downloaded.');
        }
        
        // Load related data
        $dv->load('orsEntries');
        
        // Get format parameter (default to pdf)
        $format = $request->get('format', 'pdf');
        
        switch ($format) {
            case 'pdf':
                return $this->downloadDvAsPdf($dv);
            case 'docx':
                return $this->downloadDvAsDocx($dv);
            case 'excel':
                return $this->downloadDvAsExcel($dv);
            default:
                return $this->downloadDvAsPdf($dv);
        }
    }
    
    private function downloadDvAsPdf(IncomingDv $dv)
    {
        $pdf = Pdf::loadView('dv-report', compact('dv'));
        $filename = 'DV_' . $dv->dv_number . '_' . date('Y-m-d_H-i-s') . '.pdf';
        
        return $pdf->download($filename);
    }
    
    private function downloadDvAsDocx(IncomingDv $dv)
    {
        // Create new Word document
        $phpWord = new \PhpOffice\PhpWord\PhpWord();
        
        // Set document properties
        $properties = $phpWord->getDocInfo();
        $properties->setCreator('DA-CAR Accounting System');
        $properties->setTitle('Disbursement Voucher - ' . $dv->dv_number);
        $properties->setSubject('DV Report');
        
        // Add section
        $section = $phpWord->addSection();
        
        // Add header
        $headerStyle = ['bold' => true, 'size' => 16, 'color' => '000080'];
        $section->addText('DISBURSEMENT VOUCHER REPORT', $headerStyle, ['alignment' => 'center']);
        $section->addTextBreak(2);
        
        // Add DV information table
        $tableStyle = [
            'borderSize' => 6,
            'borderColor' => '000000',
            'cellMargin' => 80,
            'width' => 100 * 50
        ];
        $phpWord->addTableStyle('DVTable', $tableStyle);
        
        $table = $section->addTable('DVTable');
        
        // Table data
        $boldStyle = ['bold' => true];
        $data = [
            ['DV Number:', $dv->dv_number],
            ['Payee:', $dv->payee],
            ['Transaction Type:', $dv->transaction_type],
            ['Implementing Unit:', $dv->implementing_unit ?? 'N/A'],
            ['Account Number:', $dv->account_number ?? 'N/A'],
            ['Original Amount:', '₱' . number_format($dv->amount, 2)],
            ['Net Amount:', $dv->net_amount ? '₱' . number_format($dv->net_amount, 2) : 'N/A'],
            ['Status:', ucwords(str_replace('_', ' ', $dv->status))],
            ['Cash Allocation Number:', $dv->cash_allocation_number ?? 'N/A'],
            ['Cash Allocation Date:', $dv->cash_allocation_date ? $dv->cash_allocation_date->format('Y-m-d') : 'N/A'],
            ['Created Date:', $dv->created_at->format('Y-m-d H:i:s')],
            ['Last Updated:', $dv->updated_at->format('Y-m-d H:i:s')],
        ];
        
        // Add table rows
        foreach ($data as $row) {
            $table->addRow();
            $table->addCell(3000)->addText($row[0], $boldStyle);
            $table->addCell(6000)->addText($row[1]);
        }
        
        // Add particulars section
        $section->addTextBreak(2);
        $section->addText('PARTICULARS:', $boldStyle);
        $section->addTextBreak();
        $section->addText($dv->particulars ?? 'N/A');
        
        // Add transaction history if available
        if ($dv->transaction_history && count($dv->transaction_history) > 0) {
            $section->addTextBreak(2);
            $section->addText('TRANSACTION HISTORY:', $boldStyle);
            $section->addTextBreak();
            
            foreach (collect($dv->transaction_history)->sortBy('date') as $history) {
                $section->addText('• ' . $history['action'] . ' - ' . \Carbon\Carbon::parse($history['date'])->format('Y-m-d') . ' by ' . $history['user']);
                
                if (isset($history['details']) && is_array($history['details'])) {
                    foreach ($history['details'] as $key => $value) {
                        if (!empty($value)) {
                            $section->addText('  - ' . ucwords(str_replace('_', ' ', $key)) . ': ' . $value);
                        }
                    }
                }
                $section->addTextBreak();
            }
        }
        
        // ORS Entries if available
        if ($dv->orsEntries && count($dv->orsEntries) > 0) {
            $section->addTextBreak(2);
            $section->addText('ORS ENTRIES:', $boldStyle);
            $section->addTextBreak();
            
            foreach ($dv->orsEntries as $ors) {
                $section->addText('• ORS Number: ' . ($ors->ors_number ?? 'N/A'));
                $section->addText('  Fund Source: ' . ($ors->fund_source ?? 'N/A'));
                $section->addTextBreak();
            }
        }
        
        // Generate filename
        $filename = 'DV_' . $dv->dv_number . '_' . date('Y-m-d_H-i-s') . '.docx';
        
        // Save as DOCX
        $objWriter = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'Word2007');
        
        // Set headers for download
        $headers = [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control' => 'max-age=0',
        ];
        
        return response()->stream(function() use ($objWriter) {
            $objWriter->save('php://output');
        }, 200, $headers);
    }
    
    private function downloadDvAsExcel(IncomingDv $dv)
    {
        // For now, return CSV format (can be enhanced to use Laravel Excel later)
        $csvData = [];
        
        // Headers
        $csvData[] = [
            'Field',
            'Value'
        ];
        
        // Basic Information
        $csvData[] = ['DV Number', $dv->dv_number];
        $csvData[] = ['Payee', $dv->payee];
        $csvData[] = ['Transaction Type', $dv->transaction_type];
        $csvData[] = ['Implementing Unit', $dv->implementing_unit ?? 'N/A'];
        $csvData[] = ['Account Number', $dv->account_number ?? 'N/A'];
        $csvData[] = ['Original Amount', number_format($dv->amount, 2)];
        if ($dv->net_amount) {
            $csvData[] = ['Net Amount', number_format($dv->net_amount, 2)];
        }
        $csvData[] = ['Status', strtoupper(str_replace('_', ' ', $dv->status))];
        $csvData[] = ['Created Date', $dv->created_at->format('Y-m-d H:i:s')];
        $csvData[] = ['Last Updated', $dv->updated_at->format('Y-m-d H:i:s')];
        
        if ($dv->particulars) {
            $csvData[] = ['Particulars', $dv->particulars];
        }
        
        // Transaction History
        if ($dv->transaction_history && count($dv->transaction_history) > 0) {
            $csvData[] = ['', ''];
            $csvData[] = ['TRANSACTION HISTORY', ''];
            $csvData[] = ['Action', 'Date', 'User', 'Details'];
            
            foreach (collect($dv->transaction_history)->sortBy('date') as $entry) {
                $details = '';
                if (isset($entry['details']) && is_array($entry['details'])) {
                    $detailsArray = [];
                    foreach ($entry['details'] as $key => $value) {
                        if ($value) {
                            $detailsArray[] = ucwords(str_replace('_', ' ', $key)) . ': ' . $value;
                        }
                    }
                    $details = implode('; ', $detailsArray);
                }
                
                $csvData[] = [
                    $entry['action'],
                    \Carbon\Carbon::parse($entry['date'])->format('Y-m-d'),
                    $entry['user'],
                    $details
                ];
            }
        }
        
        $filename = 'DV_' . $dv->dv_number . '_' . date('Y-m-d_H-i-s') . '.csv';
        
        $callback = function() use ($csvData) {
            $file = fopen('php://output', 'w');
            foreach ($csvData as $row) {
                fputcsv($file, $row);
            }
            fclose($file);
        };
        
        return response()->stream($callback, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Reallocate cash for a processed DV
     * Clears post-cash-allocation data and marks for reallocation
     */
    public function reallocateCash(Request $request, $id)
    {
        try {
            Log::info("Reallocation request received for DV ID: {$id}");
            
            $dv = IncomingDv::findOrFail($id);
            
            Log::info("DV found with status: {$dv->status}");
            
            // Verify that the DV is in processed status
            if ($dv->status !== 'processed') {
                Log::warning("DV {$id} cannot be reallocated - status is {$dv->status}, not 'processed'");
                return response()->json(['error' => 'Only processed DVs can be reallocated'], 400);
            }
            
            // Store current state for history before clearing
            $previousState = [
                'cash_allocation_date' => $dv->cash_allocation_date,
                'cash_allocation_number' => $dv->cash_allocation_number,
                'net_amount' => $dv->net_amount,
                'processed_date' => $dv->processed_date,
                'status' => $dv->status
            ];
            
            Log::info("Updating DV {$id} status to for_cash_allocation");
            
            // Clear all post-cash-allocation fields (only update confirmed existing columns)
            $updateData = [
                'status' => 'for_cash_allocation',
                'is_reallocated' => true,
                'reallocation_date' => now()->toDateString(),
                'reallocation_reason' => $request->input('reallocation_reason', 'DV returned from cashiering for reallocation'),
                'cash_allocation_date' => null,
                'cash_allocation_number' => null,
                'net_amount' => null,
                'allocated_by' => null,
                'approval_out' => false,
                'approval_out_date' => null,
                'approval_in_date' => null,
                'approved_by' => null,
                'indexing_date' => null,
                'indexed_by' => null,
                'payment_method' => null,
                'lddap_number' => null,
                'payment_method_date' => null,
                'payment_method_set_by' => null,
                'pr_out_date' => null,
                'pr_in_date' => null,
                'pr_out_by' => null,
                'pr_in_by' => null,
                'engas_number' => null,
                'engas_date' => null,
                'engas_recorded_by' => null,
                'cdj_date' => null,
                'cdj_details' => null,
                'cdj_recorded_by' => null,
                'lddap_certified_date' => null,
                'lddap_certified_by' => null,
                'processed_date' => null,
            ];
            
            Log::info("Update data prepared:", $updateData);
            
            $dv->update($updateData);
            
            // Add reallocation entry to transaction history
            $transactionHistory = $dv->transaction_history ?? [];
            $transactionHistory[] = [
                'action' => 'Cash Reallocation Requested',
                'date' => now()->toDateTimeString(),
                'user' => Auth::user()->name ?? 'System',
                'details' => [
                    'reason' => 'DV returned from cashiering for cash reallocation',
                    'previous_processed_date' => $previousState['processed_date'],
                    'cleared_fields' => array_filter($previousState) // Only include fields that had values
                ]
            ];
            
            $dv->update(['transaction_history' => $transactionHistory]);
            
            Log::info("DV {$id} successfully reallocated to cash allocation");
            
            return response()->json(['message' => 'DV successfully marked for cash reallocation']);
            
        } catch (\Exception $e) {
            Log::error("Error reallocating DV {$id}: " . $e->getMessage());
            Log::error("Stack trace: " . $e->getTraceAsString());
            return response()->json(['error' => 'Internal server error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get filter options for download modal
     */
    public function getFilterOptions()
    {
        try {
            // Get distinct transaction types from processed DVs
            $transactionTypes = IncomingDv::where('status', 'processed')
                ->distinct()
                ->whereNotNull('transaction_type')
                ->orderBy('transaction_type')
                ->pluck('transaction_type');

            // Get distinct implementing units from processed DVs
            $implementingUnits = IncomingDv::where('status', 'processed')
                ->distinct()
                ->whereNotNull('implementing_unit')
                ->orderBy('implementing_unit')
                ->pluck('implementing_unit');

            // Get distinct payees from processed DVs
            $payees = IncomingDv::where('status', 'processed')
                ->distinct()
                ->whereNotNull('payee')
                ->orderBy('payee')
                ->pluck('payee');

            return response()->json([
                'transaction_types' => $transactionTypes,
                'implementing_units' => $implementingUnits,
                'payees' => $payees
            ]);
            
        } catch (\Exception $e) {
            Log::error("Error fetching filter options: " . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch filter options'], 500);
        }
    }

    /**
     * Download processed DVs with filters
     */
    public function downloadProcessedDvs(Request $request)
    {
        try {
            Log::info('Download request received', $request->all());
            
            $filterType = $request->get('filter_type', 'date_range');
            $fileType = $request->get('file_type', 'excel');
            
            Log::info('Filter type: ' . $filterType . ', File type: ' . $fileType);
            
            // Build query for processed DVs
            $query = IncomingDv::where('status', 'processed')->with('orsEntries');
            
            // Apply date range filter if provided
            if ($startDate = $request->get('start_date')) {
                $query->whereDate('processed_date', '>=', $startDate);
                Log::info('Start date filter: ' . $startDate);
            }
            if ($endDate = $request->get('end_date')) {
                $query->whereDate('processed_date', '<=', $endDate);
                Log::info('End date filter: ' . $endDate);
            }
            
            // Apply additional filters based on filter type
            switch ($filterType) {
                case 'transaction_type':
                    if ($transactionType = $request->get('transaction_type')) {
                        $query->where('transaction_type', $transactionType);
                        Log::info('Transaction type filter: ' . $transactionType);
                    }
                    break;
                    
                case 'implementing_unit':
                    if ($implementingUnit = $request->get('implementing_unit')) {
                        $query->where('implementing_unit', $implementingUnit);
                        Log::info('Implementing unit filter: ' . $implementingUnit);
                    }
                    break;
                    
                case 'payee':
                    if ($payee = $request->get('payee')) {
                        $query->where('payee', $payee);
                        Log::info('Payee filter: ' . $payee);
                    }
                    break;
            }
            
            // Get the filtered DVs
            $dvs = $query->orderBy('processed_date', 'desc')->get();
            
            Log::info('Found DVs count: ' . $dvs->count());
            
            if ($dvs->isEmpty()) {
                Log::info('No DVs found, returning error');
                return redirect()->back()->with('error', 'No processed DVs found for the selected criteria.');
            }
            
            // Generate filename based on filter
            $filename = $this->generateDownloadFilename($filterType, $request, $fileType);
            Log::info('Generated filename: ' . $filename);
            
            // Return the appropriate file format
            switch ($fileType) {
                case 'pdf':
                    Log::info('Returning PDF download');
                    return $this->downloadDvsAsPdf($dvs, $filename);
                case 'docx':
                    Log::info('Returning DOCX download');
                    return $this->downloadDvsAsDocx($dvs, $filename);
                case 'excel':
                default:
                    Log::info('Returning Excel/CSV download');
                    return $this->downloadDvsAsExcel($dvs, $filename);
            }
            
        } catch (\Exception $e) {
            Log::error("Error downloading processed DVs: " . $e->getMessage());
            return redirect()->back()->with('error', 'Error generating download: ' . $e->getMessage());
        }
    }
    
    /**
     * Generate filename based on filter criteria
     */
    private function generateDownloadFilename($filterType, $request, $fileType)
    {
        $timestamp = now()->format('Y-m-d_H-i-s');
        $extension = $fileType === 'excel' ? 'csv' : $fileType;
        
        // Get date range for filename
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');
        $dateRange = '';
        
        if ($startDate && $endDate) {
            if ($startDate === $endDate) {
                $dateRange = $startDate;
            } else {
                $dateRange = "{$startDate}_to_{$endDate}";
            }
        } else if ($startDate) {
            $dateRange = "from_{$startDate}";
        } else if ($endDate) {
            $dateRange = "until_{$endDate}";
        } else {
            $dateRange = "all_dates";
        }
        
        switch ($filterType) {
            case 'transaction_type':
                $type = str_replace(' ', '_', $request->get('transaction_type', 'Unknown'));
                return "Processed_DVs_TransactionType_{$type}_{$dateRange}_{$timestamp}.{$extension}";
                
            case 'implementing_unit':
                $unit = str_replace(' ', '_', $request->get('implementing_unit', 'Unknown'));
                return "Processed_DVs_Unit_{$unit}_{$dateRange}_{$timestamp}.{$extension}";
                
            case 'payee':
                $payee = str_replace(' ', '_', $request->get('payee', 'Unknown'));
                return "Processed_DVs_Payee_{$payee}_{$dateRange}_{$timestamp}.{$extension}";
                
            default:
                return "Processed_DVs_{$dateRange}_{$timestamp}.{$extension}";
        }
    }
    
    /**
     * Download multiple DVs as Excel/CSV
     */
    private function downloadDvsAsExcel($dvs, $filename)
    {
        $csvData = [];
        
        // Headers
        $csvData[] = [
            'DV Number',
            'Payee',
            'Transaction Type',
            'Implementing Unit',
            'Account Number',
            'Original Amount',
            'Net Amount',
            'Cash Allocation Number',
            'Cash Allocation Date',
            'Processed Date',
            'Particulars',
            'Fund Sources',
            'ORS Numbers'
        ];
        
        // Data rows
        foreach ($dvs as $dv) {
            // Get ORS data
            $fundSources = $dv->orsEntries->pluck('fund_source')->filter()->implode('; ');
            $orsNumbers = $dv->orsEntries->pluck('ors_number')->filter()->implode('; ');
            
            $csvData[] = [
                $dv->dv_number,
                $dv->payee,
                $dv->transaction_type,
                $dv->implementing_unit ?? 'N/A',
                $dv->account_number ?? 'N/A',
                number_format($dv->amount, 2),
                $dv->net_amount ? number_format($dv->net_amount, 2) : 'N/A',
                $dv->cash_allocation_number ?? 'N/A',
                $dv->cash_allocation_date ? $dv->cash_allocation_date->format('Y-m-d') : 'N/A',
                $dv->processed_date ? $dv->processed_date->format('Y-m-d') : 'N/A',
                $dv->particulars ?? 'N/A',
                $fundSources ?: 'N/A',
                $orsNumbers ?: 'N/A'
            ];
        }
        
        $callback = function() use ($csvData) {
            $file = fopen('php://output', 'w');
            foreach ($csvData as $row) {
                fputcsv($file, $row);
            }
            fclose($file);
        };
        
        return response()->stream($callback, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }
    
    /**
     * Download multiple DVs as PDF
     */
    private function downloadDvsAsPdf($dvs, $filename)
    {
        $pdf = Pdf::loadView('dvs-report', compact('dvs'));
        return $pdf->download($filename);
    }
    
    /**
     * Download multiple DVs as Word document
     */
    private function downloadDvsAsDocx($dvs, $filename)
    {
        // Create new Word document
        $phpWord = new \PhpOffice\PhpWord\PhpWord();
        
        // Set document properties
        $properties = $phpWord->getDocInfo();
        $properties->setCreator('DA-CAR Accounting System');
        $properties->setTitle('Processed DVs Report');
        $properties->setSubject('DVs Report');
        
        // Add section
        $section = $phpWord->addSection();
        
        // Add header
        $headerStyle = ['bold' => true, 'size' => 16, 'color' => '000080'];
        $section->addText('PROCESSED DISBURSEMENT VOUCHERS REPORT', $headerStyle, ['alignment' => 'center']);
        $section->addText('Generated: ' . now()->format('F j, Y g:i A'), null, ['alignment' => 'center']);
        $section->addTextBreak(2);
        
        // Add summary
        $section->addText('Total DVs: ' . $dvs->count(), ['bold' => true]);
        $section->addText('Total Amount: ₱' . number_format($dvs->sum('amount'), 2), ['bold' => true]);
        $section->addText('Total Net Amount: ₱' . number_format($dvs->whereNotNull('net_amount')->sum('net_amount'), 2), ['bold' => true]);
        $section->addTextBreak(2);
        
        // Add DVs table
        $tableStyle = [
            'borderSize' => 6,
            'borderColor' => '000000',
            'cellMargin' => 50,
            'width' => 100 * 50
        ];
        $phpWord->addTableStyle('DVsTable', $tableStyle);
        
        $table = $section->addTable('DVsTable');
        
        // Table headers
        $boldStyle = ['bold' => true];
        $table->addRow();
        $table->addCell(2000)->addText('DV Number', $boldStyle);
        $table->addCell(2500)->addText('Payee', $boldStyle);
        $table->addCell(2000)->addText('Amount', $boldStyle);
        $table->addCell(2000)->addText('Net Amount', $boldStyle);
        $table->addCell(1500)->addText('Processed Date', $boldStyle);
        
        // Table data
        foreach ($dvs as $dv) {
            $table->addRow();
            $table->addCell(2000)->addText($dv->dv_number);
            $table->addCell(2500)->addText($dv->payee);
            $table->addCell(2000)->addText('₱' . number_format($dv->amount, 2));
            $table->addCell(2000)->addText($dv->net_amount ? '₱' . number_format($dv->net_amount, 2) : 'N/A');
            $table->addCell(1500)->addText($dv->processed_date ? $dv->processed_date->format('Y-m-d') : 'N/A');
        }
        
        // Generate filename
        $objWriter = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'Word2007');
        
        // Set headers for download
        $headers = [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control' => 'max-age=0',
        ];
        
        return response()->stream(function() use ($objWriter) {
            $objWriter->save('php://output');
        }, 200, $headers);
    }
}
