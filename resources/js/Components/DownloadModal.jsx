import { useState } from 'react';

export default function DownloadModal({ isOpen, onClose, onDownload }) {
    const [filterType, setFilterType] = useState('all');
    const [fileType, setFileType] = useState('excel');
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setMonth(date.getMonth() - 1); // Default to 1 month ago
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        return new Date().toISOString().split('T')[0]; // Default to today
    });
    const [transactionType, setTransactionType] = useState('');
    const [implementingUnit, setImplementingUnit] = useState('');
    const [payee, setPayee] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        onDownload({
            filterType,
            fileType,
            startDate,
            endDate,
            transactionType,
            implementingUnit,
            payee
        });
    };

    const setQuickDateRange = (days) => {
        const today = new Date();
        const pastDate = new Date();
        pastDate.setDate(today.getDate() - days);
        
        setStartDate(pastDate.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                            <span className="mr-2">📥</span>
                            Download Processed DVs
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors"
                        >
                            ×
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Date Range Section */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <span className="mr-2">📅</span>
                            Date Range Filter
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    📅 Start Date
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    📅 End Date
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        {/* Quick Date Range Buttons */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => setQuickDateRange(7)}
                                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                                Last 7 Days
                            </button>
                            <button
                                type="button"
                                onClick={() => setQuickDateRange(30)}
                                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                            >
                                Last 30 Days
                            </button>
                            <button
                                type="button"
                                onClick={() => setQuickDateRange(90)}
                                className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                            >
                                Last 90 Days
                            </button>
                        </div>

                        {/* Date Range Summary */}
                        <div className="mt-3 p-2 bg-white rounded-lg border border-green-200">
                            <span className="text-sm text-gray-600">
                                Selected Range: <strong>{new Date(startDate).toLocaleDateString()}</strong> to <strong>{new Date(endDate).toLocaleDateString()}</strong>
                                ({Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))} days)
                            </span>
                        </div>
                    </div>

                    {/* Filter Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            🔍 Filter Type
                        </label>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            <option value="all">All Records</option>
                            <option value="transaction_type">By Transaction Type</option>
                            <option value="implementing_unit">By Implementing Unit</option>
                            <option value="payee">By Payee</option>
                        </select>
                    </div>

                    {/* Conditional filter inputs */}
                    {filterType === 'transaction_type' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                📋 Transaction Type
                            </label>
                            <input
                                type="text"
                                value={transactionType}
                                onChange={(e) => setTransactionType(e.target.value)}
                                placeholder="Enter transaction type"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                    )}

                    {filterType === 'implementing_unit' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                🏢 Implementing Unit
                            </label>
                            <input
                                type="text"
                                value={implementingUnit}
                                onChange={(e) => setImplementingUnit(e.target.value)}
                                placeholder="Enter implementing unit"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                    )}

                    {filterType === 'payee' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                👤 Payee
                            </label>
                            <input
                                type="text"
                                value={payee}
                                onChange={(e) => setPayee(e.target.value)}
                                placeholder="Enter payee name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                    )}

                    {/* File Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            📄 File Type
                        </label>
                        <select
                            value={fileType}
                            onChange={(e) => setFileType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            <option value="excel">📊 Excel (.xlsx)</option>
                            <option value="docx">� Word Document (.docx)</option>
                            <option value="pdf">📄 PDF (.pdf)</option>
                        </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-medium flex items-center justify-center"
                        >
                            <span className="mr-2">📥</span>
                            Download
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
