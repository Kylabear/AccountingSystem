import { useState } from 'react';

export default function ProcessedDvModal({ dv, isOpen, onClose, onReallocate }) {
    
    // Helper function to calculate duration between two dates
    const calculateDuration = (startDate, endDate) => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24)); // Days
    };

    // Helper function to format duration in human-readable format
    const formatDuration = (days) => {
        if (days === 0) return '0 days';
        if (days === 1) return '1 day';
        return `${days} days`;
    };

    // Helper function to check if status is outside accounting
    const isOutsideAccounting = (action) => {
        const outsideStatuses = [
            'Sent out for approval', 'Sent for Approval', 'For Approval',
            'RTS (Return to Sender)', 'RTS from', 'RTS out',
            'NORSA', 'NORSA Submission', 'NORSA from',
            'Sent to Cashiering', 'Out to Cashiering'
        ];
        return outsideStatuses.some(status => action.includes(status));
    };

    // Calculate comprehensive duration metrics
    const calculateDurationMetrics = () => {
        // Safety check for dv object
        if (!dv) {
            return {
                totalDuration: '0 days',
                insideDuration: '0 days',
                outsideDuration: '0 days',
                currentCycleDuration: '0 days',
                previousCyclesDuration: '0 days',
                hasReallocation: false,
                cycles: []
            };
        }

        const createdDate = new Date(dv.created_at);
        const completedDate = new Date(dv.processed_date || dv.lddap_certified_date || dv.lddap_date || dv.cdj_date || dv.engas_date);
        
        if (!completedDate || !createdDate) {
            return {
                totalDuration: '0 days',
                insideDuration: '0 days',
                outsideDuration: '0 days',
                currentCycleDuration: '0 days',
                previousCyclesDuration: '0 days',
                hasReallocation: false,
                cycles: []
            };
        }

        // Calculate total duration
        const totalDays = Math.max(0, Math.ceil((completedDate - createdDate) / (1000 * 60 * 60 * 24)));

        // Calculate outside accounting duration
        let outsideDays = 0;

        // For RTS duration
        if (dv.rts_out_date && dv.rts_in_date) {
            const rtsOutDate = new Date(dv.rts_out_date);
            const rtsInDate = new Date(dv.rts_in_date);
            outsideDays += Math.max(0, Math.ceil((rtsInDate - rtsOutDate) / (1000 * 60 * 60 * 24)));
        }

        // For NORSA duration
        if (dv.norsa_out_date && dv.norsa_in_date) {
            const norsaOutDate = new Date(dv.norsa_out_date);
            const norsaInDate = new Date(dv.norsa_in_date);
            outsideDays += Math.max(0, Math.ceil((norsaInDate - norsaOutDate) / (1000 * 60 * 60 * 24)));
        }

        // For Approval duration (out for approval)
        if (dv.approval_out_date && dv.approval_in_date) {
            const approvalOutDate = new Date(dv.approval_out_date);
            const approvalInDate = new Date(dv.approval_in_date);
            outsideDays += Math.max(0, Math.ceil((approvalInDate - approvalOutDate) / (1000 * 60 * 60 * 24)));
        }

        // For Cashiering duration (out to cashiering)
        if (dv.cashiering_out_date && dv.cashiering_in_date) {
            const cashieringOutDate = new Date(dv.cashiering_out_date);
            const cashieringInDate = new Date(dv.cashiering_in_date);
            outsideDays += Math.max(0, Math.ceil((cashieringInDate - cashieringOutDate) / (1000 * 60 * 60 * 24)));
        }

        // Inside accounting duration = total - outside
        const insideDays = Math.max(0, totalDays - outsideDays);

        // Find reallocation points for cycles
        const history = dv.transaction_history || [];
        const reallocationPoints = history
            .filter(entry => entry.action.includes('Cash Reallocation'))
            .map(entry => ({
                date: entry.date,
                details: entry.details
            }));

        const hasReallocation = reallocationPoints.length > 0;
        
        // Calculate cycles
        const cycles = [];
        let currentCycleStart = createdDate;
        
        if (hasReallocation) {
            // Process each reallocation cycle
            reallocationPoints.forEach((reallocation, index) => {
                const cycleEnd = reallocation.details?.previous_processed_date || reallocation.date;
                cycles.push({
                    start: currentCycleStart,
                    end: cycleEnd,
                    duration: calculateDuration(currentCycleStart, cycleEnd),
                    type: 'completed'
                });
                currentCycleStart = reallocation.date;
            });
            
            // Current cycle (from last reallocation to completion)
            cycles.push({
                start: currentCycleStart,
                end: completedDate,
                duration: calculateDuration(currentCycleStart, completedDate),
                type: 'current'
            });
        } else {
            // Single cycle
            cycles.push({
                start: createdDate,
                end: completedDate,
                duration: calculateDuration(createdDate, completedDate),
                type: 'single'
            });
        }

        const currentCycleDuration = cycles.filter(c => c.type === 'current')[0]?.duration || 0;
        const previousCyclesDuration = cycles.filter(c => c.type === 'completed').reduce((sum, cycle) => sum + cycle.duration, 0);

        return {
            totalDuration: formatDuration(totalDays),
            insideDuration: formatDuration(insideDays),
            outsideDuration: formatDuration(outsideDays),
            currentCycleDuration: formatDuration(currentCycleDuration),
            previousCyclesDuration: formatDuration(previousCyclesDuration),
            hasReallocation,
            cycles: cycles.map(cycle => ({
                ...cycle,
                duration: formatDuration(cycle.duration),
                startDate: cycle.start,
                endDate: cycle.end
            }))
        };
    };

    const [showPreviousDetails, setShowPreviousDetails] = useState(false);

    // Helper functions for formatting
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatAmount = (amount) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    const getPaymentMethodLabel = (method) => {
        const methodMap = {
            'check': '💳 Physical Check',
            'lddap': '🏦 LDDAP-ADA Channel',
            'payroll': '📋 Payroll Register'
        };
        return methodMap[method] || method;
    };

    const handleReallocate = () => {
        if (confirm('Are you sure you want to reallocate this transaction? It will be moved back to Cash Allocation and all processing data after cash allocation will be cleared.')) {
            onReallocate(dv);
        }
    };

    if (!isOpen || !dv) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center modal-backdrop overflow-y-auto" style={{ zIndex: 50000, paddingTop: '60px', paddingBottom: '20px' }}>
            <div className="bg-white rounded-lg w-full max-w-7xl max-h-screen overflow-hidden m-4 flex flex-col">
                {/* Header */}
                <div className="bg-white border-b px-6 py-4 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800">Processed Disbursement Voucher</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 flex gap-6">
                    {/* Left Panel - Main Content */}
                    <div className="flex-1 space-y-6">
                            {/* Disbursement Voucher Information */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h3 className="text-lg font-semibold mb-4 text-green-800">📋 Disbursement Voucher Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">DV Number</p>
                                        <p className="text-gray-800">{dv.dv_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Date Created</p>
                                        <p className="text-gray-800">{formatDate(dv.created_at)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Payee</p>
                                        <p className="text-gray-800">{dv.payee}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Transaction Type</p>
                                        <p className="text-gray-800">{dv.transaction_type}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Implementing Unit</p>
                                        <p className="text-gray-800">{dv.implementing_unit || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Current Net Amount</p>
                                        <p className="text-gray-800 font-semibold">{formatAmount(dv.net_amount || dv.amount)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Account Number</p>
                                        <p className="text-gray-800">{dv.account_number}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-sm font-medium text-gray-600">Particulars</p>
                                        <p className="text-gray-800">{dv.particulars}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Current Status</p>
                                        <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-500 text-white">
                                            ✨ Processed
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Processing Completed</p>
                                        <p className="text-gray-800">{formatDate(dv.lddap_date || dv.cdj_date || dv.engas_date)}</p>
                                    </div>
                                    {dv.lddap_number && (
                                        <>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">LDDAP Number</p>
                                                <p className="text-gray-800">{dv.lddap_number}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">LDDAP Date</p>
                                                <p className="text-gray-800">{formatDate(dv.lddap_date)}</p>
                                            </div>
                                        </>
                                    )}
                                    {dv.cdj_number && (
                                        <>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">CDJ Number</p>
                                                <p className="text-gray-800">{dv.cdj_number}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">CDJ Date</p>
                                                <p className="text-gray-800">{formatDate(dv.cdj_date)}</p>
                                            </div>
                                        </>
                                    )}
                                    {dv.engas_number && (
                                        <>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">E-NGAS Number</p>
                                                <p className="text-gray-800">{dv.engas_number}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">E-NGAS Date</p>
                                                <p className="text-gray-800">{formatDate(dv.engas_date)}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Progressive Summary - For Review */}
                            <div className="rounded-lg p-4" style={{ backgroundColor: '#D92F2115', border: '1px solid #D92F21' }}>
                                <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: '#D92F21' }}>
                                    <span className="mr-2">📖</span>
                                    For Review
                                </h3>
                                
                                <div className="mb-4 p-2 bg-green-100 border border-green-300 rounded">
                                    <span className="text-sm font-medium text-green-800">
                                        ✅ Review completed on: {formatDate(dv.review_date || dv.created_at)}
                                    </span>
                                </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* RTS Details Box */}
                            <div className="p-4 rounded-lg" style={{ backgroundColor: '#F0878415', border: '1px solid #F08784' }}>
                                <h4 className="font-semibold mb-3" style={{ color: '#F08784' }}>RTS Details</h4>
                                {(dv.rts_out_date || dv.rts_in_date || dv.rts_reason) ? (
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-700">RTS Issued Date:</span>
                                            <p className="text-gray-600">{formatDate(dv.rts_out_date)}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">RTS Returned Date:</span>
                                            <p className="text-gray-600">{formatDate(dv.rts_in_date)}</p>
                                        </div>
                                        {dv.rts_reason && (
                                            <div>
                                                <span className="font-medium text-gray-700">RTS Reason:</span>
                                                <p className="text-gray-600">{dv.rts_reason}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">No RTS was issued for this DV.</p>
                                )}
                            </div>
                            
                            {/* NORSA Details Box */}
                            <div className="p-4 rounded-lg" style={{ backgroundColor: '#FFBAB315', border: '1px solid #FFBAB3' }}>
                                <h4 className="font-semibold mb-3" style={{ color: '#FFBAB3' }}>NORSA Details</h4>
                                {(dv.norsa_out_date || dv.norsa_in_date || dv.norsa_number || dv.norsa_reason) ? (
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-700">NORSA Issued Date:</span>
                                            <p className="text-gray-600">{formatDate(dv.norsa_out_date)}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">NORSA Completed Date:</span>
                                            <p className="text-gray-600">{formatDate(dv.norsa_in_date)}</p>
                                        </div>
                                        {dv.norsa_number && (
                                            <div>
                                                <span className="font-medium text-gray-700">NORSA Number:</span>
                                                <p className="text-gray-600">{dv.norsa_number}</p>
                                            </div>
                                        )}
                                        {dv.norsa_reason && (
                                            <div>
                                                <span className="font-medium text-gray-700">NORSA Details:</span>
                                                <p className="text-gray-600">{dv.norsa_reason}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">No NORSA was issued for this DV.</p>
                                )}
                            </div>
                        </div>
                    </div>

                            {/* Progressive Summary - For Cash Allocation */}
                            <div className="rounded-lg p-4" style={{ backgroundColor: '#F07B1D15', border: '1px solid #F07B1D' }}>
                                <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: '#F07B1D' }}>
                                    <span className="mr-2">💰</span>
                                    For Cash Allocation
                                </h3>
                        
                        <div className="mb-4 p-2 bg-green-100 border border-green-300 rounded">
                            <div className="flex flex-wrap items-center gap-4">
                                        <span className="text-sm font-medium text-green-800">
                                            ✅ Cash allocation completed on: {formatDate(dv.cash_allocation_date)}
                                        </span>
                                        {dv.cash_allocation_number && (
                                            <span className="text-sm font-medium text-green-800">
                                                CA No.: {dv.cash_allocation_number}
                                            </span>
                                        )}
                                        {dv.net_amount && (
                                            <span className="text-sm font-medium text-green-800">
                                                Net Amount: {formatAmount(dv.net_amount)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Cash Allocation RTS Details Box */}
                                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#F0878415', border: '1px solid #F08784' }}>
                                        <h4 className="font-semibold mb-3" style={{ color: '#F08784' }}>RTS Details (Cash Allocation)</h4>
                                        {(dv.ca_rts_out_date || dv.ca_rts_in_date || dv.ca_rts_reason) ? (
                                            <div className="space-y-2 text-sm">
                                                <div>
                                                    <span className="font-medium text-gray-700">RTS Issued Date:</span>
                                                    <p className="text-gray-600">{formatDate(dv.ca_rts_out_date)}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">RTS Returned Date:</span>
                                                    <p className="text-gray-600">{formatDate(dv.ca_rts_in_date)}</p>
                                                </div>
                                                {dv.ca_rts_reason && (
                                                    <div>
                                                        <span className="font-medium text-gray-700">RTS Reason:</span>
                                                        <p className="text-gray-600">{dv.ca_rts_reason}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 italic">No RTS was issued during cash allocation.</p>
                                        )}
                                    </div>
                                    
                                    {/* Cash Allocation NORSA Details Box */}
                                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#FFBAB315', border: '1px solid #FFBAB3' }}>
                                        <h4 className="font-semibold mb-3" style={{ color: '#FFBAB3' }}>NORSA Details (Cash Allocation)</h4>
                                        {(dv.ca_norsa_out_date || dv.ca_norsa_in_date || dv.ca_norsa_number || dv.ca_norsa_reason) ? (
                                            <div className="space-y-2 text-sm">
                                                <div>
                                                    <span className="font-medium text-gray-700">NORSA Issued Date:</span>
                                                    <p className="text-gray-600">{formatDate(dv.ca_norsa_out_date)}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">NORSA Completed Date:</span>
                                                    <p className="text-gray-600">{formatDate(dv.ca_norsa_in_date)}</p>
                                                </div>
                                                {dv.ca_norsa_number && (
                                                    <div>
                                                        <span className="font-medium text-gray-700">NORSA Number:</span>
                                                        <p className="text-gray-600">{dv.ca_norsa_number}</p>
                                                    </div>
                                                )}
                                                {dv.ca_norsa_reason && (
                                                    <div>
                                                        <span className="font-medium text-gray-700">NORSA Details:</span>
                                                        <p className="text-gray-600">{dv.ca_norsa_reason}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 italic">No NORSA was issued during cash allocation.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Progressive Summary - For Box C Certification */}
                            <div className="rounded-lg p-4" style={{ backgroundColor: '#FFF44915', border: '1px solid #FFF449' }}>
                                <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: '#B8860B' }}>
                                    <span className="mr-2">📋</span>
                                    For Box C Certification
                                </h3>
                        
                        <div className="mb-4 p-2 bg-green-100 border border-green-300 rounded">
                            <span className="text-sm font-medium text-green-800">
                                ✅ Box C certified on: {formatDate(dv.box_c_date)}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Box C RTS Details Box */}
                            <div className="p-4 rounded-lg" style={{ backgroundColor: '#F0878415', border: '1px solid #F08784' }}>
                                <h4 className="font-semibold mb-3" style={{ color: '#F08784' }}>RTS Details (Box C)</h4>
                                {(dv.bc_rts_out_date || dv.bc_rts_in_date || dv.bc_rts_reason) ? (
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-700">RTS Issued Date:</span>
                                            <p className="text-gray-600">{formatDate(dv.bc_rts_out_date)}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">RTS Returned Date:</span>
                                            <p className="text-gray-600">{formatDate(dv.bc_rts_in_date)}</p>
                                        </div>
                                        {dv.bc_rts_reason && (
                                            <div>
                                                <span className="font-medium text-gray-700">RTS Reason:</span>
                                                <p className="text-gray-600">{dv.bc_rts_reason}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">No RTS was issued during Box C certification.</p>
                                )}
                            </div>
                            
                            {/* Box C NORSA Details Box */}
                            <div className="p-4 rounded-lg" style={{ backgroundColor: '#FFBAB315', border: '1px solid #FFBAB3' }}>                                        <h4 className="font-semibold mb-3" style={{ color: '#B8860B' }}>NORSA Details (Box C)</h4>
                                {(dv.bc_norsa_out_date || dv.bc_norsa_in_date || dv.bc_norsa_number || dv.bc_norsa_reason) ? (
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-700">NORSA Issued Date:</span>
                                            <p className="text-gray-600">{formatDate(dv.bc_norsa_out_date)}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">NORSA Completed Date:</span>
                                            <p className="text-gray-600">{formatDate(dv.bc_norsa_in_date)}</p>
                                        </div>
                                        {dv.bc_norsa_number && (
                                            <div>
                                                <span className="font-medium text-gray-700">NORSA Number:</span>
                                                <p className="text-gray-600">{dv.bc_norsa_number}</p>
                                            </div>
                                        )}
                                        {dv.bc_norsa_reason && (
                                            <div>
                                                <span className="font-medium text-gray-700">NORSA Details:</span>
                                                <p className="text-gray-600">{dv.bc_norsa_reason}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">No NORSA was issued during Box C certification.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Progressive Summary - For Approval */}
                    <div className="rounded-lg p-4" style={{ backgroundColor: '#6B6B6B15', border: '1px solid #6B6B6B' }}>
                        <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: '#6B6B6B' }}>
                            <span className="mr-2">✅</span>
                            For Approval
                        </h3>
                        
                        <div className="mb-4 p-2 bg-green-100 border border-green-300 rounded">
                            <div className="flex flex-wrap items-center gap-4">
                                <span className="text-sm font-medium text-green-800">
                                    ✅ Approval completed on: {formatDate(dv.approval_in_date)}
                                </span>
                                {dv.approved_by && (
                                    <span className="text-sm font-medium text-green-800">
                                        Approved by: {dv.approved_by}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Approval Details Box */}
                        <div className="p-4 rounded-lg" style={{ backgroundColor: '#6B6B6B15', border: '1px solid #6B6B6B' }}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-gray-700">Sent for Approval:</span>
                                    <p className="text-gray-600">{formatDate(dv.approval_out_date)}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Approval Returned:</span>
                                    <p className="text-gray-600">{formatDate(dv.approval_in_date)}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Approved by:</span>
                                    <p className="text-gray-600">{dv.approved_by || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progressive Summary - For Indexing */}
                    <div className="rounded-lg p-4" style={{ backgroundColor: '#0023F515', border: '1px solid #0023F5' }}>
                        <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: '#0023F5' }}>
                            <span className="mr-2">📇</span>
                            For Indexing
                        </h3>
                        
                        <div className="mb-4 p-2 bg-green-100 border border-green-300 rounded">
                            <span className="text-sm font-medium text-green-800">
                                ✅ Indexing completed on: {formatDate(dv.indexing_date)}
                            </span>
                        </div>

                        {/* Indexing Details Box */}
                        <div className="p-4 rounded-lg" style={{ backgroundColor: '#0023F515', border: '1px solid #0023F5' }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-gray-700">Indexing Date:</span>
                                    <p className="text-gray-600">{formatDate(dv.indexing_date)}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Payment Method:</span>
                                    <p className="text-gray-600">{getPaymentMethodLabel(dv.payment_method)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progressive Summary - For Payment Method */}
                    <div className="rounded-lg p-4" style={{ backgroundColor: '#6B28E315', border: '1px solid #6B28E3' }}>
                        <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: '#6B28E3' }}>
                            <span className="mr-2">💳</span>
                            For Payment Method
                        </h3>
                        
                        <div className="mb-4 p-2 bg-green-100 border border-green-300 rounded">
                            <span className="text-sm font-medium text-green-800">
                                ✅ Payment method set on: {formatDate(dv.payment_method_date || dv.indexing_date)}
                            </span>
                        </div>

                        {/* Payment Method Details Box */}
                        <div className="p-4 rounded-lg" style={{ backgroundColor: '#6B28E315', border: '1px solid #6B28E3' }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-gray-700">Payment Method:</span>
                                    <p className="text-gray-600">{getPaymentMethodLabel(dv.payment_method)}</p>
                                </div>
                                {dv.check_no && (
                                    <div>
                                        <span className="font-medium text-gray-700">Check Number:</span>
                                        <p className="text-gray-600">{dv.check_no}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Progressive Summary - For CDJ Recording */}
                    <div className="rounded-lg p-4" style={{ backgroundColor: '#78431515', border: '1px solid #784315' }}>
                        <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: '#784315' }}>
                            <span className="mr-2">📊</span>
                            For CDJ Recording
                        </h3>
                        
                        {dv.cdj_date ? (
                            <div className="mb-4 p-2 bg-green-100 border border-green-300 rounded">
                                <span className="text-sm font-medium text-green-800">
                                    ✅ CDJ recorded on: {formatDate(dv.cdj_date)}
                                </span>
                            </div>
                        ) : (
                            <div className="mb-4 p-2 rounded" style={{ backgroundColor: '#78431515', border: '1px solid #784315' }}>
                                <span className="text-sm font-medium" style={{ color: '#784315' }}>
                                    ⏳ CDJ recording pending
                                </span>
                            </div>
                        )}

                        {/* CDJ Details Box */}
                        <div className="p-4 rounded-lg" style={{ backgroundColor: '#78431515', border: '1px solid #784315' }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                {dv.cdj_number ? (
                                    <>
                                        <div>
                                            <span className="font-medium text-gray-700">CDJ Number:</span>
                                            <p className="text-gray-600">{dv.cdj_number}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">CDJ Date:</span>
                                            <p className="text-gray-600">{formatDate(dv.cdj_date)}</p>
                                        </div>
                                        {dv.cdj_details && (
                                            <div className="md:col-span-2">
                                                <span className="font-medium text-gray-700">CDJ Details:</span>
                                                <p className="text-gray-600">{dv.cdj_details}</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="md:col-span-2">
                                        <p className="text-gray-500 italic">CDJ recording has not yet been processed for this transaction.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Progressive Summary - For E-NGAS Recording */}
                    <div className="rounded-lg p-4" style={{ backgroundColor: '#EA368015', border: '1px solid #EA3680' }}>
                        <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: '#EA3680' }}>
                            <span className="mr-2">🌐</span>
                            For E-NGAS Recording
                        </h3>
                        
                        {dv.engas_date ? (
                            <div className="mb-4 p-2 bg-green-100 border border-green-300 rounded">
                                <span className="text-sm font-medium text-green-800">
                                    ✅ E-NGAS recorded on: {formatDate(dv.engas_date)}
                                </span>
                            </div>
                        ) : (
                            <div className="mb-4 p-2 rounded" style={{ backgroundColor: '#EA368015', border: '1px solid #EA3680' }}>
                                <span className="text-sm font-medium" style={{ color: '#EA3680' }}>
                                    ⏳ E-NGAS recording pending
                                </span>
                            </div>
                        )}

                        {/* E-NGAS Details Box */}
                        <div className="p-4 rounded-lg" style={{ backgroundColor: '#EA368015', border: '1px solid #EA3680' }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                {dv.engas_number ? (
                                    <>
                                        <div>
                                            <span className="font-medium text-gray-700">E-NGAS Number:</span>
                                            <p className="text-gray-600">{dv.engas_number}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">E-NGAS Date:</span>
                                            <p className="text-gray-600">{formatDate(dv.engas_date)}</p>
                                        </div>
                                        {dv.engas_details && (
                                            <div className="md:col-span-2">
                                                <span className="font-medium text-gray-700">E-NGAS Details:</span>
                                                <p className="text-gray-600">{dv.engas_details}</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="md:col-span-2">
                                        <p className="text-gray-500 italic">E-NGAS recording has not yet been processed for this transaction.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Progressive Summary - For LDDAP Certification */}
                    <div className="rounded-lg p-4" style={{ backgroundColor: '#00000015', border: '1px solid #000000' }}>
                        <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: '#000000' }}>
                            <span className="mr-2">🔒</span>
                            For LDDAP Certification
                        </h3>
                        
                        {dv.lddap_date ? (
                            <div className="mb-4 p-2 bg-green-100 border border-green-300 rounded">
                                <span className="text-sm font-medium text-green-800">
                                    ✅ LDDAP certified on: {formatDate(dv.lddap_date)}
                                </span>
                            </div>
                        ) : (
                            <div className="mb-4 p-2 rounded" style={{ backgroundColor: '#00000015', border: '1px solid #000000' }}>
                                <span className="text-sm font-medium" style={{ color: '#000000' }}>
                                    ⏳ LDDAP certification pending
                                </span>
                            </div>
                        )}

                        {/* LDDAP Details Box */}
                        <div className="p-4 rounded-lg" style={{ backgroundColor: '#00000015', border: '1px solid #000000' }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                {dv.lddap_number ? (
                                    <>
                                        <div>
                                            <span className="font-medium text-gray-700">LDDAP Number:</span>
                                            <p className="text-gray-600">{dv.lddap_number}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">LDDAP Date:</span>
                                            <p className="text-gray-600">{formatDate(dv.lddap_date)}</p>
                                        </div>
                                        {dv.lddap_details && (
                                            <div className="md:col-span-2">
                                                <span className="font-medium text-gray-700">LDDAP Details:</span>
                                                <p className="text-gray-600">{dv.lddap_details}</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="md:col-span-2">
                                        <p className="text-gray-500 italic">LDDAP certification has not yet been processed for this transaction.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Final Processing Summary */}
                    <div className="rounded-lg p-4" style={{ backgroundColor: '#3E8C2615', border: '1px solid #3E8C26' }}>
                        <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: '#3E8C26' }}>
                            <span className="mr-2">🏁</span>
                            Processing Complete
                        </h3>
                        
                        <div className="mb-4 p-2 bg-green-100 border border-green-300 rounded">
                            <span className="text-sm font-medium text-green-800">
                                ✅ All processing completed on: {formatDate(dv.lddap_date || dv.cdj_date || dv.engas_date)}
                            </span>
                        </div>

                        <div className="p-4 rounded-lg" style={{ backgroundColor: '#3E8C2615', border: '1px solid #3E8C26' }}>
                            <div className="text-center">
                                <div className="text-lg font-semibold mb-2" style={{ color: '#3E8C26' }}>
                                    🎉 Transaction Successfully Processed
                                </div>
                                <div className="text-sm" style={{ color: '#3E8C26' }}>
                                    This disbursement voucher has completed all required processing steps and is ready for final disbursement.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Previous Processing Details (if this is a reprocessed DV) */}
                    {(dv.is_reallocated || (dv.transaction_history && dv.transaction_history.some(entry => entry.action.includes('Cash Reallocation')))) && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-yellow-800">🔄 Previous Processing Cycles</h3>
                                <button
                                    onClick={() => setShowPreviousDetails(!showPreviousDetails)}
                                    className="text-sm text-yellow-600 hover:text-yellow-800 flex items-center font-medium"
                                >
                                    {showPreviousDetails ? (
                                        <>
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                            Hide Previous Details
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                            View Previous Details
                                        </>
                                    )}
                                </button>
                            </div>
                            
                            {!showPreviousDetails && (
                                <div className="text-sm text-yellow-700">
                                    <p>This transaction has been reprocessed after cash reallocation. Click above to view previous cycle details.</p>
                                </div>
                            )}
                            
                            {showPreviousDetails && (
                                <div className="space-y-4">
                                    <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                                        <h4 className="font-semibold text-yellow-800 mb-2">ℹ️ Reallocation Information</h4>
                                        <div className="text-sm text-yellow-700 space-y-1">
                                            {dv.transaction_history && dv.transaction_history
                                                .filter(entry => entry.action.includes('Cash Reallocation'))
                                                .map((entry, index) => (
                                                    <div key={index} className="border-l-4 border-yellow-400 pl-3">
                                                        <p><strong>Date:</strong> {formatDate(entry.date)}</p>
                                                        <p><strong>Action:</strong> {entry.action}</p>
                                                        <p><strong>User:</strong> {entry.user}</p>
                                                        {entry.details && entry.details.reason && (
                                                            <p><strong>Reason:</strong> {entry.details.reason}</p>
                                                        )}
                                                        {entry.details && entry.details.previous_processed_date && (
                                                            <p><strong>Previous Processing Date:</strong> {formatDate(entry.details.previous_processed_date)}</p>
                                                        )}
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                    
                                    <div className="text-sm text-yellow-700">
                                        <p><strong>Note:</strong> Previous cycle data has been preserved in the complete transaction history below. The current cycle shows the latest processing details after reallocation.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="border-t pt-6">
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="text-lg font-semibold text-orange-800 mb-2">🔄 Cash Reallocation</h4>
                                    <p className="text-sm text-orange-700 mb-4">
                                        If this transaction was returned by cashiering, you can reallocate cash to restart processing 
                                        from the Cash Allocation step. This will clear all processing data after cash allocation but 
                                        preserve the transaction history for audit purposes.
                                    </p>
                                </div>
                                <button
                                    onClick={handleReallocate}
                                    className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 flex items-center font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Reallocate Cash
                                </button>
                            </div>
                        </div>
                    </div>
                    </div>

                    {/* Right Panel - Processing Duration & Transaction History */}
                    <div className="w-80 space-y-4">
                        {/* Duration Processed Container */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <h3 className="text-base font-semibold mb-3 text-blue-800">⏱️ Processing Duration</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-blue-700">Started</span>
                                    <span className="text-xs text-blue-800">{formatDate(dv.created_at)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-blue-700">Completed</span>
                                    <span className="text-xs text-blue-800">{formatDate(dv.lddap_date || dv.cdj_date || dv.engas_date)}</span>
                                </div>
                                
                                {/* Duration Breakdown */}
                                {(() => {
                                    const metrics = calculateDurationMetrics();
                                    return (
                                        <div className="border-t border-blue-200 pt-2 space-y-2">
                                            {/* Inside Accounting Duration */}
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-medium text-green-700">📊 Inside Accounting</span>
                                                <span className="text-xs font-semibold text-green-800">{metrics.insideDuration}</span>
                                            </div>
                                            
                                            {/* Outside Accounting Duration */}
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-medium text-orange-700">🌐 Outside Accounting</span>
                                                <span className="text-xs font-semibold text-orange-800">{metrics.outsideDuration}</span>
                                            </div>
                                            
                                            {/* Total Duration */}
                                            <div className="flex justify-between items-center border-t border-blue-200 pt-2">
                                                <span className="text-xs font-semibold text-blue-700">⏱️ Total Duration</span>
                                                <span className="text-xs font-semibold text-blue-800">{metrics.totalDuration}</span>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Transaction History */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <h3 className="text-base font-semibold mb-3 text-gray-950">📜 Complete Transaction History</h3>
                            <div className="space-y-2 max-h-[1100px] overflow-y-auto custom-scrollbar">
                                {dv.transaction_history && dv.transaction_history.length > 0 ? (
                                    dv.transaction_history.map((entry, index) => (
                                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="font-semibold text-gray-950 text-xs">{entry.action}</div>
                                                    <div className="text-xs text-blue-600 font-medium">by {entry.user}</div>
                                                    {entry.details && (
                                                        <div className="text-xs text-gray-600 mt-1 bg-gray-50 p-1 rounded">
                                                            {typeof entry.details === 'object' ? 
                                                                Object.entries(entry.details).map(([key, value]) => (
                                                                    value && <div key={key} className="mb-1"><span className="font-medium">{key.replace(/_/g, ' ')}:</span> {value}</div>
                                                                )) : 
                                                                entry.details
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 ml-2 bg-gray-100 px-2 py-1 rounded">
                                                    {formatDate(entry.date)}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-xs space-y-1">
                                        <div className="flex justify-between items-center py-2 px-2 bg-white border border-gray-200 rounded-lg">
                                            <span className="font-medium text-gray-700">📝 DV Created</span>
                                            <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs">{formatDate(dv.created_at)}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 px-2 bg-white border border-gray-200 rounded-lg">
                                            <span className="font-medium text-gray-700">🔍 Review Completed</span>
                                            <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs">{formatDate(dv.review_date)}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 px-2 bg-white border border-gray-200 rounded-lg">
                                            <span className="font-medium text-gray-700">💰 Cash Allocated</span>
                                            <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs">{formatDate(dv.cash_allocation_date)}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 px-2 bg-white border border-gray-200 rounded-lg">
                                            <span className="font-medium text-gray-700">📋 Box C Certified</span>
                                            <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs">{formatDate(dv.box_c_date)}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 px-2 bg-white border border-gray-200 rounded-lg">
                                            <span className="font-medium text-gray-700">✅ Approved</span>
                                            <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs">{formatDate(dv.approval_in_date)}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 px-2 bg-white border border-gray-200 rounded-lg">
                                            <span className="font-medium text-gray-700">📇 Indexed</span>
                                            <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs">{formatDate(dv.indexing_date)}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 px-2 bg-white border border-gray-200 rounded-lg">
                                            <span className="font-medium text-gray-700">💳 Payment Method Set</span>
                                            <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs">{formatDate(dv.payment_method_date)}</span>
                                        </div>
                                        {dv.engas_date && (
                                            <div className="flex justify-between items-center py-2 px-2 bg-white border border-gray-200 rounded-lg">
                                                <span className="font-medium text-gray-700">🌐 E-NGAS Recorded</span>
                                                <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs">{formatDate(dv.engas_date)}</span>
                                            </div>
                                        )}
                                        {dv.cdj_date && (
                                            <div className="flex justify-between items-center py-2 px-2 bg-white border border-gray-200 rounded-lg">
                                                <span className="font-medium text-gray-700">📊 CDJ Recorded</span>
                                                <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs">{formatDate(dv.cdj_date)}</span>
                                            </div>
                                        )}
                                        {dv.lddap_date && (
                                            <div className="flex justify-between items-center py-2 px-2 bg-white border border-gray-200 rounded-lg">
                                                <span className="font-medium text-gray-700">🔒 LDDAP Certified</span>
                                                <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs">{formatDate(dv.lddap_date)}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f8fafc;
                    border-radius: 4px;
                    border: 1px solid #e2e8f0;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, #94a3b8, #64748b);
                    border-radius: 4px;
                    border: 1px solid #f8fafc;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(180deg, #64748b, #475569);
                }
                
                .custom-scrollbar::-webkit-scrollbar-corner {
                    background: #f8fafc;
                }
            `}</style>
        </div>
    );
}
