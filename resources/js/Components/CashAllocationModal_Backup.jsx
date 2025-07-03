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

                    {/* Previous Processed Details Toggle - Only show for reallocated DVs */}
                    {dv.has_previous_processed_data && dv.previous_processed_data && (
                        <div className="mb-6">
                            <button
                                type="button"
                                onClick={() => setShowPreviousDetails(!showPreviousDetails)}
                                className="w-full flex items-center justify-between p-3 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                            >
                                <span className="text-sm font-medium text-blue-800">
                                    📋 View Previous Complete Processing Details
                                </span>
                                <svg 
                                    className={`w-5 h-5 text-blue-600 transform transition-transform duration-200 ${showPreviousDetails ? 'rotate-180' : ''}`}
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            
                            {showPreviousDetails && (
                                <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="mb-4">
                                        <h4 className="text-sm font-semibold text-blue-800 mb-2">🔄 Previous Complete Processing Cycle</h4>
                                        <p className="text-xs text-blue-600 italic mb-3">
                                            This DV was previously processed but returned by cashiering for reallocation. 
                                            Below are the complete details from the previous processing cycle.
                                        </p>
                                    </div>
                                    
                                    <div className="space-y-4 text-xs max-h-96 overflow-y-auto">
                                        {/* DV Information Section */}
                                        <div className="p-3 bg-white rounded border-l-4 border-blue-400">
                                            <h5 className="font-medium text-gray-800 mb-2">📄 Disbursement Voucher Information</h5>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-600">
                                                <div><strong>DV Number:</strong> {dv.previous_processed_data.dv_number}</div>
                                                <div><strong>Payee:</strong> {dv.previous_processed_data.payee}</div>
                                                <div><strong>Transaction Type:</strong> {dv.previous_processed_data.transaction_type}</div>
                                                <div><strong>Account Number:</strong> {dv.previous_processed_data.account_number}</div>
                                                <div><strong>Implementing Unit:</strong> {dv.previous_processed_data.implementing_unit}</div>
                                                <div><strong>Original Amount:</strong> ₱{parseFloat(dv.previous_processed_data.original_amount || 0).toLocaleString('en-US', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}</div>
                                                {dv.previous_processed_data.net_amount && (
                                                    <div><strong>Net Amount:</strong> ₱{parseFloat(dv.previous_processed_data.net_amount || 0).toLocaleString('en-US', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}</div>
                                                )}
                                                {dv.previous_processed_data.fund_source && (
                                                    <div><strong>Fund Source:</strong> {dv.previous_processed_data.fund_source}</div>
                                                )}
                                                {dv.previous_processed_data.ors_number && (
                                                    <div><strong>ORS Number:</strong> {dv.previous_processed_data.ors_number}</div>
                                                )}
                                                {dv.previous_processed_data.uacs && (
                                                    <div><strong>UACS:</strong> {dv.previous_processed_data.uacs}</div>
                                                )}
                                                {dv.previous_processed_data.mfo_pap && (
                                                    <div><strong>MFO/PAP:</strong> {dv.previous_processed_data.mfo_pap}</div>
                                                )}
                                                {dv.previous_processed_data.responsibility_center && (
                                                    <div><strong>Responsibility Center:</strong> {dv.previous_processed_data.responsibility_center}</div>
                                                )}
                                                {dv.previous_processed_data.fund_cluster && (
                                                    <div><strong>Fund Cluster:</strong> {dv.previous_processed_data.fund_cluster}</div>
                                                )}
                                            </div>
                                            <div className="mt-2">
                                                <div><strong>Particulars:</strong></div>
                                                <div className="text-gray-600 italic text-xs mt-1 p-2 bg-gray-50 rounded">
                                                    {dv.previous_processed_data.particulars || 'No particulars specified'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Previous Review Stage */}
                                        {dv.previous_processed_data.review_date && (
                                            <div className="p-3 bg-white rounded border-l-4 border-red-400">
                                                <h5 className="font-medium text-gray-800 mb-2">🔍 Previous Review</h5>
                                                <div className="text-gray-600 space-y-1">
                                                    <div><strong>Review Date:</strong> {new Date(dv.previous_processed_data.review_date).toLocaleDateString()}</div>
                                                    {dv.previous_processed_data.review_completed_by && (
                                                        <div><strong>Reviewed By:</strong> {dv.previous_processed_data.review_completed_by}</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Previous RTS/NORSA Stage */}
                                        {(dv.previous_processed_data.rts_out_date || dv.previous_processed_data.norsa_date) && (
                                            <div className="p-3 bg-white rounded border-l-4 border-pink-400">
                                                <h5 className="font-medium text-gray-800 mb-2">� Previous RTS/NORSA</h5>
                                                <div className="text-gray-600 space-y-1">
                                                    {dv.previous_processed_data.rts_out_date && (
                                                        <div><strong>RTS Out Date:</strong> {new Date(dv.previous_processed_data.rts_out_date).toLocaleDateString()}</div>
                                                    )}
                                                    {dv.previous_processed_data.rts_reason && (
                                                        <div><strong>RTS Reason:</strong> {dv.previous_processed_data.rts_reason}</div>
                                                    )}
                                                    {dv.previous_processed_data.norsa_date && (
                                                        <div><strong>NORSA Date:</strong> {new Date(dv.previous_processed_data.norsa_date).toLocaleDateString()}</div>
                                                    )}
                                                    {dv.previous_processed_data.norsa_number && (
                                                        <div><strong>NORSA Number:</strong> {dv.previous_processed_data.norsa_number}</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Previous Cash Allocation */}
                                        {dv.previous_processed_data.cash_allocation_date && (
                                            <div className="p-3 bg-white rounded border-l-4 border-orange-400">
                                                <h5 className="font-medium text-gray-800 mb-2">💰 Previous Cash Allocation</h5>
                                                <div className="text-gray-600 space-y-1">
                                                    <div><strong>Date:</strong> {new Date(dv.previous_processed_data.cash_allocation_date).toLocaleDateString()}</div>
                                                    {dv.previous_processed_data.cash_allocation_number && (
                                                        <div><strong>Cash Allocation Number:</strong> {dv.previous_processed_data.cash_allocation_number}</div>
                                                    )}
                                                    {dv.previous_processed_data.allocated_by && (
                                                        <div><strong>Allocated By:</strong> {dv.previous_processed_data.allocated_by}</div>
                                                    )}
                                                    {dv.previous_processed_data.certified_amount && (
                                                        <div><strong>Certified Amount:</strong> ₱{parseFloat(dv.previous_processed_data.certified_amount).toLocaleString('en-US', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        })}</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Previous Box C Certification */}
                                        {dv.previous_processed_data.box_c_amount && (
                                            <div className="p-3 bg-white rounded border-l-4 border-yellow-400">
                                                <h5 className="font-medium text-gray-800 mb-2">📋 Previous Box C Certification</h5>
                                                <div className="text-gray-600 space-y-1">
                                                    <div><strong>Amount:</strong> ₱{parseFloat(dv.previous_processed_data.box_c_amount).toLocaleString('en-US', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}</div>
                                                    {dv.previous_processed_data.box_c_data && (
                                                        <div><strong>Box C Data:</strong> {dv.previous_processed_data.box_c_data}</div>
                                                    )}
                                                    {dv.previous_processed_data.cash_certification_date && (
                                                        <div><strong>Certification Date:</strong> {new Date(dv.previous_processed_data.cash_certification_date).toLocaleDateString()}</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Previous Approval */}
                                        {(dv.previous_processed_data.approval_out_date || dv.previous_processed_data.approval_in_date) && (
                                            <div className="p-3 bg-white rounded border-l-4 border-green-400">
                                                <h5 className="font-medium text-gray-800 mb-2">✅ Previous Approval</h5>
                                                <div className="text-gray-600 space-y-1">
                                                    {dv.previous_processed_data.approval_out_date && (
                                                        <div><strong>Sent for Approval:</strong> {new Date(dv.previous_processed_data.approval_out_date).toLocaleDateString()}</div>
                                                    )}
                                                    {dv.previous_processed_data.approval_in_date && (
                                                        <div><strong>Returned from Approval:</strong> {new Date(dv.previous_processed_data.approval_in_date).toLocaleDateString()}</div>
                                                    )}
                                                    {dv.previous_processed_data.approved_by && (
                                                        <div><strong>Approved By:</strong> {dv.previous_processed_data.approved_by}</div>
                                                    )}
                                                    {dv.previous_processed_data.approval_status && (
                                                        <div><strong>Status:</strong> {dv.previous_processed_data.approval_status}</div>
                                                    )}
                                                    {dv.previous_processed_data.approval_remarks && (
                                                        <div><strong>Remarks:</strong> {dv.previous_processed_data.approval_remarks}</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Previous Indexing */}
                                        {dv.previous_processed_data.indexing_date && (
                                            <div className="p-3 bg-white rounded border-l-4 border-blue-400">
                                                <h5 className="font-medium text-gray-800 mb-2">📇 Previous Indexing</h5>
                                                <div className="text-gray-600 space-y-1">
                                                    <div><strong>Date:</strong> {new Date(dv.previous_processed_data.indexing_date).toLocaleDateString()}</div>
                                                    {dv.previous_processed_data.indexed_by && (
                                                        <div><strong>Indexed By:</strong> {dv.previous_processed_data.indexed_by}</div>
                                                    )}
                                                    {dv.previous_processed_data.indexing_remarks && (
                                                        <div><strong>Remarks:</strong> {dv.previous_processed_data.indexing_remarks}</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Previous Payment Method */}
                                        {dv.previous_processed_data.payment_method && (
                                            <div className="p-3 bg-white rounded border-l-4 border-purple-400">
                                                <h5 className="font-medium text-gray-800 mb-2">💳 Previous Payment Method</h5>
                                                <div className="text-gray-600 space-y-1">
                                                    <div><strong>Method:</strong> {dv.previous_processed_data.payment_method}</div>
                                                    {dv.previous_processed_data.payment_method_date && (
                                                        <div><strong>Date:</strong> {new Date(dv.previous_processed_data.payment_method_date).toLocaleDateString()}</div>
                                                    )}
                                                    {dv.previous_processed_data.payment_method_set_by && (
                                                        <div><strong>Set By:</strong> {dv.previous_processed_data.payment_method_set_by}</div>
                                                    )}
                                                    {dv.previous_processed_data.lddap_number && (
                                                        <div><strong>LDDAP Number:</strong> {dv.previous_processed_data.lddap_number}</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Previous Payroll Register */}
                                        {(dv.previous_processed_data.pr_out_date || dv.previous_processed_data.pr_in_date) && (
                                            <div className="p-3 bg-white rounded border-l-4 border-indigo-400">
                                                <h5 className="font-medium text-gray-800 mb-2">📊 Previous Payroll Register</h5>
                                                <div className="text-gray-600 space-y-1">
                                                    {dv.previous_processed_data.pr_out_date && (
                                                        <div><strong>PR Out Date:</strong> {new Date(dv.previous_processed_data.pr_out_date).toLocaleDateString()}</div>
                                                    )}
                                                    {dv.previous_processed_data.pr_out_by && (
                                                        <div><strong>PR Out By:</strong> {dv.previous_processed_data.pr_out_by}</div>
                                                    )}
                                                    {dv.previous_processed_data.pr_in_date && (
                                                        <div><strong>PR In Date:</strong> {new Date(dv.previous_processed_data.pr_in_date).toLocaleDateString()}</div>
                                                    )}
                                                    {dv.previous_processed_data.pr_in_by && (
                                                        <div><strong>PR In By:</strong> {dv.previous_processed_data.pr_in_by}</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Previous Out to Cashiering */}
                                        {dv.previous_processed_data.out_to_cashiering_date && (
                                            <div className="p-3 bg-white rounded border-l-4 border-purple-600">
                                                <h5 className="font-medium text-gray-800 mb-2">🏦 Previous Out to Cashiering</h5>
                                                <div className="text-gray-600 space-y-1">
                                                    <div><strong>Date:</strong> {new Date(dv.previous_processed_data.out_to_cashiering_date).toLocaleDateString()}</div>
                                                    {dv.previous_processed_data.out_to_cashiering_by && (
                                                        <div><strong>Sent By:</strong> {dv.previous_processed_data.out_to_cashiering_by}</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Previous EN-GAS */}
                                        {dv.previous_processed_data.engas_number && (
                                            <div className="p-3 bg-white rounded border-l-4 border-pink-400">
                                                <h5 className="font-medium text-gray-800 mb-2">🌐 Previous EN-GAS Recording</h5>
                                                <div className="text-gray-600 space-y-1">
                                                    <div><strong>Number:</strong> {dv.previous_processed_data.engas_number}</div>
                                                    {dv.previous_processed_data.engas_date && (
                                                        <div><strong>Date:</strong> {new Date(dv.previous_processed_data.engas_date).toLocaleDateString()}</div>
                                                    )}
                                                    {dv.previous_processed_data.engas_recorded_by && (
                                                        <div><strong>Recorded By:</strong> {dv.previous_processed_data.engas_recorded_by}</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Previous CDJ */}
                                        {dv.previous_processed_data.cdj_number && (
                                            <div className="p-3 bg-white rounded border-l-4 border-amber-600">
                                                <h5 className="font-medium text-gray-800 mb-2">📊 Previous CDJ Recording</h5>
                                                <div className="text-gray-600 space-y-1">
                                                    <div><strong>Number:</strong> {dv.previous_processed_data.cdj_number}</div>
                                                    {dv.previous_processed_data.cdj_date && (
                                                        <div><strong>Date:</strong> {new Date(dv.previous_processed_data.cdj_date).toLocaleDateString()}</div>
                                                    )}
                                                    {dv.previous_processed_data.cdj_type && (
                                                        <div><strong>Type:</strong> {dv.previous_processed_data.cdj_type}</div>
                                                    )}
                                                    {dv.previous_processed_data.cdj_recorded_by && (
                                                        <div><strong>Recorded By:</strong> {dv.previous_processed_data.cdj_recorded_by}</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Previous LDDAP */}
                                        {(dv.previous_processed_data.lddap_date || dv.previous_processed_data.lddap_certified_date) && (
                                            <div className="p-3 bg-white rounded border-l-4 border-gray-600">
                                                <h5 className="font-medium text-gray-800 mb-2">🔒 Previous LDDAP Certification</h5>
                                                <div className="text-gray-600 space-y-1">
                                                    {dv.previous_processed_data.lddap_date && (
                                                        <div><strong>LDDAP Date:</strong> {new Date(dv.previous_processed_data.lddap_date).toLocaleDateString()}</div>
                                                    )}
                                                    {dv.previous_processed_data.lddap_certified_date && (
                                                        <div><strong>Certified Date:</strong> {new Date(dv.previous_processed_data.lddap_certified_date).toLocaleDateString()}</div>
                                                    )}
                                                    {dv.previous_processed_data.lddap_certified_by && (
                                                        <div><strong>Certified By:</strong> {dv.previous_processed_data.lddap_certified_by}</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Processing Completion */}
                                        {dv.previous_processed_data.processed_date && (
                                            <div className="p-3 bg-white rounded border-l-4 border-green-600">
                                                <h5 className="font-medium text-gray-800 mb-2">✨ Processing Completed</h5>
                                                <div className="text-gray-600">
                                                    <div><strong>Processed Date:</strong> {new Date(dv.previous_processed_data.processed_date).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Reallocation Information */}
                                        <div className="p-3 bg-orange-100 rounded border-l-4 border-orange-600">
                                            <h5 className="font-medium text-gray-800 mb-2">🔄 Reallocation Information</h5>
                                            <div className="text-gray-600 space-y-1">
                                                {dv.reallocation_date && (
                                                    <div><strong>Reallocation Date:</strong> {new Date(dv.reallocation_date).toLocaleDateString()}</div>
                                                )}
                                                {dv.reallocation_reason && (
                                                    <div><strong>Reason:</strong> {dv.reallocation_reason}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

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
