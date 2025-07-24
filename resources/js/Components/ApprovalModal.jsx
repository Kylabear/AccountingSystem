import { useState, useEffect } from 'react';

export default function ApprovalModal({ dv, isOpen, onClose, onApprovalOut, onApprovalIn }) {
    const [outDate, setOutDate] = useState('');
    const [inDate, setInDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Auto-fill today's date when modal opens
    useEffect(() => {
        if (isOpen && dv) {
            const today = new Date().toISOString().split('T')[0];
            setOutDate(dv.approval_out_date ? new Date(dv.approval_out_date).toISOString().split('T')[0] : today);
            setInDate(dv.approval_in_date ? new Date(dv.approval_in_date).toISOString().split('T')[0] : today);
        }
    }, [isOpen, dv]);

    const handleSendOut = async () => {
        setIsSubmitting(true);
        try {
            await onApprovalOut(dv, outDate);
            onClose();
        } catch (error) {
            console.error('Error sending for approval:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReturnIn = async () => {
        setIsSubmitting(true);
        try {
            await onApprovalIn(dv, inDate);
            onClose();
        } catch (error) {
            console.error('Error returning from approval:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !dv) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center modal-backdrop overflow-y-auto" style={{ zIndex: 50000, paddingTop: '80px', paddingBottom: '20px' }}>
            <div className="bg-white rounded-lg w-full max-w-6xl max-h-screen overflow-hidden m-4 flex flex-col">
                {/* Header */}
                <div className="bg-gray-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold">Disbursement Voucher - Approval Process</h2>
                    <button onClick={onClose} className="text-white hover:text-gray-200">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto">
                    {/* DV Information */}
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
                                <span className="text-sm text-gray-700">Net Amount</span>
                                <div className="font-bold text-green-600 text-lg">
                                    {dv.net_amount !== undefined && dv.net_amount !== null && dv.net_amount !== '' && !isNaN(parseFloat(dv.net_amount))
                                        ? `₱${parseFloat(dv.net_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                        : 'N/A'}
                                </div>
                            </div>
                            <div>
                                <span className="text-sm text-gray-700">Transaction Type</span>
                                <div className="text-base">{dv.transaction_type || 'N/A'}</div>
                            </div>
                            <div className="col-span-2">
                                <span className="text-sm text-gray-700">Particulars</span>
                                <div className="text-base">{dv.particulars || 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Approval Status Display */}
                    <div className="mb-6 p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <span className="mr-2">✅</span>
                            Approval Status
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 bg-white border border-gray-200 rounded-lg">
                                <div className="text-sm font-medium text-gray-700 mb-1">Current Status</div>
                                <div className="text-base">
                                    {!dv.approval_out_date ? (
                                        <span className="text-orange-600 font-medium">Ready to send for approval</span>
                                    ) : !dv.approval_in_date ? (
                                        <span className="text-blue-600 font-medium">Out for approval</span>
                                    ) : (
                                        <span className="text-green-600 font-medium">Approval completed</span>
                                    )}
                                </div>
                            </div>
                            
                            {dv.approval_out_date && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="text-sm font-medium text-blue-700 mb-1">Sent Out Date</div>
                                    <div className="text-base text-blue-600">
                                        {new Date(dv.approval_out_date).toLocaleDateString()}
                                    </div>
                                </div>
                            )}
                            
                            {dv.approval_in_date && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="text-sm font-medium text-green-700 mb-1">Returned Date</div>
                                    <div className="text-base text-green-600">
                                        {new Date(dv.approval_in_date).toLocaleDateString()}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Approval Actions */}
                    <div className="space-y-6">
                        {/* Send Out for Approval */}
                        {!dv.approval_out_date && (
                            <div className="p-4 border-2 border-orange-200 rounded-lg bg-orange-50">
                                <h4 className="text-lg font-semibold text-orange-800 mb-4">Send Out for Approval</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Date Sent Out
                                        </label>
                                        <input
                                            type="date"
                                            value={outDate}
                                            onChange={(e) => setOutDate(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-orange-500"
                                            required
                                        />
                                    </div>
                                    <button
                                        onClick={handleSendOut}
                                        disabled={isSubmitting || !outDate}
                                        className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                                                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                                                </svg>
                                                Sending...
                                            </>
                                        ) : (
                                            'Send Out for Approval'
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Return from Approval */}
                        {dv.approval_out_date && !dv.approval_in_date && (
                            <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                                <h4 className="text-lg font-semibold text-blue-800 mb-4">Return from Approval</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Date Returned
                                        </label>
                                        <input
                                            type="date"
                                            value={inDate}
                                            onChange={(e) => setInDate(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <button
                                        onClick={handleReturnIn}
                                        disabled={isSubmitting || !inDate}
                                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
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
                                            'Return In - Proceed to Indexing'
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Completed Status */}
                        {dv.approval_in_date && (
                            <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50">
                                <h4 className="text-lg font-semibold text-green-800 mb-2">Approval Completed</h4>
                                <p className="text-green-700">
                                    This DV has been approved and is ready for the next stage (Indexing).
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Close Button */}
                    <div className="flex justify-end mt-6">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
