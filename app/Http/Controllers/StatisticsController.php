<?php

namespace App\Http\Controllers;

use App\Models\IncomingDv;
use App\Models\PredefinedOption;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StatisticsController extends Controller
{
    public function index(Request $request)
    {
        // Get filter values from request
        $filterBy = $request->get('filter_by', 'implementing_unit'); // Default filter
        $timePeriod = $request->get('time_period', 'monthly');

        // Build the base query with time period filter
        $query = IncomingDv::query();
        $this->applyTimePeriodFilter($query, $timePeriod);

        // Get overall statistics
        $totalDVs = $query->count();
        $pendingDVs = (clone $query)->where('status', 'pending')->count();
        $processedDVs = (clone $query)->whereIn('status', ['approved', 'completed', 'processed'])->count();

        // Get breakdown data based on selected filter
        $breakdownData = $this->getBreakdownData($query, $filterBy);

        // Get filter options dynamically
        $filterOptions = [
            'fundSources' => PredefinedOption::getOptionsForType(PredefinedOption::TYPE_FUND_SOURCE),
            'transactionTypes' => PredefinedOption::getOptionsForType(PredefinedOption::TYPE_TRANSACTION_TYPE),
            'implementingUnits' => PredefinedOption::getOptionsForType(PredefinedOption::TYPE_IMPLEMENTING_UNIT),
        ];

        // Get recent activity
        $recentActivity = IncomingDv::orderBy('updated_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($dv) {
                return [
                    'id' => $dv->id,
                    'action' => $this->getActionFromStatus($dv->status),
                    'dv' => $dv->dv_number,
                    'amount' => $dv->amount,
                    'time' => $dv->updated_at->diffForHumans(),
                ];
            });

        return Inertia::render('StatisticsPage', [
            'statistics' => [
                'totalDVs' => $totalDVs,
                'pendingDVs' => $pendingDVs,
                'processedDVs' => $processedDVs,
                'recentActivity' => $recentActivity,
            ],
            'breakdownData' => $breakdownData,
            'filterOptions' => $filterOptions,
            'currentFilters' => [
                'filter_by' => $filterBy,
                'time_period' => $timePeriod,
            ]
        ]);
    }

    /**
     * Export statistics data
     */
    public function export(Request $request)
    {
        $filterBy = $request->get('filter_by', 'implementing_unit');
        $timePeriod = $request->get('time_period', 'monthly');
        $format = $request->get('format', 'csv');

        // Build the base query with time period filter
        $query = IncomingDv::query();
        $this->applyTimePeriodFilter($query, $timePeriod);

        // Get overall statistics
        $totalDVs = $query->count();
        $pendingDVs = (clone $query)->where('status', 'pending')->count();
        $processedDVs = (clone $query)->whereIn('status', ['approved', 'completed', 'processed'])->count();

        // Get breakdown data
        $breakdownData = $this->getBreakdownData($query, $filterBy);

        if ($format === 'csv') {
            return $this->exportCsv($totalDVs, $pendingDVs, $processedDVs, $breakdownData, $filterBy, $timePeriod);
        }

        // For future support of other formats
        return response()->json(['error' => 'Unsupported export format'], 400);
    }

    private function exportCsv($totalDVs, $pendingDVs, $processedDVs, $breakdownData, $filterBy, $timePeriod)
    {
        $csvData = [];

        // Add header information
        $csvData[] = ['DV Statistics Export Report'];
        $csvData[] = ['Generated on', now()->format('Y-m-d H:i:s')];
        $csvData[] = ['Time Period', ucfirst($timePeriod)];
        $csvData[] = ['Filter By', ucwords(str_replace('_', ' ', $filterBy))];
        $csvData[] = [''];

        // Add summary statistics
        $csvData[] = ['Summary Statistics'];
        $csvData[] = ['Total DVs', $totalDVs];
        $csvData[] = ['Processed DVs', $processedDVs];
        $csvData[] = ['Pending DVs', $pendingDVs];
        $csvData[] = ['Processing Rate', $totalDVs > 0 ? round(($processedDVs / $totalDVs) * 100, 2) . '%' : '0%'];
        $csvData[] = [''];

        // Add breakdown data
        $csvData[] = ['Breakdown by ' . ucwords(str_replace('_', ' ', $filterBy))];
        $csvData[] = ['Category', 'Total Received', 'Processed', 'Progress Percentage'];

        foreach ($breakdownData['data'] as $item) {
            $csvData[] = [
                $item['category'],
                $item['received'],
                $item['processed'],
                $item['progress_percentage'] . '%'
            ];
        }

        $filename = 'dv_statistics_' . $timePeriod . '_' . $filterBy . '_' . now()->format('Y-m-d_H-i-s') . '.csv';

        $callback = function() use ($csvData) {
            $file = fopen('php://output', 'w');
            
            // Add UTF-8 BOM for proper encoding
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            
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

    private function applyTimePeriodFilter($query, $timePeriod)
    {
        switch ($timePeriod) {
            case 'daily':
                $query->whereDate('created_at', today());
                break;
            case 'weekly':
                $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
                break;
            case 'monthly':
                $query->whereMonth('created_at', now()->month)
                      ->whereYear('created_at', now()->year);
                break;
            case 'quarterly':
                $quarter = ceil(now()->month / 3);
                $startMonth = ($quarter - 1) * 3 + 1;
                $endMonth = $quarter * 3;
                $query->whereBetween('created_at', [
                    now()->month($startMonth)->startOfMonth(),
                    now()->month($endMonth)->endOfMonth()
                ]);
                break;
            case 'yearly':
                $query->whereYear('created_at', now()->year);
                break;
        }
    }

    private function getBreakdownData($baseQuery, $filterBy)
    {
        // Map filter_by to actual database column
        $columnMap = [
            'fund_source' => 'fund_source',
            'transaction_type' => 'transaction_type',
            'implementing_unit' => 'implementing_unit',
        ];

        $column = $columnMap[$filterBy] ?? 'implementing_unit';

        // Get breakdown statistics
        $breakdown = (clone $baseQuery)
            ->selectRaw("
                {$column} as category,
                COUNT(*) as received,
                SUM(CASE WHEN status IN ('approved', 'completed', 'processed') THEN 1 ELSE 0 END) as processed,
                ROUND(
                    (SUM(CASE WHEN status IN ('approved', 'completed', 'processed') THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 
                    2
                ) as progress_percentage
            ")
            ->whereNotNull($column)
            ->where($column, '!=', '')
            ->groupBy($column)
            ->orderBy('received', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'category' => $item->category,
                    'received' => (int) $item->received,
                    'processed' => (int) $item->processed,
                    'progress_percentage' => (float) $item->progress_percentage,
                ];
            });

        return [
            'filter_type' => $filterBy,
            'filter_label' => ucwords(str_replace('_', ' ', $filterBy)),
            'data' => $breakdown
        ];
    }

    private function getActionFromStatus($status)
    {
        $statusMap = [
            'pending' => 'DV Submitted',
            'approved' => 'DV Approved',
            'processed' => 'DV Processed',
            'completed' => 'DV Completed',
            'rejected' => 'DV Rejected',
            'returned' => 'DV Returned',
        ];

        return $statusMap[$status] ?? 'DV Updated';
    }
}
