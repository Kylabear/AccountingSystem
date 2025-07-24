import { useState } from 'react';

export default function IndexingModal({ dv, isOpen, onClose, onSubmit }) {
    const [indexingDate, setIndexingDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            indexing_date: indexingDate
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-backdrop overflow-y-auto" style={{ zIndex: 50000, paddingTop: '80px', paddingBottom: '20px' }}>
            <div className="bg-white rounded-lg w-full max-w-6xl max-h-screen overflow-hidden m-4 flex flex-col">
                {/* Header */}
                <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center flex-shrink-0">
                    <h3 className="text-xl font-bold">Index DV</h3>
                    <button onClick={onClose} className="text-white hover:text-gray-200">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto">
                    <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">
                            DV Number: <span className="font-medium">{dv.dv_number}</span>
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                            Payee: <span className="font-medium">{dv.payee}</span>
                        </p>
                        <p className="text-sm text-gray-600 mb-4">
                            Verify against previous payments to avoid duplication.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date of Indexing
                            </label>
                            <input
                                type="date"
                                value={indexingDate}
                                onChange={(e) => setIndexingDate(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

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
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                                Complete Indexing
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
