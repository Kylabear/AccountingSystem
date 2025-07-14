import { useState } from 'react';

export default function NorsaInputForm({ onSubmit, onCancel }) {
    const [norsaNumber, setNorsaNumber] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleNorsaNumberChange = (e) => {
        let value = e.target.value;
        
        // Remove any non-digit characters
        let digitsOnly = value.replace(/[^0-9]/g, '');
        
        // Limit to maximum 10 digits total (YYYY + MM + NNNN)
        digitsOnly = digitsOnly.slice(0, 10);
        
        // Format as YYYY-MM-NNNN
        let formattedValue = '';
        if (digitsOnly.length > 0) {
            // Year part (YYYY) - only allow valid years
            const yearPart = digitsOnly.slice(0, 4);
            const currentYear = new Date().getFullYear();
            if (yearPart.length === 4) {
                const year = parseInt(yearPart);
                if (year < 2020 || year > currentYear + 1) {
                    setError(`Year must be between 2020 and ${currentYear + 1}`);
                    return;
                }
            }
            formattedValue = yearPart;

            if (digitsOnly.length > 4) {
                // Month part (MM) - only allow 01-12
                const monthPart = digitsOnly.slice(4, 6);
                if (monthPart.length === 2) {
                    const month = parseInt(monthPart);
                    if (month < 1 || month > 12) {
                        setError('Month must be between 01 and 12');
                        return;
                    }
                }
                formattedValue += '-' + monthPart;

                if (digitsOnly.length > 6) {
                    // Number part (NNNN)
                    const numberPart = digitsOnly.slice(6, 10);
                    formattedValue += '-' + numberPart;
                }
            }
        }
        
        setNorsaNumber(formattedValue);
        
        // Validate complete number
        if (formattedValue.length === 12) { // Full length with dashes
            const validationError = validateNorsaNumber(formattedValue);
            setError(validationError || '');
        } else {
            setError('');
        }
    };

    const validateNorsaNumber = (value) => {
        // NORSA number format: YYYY-MM-NNNN (exactly 12 characters including dashes)
        const norsaPattern = /^\d{4}-\d{2}-\d{4}$/;
        
        if (!value) {
            return 'NORSA number is required';
        }
        
        if (!norsaPattern.test(value)) {
            return 'Must follow format: YYYY-MM-NNNN';
        }

        const [year, month, number] = value.split('-');
        
        // Validate year (between 2020 and next year)
        const currentYear = new Date().getFullYear();
        if (parseInt(year) < 2020 || parseInt(year) > currentYear + 1) {
            return `Year must be between 2020 and ${currentYear + 1}`;
        }

        // Validate month (01-12)
        const monthNum = parseInt(month);
        if (monthNum < 1 || monthNum > 12) {
            return 'Month must be between 01 and 12';
        }

        // Ensure month is zero-padded
        if (month.length !== 2) {
            return 'Month must be two digits (e.g., 01-12)';
        }

        // Validate number part (exactly 4 digits)
        if (number.length !== 4) {
            return 'Number must be exactly 4 digits';
        }

        return null;
    };

    const handleSubmit = () => {
        const validationError = validateNorsaNumber(norsaNumber);
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsSubmitting(true);
        onSubmit(norsaNumber);
    };

    return (
        <div className="p-6 space-y-6">
            <h3 className="text-lg font-semibold mb-4">NORSA Details</h3>
            
            <div className="space-y-4">
                {/* NORSA Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        NORSA Date
                    </label>
                    <input
                        type="date"
                        value={new Date().toISOString().split('T')[0]}
                        disabled
                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                    />
                </div>

                {/* NORSA Number */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        NORSA Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={norsaNumber}
                            onChange={handleNorsaNumberChange}
                            className={`w-full p-3 border rounded-lg focus:outline-none ${
                                error 
                                    ? 'border-red-500 focus:border-red-500' 
                                    : 'border-gray-300 focus:border-green-500'
                            }`}
                            placeholder="YYYY-MM-NNNN"
                            maxLength={12}
                            pattern="\d{4}-\d{2}-\d{4}"
                            title="Format: YYYY-MM-NNNN"
                        />
                        {norsaNumber && !error && norsaNumber.length === 12 && (
                            <span className="absolute right-3 top-3 text-green-500">
                                ✓
                            </span>
                        )}
                    </div>
                    {error && (
                        <p className="text-red-500 text-xs mt-1">{error}</p>
                    )}
                    <p className="text-gray-500 text-xs mt-1">
                        Format: YYYY-MM-NNNN (e.g., 2025-07-1234)
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!norsaNumber || isSubmitting || error}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Confirm NORSA
                </button>
            </div>
        </div>
    );
}
