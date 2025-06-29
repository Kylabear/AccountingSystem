import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function RtsNorsaModal({ dv, isOpen, onClose, onUpdate }) {
    const [formData, setFormData] = useState({
        rts_reason: '',
        norsa_number: ''
    });
    const [processing, setProcessing] = useState(false);

    // Get current date in YYYY-MM-DD format
    const getCurrentDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    // Get the current interaction mode based on DV status and history
    const getInteractionMode = () => {
        if (!dv) return 'view';

        const status = dv.status;
        const rtsHistory = dv.rts_history || [];
        const norsaHistory = dv.norsa_history || [];

        switch (status) {
            case 'for_review':
                if (rtsHistory.length === 0 && norsaHistory.length === 0) {
                    return 'first_rts_review'; // First time clicking from For Review
                } else {
                    return 'subsequent_review'; // After RTS/NORSA cycles completed
                }
            case 'for_rts_in':
                return 'rts_return'; // Viewing from RTS In section
            case 'for_norsa_in':
                return 'norsa_return'; // Viewing from NORSA In section
            default:
                return 'view';
        }
    };

    const mode = getInteractionMode();

    const handleSubmit = (action) => {
        setProcessing(true);
        
        const currentDate = getCurrentDate();
        const updatedData = { ...dv };

        switch (action) {
            case 'return_to_sender':
                // First RTS - add to history and change status
                const newRtsEntry = {
                    date: currentDate,
                    reason: formData.rts_reason,
                    returned_date: null
                };
                updatedData.rts_history = [...(dv.rts_history || []), newRtsEntry];
                updatedData.rts_cycle_count = (dv.rts_cycle_count || 0) + 1;
                updatedData.last_rts_date = currentDate;
                updatedData.status = 'for_rts_in';
                updatedData.rts_origin = 'review'; // Always from review for this action
                break;

            case 'returned_after_rts':
                // Complete RTS cycle - update last entry and change status
                const rtsHistory = [...(dv.rts_history || [])];
                if (rtsHistory.length > 0) {
                    rtsHistory[rtsHistory.length - 1].returned_date = currentDate;
                }
                updatedData.rts_history = rtsHistory;
                updatedData.status = 'for_review';
                break;

            case 'mark_as_rts':
                // New RTS cycle from subsequent review
                const newRtsEntry2 = {
                    date: currentDate,
                    reason: formData.rts_reason,
                    returned_date: null
                };
                updatedData.rts_history = [...(dv.rts_history || []), newRtsEntry2];
                updatedData.rts_cycle_count = (dv.rts_cycle_count || 0) + 1;
                updatedData.last_rts_date = currentDate;
                updatedData.status = 'for_rts_in';
                updatedData.rts_origin = 'review'; // Always from review for this action
                break;

            case 'review_done':
                // Complete review - move to cash allocation
                updatedData.status = 'for_cash_allocation';
                break;

            case 'send_to_norsa':
                // Start NORSA cycle
                const newNorsaEntry = {
                    date: currentDate,
                    number: formData.norsa_number,
                    returned_date: null
                };
                updatedData.norsa_history = [...(dv.norsa_history || []), newNorsaEntry];
                updatedData.norsa_cycle_count = (dv.norsa_cycle_count || 0) + 1;
                updatedData.last_norsa_date = currentDate;
                updatedData.status = 'for_norsa_in';
                updatedData.norsa_origin = 'review'; // Always from review for this action
                break;

            case 'mark_as_norsa':
                // This is for updating NORSA from subsequent review (shouldn't happen in normal flow)
                const newNorsaEntry2 = {
                    date: currentDate,
                    number: formData.norsa_number,
                    returned_date: null
                };
                updatedData.norsa_history = [...(dv.norsa_history || []), newNorsaEntry2];
                updatedData.norsa_cycle_count = (dv.norsa_cycle_count || 0) + 1;
                updatedData.last_norsa_date = currentDate;
                updatedData.status = 'for_norsa_in';
                updatedData.norsa_origin = 'review'; // Always from review for this action
                break;

            case 'returned_after_norsa':
                // Complete NORSA cycle
                const norsaHistory = [...(dv.norsa_history || [])];
                if (norsaHistory.length > 0) {
                    norsaHistory[norsaHistory.length - 1].returned_date = currentDate;
                }
                updatedData.norsa_history = norsaHistory;
                updatedData.status = 'for_review';
                break;
        }

        // Send update to backend
        router.post(`/incoming-dvs/${dv.id}/rts-norsa`, updatedData, {
            onSuccess: () => {
                onUpdate && onUpdate();
                onClose();
                setProcessing(false);
                // Redirect to For Review tab for most actions
                if (['return_to_sender', 'mark_as_rts', 'review_done', 'send_to_norsa'].includes(action)) {
                    // This will trigger a page refresh to the For Review tab
                    window.location.href = '/incoming-dvs';
                }
            },
            onError: (errors) => {
                console.error('Error updating DV:', errors);
                setProcessing(false);
            }
        });
    };

    const renderContent = () => {
        if (!dv) return null;

        const rtsHistory = dv.rts_history || [];
        const norsaHistory = dv.norsa_history || [];
        const currentDate = getCurrentDate();

        switch (mode) {
            case 'first_rts_review':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date of RTS
                                </label>
                                <input
                                    type="date"
                                    value={currentDate}
                                    disabled
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for RTS
                                </label>
                                <input
                                    type="text"
                                    value={formData.rts_reason}
                                    onChange={(e) => setFormData({...formData, rts_reason: e.target.value})}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                                    placeholder="Enter reason for return to sender"
                                />
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <button
                                onClick={() => handleSubmit('return_to_sender')}
                                disabled={processing || !formData.rts_reason.trim()}
                                className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                                {processing ? 'Processing...' : 'Return to Sender'}
                            </button>
                        </div>
                    </div>
                );

            case 'rts_return':
                const lastRts = rtsHistory[rtsHistory.length - 1];
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date of RTS
                                </label>
                                <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50">
                                    {lastRts?.date}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for RTS
                                </label>
                                <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50">
                                    {lastRts?.reason}
                                </div>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={() => handleSubmit('returned_after_rts')}
                                    disabled={processing}
                                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors w-full"
                                >
                                    {processing ? 'Processing...' : 'Returned After RTS'}
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 'norsa_return':
                const lastNorsa = norsaHistory[norsaHistory.length - 1];
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date of NORSA
                                </label>
                                <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50">
                                    {lastNorsa?.date}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    NORSA Number
                                </label>
                                <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50">
                                    {lastNorsa?.number}
                                </div>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={() => handleSubmit('returned_after_norsa')}
                                    disabled={processing}
                                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors w-full"
                                >
                                    {processing ? 'Processing...' : 'Returned After NORSA'}
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 'subsequent_review':
                return (
                    <div className="space-y-6">
                        {/* Show all previous RTS history */}
                        {rtsHistory.length > 0 && (
                            <div>
                                <h4 className="text-lg font-medium text-gray-800 mb-4">RTS History</h4>
                                <div className="space-y-2">
                                    {rtsHistory.map((rts, index) => (
                                        <div key={index} className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
                                            <div className="text-sm">
                                                <span className="font-medium">Date:</span> {rts.date}
                                            </div>
                                            <div className="text-sm">
                                                <span className="font-medium">Reason:</span> {rts.reason}
                                            </div>
                                            <div className="text-sm">
                                                <span className="font-medium">Returned:</span> {rts.returned_date || 'N/A'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Show all previous NORSA history */}
                        {norsaHistory.length > 0 && (
                            <div>
                                <h4 className="text-lg font-medium text-gray-800 mb-4">NORSA History</h4>
                                <div className="space-y-2">
                                    {norsaHistory.map((norsa, index) => (
                                        <div key={index} className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
                                            <div className="text-sm">
                                                <span className="font-medium">Date:</span> {norsa.date}
                                            </div>
                                            <div className="text-sm">
                                                <span className="font-medium">Number:</span> {norsa.number}
                                            </div>
                                            <div className="text-sm">
                                                <span className="font-medium">Returned:</span> {norsa.returned_date || 'N/A'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* New action inputs */}
                        <div>
                            <h4 className="text-lg font-medium text-gray-800 mb-4">New Action</h4>
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date of RTS
                                    </label>
                                    <input
                                        type="date"
                                        value={currentDate}
                                        disabled
                                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Reason for RTS
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.rts_reason}
                                        onChange={(e) => setFormData({...formData, rts_reason: e.target.value})}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                                        placeholder="Enter reason for return to sender"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date of NORSA
                                    </label>
                                    <input
                                        type="date"
                                        value={currentDate}
                                        disabled
                                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        NORSA Number
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.norsa_number}
                                        onChange={(e) => setFormData({...formData, norsa_number: e.target.value})}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                                        placeholder="Enter NORSA number"
                                    />
                                </div>
                            </div>

                            {/* Action buttons - vertically stacked */}
                            <div className="space-y-3">
                                <button
                                    onClick={() => handleSubmit('mark_as_rts')}
                                    disabled={processing || !formData.rts_reason.trim()}
                                    className="w-full bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
                                >
                                    {processing ? 'Processing...' : 'Mark as RTS'}
                                </button>
                                
                                <button
                                    onClick={() => handleSubmit('review_done')}
                                    disabled={processing}
                                    className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                                >
                                    {processing ? 'Processing...' : 'Review Done'}
                                </button>
                                
                                <button
                                    onClick={() => handleSubmit('send_to_norsa')}
                                    disabled={processing || !formData.norsa_number.trim()}
                                    className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                                >
                                    {processing ? 'Processing...' : 'Send to NORSA'}
                                </button>
                            </div>
                        </div>
                    </div>
                );

            default:
                return <div>Loading...</div>;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 modal-backdrop overflow-y-auto" style={{ zIndex: 50000, paddingTop: '100px', paddingBottom: '20px' }}>
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">
                            DV Review Process - {dv?.payee}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="font-medium">DV Number:</span> {dv?.dv_number}</div>
                            <div><span className="font-medium">Amount:</span> ₱{parseFloat(dv?.amount || 0).toLocaleString()}</div>
                            <div><span className="font-medium">Status:</span> {dv?.status?.replace('_', ' ').toUpperCase()}</div>
                            <div><span className="font-medium">Transaction Type:</span> {dv?.transaction_type}</div>
                        </div>
                    </div>

                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
