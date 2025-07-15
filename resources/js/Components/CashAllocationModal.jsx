import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function CashAllocationModal({ dv, isOpen, onClose, onUpdate }) {
    const [formData, setFormData] = useState({
        cash_allocation_date: '',
        cash_allocation_number: '',
        net_amount: '',
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Auto-fill today's date when modal opens
    useEffect(() => {
        if (isOpen && dv) {
            const today = new Date().toISOString().split('T')[0];
            setFormData({
                cash_allocation_date: today,
                cash_allocation_number: '',
                net_amount: dv.amount || '', // Pre-fill with original amount
            });
            setErrors({});
        }
    }, [isOpen, dv]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        if (name === 'cash_allocation_number') {
            // Remove all non-digits
            let numbers = value.replace(/\D/g, '');
            // Limit to exactly 11 digits (4+2+5) for YYYY-MM-NNNNN format
            numbers = numbers.slice(0, 11);
            
            // Format as YYYY-MM-NNNNN
            let formattedValue = '';
            if (numbers.length > 0) {
                // First 4 digits (YYYY)
                formattedValue = numbers.slice(0, 4);
                if (numbers.length > 4) {
                    // Next 2 digits (MM)
                    formattedValue += '-' + numbers.slice(4, 6);
                    if (numbers.length > 6) {
                        // Last 5 digits (NNNNN)
                        formattedValue += '-' + numbers.slice(6);
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
        
        // Validate cash allocation number format (YYYY-MM-NNNNN)
        const cashAllocPattern = /^\d{4}-\d{2}-\d{5}$/;
        if (!formData.cash_allocation_number) {
            newErrors.cash_allocation_number = 'Cash allocation number is required';
        } else if (!cashAllocPattern.test(formData.cash_allocation_number)) {
            newErrors.cash_allocation_number = 'Must follow format: YYYY-MM-NNNNN';
        } else {
            // Additional validation for year and month
            const [year, month] = formData.cash_allocation_number.split('-');
            if (parseInt(month) < 1 || parseInt(month) > 12) {
                newErrors.cash_allocation_number = 'Invalid month (must be 01-12)';
            }
        }

        // Other validations...
        if (!formData.cash_allocation_date) {
            newErrors.cash_allocation_date = 'Date is required';
        }
        if (!formData.net_amount) {
            newErrors.net_amount = 'Net amount is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            router.post(`/incoming-dvs/${dv.id}/cash-allocation`, formData, {
                onSuccess: () => {
                    onUpdate();
                    onClose();
                },
                onError: (errors) => {
                    setErrors(errors);
                },
                onFinish: () => {
                    setIsSubmitting(false);
                }
            });
        } catch (error) {
            console.error('Error submitting cash allocation:', error);
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !dv) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center modal-backdrop overflow-y-auto" style={{ zIndex: 50000, paddingTop: '120px', paddingBottom: '40px' }}>
            <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 my-4 flex flex-col md:flex-row">
                {/* Main Content (left) */}
                <div className="flex-1 p-0 md:p-6">
                    {/* Header - orange, only for main content */}
                    <div className="bg-orange-500 text-white p-4 rounded-t-lg md:rounded-t-lg md:rounded-l-lg md:rounded-tr-none">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold">Cash Allocation</h2>
                            <button
                                onClick={onClose}
                                className="text-white hover:text-gray-200 text-xl font-bold"
                                disabled={isSubmitting}
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                    <div className="p-6 pt-0 md:pt-6">
                        {/* Disbursement Voucher Information (Green) - Screenshot Style */}
                        <div className="mb-6 p-4 border-2 border-green-200 rounded-lg bg-green-50">
                            <h3 className="text-lg font-semibold text-green-800 mb-4">Disbursement Voucher Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                <div>
                                    <span className="text-sm text-gray-700">Payee</span>
                                    <div className="font-bold text-lg">{dv.payee || 'N/A'}</div>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-700">DV Number</span>
                                    <div className="font-bold text-lg">{dv.dv_number || 'N/A'}</div>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-700">Receive Date</span>
                                    <div className="text-base">{dv.receive_date ? new Date(dv.receive_date).toLocaleDateString() : 'N/A'}</div>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-700">Transaction Type</span>
                                    <div className="text-base">{dv.transaction_type || 'N/A'}</div>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-sm text-gray-700">Particulars</span>
                                    <div className="text-base">{dv.particulars || 'N/A'}</div>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-700">Amount as stated by DV</span>
                                    <div className="font-bold text-green-600 text-lg">
                                        {dv.amount !== undefined && dv.amount !== null && dv.amount !== '' && !isNaN(parseFloat(dv.amount))
                                            ? `₱${parseFloat(dv.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                            : 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-700">Implementing Unit</span>
                                    <div className="text-base">{dv.implementing_unit || 'N/A'}</div>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-700">Account Number</span>
                                    <div className="text-base">{dv.account_number || 'N/A'}</div>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-700">ORS No.</span>
                                    <div className="text-base">{dv.ors_no || 'N/A'}</div>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-700">Fund Source</span>
                                    <div className="text-base">{dv.fund_source || 'N/A'}</div>
                                </div>
                                <div className="md:col-span-2">
                                    <span className="text-sm text-gray-700">UACS/Object of Expenditure</span>
                                    <div className="text-base">{dv.uacs || 'N/A'}</div>
                                </div>
                            </div>
                        </div>

                        {/* For Review (Gray) - Screenshot Style */}
                        <div className="mb-6 p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <span className="mr-2">📖</span>
                                For Review
                            </h3>
                            {/* Review completed date in green box */}
                            <div className="mb-4">
                                <div className="rounded bg-green-100 border border-green-200 px-4 py-2 text-green-800 text-sm font-medium">
                                    {dv.review_completed_at ? (
                                        <>Review completed on: {new Date(dv.review_completed_at).toLocaleDateString()}</>
                                    ) : (
                                        <span className="italic text-gray-400">Not reviewed yet</span>
                                    )}
                                </div>
                            </div>
                            {/* RTS and NORSA details in colored cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="rounded bg-red-50 border border-red-200 px-4 py-3">
                                    <div className="font-semibold text-red-700 mb-1">RTS Details</div>
                                    <div className="text-sm text-red-700">
                                        {dv.rts_details ? (
                                            <span>{dv.rts_details}</span>
                                        ) : (
                                            <span className="italic">No RTS was issued for this DV.</span>
                                        )}
                                    </div>
                                </div>
                                <div className="rounded bg-yellow-50 border border-yellow-200 px-4 py-3">
                                    <div className="font-semibold text-yellow-800 mb-1">NORSA Details</div>
                                    <div className="text-sm text-yellow-800">
                                        {dv.norsa_details ? (
                                            <span>{dv.norsa_details}</span>
                                        ) : (
                                            <span className="italic">No NORSA was issued for this DV.</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Cash Allocation Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cash Allocation Date
                                </label>
                                <input
                                    type="date"
                                    name="cash_allocation_date"
                                    value={formData.cash_allocation_date}
                                    onChange={handleInputChange}
                                    className={`w-full border-2 rounded-lg p-3 focus:outline-none ${
                                        errors.cash_allocation_date 
                                            ? 'border-red-500 focus:border-red-500' 
                                            : 'border-gray-300 focus:border-orange-500'
                                    }`}
                                    required
                                />
                                {errors.cash_allocation_date && (
                                    <p className="text-red-500 text-xs mt-1">{errors.cash_allocation_date}</p>
                                )}
                            </div>

                            {/* Cash Allocation Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cash Allocation Number
                                </label>
                                <input
                                    type="text"
                                    name="cash_allocation_number"
                                    value={formData.cash_allocation_number}
                                    onChange={handleInputChange}
                                    placeholder="YYYY-MM-NNNNN (e.g., 2025-06-04734)"
                                    maxLength={13}
                                    className={`w-full border-2 rounded-lg p-3 focus:outline-none ${
                                        errors.cash_allocation_number 
                                            ? 'border-red-500 focus:border-red-500' 
                                            : 'border-gray-300 focus:border-orange-500'
                                    }`}
                                    required
                                />
                                {errors.cash_allocation_number && (
                                    <p className="text-red-500 text-xs mt-1">{errors.cash_allocation_number}</p>
                                )}
                            </div>

                            {/* Net Amount */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Net Amount (Final Payable Amount)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-gray-500">₱</span>
                                    <input
                                        type="text"
                                        name="net_amount"
                                        value={formData.net_amount}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        className={`w-full border-2 rounded-lg p-3 pl-8 focus:outline-none ${
                                            errors.net_amount 
                                                ? 'border-red-500 focus:border-red-500' 
                                                : 'border-gray-300 focus:border-orange-500'
                                        }`}
                                        required
                                    />
                                </div>
                                {errors.net_amount && (
                                    <p className="text-red-500 text-xs mt-1">{errors.net_amount}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    This is the final amount after taxes and deductions
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                                                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : (
                                        'Save Cash Allocation'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                {/* Transaction History Panel (right) */}
                <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-gray-200 bg-gray-50 rounded-b-lg md:rounded-b-none md:rounded-r-lg flex-shrink-0 p-6 pt-4 md:pt-6" style={{ minWidth: '320px' }}>
                    <div className="mb-4 flex items-center justify-between">
                        <span className="font-semibold text-gray-800">Transaction History</span>
                        {dv.transaction_history && (
                            <span className="text-xs text-gray-500">{dv.transaction_history.length} entr{dv.transaction_history.length === 1 ? 'y' : 'ies'}</span>
                        )}
                    </div>
                    <div className="space-y-3">
                        {dv.transaction_history && dv.transaction_history.length > 0 ? (
                            dv.transaction_history.map((item, idx) => (
                                <div key={idx} className="bg-white border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2 shadow-sm">
                                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2 align-middle"></span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-gray-800 text-sm truncate">{item.type}</span>
                                            <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">{item.date ? new Date(item.date).toLocaleDateString() : ''}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 mb-1">{item.by ? `by ${item.by}` : ''}</div>
                                        <div className="text-xs text-gray-700 space-y-0.5">
                                            {item.amount !== undefined && item.amount !== null && !isNaN(parseFloat(item.amount)) && (
                                                <div>Amount: ₱{parseFloat(item.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                            )}
                                            {item.dv_number && <div>DV Number: {item.dv_number}</div>}
                                            {item.allocation_number && <div>Allocation Number: {item.allocation_number}</div>}
                                            {item.net_amount !== undefined && item.net_amount !== null && !isNaN(parseFloat(item.net_amount)) && (
                                                <div>Net Amount: ₱{parseFloat(item.net_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                            )}
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
    );
}
