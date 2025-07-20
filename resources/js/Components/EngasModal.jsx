import { useState, useEffect } from 'react';

export default function EngasModal({ dv, isOpen, onClose, onSubmit }) {
    const [engasNumber, setEngasNumber] = useState('');
    const [engasDate, setEngasDate] = useState(new Date().toISOString().split('T')[0]);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        engas_number: '',
        engas_date: ''
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

    // Generate placeholder based on current date
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const placeholder = `${year}-${month}-000001`;

    const validateEngasNumber = (value) => {
        // Pattern: YYYY-MM-XXXXXX (where XXXXXX is exactly 6 digits)
        const pattern = /^(\d{4})-(\d{2})-(\d{6})$/;
        const match = value.match(pattern);
        
        if (!match) {
            return 'Format must be YYYY-MM-XXXXXX (e.g., 2025-07-000457)';
        }
        
        const [, yearStr, monthStr, numberStr] = match;
        const year = parseInt(yearStr);
        const month = parseInt(monthStr);
        const number = parseInt(numberStr);
        
        if (year < 2020 || year > 2030) {
            return 'Year must be between 2020 and 2030';
        }
        
        if (month < 1 || month > 12) {
            return 'Month must be between 01 and 12';
        }
        
        if (number === 0) {
            return 'Serial number cannot be 000000';
        }
        
        return '';
    };

    const isValidFormat = (value) => {
        const pattern = /^(\d{4})-(\d{2})-(\d{6})$/;
        const match = value.match(pattern);
        
        if (!match) return false;
        
        const [, yearStr, monthStr, numberStr] = match;
        const year = parseInt(yearStr);
        const month = parseInt(monthStr);
        const number = parseInt(numberStr);
        
        return year >= 2020 && year <= 2030 && 
               month >= 1 && month <= 12 && 
               number > 0;
    };

    const handleEngasNumberChange = (e) => {
        let value = e.target.value;
        
        // Remove any non-digit characters
        let digitsOnly = value.replace(/[^0-9]/g, '');
        
        // Limit to maximum 12 digits (4 year + 2 month + 6 serial)
        if (digitsOnly.length > 12) {
            digitsOnly = digitsOnly.slice(0, 12);
        }
        
        // Auto-format based on length
        let formattedValue = '';
        
        if (digitsOnly.length <= 4) {
            // Just the year part
            formattedValue = digitsOnly;
        } else if (digitsOnly.length <= 6) {
            // Year + month
            formattedValue = digitsOnly.slice(0, 4) + '-' + digitsOnly.slice(4);
        } else {
            // Year + month + serial number (up to 6 digits)
            formattedValue = digitsOnly.slice(0, 4) + '-' + digitsOnly.slice(4, 6) + '-' + digitsOnly.slice(6, 12);
        }
        
        setEngasNumber(formattedValue);
        
        if (formattedValue) {
            const validationError = validateEngasNumber(formattedValue);
            setError(validationError);
        } else {
            setError('');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        if (name === 'engas_number') {
            // Remove all non-digits
            let numbers = value.replace(/\D/g, '');
            // Limit to exactly 12 digits (4+2+6) for YYYY-MM-NNNNNN format
            numbers = numbers.slice(0, 12);
            
            // Format as YYYY-MM-NNNNNN
            let formattedValue = '';
            if (numbers.length > 0) {
                // First 4 digits (YYYY)
                formattedValue = numbers.slice(0, 4);
                if (numbers.length > 4) {
                    // Next 2 digits (MM)
                    formattedValue += '-' + numbers.slice(4, 6);
                    if (numbers.length > 6) {
                        // Last 6 digits (NNNNNN)
                        formattedValue += '-' + numbers.slice(6);
                        // Pad with leading zeros if necessary
                        while (formattedValue.split('-')[2].length < 6) {
                            formattedValue = formattedValue.split('-')[0] + '-' + 
                                           formattedValue.split('-')[1] + '-' + 
                                           '0' + formattedValue.split('-')[2];
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
        
        // Validate E-NGAS number format (YYYY-MM-NNNNNN)
        const engasPattern = /^\d{4}-\d{2}-\d{6}$/;
        if (!formData.engas_number) {
            newErrors.engas_number = 'E-NGAS number is required';
        } else if (!engasPattern.test(formData.engas_number)) {
            newErrors.engas_number = 'Must follow format: YYYY-MM-NNNNNN';
        } else {
            // Additional validation for year and month
            const [year, month] = formData.engas_number.split('-');
            if (parseInt(month) < 1 || parseInt(month) > 12) {
                newErrors.engas_number = 'Invalid month (must be 01-12)';
            }
            // Validate that the last part has 6 digits and starts with necessary leading zeros
            const lastPart = formData.engas_number.split('-')[2];
            if (lastPart.length !== 6) {
                newErrors.engas_number = 'Last part must be exactly 6 digits';
            }
        }

        // Other validations
        if (!formData.engas_date) {
            newErrors.engas_date = 'E-NGAS date is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const validationError = validateEngasNumber(engasNumber);
        if (validationError) {
            setError(validationError);
            return;
        }
        
        onSubmit({
            engas_number: engasNumber,
            engas_date: engasDate
        });
        
        // Reset form
        setEngasNumber('');
        setEngasDate(new Date().toISOString().split('T')[0]);
        setError('');
    };

    const handleClose = () => {
        // Reset form when closing
        setEngasNumber('');
        setEngasDate(new Date().toISOString().split('T')[0]);
        setError('');
        onClose();
    };

    if (!isOpen || !dv) return null;

    const isFormValid = isValidFormat(engasNumber) && engasDate;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center modal-backdrop overflow-y-auto" style={{ zIndex: 50000, paddingTop: '80px', paddingBottom: '20px' }}>
            <div className="bg-white rounded-lg w-full max-w-6xl max-h-screen overflow-hidden m-4 flex flex-col">
                {/* Full-width Header */}
                <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold">Disbursement Voucher - E-NGAS Recording</h2>
                    <button onClick={handleClose} className="text-white hover:text-gray-200">
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
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-engas text-white">
                                    For E-NGAS
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

                    {/* E-NGAS Recording Actions */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4">🌐 E-NGAS Recording</h3>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="bg-engas-light border border-engas rounded-lg p-4">
                                <h4 className="font-semibold text-engas-dark mb-3">Record E-NGAS Information</h4>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            E-NGAS Number <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="engas_number"
                                            value={engasNumber}
                                            onChange={(e) => {
                                                handleEngasNumberChange(e);
                                                handleInputChange(e);
                                            }}
                                            className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 ${
                                                error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-engas'
                                            }`}
                                            placeholder={placeholder}
                                            maxLength="14"
                                            required
                                        />
                                        {error && (
                                            <p className="text-red-500 text-xs mt-1">{error}</p>
                                        )}
                                        <p className="text-gray-500 text-xs mt-1">
                                            Format: YYYY-MM-XXXXXX (e.g., {placeholder})
                                        </p>
                                        {engasNumber && !error && isValidFormat(engasNumber) && (
                                            <p className="text-green-600 text-xs mt-1">✓ Valid format</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Recording Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="engas_date"
                                            value={engasDate}
                                            onChange={(e) => {
                                                setEngasDate(e.target.value);
                                                setFormData(prev => ({ ...prev, engas_date: e.target.value }));
                                            }}
                                            className="w-full border border-gray-300 rounded-lg p-2 focus:border-engas focus:outline-none"
                                            required
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={!isFormValid}
                                            className={`text-white px-4 py-2 rounded-lg transition-all ${
                                                isFormValid 
                                                    ? 'bg-engas hover:bg-engas-dark cursor-pointer' 
                                                    : 'bg-gray-400 cursor-not-allowed'
                                            }`}
                                        >
                                            🌐 Record E-NGAS
                                        </button>
                                        {isFormValid && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (confirm('Send this DV for CDJ recording?')) {
                                                        onSubmit({
                                                            engas_number: engasNumber,
                                                            engas_date: engasDate,
                                                            action: 'for_cdj'
                                                        });
                                                    }
                                                }}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                📊 For CDJ Recording
                                            </button>
                                        )}
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
                                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
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
