import { useState, useEffect } from 'react';

export default function PaymentMethodModal({ dv, isOpen, onClose, onSubmit }) {
    const [paymentMethod, setPaymentMethod] = useState('');
    const [lddapNumber, setLddapNumber] = useState('');
    const [errors, setErrors] = useState({});

    // LDDAP number validation and formatting
    const handleLddapNumberChange = (e) => {
        let value = e.target.value;
        
        // Remove any non-digit characters
        let digitsOnly = value.replace(/[^0-9]/g, '');
        
        // Limit to maximum 11 digits (3 + 2 + 3 + 4)
        if (digitsOnly.length > 12) {
            digitsOnly = digitsOnly.slice(0, 12);
        }
        
        // Auto-format based on length
        let formattedValue = '';
        
        if (digitsOnly.length <= 3) {
            // Just the first part
            formattedValue = digitsOnly;
        } else if (digitsOnly.length <= 5) {
            // First + second part
            formattedValue = digitsOnly.slice(0, 3) + '-' + digitsOnly.slice(3);
        } else if (digitsOnly.length <= 8) {
            // First + second + third part
            formattedValue = digitsOnly.slice(0, 3) + '-' + digitsOnly.slice(3, 5) + '-' + digitsOnly.slice(5);
        } else {
            // Complete format
            formattedValue = digitsOnly.slice(0, 3) + '-' + digitsOnly.slice(3, 5) + '-' + digitsOnly.slice(5, 8) + '-' + digitsOnly.slice(8, 12);
        }
        
        setLddapNumber(formattedValue);
        
        // Clear error when user starts typing
        if (errors.lddapNumber) {
            setErrors(prev => ({ ...prev, lddapNumber: '' }));
        }
    };

    const validateLddapNumber = (value) => {
        if (!value) return '';
        
        // Pattern: NNN-MM-SRN-YYYY (where NNN=3 digits, MM=2 digits, SRN=3 digits, YYYY=4 digits)
        const pattern = /^(\d{3})-(\d{2})-(\d{3})-(\d{4})$/;
        const match = value.match(pattern);
        
        if (!match) {
            return 'Format must be NNN-MM-SRN-YYYY (e.g., 101-06-456-2025)';
        }
        
        const [, firstPart, secondPart, thirdPart, yearStr] = match;
        const year = parseInt(yearStr);
        
        if (year < 2020 || year > 2030) {
            return 'Year must be between 2020 and 2030';
        }
        
        return '';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate LDDAP number if LDDAP payment method is selected
        if (paymentMethod === 'lddap') {
            const lddapError = validateLddapNumber(lddapNumber);
            if (lddapError) {
                setErrors(prev => ({ ...prev, lddapNumber: lddapError }));
                return;
            }
        }
        
        const data = {
            payment_method: paymentMethod
        };
        
        if (paymentMethod === 'lddap') {
            data.lddap_number = lddapNumber;
        }
        
        onSubmit(data);
    };

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

    if (!isOpen || !dv) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center modal-backdrop overflow-y-auto" style={{ zIndex: 50000, paddingTop: '80px', paddingBottom: '20px' }}>
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-screen overflow-hidden m-4 flex flex-col">
                {/* Header */}
                <div className="bg-white border-b px-6 py-4 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800">Disbursement Voucher - Payment Method</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    {/* Progressive Summary - Disbursement Voucher Information */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-4 text-green-800">📋 Disbursement Voucher Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600">DV Number</p>
                                <p className="text-gray-800">{dv.dv_number || <span className='text-gray-400 italic'>Not set</span>}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Date Created</p>
                                <p className="text-gray-800">{dv.created_at ? formatDate(dv.created_at) : <span className='text-gray-400 italic'>Not set</span>}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Payee</p>
                                <p className="text-gray-800">{dv.payee || <span className='text-gray-400 italic'>Not set</span>}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Transaction Type</p>
                                <p className="text-gray-800">{dv.transaction_type || <span className='text-gray-400 italic'>Not set</span>}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Original Amount</p>
                                <p className="text-gray-800">{dv.amount ? formatAmount(dv.amount) : <span className='text-gray-400 italic'>Not set</span>}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Account Number</p>
                                <p className="text-gray-800">{dv.account_number || <span className='text-gray-400 italic'>Not set</span>}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Particulars</p>
                                <p className="text-gray-800">{dv.particulars || <span className='text-gray-400 italic'>Not set</span>}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Current Status</p>
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-payment text-white">
                                    For Payment
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Progressive Summary - For Review */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-4 text-red-800">📝 For Review</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-red-600">Review Completed</p>
                                <p className="text-red-800">✅ {dv.review_date ? formatDate(dv.review_date) : <span className='text-gray-400 italic'>Not set</span>}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-red-600">Status</p>
                                <p className="text-red-800">Review Done</p>
                            </div>
                        </div>
                    </div>

                    {/* Progressive Summary - For Cash Allocation */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-4 text-orange-800">💰 For Cash Allocation</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-orange-600">Allocation Completed</p>
                                <p className="text-orange-800">✅ {dv.cash_allocation_date ? formatDate(dv.cash_allocation_date) : <span className='text-gray-400 italic'>Not set</span>}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-orange-600">Status</p>
                                <p className="text-orange-800">Cash Allocated</p>
                            </div>
                        </div>
                    </div>

                    {/* Progressive Summary - For Box C Certification */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-4 text-yellow-800">📋 For Box C Certification</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-yellow-600">Certification Completed</p>
                                <p className="text-yellow-800">✅ {dv.box_c_date ? formatDate(dv.box_c_date) : <span className='text-gray-400 italic'>Not set</span>}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-yellow-600">Status</p>
                                <p className="text-yellow-800">Box C Certified</p>
                            </div>
                        </div>
                    </div>

                    {/* Progressive Summary - For Approval */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">✅ For Approval</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Approval Completed</p>
                                <p className="text-gray-800">✅ {dv.approval_in_date ? formatDate(dv.approval_in_date) : <span className='text-gray-400 italic'>Not set</span>}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Status</p>
                                <p className="text-gray-800">Approved</p>
                            </div>
                        </div>
                    </div>

                    {/* Progressive Summary - For Indexing */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-4 text-blue-800">📋 For Indexing</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-blue-600">Indexing Completed</p>
                                <p className="text-blue-800">✅ {dv.indexing_date ? formatDate(dv.indexing_date) : <span className='text-gray-400 italic'>Not set</span>}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-blue-600">Status</p>
                                <p className="text-blue-800">Indexed</p>
                            </div>
                        </div>
                    </div>

                    {/* Progressive Summary - For Review */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-4 text-red-800">📝 For Review</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-red-600">Review Completed</p>
                                <p className="text-red-800">✅ {formatDate(dv.review_date || dv.created_at)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-red-600">Status</p>
                                <p className="text-red-800">Review Done</p>
                            </div>
                        </div>

                        {/* RTS/NORSA Details Side by Side */}
                        {(dv.rts_reason || dv.norsa_number) && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* RTS Details */}
                                {dv.rts_reason && (
                                    <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                                        <h4 className="font-semibold text-red-800 mb-2">🔄 RTS Details</h4>
                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-xs font-medium text-red-600">RTS Date</p>
                                                <p className="text-sm text-red-800">{formatDate(dv.rts_date)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-red-600">RTS Reason</p>
                                                <p className="text-sm text-red-800">{dv.rts_reason}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-red-600">RTS In Date</p>
                                                <p className="text-sm text-red-800">{formatDate(dv.rts_in_date)}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* NORSA Details */}
                                {dv.norsa_number && (
                                    <div className="bg-purple-100 border border-purple-300 rounded-lg p-3">
                                        <h4 className="font-semibold text-purple-800 mb-2">📝 NORSA Details</h4>
                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-xs font-medium text-purple-600">NORSA Number</p>
                                                <p className="text-sm text-purple-800">{dv.norsa_number}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-purple-600">NORSA Date</p>
                                                <p className="text-sm text-purple-800">{formatDate(dv.norsa_date)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-purple-600">NORSA In Date</p>
                                                <p className="text-sm text-purple-800">{formatDate(dv.norsa_in_date)}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Progressive Summary - For Cash Allocation */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-4 text-orange-800">💰 For Cash Allocation</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-orange-600">Allocation Completed</p>
                                <p className="text-orange-800">✅ {formatDate(dv.cash_allocation_date)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-orange-600">Status</p>
                                <p className="text-orange-800">Cash Allocated</p>
                            </div>
                        </div>

                        {/* Cash Allocation Details */}
                        {(dv.cash_allocation_date || dv.cash_allocation_number || dv.net_amount) && (
                            <div className="mt-4 bg-orange-100 border border-orange-300 rounded-lg p-3">
                                <h4 className="font-semibold text-orange-800 mb-3">Cash Allocation Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <p className="text-xs font-medium text-orange-600">Allocation Date</p>
                                        <p className="text-sm text-orange-800">{formatDate(dv.cash_allocation_date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-orange-600">Allocation Number</p>
                                        <p className="text-sm text-orange-800">{dv.cash_allocation_number || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-orange-600">Net Amount</p>
                                        <p className="text-sm text-orange-800 font-semibold">{formatAmount(dv.net_amount)}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Progressive Summary - For Box C Certification */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-4 text-yellow-800">📋 For Box C Certification</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-yellow-600">Certification Completed</p>
                                <p className="text-yellow-800">✅ {formatDate(dv.box_c_date)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-yellow-600">Status</p>
                                <p className="text-yellow-800">Box C Certified</p>
                            </div>
                        </div>

                        {/* Box C RTS/NORSA Details Side by Side */}
                        {(dv.box_c_rts_reason || dv.box_c_norsa_number) && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Box C RTS Details */}
                                {dv.box_c_rts_reason && (
                                    <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                                        <h4 className="font-semibold text-red-800 mb-2">🔄 Box C RTS Details</h4>
                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-xs font-medium text-red-600">RTS Date</p>
                                                <p className="text-sm text-red-800">{formatDate(dv.box_c_rts_date)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-red-600">RTS Reason</p>
                                                <p className="text-sm text-red-800">{dv.box_c_rts_reason}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Box C NORSA Details */}
                                {dv.box_c_norsa_number && (
                                    <div className="bg-purple-100 border border-purple-300 rounded-lg p-3">
                                        <h4 className="font-semibold text-purple-800 mb-2">📝 Box C NORSA Details</h4>
                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-xs font-medium text-purple-600">NORSA Number</p>
                                                <p className="text-sm text-purple-800">{dv.box_c_norsa_number}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-purple-600">NORSA Date</p>
                                                <p className="text-sm text-purple-800">{formatDate(dv.box_c_norsa_date)}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Progressive Summary - For Approval */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">✅ For Approval</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Approval Completed</p>
                                <p className="text-gray-800">✅ {formatDate(dv.approval_in_date)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Status</p>
                                <p className="text-gray-800">Approved</p>
                            </div>
                        </div>

                        {/* Approval Details */}
                        {(dv.approval_out_date || dv.approval_in_date) && (
                            <div className="mt-4 bg-gray-100 border border-gray-300 rounded-lg p-3">
                                <h4 className="font-semibold text-gray-800 mb-3">Approval Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-xs font-medium text-gray-600">Sent for Approval</p>
                                        <p className="text-sm text-gray-800">{formatDate(dv.approval_out_date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-600">Approval Returned</p>
                                        <p className="text-sm text-gray-800">{formatDate(dv.approval_in_date)}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Progressive Summary - For Indexing */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-4 text-blue-800">📋 For Indexing</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-blue-600">Indexing Completed</p>
                                <p className="text-blue-800">✅ {formatDate(dv.indexing_date)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-blue-600">Status</p>
                                <p className="text-blue-800">Indexed</p>
                            </div>
                        </div>

                        {/* Indexing Details */}
                        {dv.indexing_date && (
                            <div className="mt-4 bg-blue-100 border border-blue-300 rounded-lg p-3">
                                <h4 className="font-semibold text-blue-800 mb-3">Indexing Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-xs font-medium text-blue-600">Indexing Date</p>
                                        <p className="text-sm text-blue-800">{formatDate(dv.indexing_date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-blue-600">Processing Status</p>
                                        <p className="text-sm text-blue-800">Complete</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Payment Method Actions */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4">💳 Payment Method Selection</h3>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="bg-payment-light border border-payment rounded-lg p-4">
                                <h4 className="font-semibold text-payment-dark mb-3">Select Payment Method</h4>
                                <div className="space-y-3 mb-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="check"
                                            checked={paymentMethod === 'check'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="mr-3"
                                        />
                                        <span className="text-sm font-medium">💳 Physical Check</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="lddap"
                                            checked={paymentMethod === 'lddap'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="mr-3"
                                        />
                                        <span className="text-sm font-medium">🏦 LDDAP-ADA Channel</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="payroll"
                                            checked={paymentMethod === 'payroll'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="mr-3"
                                        />
                                        <span className="text-sm font-medium">📋 Payroll Register</span>
                                    </label>
                                </div>

                                {paymentMethod === 'lddap' && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            LDDAP Number
                                        </label>
                                        <input
                                            type="text"
                                            value={lddapNumber}
                                            onChange={handleLddapNumberChange}
                                            className={`w-full border rounded-lg p-2 focus:outline-none ${
                                                errors.lddapNumber 
                                                    ? 'border-red-500 focus:border-red-500' 
                                                    : 'border-gray-300 focus:border-payment'
                                            }`}
                                            placeholder="NNN-MM-SRN-YYYY (e.g., 101-06-456-2025)"
                                            maxLength={15}
                                            required
                                        />
                                        {errors.lddapNumber && (
                                            <p className="text-red-500 text-xs mt-1">{errors.lddapNumber}</p>
                                        )}
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={!paymentMethod}
                                        className="bg-payment text-white px-4 py-2 rounded-lg hover:bg-payment-dark disabled:opacity-50 transition-colors"
                                    >
                                        💳 Set Payment Method
                                    </button>
                                    {paymentMethod && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (confirm('Send this DV out to cashiering?')) {
                                                        onSubmit({
                                                            payment_method: paymentMethod,
                                                            lddap_number: paymentMethod === 'lddap' ? lddapNumber : undefined,
                                                            action: 'out_to_cashiering'
                                                        });
                                                    }
                                                }}
                                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                            >
                                                📤 Out to Cashiering
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (confirm('Send this DV for E-NGAS recording?')) {
                                                        onSubmit({
                                                            payment_method: paymentMethod,
                                                            lddap_number: paymentMethod === 'lddap' ? lddapNumber : undefined,
                                                            action: 'for_engas'
                                                        });
                                                    }
                                                }}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                🌐 For E-NGAS
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
