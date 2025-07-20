import { useState, useEffect } from 'react';

export default function LddapModal({ dv, isOpen, onClose, onSubmit }) {
    const [lddapDate, setLddapDate] = useState(new Date().toISOString().split('T')[0]);
    const [formData, setFormData] = useState({
        lddap_number: '',
        certification_date: ''
    });
    const [errors, setErrors] = useState({});

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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit({
                lddap_date: lddapDate,
                lddap_number: formData.lddap_number
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        if (name === 'lddap_number') {
            // Remove all non-digits
            let numbers = value.replace(/\D/g, '');
            // Format as NNN-MM-SRNBR-NNNNN
            let formattedValue = '';
            
            if (numbers.length > 0) {
                // First 3 digits (NNN)
                formattedValue = numbers.slice(0, 3);
                if (numbers.length > 3) {
                    // Next 2 digits (MM)
                    formattedValue += '-' + numbers.slice(3, 5);
                    if (numbers.length > 5) {
                        // Next digits (SRNBR)
                        formattedValue += '-' + numbers.slice(5, 10);
                        if (numbers.length > 10) {
                            // Last 5 digits (NNNNN)
                            formattedValue += '-' + numbers.slice(10, 15);
                        }
                    }
                }
            }

            setFormData(prev => ({
                ...prev,
                [name]: formattedValue
            }));
            return;
        }

        // For other fields
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Validate LDDAP number format (NNN-MM-SRNBR-NNNNN)
        // Note: This is a more flexible validation since incomplete numbers are allowed
        const lddapPattern = /^\d{3}-\d{2}(-\d{1,5})?(-\d{1,5})?$/;
        if (!formData.lddap_number) {
            newErrors.lddap_number = 'LDDAP number is required';
        } else if (!lddapPattern.test(formData.lddap_number)) {
            newErrors.lddap_number = 'Must follow format: NNN-MM-SRNBR-NNNNN';
        } else {
            // Additional validation for month if it exists
            const parts = formData.lddap_number.split('-');
            if (parts.length >= 2) {
                const month = parseInt(parts[1]);
                if (month < 1 || month > 12) {
                    newErrors.lddap_number = 'Invalid month (must be 01-12)';
                }
            }
        }

        // Other validations - check lddapDate instead of formData.certification_date
        if (!lddapDate) {
            newErrors.lddap_date = 'LDDAP certification date is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    if (!isOpen || !dv) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center modal-backdrop overflow-y-auto" style={{ zIndex: 50000, paddingTop: '80px', paddingBottom: '20px' }}>
            <div className="bg-white rounded-lg w-full max-w-6xl max-h-screen overflow-hidden m-4 flex flex-col">
                {/* Full-width Header */}
                <div className="bg-black text-white px-6 py-4 rounded-t-lg flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold">Disbursement Voucher - LDDAP Certification</h2>
                    <button onClick={onClose} className="text-white hover:text-gray-200">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Main content and transaction history side by side */}
                <div className="flex flex-col md:flex-row w-full flex-1 overflow-hidden">
                    {/* Main Content (left) */}
                    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                    {/* Progressive Summary - Disbursement Voucher Information */}
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
                                <p className="text-sm font-medium text-gray-600">Original Amount</p>
                                <p className="text-gray-800">{formatAmount(dv.amount)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Account Number</p>
                                <p className="text-gray-800">{dv.account_number}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Particulars</p>
                                <p className="text-gray-800">{dv.particulars}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Current Status</p>
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-lddap text-white">
                                    For LDDAP
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

                    {/* Progressive Summary - For Mode of Payment */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-4 text-purple-800">💳 For Mode of Payment</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-purple-600">Payment Method Set</p>
                                <p className="text-purple-800">✅ {formatDate(dv.payment_method_date)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-purple-600">Status</p>
                                <p className="text-purple-800">Payment Method Selected</p>
                            </div>
                        </div>

                        {/* Payment Method Details */}
                        {dv.payment_method && (
                            <div className="mt-4 bg-purple-100 border border-purple-300 rounded-lg p-3">
                                <h4 className="font-semibold text-purple-800 mb-3">Payment Method Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-xs font-medium text-purple-600">Payment Method</p>
                                        <p className="text-sm text-purple-800 font-semibold">{getPaymentMethodLabel(dv.payment_method)}</p>
                                    </div>
                                    {dv.lddap_number && (
                                        <div>
                                            <p className="text-xs font-medium text-purple-600">LDDAP Number</p>
                                            <p className="text-sm text-purple-800">{dv.lddap_number}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Progressive Summary - For E-NGAS Recording */}
                    <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-4 text-pink-800">🌐 For E-NGAS Recording</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-pink-600">E-NGAS Recorded</p>
                                <p className="text-pink-800">✅ {formatDate(dv.engas_date)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-pink-600">Status</p>
                                <p className="text-pink-800">E-NGAS Complete</p>
                            </div>
                        </div>

                        {/* E-NGAS Details */}
                        {(dv.engas_number || dv.engas_date) && (
                            <div className="mt-4 bg-pink-100 border border-pink-300 rounded-lg p-3">
                                <h4 className="font-semibold text-pink-800 mb-3">E-NGAS Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-xs font-medium text-pink-600">E-NGAS Number</p>
                                        <p className="text-sm text-pink-800 font-semibold">{dv.engas_number || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-pink-600">Recording Date</p>
                                        <p className="text-sm text-pink-800">{formatDate(dv.engas_date)}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Progressive Summary - For CDJ Recording */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-4 text-amber-800">📊 For CDJ Recording</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-amber-600">CDJ Recorded</p>
                                <p className="text-amber-800">✅ {formatDate(dv.cdj_date)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-amber-600">Status</p>
                                <p className="text-amber-800">CDJ Complete</p>
                            </div>
                        </div>

                        {/* CDJ Details */}
                        {dv.cdj_date && (
                            <div className="mt-4 bg-amber-100 border border-amber-300 rounded-lg p-3">
                                <h4 className="font-semibold text-amber-800 mb-3">CDJ Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-xs font-medium text-amber-600">Recording Date</p>
                                        <p className="text-sm text-amber-800">{formatDate(dv.cdj_date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-amber-600">Processing Status</p>
                                        <p className="text-sm text-amber-800">Complete</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* LDDAP Certification Actions */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4">🏛️ LDDAP Certification</h3>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="bg-lddap-light border border-lddap rounded-lg p-4">
                                <h4 className="font-semibold text-lddap-dark mb-3">Certify LDDAP Information</h4>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Certification Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={lddapDate}
                                            onChange={(e) => setLddapDate(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg p-2 focus:border-lddap focus:outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            LDDAP Number <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="lddap_number"
                                            value={formData.lddap_number}
                                            onChange={handleInputChange}
                                            className={`w-full border rounded-lg p-2 focus:outline-none ${
                                                errors.lddap_number ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="NNN-MM-SRNBR-NNNNN"
                                            required
                                        />
                                        {errors.lddap_number && (
                                            <p className="text-red-500 text-xs mt-1">{errors.lddap_number}</p>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            className="bg-lddap text-white px-4 py-2 rounded-lg hover:bg-lddap-dark transition-colors"
                                        >
                                            🏛️ Certify LDDAP
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                    
                    {/* Transaction History Panel (right) */}
                    <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-gray-200 bg-gray-50 rounded-b-lg md:rounded-b-none md:rounded-tr-lg md:rounded-br-lg flex-shrink-0 p-6 pt-4 md:pt-6 overflow-y-auto" style={{ minWidth: '320px' }}>
                        <div className="mb-4 flex items-center justify-between">
                            <span className="font-semibold text-gray-800">Transaction History</span>
                            {dv.transaction_history && (
                                <span className="text-xs text-gray-500">{dv.transaction_history.length} entr{dv.transaction_history.length === 1 ? 'y' : 'ies'}</span>
                            )}
                        </div>
                        <div className="space-y-3">
                            {dv.transaction_history && dv.transaction_history.length > 0 ? (
                                dv.transaction_history.map((item, idx) => (
                                    <div key={idx} className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                                        <div className="flex items-start gap-2">
                                            <span className="inline-block w-2 h-2 rounded-full bg-black mt-2 flex-shrink-0"></span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-semibold text-gray-800 text-sm">
                                                        {item.type || item.action || item.status || 'Transaction'}
                                                    </span>
                                                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                                        {item.date ? new Date(item.date).toLocaleDateString() : 
                                                         item.created_at ? new Date(item.created_at).toLocaleDateString() : 
                                                         item.updated_at ? new Date(item.updated_at).toLocaleDateString() : ''}
                                                    </span>
                                                </div>
                                                
                                                {(item.by || item.user || item.created_by) && (
                                                    <div className="text-xs text-gray-500 mb-2">
                                                        by {item.by || item.user || item.created_by}
                                                    </div>
                                                )}
                                                
                                                <div className="text-xs text-gray-700 space-y-1">
                                                    {/* Show any available amount */}
                                                    {(item.amount !== undefined && item.amount !== null && item.amount !== '' && !isNaN(parseFloat(item.amount))) && (
                                                        <div className="font-medium">Amount: ₱{parseFloat(item.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                    )}
                                                    
                                                    {/* Show net amount if different from amount */}
                                                    {(item.net_amount !== undefined && item.net_amount !== null && item.net_amount !== '' && !isNaN(parseFloat(item.net_amount)) && parseFloat(item.net_amount) !== parseFloat(item.amount || 0)) && (
                                                        <div className="font-medium text-green-600">Net Amount: ₱{parseFloat(item.net_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                    )}
                                                    
                                                    {/* DV Number */}
                                                    {(item.dv_number || item.document_number) && (
                                                        <div>DV: {item.dv_number || item.document_number}</div>
                                                    )}
                                                    
                                                    {/* LDDAP specific fields */}
                                                    {(item.lddap_number || item.lddap_date) && (
                                                        <div>LDDAP: {item.lddap_number || (item.lddap_date ? new Date(item.lddap_date).toLocaleDateString() : '')}</div>
                                                    )}
                                                    
                                                    {/* CDJ specific fields */}
                                                    {(item.cdj_number || item.cdj_date) && (
                                                        <div>CDJ: {item.cdj_number || (item.cdj_date ? new Date(item.cdj_date).toLocaleDateString() : '')}</div>
                                                    )}
                                                    
                                                    {/* E-NGAS specific fields */}
                                                    {(item.engas_number || item.e_ngas_number) && (
                                                        <div>E-NGAS: {item.engas_number || item.e_ngas_number}</div>
                                                    )}
                                                    
                                                    {/* Description or notes */}
                                                    {(item.description || item.notes || item.remarks) && (
                                                        <div className="italic">{item.description || item.notes || item.remarks}</div>
                                                    )}
                                                    
                                                    {/* Status */}
                                                    {item.status && (
                                                        <div>Status: <span className="font-medium">{item.status}</span></div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-xs text-gray-400 italic">No transaction history available.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
