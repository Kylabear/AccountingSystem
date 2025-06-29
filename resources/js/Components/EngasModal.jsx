import { useState } from 'react';

export default function EngasModal({ dv, isOpen, onClose, onSubmit }) {
    const [engasNumber, setEngasNumber] = useState('');
    const [engasDate, setEngasDate] = useState(new Date().toISOString().split('T')[0]);
    const [error, setError] = useState('');

    // Generate placeholder based on current date
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const placeholder = `${year}-${month}-00000`;

    const validateEngasNumber = (value) => {
        // Pattern: YYYY-MM-XXXXX (where XXXXX is 5 digits)
        const pattern = /^(\d{4})-(\d{2})-(\d{5})$/;
        const match = value.match(pattern);
        
        if (!match) {
            return 'Format must be YYYY-MM-XXXXX (e.g., 2025-06-05423)';
        }
        
        const [, yearStr, monthStr] = match;
        const year = parseInt(yearStr);
        const month = parseInt(monthStr);
        
        if (year < 2020 || year > 2030) {
            return 'Year must be between 2020 and 2030';
        }
        
        if (month < 1 || month > 12) {
            return 'Month must be between 01 and 12';
        }
        
        return '';
    };

    const handleEngasNumberChange = (e) => {
        const value = e.target.value;
        setEngasNumber(value);
        
        if (value) {
            const validationError = validateEngasNumber(value);
            setError(validationError);
        } else {
            setError('');
        }
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
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-backdrop overflow-y-auto" style={{ zIndex: 50000, paddingTop: '100px', paddingBottom: '20px' }}>
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">E-NGAS Recording</h3>
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
                            E-NGAS Number
                        </label>
                        <input
                            type="text"
                            value={engasNumber}
                            onChange={handleEngasNumberChange}
                            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${
                                error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-pink-500'
                            }`}
                            placeholder={placeholder}
                            required
                        />
                        {error && (
                            <p className="text-red-500 text-xs mt-1">{error}</p>
                        )}
                        <p className="text-gray-500 text-xs mt-1">
                            Format: YYYY-MM-XXXXX (e.g., {placeholder})
                        </p>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Recording Date
                        </label>
                        <input
                            type="date"
                            value={engasDate}
                            onChange={(e) => setEngasDate(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
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
                            className="px-4 py-2 text-white rounded-md hover:opacity-90"
                            style={{ backgroundColor: '#EA3680' }}
                        >
                            Record E-NGAS
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
