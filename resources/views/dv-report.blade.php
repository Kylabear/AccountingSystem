<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>DV Report - {{ $dv->dv_number }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #4f46e5;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #4f46e5;
            margin: 0;
            font-size: 24px;
        }
        .header h2 {
            color: #6b7280;
            margin: 5px 0 0 0;
            font-size: 16px;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            background-color: #4f46e5;
            color: white;
            padding: 8px 12px;
            margin-bottom: 15px;
            font-weight: bold;
            font-size: 14px;
        }
        .info-grid {
            display: table;
            width: 100%;
        }
        .info-row {
            display: table-row;
        }
        .info-label {
            display: table-cell;
            font-weight: bold;
            padding: 8px 12px 8px 0;
            width: 25%;
            vertical-align: top;
            color: #4b5563;
        }
        .info-value {
            display: table-cell;
            padding: 8px 0;
            vertical-align: top;
            border-bottom: 1px solid #e5e7eb;
        }
        .amount {
            font-size: 16px;
            font-weight: bold;
            color: #059669;
        }
        .status {
            background-color: #10b981;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            display: inline-block;
            font-size: 11px;
            font-weight: bold;
        }
        .history-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .history-table th {
            background-color: #f3f4f6;
            padding: 10px;
            text-align: left;
            border: 1px solid #d1d5db;
            font-weight: bold;
            font-size: 11px;
        }
        .history-table td {
            padding: 8px 10px;
            border: 1px solid #d1d5db;
            font-size: 11px;
            vertical-align: top;
        }
        .history-table tr:nth-child(even) {
            background-color: #f9fafb;
        }
        .ors-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .ors-table th {
            background-color: #fef3c7;
            padding: 8px;
            text-align: left;
            border: 1px solid #f59e0b;
            font-weight: bold;
            font-size: 11px;
        }
        .ors-table td {
            padding: 6px 8px;
            border: 1px solid #fbbf24;
            font-size: 11px;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
        }
        .particulars {
            background-color: #f8fafc;
            padding: 12px;
            border-left: 4px solid #4f46e5;
            margin: 10px 0;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Disbursement Voucher Report</h1>
        <h2>DA-CAR Accounting Section</h2>
        <p style="margin: 10px 0 0 0; font-size: 14px;"><strong>DV Number:</strong> {{ $dv->dv_number }}</p>
    </div>

    <div class="section">
        <div class="section-title">Basic Information</div>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Payee:</div>
                <div class="info-value">{{ $dv->payee }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Transaction Type:</div>
                <div class="info-value">{{ $dv->transaction_type }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Implementing Unit:</div>
                <div class="info-value">{{ $dv->implementing_unit ?? 'N/A' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Account Number:</div>
                <div class="info-value">{{ $dv->account_number ?? 'N/A' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Original Amount:</div>
                <div class="info-value amount">₱{{ number_format($dv->amount, 2) }}</div>
            </div>
            @if($dv->net_amount)
            <div class="info-row">
                <div class="info-label">Net Amount:</div>
                <div class="info-value amount">₱{{ number_format($dv->net_amount, 2) }}</div>
            </div>
            @endif
            <div class="info-row">
                <div class="info-label">Status:</div>
                <div class="info-value"><span class="status">{{ strtoupper(str_replace('_', ' ', $dv->status)) }}</span></div>
            </div>
            <div class="info-row">
                <div class="info-label">Created Date:</div>
                <div class="info-value">{{ $dv->created_at->format('F d, Y g:i A') }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Last Updated:</div>
                <div class="info-value">{{ $dv->updated_at->format('F d, Y g:i A') }}</div>
            </div>
        </div>
    </div>

    @if($dv->particulars)
    <div class="section">
        <div class="section-title">Particulars</div>
        <div class="particulars">
            {{ $dv->particulars }}
        </div>
    </div>
    @endif

    @if($dv->cash_allocation_number || $dv->cash_allocation_date)
    <div class="section">
        <div class="section-title">Cash Allocation Details</div>
        <div class="info-grid">
            @if($dv->cash_allocation_number)
            <div class="info-row">
                <div class="info-label">Allocation Number:</div>
                <div class="info-value">{{ $dv->cash_allocation_number }}</div>
            </div>
            @endif
            @if($dv->cash_allocation_date)
            <div class="info-row">
                <div class="info-label">Allocation Date:</div>
                <div class="info-value">{{ \Carbon\Carbon::parse($dv->cash_allocation_date)->format('F d, Y') }}</div>
            </div>
            @endif
            @if($dv->allocated_by)
            <div class="info-row">
                <div class="info-label">Allocated By:</div>
                <div class="info-value">{{ $dv->allocated_by }}</div>
            </div>
            @endif
        </div>
    </div>
    @endif

    @if($dv->orsEntries && $dv->orsEntries->count() > 0)
    <div class="section">
        <div class="section-title">ORS Entries</div>
        <table class="ors-table">
            <thead>
                <tr>
                    <th>ORS Number</th>
                    <th>Fund Source</th>
                    <th>Date Added</th>
                </tr>
            </thead>
            <tbody>
                @foreach($dv->orsEntries as $ors)
                <tr>
                    <td>{{ $ors->ors_number }}</td>
                    <td>{{ $ors->fund_source ?? 'N/A' }}</td>
                    <td>{{ $ors->created_at->format('M d, Y') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    @if($dv->transaction_history && count($dv->transaction_history) > 0)
    <div class="section">
        <div class="section-title">Transaction History</div>
        <table class="history-table">
            <thead>
                <tr>
                    <th style="width: 25%;">Action</th>
                    <th style="width: 15%;">Date</th>
                    <th style="width: 15%;">User</th>
                    <th style="width: 45%;">Details</th>
                </tr>
            </thead>
            <tbody>
                @foreach(collect($dv->transaction_history)->sortByDesc('date') as $entry)
                <tr>
                    <td><strong>{{ $entry['action'] }}</strong></td>
                    <td>{{ \Carbon\Carbon::parse($entry['date'])->format('M d, Y') }}</td>
                    <td>{{ $entry['user'] }}</td>
                    <td>
                        @if(isset($entry['details']) && is_array($entry['details']))
                            @foreach($entry['details'] as $key => $value)
                                @if($value)
                                    <div><strong>{{ ucwords(str_replace('_', ' ', $key)) }}:</strong> 
                                    @if(in_array($key, ['amount', 'net_amount', 'original_amount']) && is_numeric($value))
                                        ₱{{ number_format($value, 2) }}
                                    @else
                                        {{ $value }}
                                    @endif
                                    </div>
                                @endif
                            @endforeach
                        @endif
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    <div class="footer">
        <p><strong>Report Generated:</strong> {{ now()->format('F d, Y g:i A') }}</p>
        <p>DA-CAR Accounting Section Monitoring System</p>
    </div>
</body>
</html>
