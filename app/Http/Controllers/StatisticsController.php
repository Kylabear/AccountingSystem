<?php

namespace App\Http\Controllers;

use App\Models\IncomingDv;
use App\Models\PredefinedOption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class StatisticsController extends Controller
{
    public function index(Request $request)
    {
        // Get filter values from request
        $filterBy = $request->get('filter_by', 'implementing_unit'); // This line is retained for context
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

        // Get all DVs for dashboard statistics
        $allDvs = IncomingDv::select('id', 'status', 'amount', 'dv_number', 'created_at')
            ->get()
            ->map(function ($dv) {
                return [
                    'id' => $dv->id,
                    'status' => $dv->status,
                    'amount' => $dv->amount,
                    'dv_number' => $dv->dv_number,
                    'created_at' => $dv->created_at->format('Y-m-d'),
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
            ],
            'dvs' => $allDvs, // Add DVs data for dashboard
        ]);
    }

    /**
     * Export statistics data
     */
    public function export(Request $request)
    {
        try {
            Log::info('Export request started', [
                'authenticated' => Auth::check(),
                'params' => $request->all()
            ]);

            $filterBy = $request->get('filter_by', 'implementing_unit');
            $timePeriod = $request->get('time_period', 'monthly');
            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');
            $format = $request->get('format', 'csv');

            // Build the base query with time period filter
            $query = IncomingDv::query();
            
            // Apply date range filter if provided, otherwise use time period filter
            if ($startDate && $endDate) {
                $query->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
            } else {
                $this->applyTimePeriodFilter($query, $timePeriod);
            }

            // Get overall statistics
            $totalDVs = $query->count();
            $pendingDVs = (clone $query)->where('status', 'pending')->count();
            $processedDVs = (clone $query)->whereIn('status', ['approved', 'completed', 'processed'])->count();

            // Get breakdown data
            $breakdownData = $this->getBreakdownData($query, $filterBy);

            Log::info('Export data prepared', [
                'totalDVs' => $totalDVs,
                'format' => $format,
                'dateRange' => $startDate && $endDate ? "$startDate to $endDate" : "Period: $timePeriod"
            ]);

            // Prepare data for export
            $exportData = [
                'totalDVs' => $totalDVs,
                'pendingDVs' => $pendingDVs,
                'processedDVs' => $processedDVs,
                'processingRate' => $totalDVs > 0 ? round(($processedDVs / $totalDVs) * 100, 2) : 0,
                'breakdownData' => $breakdownData,
                'filterBy' => $filterBy,
                'timePeriod' => $timePeriod,
                'startDate' => $startDate,
                'endDate' => $endDate,
                'dateRangeText' => $startDate && $endDate ? 
                    "Date Range: " . date('M j, Y', strtotime($startDate)) . " - " . date('M j, Y', strtotime($endDate)) :
                    "Time Period: " . ucfirst($timePeriod),
                'generatedAt' => now()->format('Y-m-d H:i:s')
            ];

            switch ($format) {
                case 'csv':
                    return $this->exportCsv($exportData);
                case 'pdf':
                    return $this->exportPdf($exportData);
                case 'excel':
                case 'xlsx':
                    return $this->exportExcel($exportData);
                case 'docx':
                    return $this->exportDocx($exportData);
                default:
                    return response()->json(['error' => 'Unsupported export format'], 400);
            }
        } catch (\Exception $e) {
            Log::error('Export failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Export failed: ' . $e->getMessage()], 500);
        }
    }

    private function exportCsv($exportData)
    {
        $csvData = [];

        // Add header information
        $csvData[] = ['DV Statistics Export Report'];
        $csvData[] = ['Generated on', $exportData['generatedAt']];
        $csvData[] = ['Filter Criteria', $exportData['dateRangeText']];
        $csvData[] = ['Filter By', ucwords(str_replace('_', ' ', $exportData['filterBy']))];
        $csvData[] = [''];

        // Add summary statistics
        $csvData[] = ['Summary Statistics'];
        $csvData[] = ['Total DVs', $exportData['totalDVs']];
        $csvData[] = ['Processed DVs', $exportData['processedDVs']];
        $csvData[] = ['Pending DVs', $exportData['pendingDVs']];
        $csvData[] = ['Processing Rate', $exportData['processingRate'] . '%'];
        $csvData[] = [''];

        // Add breakdown data
        $csvData[] = ['Breakdown by ' . ucwords(str_replace('_', ' ', $exportData['filterBy']))];
        $csvData[] = ['Category', 'Total Received', 'Processed', 'Progress Percentage'];

        foreach ($exportData['breakdownData']['data'] as $item) {
            $csvData[] = [
                $item['category'],
                $item['received'],
                $item['processed'],
                $item['progress_percentage'] . '%'
            ];
        }

        $dateIdentifier = isset($exportData['startDate']) && isset($exportData['endDate']) ? 
            $exportData['startDate'] . '_to_' . $exportData['endDate'] : 
            $exportData['timePeriod'];
        
        $filename = 'dv_statistics_' . $dateIdentifier . '_' . $exportData['filterBy'] . '_' . now()->format('Y-m-d_H-i-s') . '.csv';

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
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0'
        ]);
    }

    private function exportPdf($exportData)
    {
        $html = $this->generateReportHtml($exportData);
        
        $dateIdentifier = isset($exportData['startDate']) && isset($exportData['endDate']) ? 
            $exportData['startDate'] . '_to_' . $exportData['endDate'] : 
            $exportData['timePeriod'];
        
        $filename = 'dv_statistics_' . $dateIdentifier . '_' . $exportData['filterBy'] . '_' . now()->format('Y-m-d_H-i-s') . '.html';
        
        return response($html, 200, [
            'Content-Type' => 'text/html; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0'
        ]);
    }

    private function exportExcel($exportData)
    {
        $xml = $this->generateExcelXml($exportData);
        
        $dateIdentifier = isset($exportData['startDate']) && isset($exportData['endDate']) ? 
            $exportData['startDate'] . '_to_' . $exportData['endDate'] : 
            $exportData['timePeriod'];
        
        $filename = 'dv_statistics_' . $dateIdentifier . '_' . $exportData['filterBy'] . '_' . now()->format('Y-m-d_H-i-s') . '.xls';
        
        return response($xml, 200, [
            'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0'
        ]);
    }

    private function exportDocx($exportData)
    {
        $content = $this->generateDocxContent($exportData);
        
        $dateIdentifier = isset($exportData['startDate']) && isset($exportData['endDate']) ? 
            $exportData['startDate'] . '_to_' . $exportData['endDate'] : 
            $exportData['timePeriod'];
        
        $filename = 'dv_statistics_' . $dateIdentifier . '_' . $exportData['filterBy'] . '_' . now()->format('Y-m-d_H-i-s') . '.doc';
        
        return response($content, 200, [
            'Content-Type' => 'application/msword; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0'
        ]);
    }

    private function generateReportHtml($exportData)
    {
        $html = '<!DOCTYPE html>
        <html>
        <head>
            <title>DV Statistics Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                h1 { color: #2d5016; text-align: center; margin-bottom: 30px; }
                h2 { color: #4a7c23; border-bottom: 2px solid #4a7c23; padding-bottom: 5px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { padding: 12px; text-align: left; border: 1px solid #ddd; }
                th { background-color: #f8f9fa; font-weight: bold; }
                .summary-table th { background-color: #e8f5e8; }
                .breakdown-table th { background-color: #e3f2fd; }
                .meta-info { background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
                .progress-bar { height: 20px; background-color: #e0e0e0; border-radius: 10px; overflow: hidden; }
                .progress-fill { height: 100%; background-color: #4caf50; }
            </style>
        </head>
        <body>
            <h1>📊 DV Statistics Export Report</h1>
            
            <div class="meta-info">
                <strong>Generated on:</strong> ' . $exportData['generatedAt'] . '<br>
                <strong>Filter Criteria:</strong> ' . $exportData['dateRangeText'] . '<br>
                <strong>Filter By:</strong> ' . ucwords(str_replace('_', ' ', $exportData['filterBy'])) . '
            </div>

            <h2>📈 Summary Statistics</h2>
            <table class="summary-table">
                <tr><th>Metric</th><th>Value</th></tr>
                <tr><td>Total DVs</td><td>' . number_format($exportData['totalDVs']) . '</td></tr>
                <tr><td>Processed DVs</td><td>' . number_format($exportData['processedDVs']) . '</td></tr>
                <tr><td>Pending DVs</td><td>' . number_format($exportData['pendingDVs']) . '</td></tr>
                <tr><td>Processing Rate</td><td>' . $exportData['processingRate'] . '%</td></tr>
            </table>

            <h2>📋 Breakdown by ' . ucwords(str_replace('_', ' ', $exportData['filterBy'])) . '</h2>
            <table class="breakdown-table">
                <tr><th>Category</th><th>Total Received</th><th>Processed</th><th>Progress %</th></tr>';
        
        foreach ($exportData['breakdownData']['data'] as $item) {
            $html .= '<tr>
                <td>' . htmlspecialchars($item['category']) . '</td>
                <td>' . number_format($item['received']) . '</td>
                <td>' . number_format($item['processed']) . '</td>
                <td>' . $item['progress_percentage'] . '%</td>
            </tr>';
        }
        
        $html .= '</table>
        </body>
        </html>';
        
        return $html;
    }

    private function generateExcelXml($exportData)
    {
        $xml = '<?xml version="1.0"?>
        <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
         xmlns:o="urn:schemas-microsoft-com:office:office"
         xmlns:x="urn:schemas-microsoft-com:office:excel"
         xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
         xmlns:html="http://www.w3.org/TR/REC-html40">
         <Worksheet ss:Name="DV Statistics">
          <Table>
           <Row>
            <Cell><Data ss:Type="String">DV Statistics Export Report</Data></Cell>
           </Row>
           <Row>
            <Cell><Data ss:Type="String">Generated on</Data></Cell>
            <Cell><Data ss:Type="String">' . $exportData['generatedAt'] . '</Data></Cell>
           </Row>
           <Row>
            <Cell><Data ss:Type="String">Time Period</Data></Cell>
            <Cell><Data ss:Type="String">' . ucfirst($exportData['timePeriod']) . '</Data></Cell>
           </Row>
           <Row>
            <Cell><Data ss:Type="String">Filter By</Data></Cell>
            <Cell><Data ss:Type="String">' . ucwords(str_replace('_', ' ', $exportData['filterBy'])) . '</Data></Cell>
           </Row>
           <Row></Row>
           <Row>
            <Cell><Data ss:Type="String">Summary Statistics</Data></Cell>
           </Row>
           <Row>
            <Cell><Data ss:Type="String">Total DVs</Data></Cell>
            <Cell><Data ss:Type="Number">' . $exportData['totalDVs'] . '</Data></Cell>
           </Row>
           <Row>
            <Cell><Data ss:Type="String">Processed DVs</Data></Cell>
            <Cell><Data ss:Type="Number">' . $exportData['processedDVs'] . '</Data></Cell>
           </Row>
           <Row>
            <Cell><Data ss:Type="String">Pending DVs</Data></Cell>
            <Cell><Data ss:Type="Number">' . $exportData['pendingDVs'] . '</Data></Cell>
           </Row>
           <Row>
            <Cell><Data ss:Type="String">Processing Rate</Data></Cell>
            <Cell><Data ss:Type="String">' . $exportData['processingRate'] . '%</Data></Cell>
           </Row>
           <Row></Row>
           <Row>
            <Cell><Data ss:Type="String">Breakdown by ' . ucwords(str_replace('_', ' ', $exportData['filterBy'])) . '</Data></Cell>
           </Row>
           <Row>
            <Cell><Data ss:Type="String">Category</Data></Cell>
            <Cell><Data ss:Type="String">Total Received</Data></Cell>
            <Cell><Data ss:Type="String">Processed</Data></Cell>
            <Cell><Data ss:Type="String">Progress %</Data></Cell>
           </Row>';
        
        foreach ($exportData['breakdownData']['data'] as $item) {
            $xml .= '<Row>
             <Cell><Data ss:Type="String">' . htmlspecialchars($item['category']) . '</Data></Cell>
             <Cell><Data ss:Type="Number">' . $item['received'] . '</Data></Cell>
             <Cell><Data ss:Type="Number">' . $item['processed'] . '</Data></Cell>
             <Cell><Data ss:Type="String">' . $item['progress_percentage'] . '%</Data></Cell>
            </Row>';
        }
        
        $xml .= '</Table>
         </Worksheet>
        </Workbook>';
        
        return $xml;
    }

    private function generateDocxContent($exportData)
    {
        $content = '<html>
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
            <title>DV Statistics Report</title>
        </head>
        <body>
            <h1 style="text-align: center; color: #2d5016;">📊 DV Statistics Export Report</h1>
            
            <div style="background-color: #f5f5f5; padding: 15px; margin-bottom: 20px;">
                <p><strong>Generated on:</strong> ' . $exportData['generatedAt'] . '</p>
                <p><strong>Time Period:</strong> ' . ucfirst($exportData['timePeriod']) . '</p>
                <p><strong>Filter By:</strong> ' . ucwords(str_replace('_', ' ', $exportData['filterBy'])) . '</p>
            </div>

            <h2 style="color: #4a7c23;">📈 Summary Statistics</h2>
            <table border="1" style="width: 100%; border-collapse: collapse;">
                <tr style="background-color: #e8f5e8;">
                    <th style="padding: 10px;">Metric</th>
                    <th style="padding: 10px;">Value</th>
                </tr>
                <tr><td style="padding: 10px;">Total DVs</td><td style="padding: 10px;">' . number_format($exportData['totalDVs']) . '</td></tr>
                <tr><td style="padding: 10px;">Processed DVs</td><td style="padding: 10px;">' . number_format($exportData['processedDVs']) . '</td></tr>
                <tr><td style="padding: 10px;">Pending DVs</td><td style="padding: 10px;">' . number_format($exportData['pendingDVs']) . '</td></tr>
                <tr><td style="padding: 10px;">Processing Rate</td><td style="padding: 10px;">' . $exportData['processingRate'] . '%</td></tr>
            </table>

            <h2 style="color: #4a7c23;">📋 Breakdown by ' . ucwords(str_replace('_', ' ', $exportData['filterBy'])) . '</h2>
            <table border="1" style="width: 100%; border-collapse: collapse;">
                <tr style="background-color: #e3f2fd;">
                    <th style="padding: 10px;">Category</th>
                    <th style="padding: 10px;">Total Received</th>
                    <th style="padding: 10px;">Processed</th>
                    <th style="padding: 10px;">Progress %</th>
                </tr>';
        
        foreach ($exportData['breakdownData']['data'] as $item) {
            $content .= '<tr>
                <td style="padding: 10px;">' . htmlspecialchars($item['category']) . '</td>
                <td style="padding: 10px;">' . number_format($item['received']) . '</td>
                <td style="padding: 10px;">' . number_format($item['processed']) . '</td>
                <td style="padding: 10px;">' . $item['progress_percentage'] . '%</td>
            </tr>';
        }
        
        $content .= '</table>
        </body>
        </html>';
        
        return $content;
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

    /**
     * Get implementing unit analysis data with processing duration calculations
     */
    public function getImplementingUnitAnalysis(Request $request)
    {
        $timePeriod = $request->get('time_period', 'monthly');
        
        // Build the base query with time period filter
        $query = IncomingDv::query();
        $this->applyTimePeriodFilter($query, $timePeriod);

        // Get all implementing units
        $implementingUnits = (clone $query)
            ->whereNotNull('implementing_unit')
            ->where('implementing_unit', '!=', '')
            ->select('implementing_unit')
            ->distinct()
            ->pluck('implementing_unit');

        $analysisData = [];

        foreach ($implementingUnits as $unit) {
            $unitQuery = (clone $query)->where('implementing_unit', $unit);
            
            // Get unit statistics
            $unitReceived = $unitQuery->count();
            $unitProcessed = (clone $unitQuery)->whereIn('status', ['approved', 'completed', 'processed'])->count();
            $unitProgressRate = $unitReceived > 0 ? round(($unitProcessed / $unitReceived) * 100, 2) : 0;

            // Calculate processing durations for the unit
            $processedDvs = (clone $unitQuery)->whereIn('status', ['approved', 'completed', 'processed'])->get();
            $unitDurations = $this->calculateUnitProcessingDurations($processedDvs);

            // Get transaction type breakdown for this unit
            $transactionTypes = (clone $unitQuery)
                ->whereNotNull('transaction_type')
                ->where('transaction_type', '!=', '')
                ->selectRaw("
                    transaction_type,
                    COUNT(*) as received,
                    SUM(CASE WHEN status IN ('approved', 'completed', 'processed') THEN 1 ELSE 0 END) as processed,
                    ROUND(
                        (SUM(CASE WHEN status IN ('approved', 'completed', 'processed') THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 
                        2
                    ) as progress_percentage
                ")
                ->groupBy('transaction_type')
                ->orderBy('received', 'desc')
                ->get()
                ->map(function ($item) use ($unitQuery) {
                    // Calculate processing durations for this transaction type within this unit
                    $typeProcessedDvs = (clone $unitQuery)
                        ->where('transaction_type', $item->transaction_type)
                        ->whereIn('status', ['approved', 'completed', 'processed'])
                        ->get();
                    
                    $typeDurations = $this->calculateUnitProcessingDurations($typeProcessedDvs);

                    return [
                        'transaction_type' => $item->transaction_type,
                        'received' => (int) $item->received,
                        'processed' => (int) $item->processed,
                        'progress_percentage' => (float) $item->progress_percentage,
                        'avg_inside_days' => $typeDurations['avg_inside_days'],
                        'avg_outside_days' => $typeDurations['avg_outside_days'],
                        'avg_total_days' => $typeDurations['avg_total_days'],
                    ];
                });

            $analysisData[] = [
                'implementing_unit' => $unit,
                'received' => $unitReceived,
                'processed' => $unitProcessed,
                'progress_rate' => $unitProgressRate,
                'avg_inside_days' => $unitDurations['avg_inside_days'],
                'avg_outside_days' => $unitDurations['avg_outside_days'],
                'avg_total_days' => $unitDurations['avg_total_days'],
                'transaction_types' => $transactionTypes
            ];
        }

        return response()->json([
            'implementing_units' => $analysisData,
            'time_period' => $timePeriod,
            'generated_at' => now()->toISOString()
        ]);
    }

    /**
     * Calculate processing durations for a collection of DVs
     */
    private function calculateUnitProcessingDurations($dvs)
    {
        if ($dvs->isEmpty()) {
            return [
                'avg_inside_days' => 0,
                'avg_outside_days' => 0,
                'avg_total_days' => 0
            ];
        }

        $totalInsideDays = 0;
        $totalOutsideDays = 0;
        $totalTotalDays = 0;
        $count = 0;

        foreach ($dvs as $dv) {
            $durations = $this->calculateIndividualDvDurations($dv);
            $totalInsideDays += $durations['inside_days'];
            $totalOutsideDays += $durations['outside_days'];
            $totalTotalDays += $durations['total_days'];
            $count++;
        }

        return [
            'avg_inside_days' => $count > 0 ? round($totalInsideDays / $count, 1) : 0,
            'avg_outside_days' => $count > 0 ? round($totalOutsideDays / $count, 1) : 0,
            'avg_total_days' => $count > 0 ? round($totalTotalDays / $count, 1) : 0
        ];
    }

    /**
     * Calculate processing durations for an individual DV
     * Using the same logic as ProcessedDvModal.jsx
     */
    private function calculateIndividualDvDurations($dv)
    {
        $createdDate = $dv->created_at;
        $completedDate = $dv->lddap_certified_date ?? $dv->cdj_date ?? $dv->engas_date ?? $dv->processed_date;
        
        if (!$completedDate || !$createdDate) {
            return [
                'inside_days' => 0,
                'outside_days' => 0,
                'total_days' => 0
            ];
        }

        // Calculate total duration
        $totalDays = max(1, $createdDate->diffInDays($completedDate));

        // Calculate outside accounting duration
        $outsideDays = 0;

        // For RTS duration (Cash Allocation)
        if ($dv->ca_rts_out_date && $dv->ca_rts_in_date) {
            $outsideDays += max(0, $dv->ca_rts_out_date->diffInDays($dv->ca_rts_in_date));
        }

        // For NORSA duration (Cash Allocation)
        if ($dv->ca_norsa_out_date && $dv->ca_norsa_in_date) {
            $outsideDays += max(0, $dv->ca_norsa_out_date->diffInDays($dv->ca_norsa_in_date));
        }

        // For RTS duration (Box C)
        if ($dv->bc_rts_out_date && $dv->bc_rts_in_date) {
            $outsideDays += max(0, $dv->bc_rts_out_date->diffInDays($dv->bc_rts_in_date));
        }

        // For NORSA duration (Box C)
        if ($dv->bc_norsa_out_date && $dv->bc_norsa_in_date) {
            $outsideDays += max(0, $dv->bc_norsa_out_date->diffInDays($dv->bc_norsa_in_date));
        }

        // For Approval duration (out for approval)
        if ($dv->approval_out_date && $dv->approval_in_date) {
            $outsideDays += max(0, $dv->approval_out_date->diffInDays($dv->approval_in_date));
        }

        // Inside accounting duration = total - outside
        $insideDays = max(0, $totalDays - $outsideDays);

        return [
            'inside_days' => $insideDays,
            'outside_days' => $outsideDays,
            'total_days' => $totalDays
        ];
    }
}
