import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import NorsaInputForm from './NorsaInputForm';

export default function RtsNorsaModal({ dv, isOpen, onClose, onUpdate }) {
    const [showNorsaForm, setShowNorsaForm] = useState(false);
    const [formData, setFormData] = useState({
        rts_reason: '',
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setFormData({ rts_reason: '' });
            setErrors({});
            setShowNorsaForm(false);
            setProcessing(false);
        }
    }, [isOpen]);

    const handleSubmit = async (action) => {
        try {
            setProcessing(true);
            const currentDate = new Date().toISOString().split('T')[0];
            
            const data = {
                _method: 'PUT',
                date: currentDate
            };

            switch (action) {
                case 'review_done':
                    data.status = 'for_cash_allocation';
                    break;
                case 'return_to_sender':
                    if (!formData.rts_reason) {
                        setErrors({ rts_reason: 'Reason is required' });
                        setProcessing(false);
                        return;
                    }
                    data.status = 'for_rts_in';
                    data.rts_reason = formData.rts_reason;
                    break;
            }

            const response = await fetch(`/incoming-dvs/${dv.id}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update status');
            }

            const responseData = await response.json();
            if (responseData.success) {
                onClose();
                window.location.reload();
            } else {
                throw new Error(responseData.message || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'An error occurred while processing your request');
        } finally {
            setProcessing(false);
        }
    };

    const handleNorsaSubmit = async (norsaNumber) => {
        try {
            // Validate NORSA number format first
            const norsaPattern = /^\d{4}-\d{2}-\d{4}$/;
            if (!norsaPattern.test(norsaNumber)) {
                alert('Invalid NORSA number format. Must be YYYY-MM-NNNN');
                return;
            }

            // Parse and validate year and month
            const [year, month] = norsaNumber.split('-');
            const yearNum = parseInt(year);
            const monthNum = parseInt(month);
            const currentYear = new Date().getFullYear();

            if (yearNum < 2020 || yearNum > currentYear + 1) {
                alert(`Year must be between 2020 and ${currentYear + 1}`);
                return;
            }

            if (monthNum < 1 || monthNum > 12) {
                alert('Month must be between 01 and 12');
                return;
            }

            setProcessing(true);
            const response = await fetch(`/incoming-dvs/${dv.id}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({
                    _method: 'PUT',
                    status: 'for_norsa_in',
                    norsa_number: norsaNumber,
                    date: new Date().toISOString().split('T')[0]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update status');
            }

            const data = await response.json();
            if (data.success) {
                onClose();
                window.location.reload();
            } else {
                throw new Error(data.message || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'An error occurred while processing your request');
        } finally {
            setProcessing(false);
        }
    };

    const renderContent = () => {
        if (!dv) return null;

        // If showing NORSA form
        if (showNorsaForm) {
            return (
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold">NORSA Entry</h3>
                        <button
                            onClick={() => setShowNorsaForm(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ×
                        </button>
                    </div>
                    <NorsaInputForm 
                        onSubmit={handleNorsaSubmit}
                        onCancel={() => setShowNorsaForm(false)}
                    />
                </div>
            );
        }

        // Normal view with all action buttons
        return (
            <div className="p-6 space-y-6">
                <h3 className="text-lg font-semibold mb-4">Review Actions</h3>
                
                {/* RTS Section */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reason for Return to Sender (if applicable)
                        </label>
                        <input
                            type="text"
                            value={formData.rts_reason}
                            onChange={(e) => {
                                setFormData({ ...formData, rts_reason: e.target.value });
                                if (errors.rts_reason) setErrors({ ...errors, rts_reason: '' });
                            }}
                            className={`w-full p-3 border rounded-lg focus:outline-none ${
                                errors.rts_reason ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter reason for returning"
                        />
                        {errors.rts_reason && (
                            <p className="text-red-500 text-xs mt-1">{errors.rts_reason}</p>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => handleSubmit('review_done')}
                        disabled={processing}
                        className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                        {processing ? 'Processing...' : 'Review Done'}
                    </button>
                    
                    <button
                        onClick={() => handleSubmit('return_to_sender')}
                        disabled={processing || !formData.rts_reason.trim()}
                        className="w-full bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
                    >
                        {processing ? 'Processing...' : 'Return to Sender (RTS)'}
                    </button>
                    
                    <button
                        onClick={() => setShowNorsaForm(true)}
                        disabled={processing}
                        className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    >
                        {processing ? 'Processing...' : 'Send to NORSA'}
                    </button>
                    
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 modal-backdrop overflow-y-auto" style={{ zIndex: 50000 }}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                {renderContent()}
            </div>
        </div>
    );
}
