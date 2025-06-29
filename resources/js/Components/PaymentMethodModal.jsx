import { useState } from 'react';

export default function PaymentMethodModal({ dv, isOpen, onClose, onSubmit }) {
    const [paymentMethod, setPaymentMethod] = useState('');
    const [lddapNumber, setLddapNumber] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            payment_method: paymentMethod
        };
        
        if (paymentMethod === 'lddap') {
            data.lddap_number = lddapNumber;
        }
        
        onSubmit(data);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-backdrop overflow-y-auto" style={{ zIndex: 50000, paddingTop: '100px', paddingBottom: '20px' }}>
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Set Payment Method</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                        DV Number: <span className="font-medium">{dv.dv_number}</span>
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                        Payee: <span className="font-medium">{dv.payee}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Method
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="check"
                                    checked={paymentMethod === 'check'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="mr-2"
                                />
                                Physical Check
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="lddap"
                                    checked={paymentMethod === 'lddap'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="mr-2"
                                />
                                LDDAP-ADA Channel
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="payroll"
                                    checked={paymentMethod === 'payroll'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="mr-2"
                                />
                                Payroll Register
                            </label>
                        </div>
                    </div>

                    {paymentMethod === 'lddap' && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                LDDAP Number
                            </label>
                            <input
                                type="text"
                                value={lddapNumber}
                                onChange={(e) => setLddapNumber(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Enter LDDAP number"
                                required
                            />
                        </div>
                    )}

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!paymentMethod}
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                        >
                            Set Payment Method
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
