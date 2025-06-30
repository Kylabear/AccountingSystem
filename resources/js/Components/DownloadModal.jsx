import { useState } from 'react';

export default function DownloadModal({ isOpen, onClose, onDownload }) {
    const [filterType, setFilterType] = useState('day');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [transactionType, setTransactionType] = useState('');
    const [implementingUnit, setImplementingUnit] = useState('');
    const [payee, setPayee] = useState('');
    const [includeDay, setIncludeDay] = useState(false);
    const [dayInMonth, setDayInMonth] = useState(1);
    const [fileType, setFileType] = useState('excel');

    // Generate year options (current year and 5 years back)
    const currentYear = new Date().getFullYear();
    const yearOptions = [];
    for (let i = 0; i <= 5; i++) {
        yearOptions.push(currentYear - i);
    }

    // Month options
    const monthOptions = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' }
    ];

    // Transaction type options
    const transactionTypes = [
        'Personnel Services',
        'Maintenance and Other Operating Expenses',
        'Capital Outlay',
        'Financial Assistance',
        'Others'
    ];

    // Generate day options
    const getDaysInMonth = (year, month) => {
        return new Date(year, month, 0).getDate();
    };

    const dayOptions = [];
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    for (let i = 1; i <= daysInMonth; i++) {
        dayOptions.push(i);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const downloadParams = {
            filterType,
            fileType,
            selectedDate: filterType === 'day' ? selectedDate : null,
            selectedMonth: filterType !== 'day' ? selectedMonth : null,
            selectedYear: filterType !== 'day' ? selectedYear : null,
            transactionType: filterType === 'transaction_type' ? transactionType : null,
            implementingUnit: filterType === 'implementing_unit' ? implementingUnit : null,
            payee: filterType === 'payee' ? payee : null,
            includeDay: (filterType === 'implementing_unit' || filterType === 'payee') ? includeDay : false,
            dayInMonth: includeDay ? dayInMonth : null
        };

        onDownload(downloadParams);
    };

    const resetForm = () => {
        setFilterType('day');
        setSelectedDate(new Date().toISOString().split('T')[0]);
        setSelectedMonth(new Date().getMonth() + 1);
        setSelectedYear(new Date().getFullYear());
        setTransactionType('');
        setImplementingUnit('');
        setPayee('');
        setIncludeDay(false);
        setDayInMonth(1);
        setFileType('excel');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center modal-backdrop overflow-y-auto" style={{ zIndex: 50000, paddingTop: '80px', paddingBottom: '20px' }}>
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-hidden m-4 flex flex-col">
                {/* Header */}
                <div className="bg-green-600 text-white border-b px-6 py-4 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold">📥 Download Processed DVs</h2>
                    <button onClick={onClose} className="text-white hover:text-gray-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
                    {/* Filter Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            🔍 Filter By:
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="day"
                                    checked={filterType === 'day'}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="mr-2"
                                />
                                <span>📅 Per Day</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="month"
                                    checked={filterType === 'month'}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="mr-2"
                                />
                                <span>📆 Per Month</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="transaction_type"
                                    checked={filterType === 'transaction_type'}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="mr-2"
                                />
                                <span>📋 Per Transaction Type</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="implementing_unit"
                                    checked={filterType === 'implementing_unit'}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="mr-2"
                                />
                                <span>🏢 Per Implementing Unit</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="payee"
                                    checked={filterType === 'payee'}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="mr-2"
                                />
                                <span>👤 Per Payee</span>
                            </label>
                        </div>
                    </div>

                    {/* Date Selection for Per Day */}
                    {filterType === 'day' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                📅 Select Date:
                            </label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                required
                            />
                        </div>
                    )}

                    {/* Month/Year Selection for Per Month */}
                    {filterType === 'month' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    📆 Month:
                                </label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                    required
                                >
                                    {monthOptions.map(month => (
                                        <option key={month.value} value={month.value}>
                                            {month.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    📅 Year:
                                </label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                    required
                                >
                                    {yearOptions.map(year => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Transaction Type Selection */}
                    {filterType === 'transaction_type' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                📋 Transaction Type:
                            </label>
                            <select
                                value={transactionType}
                                onChange={(e) => setTransactionType(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                required
                            >
                                <option value="">Select Transaction Type</option>
                                {transactionTypes.map(type => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Implementing Unit Selection */}
                    {filterType === 'implementing_unit' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    🏢 Implementing Unit:
                                </label>
                                <input
                                    type="text"
                                    value={implementingUnit}
                                    onChange={(e) => setImplementingUnit(e.target.value)}
                                    placeholder="Enter implementing unit name"
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                    required
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        📆 Month:
                                    </label>
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                        required
                                    >
                                        {monthOptions.map(month => (
                                            <option key={month.value} value={month.value}>
                                                {month.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        📅 Year:
                                    </label>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                        required
                                    >
                                        {yearOptions.map(year => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Optional specific day */}
                            <div>
                                <label className="flex items-center mb-2">
                                    <input
                                        type="checkbox"
                                        checked={includeDay}
                                        onChange={(e) => setIncludeDay(e.target.checked)}
                                        className="mr-2"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        📅 Filter by specific day
                                    </span>
                                </label>
                                {includeDay && (
                                    <select
                                        value={dayInMonth}
                                        onChange={(e) => setDayInMonth(parseInt(e.target.value))}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                    >
                                        {dayOptions.map(day => (
                                            <option key={day} value={day}>
                                                {day}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Payee Selection */}
                    {filterType === 'payee' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    👤 Payee:
                                </label>
                                <input
                                    type="text"
                                    value={payee}
                                    onChange={(e) => setPayee(e.target.value)}
                                    placeholder="Enter payee name (e.g., PLDT)"
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                    required
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        📆 Month:
                                    </label>
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                        required
                                    >
                                        {monthOptions.map(month => (
                                            <option key={month.value} value={month.value}>
                                                {month.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        📅 Year:
                                    </label>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                        required
                                    >
                                        {yearOptions.map(year => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Optional specific day */}
                            <div>
                                <label className="flex items-center mb-2">
                                    <input
                                        type="checkbox"
                                        checked={includeDay}
                                        onChange={(e) => setIncludeDay(e.target.checked)}
                                        className="mr-2"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        📅 Filter by specific day
                                    </span>
                                </label>
                                {includeDay && (
                                    <select
                                        value={dayInMonth}
                                        onChange={(e) => setDayInMonth(parseInt(e.target.value))}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                    >
                                        {dayOptions.map(day => (
                                            <option key={day} value={day}>
                                                {day}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                    )}

                    {/* File Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            📁 Download File Type:
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                            <label className="flex items-center justify-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                                <input
                                    type="radio"
                                    value="excel"
                                    checked={fileType === 'excel'}
                                    onChange={(e) => setFileType(e.target.value)}
                                    className="sr-only"
                                />
                                <div className={`text-center ${fileType === 'excel' ? 'text-green-600' : 'text-gray-600'}`}>
                                    <div className="text-2xl mb-1">📊</div>
                                    <div className="text-sm font-medium">Excel</div>
                                </div>
                            </label>
                            <label className="flex items-center justify-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                                <input
                                    type="radio"
                                    value="docx"
                                    checked={fileType === 'docx'}
                                    onChange={(e) => setFileType(e.target.value)}
                                    className="sr-only"
                                />
                                <div className={`text-center ${fileType === 'docx' ? 'text-green-600' : 'text-gray-600'}`}>
                                    <div className="text-2xl mb-1">📄</div>
                                    <div className="text-sm font-medium">Word</div>
                                </div>
                            </label>
                            <label className="flex items-center justify-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                                <input
                                    type="radio"
                                    value="pdf"
                                    checked={fileType === 'pdf'}
                                    onChange={(e) => setFileType(e.target.value)}
                                    className="sr-only"
                                />
                                <div className={`text-center ${fileType === 'pdf' ? 'text-green-600' : 'text-gray-600'}`}>
                                    <div className="text-2xl mb-1">📕</div>
                                    <div className="text-sm font-medium">PDF</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => {
                                resetForm();
                                onClose();
                            }}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
