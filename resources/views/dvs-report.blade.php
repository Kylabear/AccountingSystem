<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Processed DVs Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            margin: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2563eb;
            margin-bottom: 10px;
        }
        .summary {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .summary h3 {
            margin-top: 0;
            color: #374151;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        .amount {
            text-align: right;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>PROCESSED DISBURSEMENT VOUCHERS REPORT</h1>
        <p>Department of Agriculture - Cordillera Administrative Region</p>
        <p>Generated on: {{ now()->format('F j, Y g:i A') }}</p>
    </div>

    <div class="summary">
        <h3>Report Summary</h3>
        <p><strong>Total DVs:</strong> {{ $dvs->count() }}</p>
        <p><strong>Total Original Amount:</strong> ₱{{ number_format($dvs->sum('amount'), 2) }}</p>
        <p><strong>Total Net Amount:</strong> ₱{{ number_format($dvs->whereNotNull('net_amount')->sum('net_amount'), 2) }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>DV Number</th>
                <th>Payee</th>
                <th>Transaction Type</th>
                <th>Implementing Unit</th>
                <th>Original Amount</th>
                <th>Net Amount</th>
                <th>Cash Allocation Date</th>
                <th>Processed Date</th>
            </tr>
        </thead>
        <tbody>
            @foreach($dvs as $dv)
            <tr>
                <td>{{ $dv->dv_number }}</td>
                <td>{{ $dv->payee }}</td>
                <td>{{ $dv->transaction_type }}</td>
                <td>{{ $dv->implementing_unit ?? 'N/A' }}</td>
                <td class="amount">₱{{ number_format($dv->amount, 2) }}</td>
                <td class="amount">{{ $dv->net_amount ? '₱' . number_format($dv->net_amount, 2) : 'N/A' }}</td>
                <td>{{ $dv->cash_allocation_date ? $dv->cash_allocation_date->format('Y-m-d') : 'N/A' }}</td>
                <td>{{ $dv->processed_date ? $dv->processed_date->format('Y-m-d') : 'N/A' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>This report was generated automatically by the DA-CAR Accounting System</p>
        <p>Page {{ $loop->index ?? 1 }} of {{ ceil($dvs->count() / 25) }}</p>
    </div>
</body>
</html>
