import { useState } from 'react';

export default function EngasModal({ dv, isOpen, onClose, onSubmit }) {
    const [engasNumber, setEngasNumber] = useState('');
    const [engasDate, setEngasDate] = useState(new Date().toISOString().split('T')[0]);
    const [error, setError] = useState('');

    // Generate placeholder based on current date
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const placeholder = `${year}-${month}-00001`;

    const validateEngasNumber = (value) => {
        // Pattern: YYYY-MM-XXXXX (where XXXXX is exactly 5 digits)
        const pattern = /^(\d{4})-(\d{2})-(\d{5})$/;
        const match = value.match(pattern);
        
        if (!match) {
            return 'Format must be YYYY-MM-XXXXX (e.g., 2025-06-00001)';
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
            return 'Serial number cannot be 00000';
        }
        
        return '';
    };

    const isValidFormat = (value) => {
        const pattern = /^(\d{4})-(\d{2})-(\d{5})$/;
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
        
        // Limit to maximum 11 digits (4 year + 2 month + 5 serial)
        if (digitsOnly.length > 11) {
            digitsOnly = digitsOnly.slice(0, 11);
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
            // Year + month + serial number (up to 5 digits)
            formattedValue = digitsOnly.slice(0, 4) + '-' + digitsOnly.slice(4, 6) + '-' + digitsOnly.slice(6, 11);
        }
        
        setEngasNumber(formattedValue);
        
        if (formattedValue) {
            const validationError = validateEngasNumber(formattedValue);
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

    if (!isOpen) return null;

    const isFormValid = isValidFormat(engasNumber) && engasDate;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-backdrop overflow-y-auto" style={{ zIndex: 50000, paddingTop: '100px', paddingBottom: '20px' }}>
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">E-NGAS Recording</h3>
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                        DV Number: <span className="font-medium">{dv?.dv_number}</span>
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                        Payee: <span className="font-medium">{dv?.payee}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            E-NGAS Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={engasNumber}
                            onChange={handleEngasNumberChange}
                            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${
                                error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-pink-500'
                            }`}
                            placeholder={placeholder}
                            maxLength="13"
                            required
                        />
                        {error && (
                            <p className="text-red-500 text-xs mt-1">{error}</p>
                        )}
                        <p className="text-gray-500 text-xs mt-1">
                            Format: YYYY-MM-XXXXX (e.g., {placeholder})
                        </p>
                        {engasNumber && !error && isValidFormat(engasNumber) && (
                            <p className="text-green-600 text-xs mt-1">✓ Valid format</p>
                        )}
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Recording Date <span className="text-red-500">*</span>
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
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!isFormValid}
                            className={`px-4 py-2 text-white rounded-md transition-all ${
                                isFormValid 
                                    ? 'hover:opacity-90 cursor-pointer' 
                                    : 'opacity-50 cursor-not-allowed'
                            }`}
                            style={{ backgroundColor: isFormValid ? '#EA3680' : '#9CA3AF' }}
                        >
                            Record E-NGAS
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
