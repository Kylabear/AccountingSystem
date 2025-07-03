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

        // Format cash allocation number to YYYY-MM-NNNNN (exactly 13 characters)
        if (name === 'cash_allocation_number') {
            // Remove all non-digits first
            let numbers = value.replace(/\D/g, '');
            // Limit to exactly 11 digits (4+2+5) for 13 total characters including dashes
            numbers = numbers.slice(0, 11);
            
            // Format as YYYY-MM-NNNNN
            let formattedValue = '';
            if (numbers.length > 0) {
                if (numbers.length <= 4) {
                    formattedValue = numbers;
                } else if (numbers.length <= 6) {
                    formattedValue = numbers.slice(0, 4) + '-' + numbers.slice(4);
                } else {
                    formattedValue = numbers.slice(0, 4) + '-' + numbers.slice(4, 6) + '-' + numbers.slice(6);
                }
            }
            setFormData(prev => ({ ...prev, [name]: formattedValue }));
        }
        // Format net amount to allow only numbers and decimal
        else if (name === 'net_amount') {
            const formattedValue = value.replace(/[^\d.]/g, '');
            // Ensure only one decimal point
            const parts = formattedValue.split('.');
            if (parts.length > 2) {
                const formatted = parts[0] + '.' + parts.slice(1).join('');
                setFormData(prev => ({ ...prev, [name]: formatted }));
            } else {
                setFormData(prev => ({ ...prev, [name]: formattedValue }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.cash_allocation_date) {
            newErrors.cash_allocation_date = 'Cash allocation date is required';
        }

        if (!formData.cash_allocation_number) {
            newErrors.cash_allocation_number = 'Cash allocation number is required';
        } else if (formData.cash_allocation_number.length !== 13 || !/^\d{4}-\d{2}-\d{5}$/.test(formData.cash_allocation_number)) {
            newErrors.cash_allocation_number = 'Cash allocation number must be exactly 13 characters: YYYY-MM-NNNNN (e.g., 2025-06-04734)';
        }

        if (!formData.net_amount || parseFloat(formData.net_amount) <= 0) {
            newErrors.net_amount = 'Net amount must be greater than 0';
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
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 my-4">
                {/* Header */}
                <div className="bg-orange-500 text-white p-4 rounded-t-lg">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">Cash Allocation</h2>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 text-xl font-bold"
                            disabled={isSubmitting}
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* DV Info */}
                    <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                        <h3 className="font-medium text-gray-800 mb-2">DV Information</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                            <div><strong>DV Number:</strong> {dv.dv_number}</div>
                            <div><strong>Payee:</strong> {dv.payee}</div>
                            <div><strong>Original Amount:</strong> ₱{parseFloat(dv.amount).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}</div>
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
        </div>
    );
}
