import { Link } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';

export default function DvDetailsPage({ dv }) {
    const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
    const downloadRef = useRef(null);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (downloadRef.current && !downloadRef.current.contains(event.target)) {
                setShowDownloadDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const formatCurrency = (amount) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    const downloadDv = (format = 'pdf') => {
        setShowDownloadDropdown(false);
        
        // Create download URL with format parameter
        const downloadUrl = `/incoming-dvs/${dv.id}/download?format=${format}`;
        
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `DV_${dv.dv_number}_${format.toUpperCase()}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toggleDownloadDropdown = () => {
        setShowDownloadDropdown(!showDownloadDropdown);
    };

    // Calculate processing duration
    const calculateDuration = () => {
        if (!dv.received_date || !dv.lddap_certified_date) {
            return { insideDays: 'N/A', totalDays: 'N/A' };
        }

        const startDate = new Date(dv.received_date);
        const endDate = new Date(dv.lddap_certified_date);
        const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

        // Calculate days outside accounting (approximation based on typical workflow)
        let outsideDays = 0;
        
        // Days for approval (if went out for approval)
        if (dv.approval_out_date && dv.approval_in_date) {
            const approvalOut = new Date(dv.approval_out_date);
            const approvalIn = new Date(dv.approval_in_date);
            outsideDays += Math.ceil((approvalIn - approvalOut) / (1000 * 60 * 60 * 24));
        }

        // Days for NORSA (if issued)
        if (dv.norsa_out_date && dv.norsa_in_date) {
            const norsaOut = new Date(dv.norsa_out_date);
            const norsaIn = new Date(dv.norsa_in_date);
            outsideDays += Math.ceil((norsaIn - norsaOut) / (1000 * 60 * 60 * 24));
        }

        // Days for RTS (if issued)
        if (dv.rts_out_date && dv.rts_in_date) {
            const rtsOut = new Date(dv.rts_out_date);
            const rtsIn = new Date(dv.rts_in_date);
            outsideDays += Math.ceil((rtsIn - rtsOut) / (1000 * 60 * 60 * 24));
        }

        // Days for PR processing (if applicable)
        if (dv.payment_method === 'pr' && dv.pr_out_date && dv.pr_in_date) {
            const prOut = new Date(dv.pr_out_date);
            const prIn = new Date(dv.pr_in_date);
            outsideDays += Math.ceil((prIn - prOut) / (1000 * 60 * 60 * 24));
        }

        const insideDays = totalDays - outsideDays;

        return {
            insideDays: insideDays > 0 ? insideDays : 'N/A',
            totalDays: totalDays > 0 ? totalDays : 'N/A'
        };
    };

    const duration = calculateDuration();

    // Helper function to get transaction history entry by action
    const getTransactionEntry = (action) => {
        return dv.transaction_history?.find(entry => 
            entry.action.toLowerCase().includes(action.toLowerCase())
        );
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sticky Header */}
            <div className="bg-green-700 text-white p-4 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center">
                        <img 
                            src="/DALOGO.png" 
                            alt="DA Logo" 
                            className="w-16 h-16 mr-3 object-contain"
                        />
                        <h1 className="text-xl font-medium">DA-CAR Accounting Section Monitoring and Tracking System</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link href="/statistics" className="hover:text-green-200">Statistics</Link>
                        <Link href="/profile" className="hover:text-green-200">Profile</Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                {/* Back button */}
                <div className="mb-6">
                    <Link 
                        href="/incoming-dvs"
                        className="inline-flex items-center text-green-600 hover:text-green-700"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Dashboard
                    </Link>
                </div>

                {/* Header with DV info and download button */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Disbursement Voucher Details
                            </h2>
                            <p className="text-lg text-gray-600">
                                DV Number: <span className="font-semibold">{dv.dv_number}</span>
                            </p>
                            <p className="text-sm text-green-600 font-medium">
                                Status: {dv.status.replace(/_/g, ' ').toUpperCase()}
                            </p>
                        </div>
                        <div className="relative" ref={downloadRef}>
                            <button
                                onClick={toggleDownloadDropdown}
                                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center relative"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download Full Copy
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            
                            {showDownloadDropdown && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                    <div className="py-1">
                                        <button
                                            onClick={() => downloadDv('pdf')}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            <svg className="w-4 h-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                            Download as PDF
                                        </button>
                                        <button
                                            onClick={() => downloadDv('excel')}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            <svg className="w-4 h-4 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                                            </svg>
                                            Download as Excel
                                        </button>
                                        <button
                                            onClick={() => downloadDv('docx')}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            <svg className="w-4 h-4 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Download as DOCX
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main content with sidebar layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main content - left side (3 columns) */}
                    <div className="lg:col-span-3 space-y-6">
                        
                        {/* Details Upon Received */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-2xl hover:border-blue-300 transition-all duration-500 transform hover:-translate-y-2 hover:scale-102 animate-fade-in-up">
                            <h3 className="text-xl font-bold mb-4 text-blue-700 border-b-2 border-blue-200 pb-2 flex items-center group cursor-pointer">
                                <span className="mr-3 text-2xl group-hover:animate-bounce">📝</span>
                                <span className="group-hover:text-blue-800 transition-colors">Details Upon Received</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="hover:bg-blue-50 p-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                                    <label className="text-sm font-medium text-gray-500">Transaction Type</label>
                                    <p className="text-gray-900 font-semibold">{dv.transaction_type}</p>
                                </div>
                                <div className="hover:bg-blue-50 p-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                                    <label className="text-sm font-medium text-gray-500">Implementing Unit</label>
                                    <p className="text-gray-900 font-semibold">{dv.implementing_unit}</p>
                                </div>
                                <div className="hover:bg-blue-50 p-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                                    <label className="text-sm font-medium text-gray-500">Payee</label>
                                    <p className="text-gray-900 font-semibold">{dv.payee}</p>
                                </div>
                                <div className="hover:bg-blue-50 p-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                                    <label className="text-sm font-medium text-gray-500">Account Number</label>
                                    <p className="text-gray-900 font-semibold">{dv.account_number || 'N/A'}</p>
                                </div>
                                <div className="hover:bg-green-50 p-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                                    <label className="text-sm font-medium text-gray-500">Original Amount</label>
                                    <p className="font-bold text-green-700">{formatCurrency(dv.amount)}</p>
                                </div>
                                <div className="hover:bg-blue-50 p-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                                    <label className="text-sm font-medium text-gray-500">Received Date</label>
                                    <p className="text-gray-900 font-semibold">{formatDate(dv.received_date)}</p>
                                </div>
                                <div className="md:col-span-2 hover:bg-blue-50 p-3 rounded-lg transition-all duration-300 transform hover:scale-102">
                                    <label className="text-sm font-medium text-gray-500">Particulars</label>
                                    <p className="text-gray-900">{dv.particulars}</p>
                                </div>
                            </div>
                        </div>

                        {/* For Review (RTS and NORSA) */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-2xl hover:border-orange-300 transition-all duration-500 transform hover:-translate-y-2 hover:scale-102 animate-fade-in-up">
                            <h3 className="text-xl font-bold mb-4 text-orange-700 border-b-2 border-orange-200 pb-2 flex items-center group cursor-pointer">
                                <span className="mr-3 text-2xl group-hover:animate-spin">🔄</span>
                                <span className="group-hover:text-orange-800 transition-colors">For Review</span>
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* RTS Section */}
                                <div className="border-l-4 border-red-400 pl-4 hover:border-red-600 transition-all duration-300 transform hover:scale-105 hover:shadow-md rounded-lg p-4 hover:bg-red-50">
                                    <h4 className="font-medium text-red-700 mb-3 flex items-center">
                                        <span className="mr-2 animate-pulse">❌</span>
                                        Return to Sender (RTS)
                                    </h4>
                                    {dv.rts_out_date || dv.rts_in_date ? (
                                        <div className="space-y-2">
                                            <div className="hover:bg-red-100 p-2 rounded transition-all duration-300">
                                                <label className="text-sm font-medium text-gray-500">RTS Issued Date</label>
                                                <p className="text-gray-900 font-semibold">{formatDate(dv.rts_out_date) || 'N/A'}</p>
                                            </div>
                                            <div className="hover:bg-red-100 p-2 rounded transition-all duration-300">
                                                <label className="text-sm font-medium text-gray-500">RTS Returned Date</label>
                                                <p className="text-gray-900 font-semibold">{formatDate(dv.rts_in_date) || 'N/A'}</p>
                                            </div>
                                            {dv.rts_reason && (
                                                <div className="hover:bg-red-100 p-2 rounded transition-all duration-300">
                                                    <label className="text-sm font-medium text-gray-500">RTS Reason</label>
                                                    <p className="text-gray-900">{dv.rts_reason}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 italic flex items-center">
                                            <span className="mr-2">✅</span>
                                            No RTS issued for this transaction
                                        </p>
                                    )}
                                </div>

                                {/* NORSA Section */}
                                <div className="border-l-4 border-yellow-400 pl-4 hover:border-yellow-600 transition-all duration-300 transform hover:scale-105 hover:shadow-md rounded-lg p-4 hover:bg-yellow-50">
                                    <h4 className="font-medium text-yellow-700 mb-3 flex items-center">
                                        <span className="mr-2 animate-pulse">📋</span>
                                        Notice of Receipt of Supporting Attachments (NORSA)
                                    </h4>
                                    {dv.norsa_out_date || dv.norsa_in_date ? (
                                        <div className="space-y-2">
                                            <div className="hover:bg-yellow-100 p-2 rounded transition-all duration-300">
                                                <label className="text-sm font-medium text-gray-500">NORSA Issued Date</label>
                                                <p className="text-gray-900 font-semibold">{formatDate(dv.norsa_out_date) || 'N/A'}</p>
                                            </div>
                                            <div className="hover:bg-yellow-100 p-2 rounded transition-all duration-300">
                                                <label className="text-sm font-medium text-gray-500">NORSA Completed Date</label>
                                                <p className="text-gray-900 font-semibold">{formatDate(dv.norsa_in_date) || 'N/A'}</p>
                                            </div>
                                            {dv.norsa_reason && (
                                                <div className="hover:bg-yellow-100 p-2 rounded transition-all duration-300">
                                                    <label className="text-sm font-medium text-gray-500">NORSA Details</label>
                                                    <p className="text-gray-900">{dv.norsa_reason}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 italic flex items-center">
                                            <span className="mr-2">✅</span>
                                            No NORSA issued for this transaction
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Cash Allocation Details */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-2xl hover:border-green-300 transition-all duration-500 transform hover:-translate-y-2 hover:scale-102 animate-fade-in-up">
                            <h3 className="text-xl font-bold mb-4 text-green-700 border-b-2 border-green-200 pb-2 flex items-center group cursor-pointer">
                                <span className="mr-3 text-2xl group-hover:animate-bounce">💰</span>
                                <span className="group-hover:text-green-800 transition-colors">Cash Allocation Details</span>
                            </h3>
                            {dv.cash_allocation_number ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="hover:bg-green-50 p-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                                        <label className="text-sm font-medium text-gray-500">Cash Allocation Number</label>
                                        <p className="text-gray-900 font-semibold">{dv.cash_allocation_number}</p>
                                    </div>
                                    <div className="hover:bg-green-50 p-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                                        <label className="text-sm font-medium text-gray-500">Allocation Date</label>
                                        <p className="text-gray-900 font-semibold">{formatDate(dv.cash_allocation_date)}</p>
                                    </div>
                                    {dv.net_amount && (
                                        <div className="hover:bg-green-50 p-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                                            <label className="text-sm font-medium text-gray-500">Net Amount</label>
                                            <p className="font-bold text-green-700">{formatCurrency(dv.net_amount)}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-6xl animate-pulse mb-4">💸</div>
                                    <p className="text-gray-400 italic">No cash allocation details available</p>
                                </div>
                            )}
                        </div>

                        {/* Box C / Date of Certification */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-2xl hover:border-purple-300 transition-all duration-500 transform hover:-translate-y-2 hover:scale-102 animate-fade-in-up">
                            <h3 className="text-xl font-bold mb-4 text-purple-700 border-b-2 border-purple-200 pb-2 flex items-center group cursor-pointer">
                                <span className="mr-3 text-2xl group-hover:animate-pulse">📋</span>
                                <span className="group-hover:text-purple-800 transition-colors">Box C / Date of Certification</span>
                            </h3>
                            {dv.box_c_date || dv.certification_date ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="hover:bg-purple-50 p-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                                        <label className="text-sm font-medium text-gray-500">Box C Date</label>
                                        <p className="text-gray-900 font-semibold">{formatDate(dv.box_c_date) || 'N/A'}</p>
                                    </div>
                                    <div className="hover:bg-purple-50 p-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                                        <label className="text-sm font-medium text-gray-500">Certification Date</label>
                                        <p className="text-gray-900 font-semibold">{formatDate(dv.certification_date) || 'N/A'}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-6xl animate-pulse mb-4">📝</div>
                                    <p className="text-gray-400 italic">No certification details available</p>
                                </div>
                            )}
                        </div>

                        {/* Approval / Out and In Details */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-2xl hover:border-indigo-300 transition-all duration-500 transform hover:-translate-y-2 hover:scale-102 animate-fade-in-up">
                            <h3 className="text-xl font-bold mb-4 text-indigo-700 border-b-2 border-indigo-200 pb-2 flex items-center group cursor-pointer">
                                <span className="mr-3 text-2xl group-hover:animate-bounce">✅</span>
                                <span className="group-hover:text-indigo-800 transition-colors">Approval / Out and In Details</span>
                            </h3>
                            {dv.approval_out_date || dv.approval_in_date ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="hover:bg-indigo-50 p-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                                        <label className="text-sm font-medium text-gray-500">Sent for Approval Date</label>
                                        <p className="text-gray-900 font-semibold">{formatDate(dv.approval_out_date) || 'N/A'}</p>
                                    </div>
                                    <div className="hover:bg-indigo-50 p-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                                        <label className="text-sm font-medium text-gray-500">Returned from Approval Date</label>
                                        <p className="text-gray-900 font-semibold">{formatDate(dv.approval_in_date) || 'N/A'}</p>
                                    </div>
                                    {dv.approval_status && (
                                        <div className="hover:bg-indigo-50 p-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                                            <label className="text-sm font-medium text-gray-500">Approval Status</label>
                                            <p className="text-gray-900 font-semibold">{dv.approval_status}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-6xl animate-pulse mb-4">⚡</div>
                                    <p className="text-gray-400 italic">No approval process details available</p>
                                </div>
                            )}
                        </div>

                        {/* Indexing */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-2xl hover:border-pink-300 transition-all duration-500 transform hover:-translate-y-2 hover:scale-102 animate-fade-in-up">
                            <h3 className="text-xl font-bold mb-4 text-pink-700 border-b-2 border-pink-200 pb-2 flex items-center group cursor-pointer">
                                <span className="mr-3 text-2xl group-hover:animate-spin">📇</span>
                                <span className="group-hover:text-pink-800 transition-colors">Indexing</span>
                            </h3>
                            {dv.indexing_date ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="hover:bg-pink-50 p-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                                        <label className="text-sm font-medium text-gray-500">Indexing Date</label>
                                        <p className="text-gray-900 font-semibold">{formatDate(dv.indexing_date)}</p>
                                    </div>
                                    <div className="hover:bg-pink-50 p-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                                        <label className="text-sm font-medium text-gray-500">Indexed By</label>
                                        <p className="text-gray-900 font-semibold">{dv.indexed_by || 'N/A'}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-6xl animate-pulse mb-4">📚</div>
                                    <p className="text-gray-400 italic">No indexing details available</p>
                                </div>
                            )}
                        </div>

                        {/* Mode of Payment */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-2xl hover:border-teal-300 transition-all duration-500 transform hover:-translate-y-2 hover:scale-102 animate-fade-in-up">
                            <h3 className="text-xl font-bold mb-4 text-teal-700 border-b-2 border-teal-200 pb-2 flex items-center group cursor-pointer">
                                <span className="mr-3 text-2xl group-hover:animate-bounce">💳</span>
                                <span className="group-hover:text-teal-800 transition-colors">Mode of Payment: Check, LDDAP or PR Details</span>
                            </h3>
                            {dv.payment_method ? (
                                <div className="space-y-4">
                                    <div className="hover:bg-teal-50 p-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                                        <label className="text-sm font-medium text-gray-500">Payment Method</label>
                                        <p className="font-bold text-teal-700 text-xl">{dv.payment_method.toUpperCase()}</p>
                                    </div>
                                    
                                    {dv.payment_method === 'check' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="hover:bg-teal-50 p-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                                                <label className="text-sm font-medium text-gray-500">Check Number</label>
                                                <p className="text-gray-900 font-semibold">{dv.check_number || 'N/A'}</p>
                                            </div>
                                            <div className="hover:bg-teal-50 p-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                                                <label className="text-sm font-medium text-gray-500">Check Date</label>
                                                <p className="text-gray-900 font-semibold">{formatDate(dv.check_date) || 'N/A'}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {dv.payment_method === 'lddap' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="hover:bg-teal-50 p-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                                                <label className="text-sm font-medium text-gray-500">LDDAP Number</label>
                                                <p className="text-gray-900 font-semibold">{dv.lddap_number || 'N/A'}</p>
                                            </div>
                                            <div className="hover:bg-teal-50 p-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                                                <label className="text-sm font-medium text-gray-500">LDDAP Date</label>
                                                <p className="text-gray-900 font-semibold">{formatDate(dv.lddap_date) || 'N/A'}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {dv.payment_method === 'pr' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="hover:bg-teal-50 p-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                                                <label className="text-sm font-medium text-gray-500">PR Number</label>
                                                <p className="text-gray-900 font-semibold">{dv.pr_number || 'N/A'}</p>
                                            </div>
                                            <div className="hover:bg-teal-50 p-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                                                <label className="text-sm font-medium text-gray-500">PR Out Date</label>
                                                <p className="text-gray-900 font-semibold">{formatDate(dv.pr_out_date) || 'N/A'}</p>
                                            </div>
                                            <div className="hover:bg-teal-50 p-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                                                <label className="text-sm font-medium text-gray-500">PR In Date</label>
                                                <p className="text-gray-900 font-semibold">{formatDate(dv.pr_in_date) || 'N/A'}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-6xl animate-pulse mb-4">💰</div>
                                    <p className="text-gray-400 italic">No payment method details available</p>
                                </div>
                            )}
                        </div>

                        {/* E-NGAS Details and CDJ Detail together with LDDAP Certification */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-2xl hover:border-red-300 transition-all duration-500 transform hover:-translate-y-2 hover:scale-102 animate-fade-in-up">
                            <h3 className="text-xl font-bold mb-4 text-red-700 border-b-2 border-red-200 pb-2 flex items-center group cursor-pointer">
                                <span className="mr-3 text-2xl group-hover:animate-pulse">🔢</span>
                                <span className="group-hover:text-red-800 transition-colors">E-NGAS Details and CDJ Detail together with LDDAP Certification</span>
                            </h3>
                            <div className="space-y-6">
                                {/* E-NGAS Details */}
                                <div className="border-l-4 border-blue-400 pl-4 hover:border-blue-600 transition-all duration-300 transform hover:scale-105 hover:shadow-md rounded-lg p-4 hover:bg-blue-50">
                                    <h4 className="font-medium text-blue-700 mb-3 flex items-center">
                                        <span className="mr-2 animate-pulse">💻</span>
                                        E-NGAS Details
                                    </h4>
                                    {dv.engas_number ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="hover:bg-blue-100 p-2 rounded transition-all duration-300">
                                                <label className="text-sm font-medium text-gray-500">E-NGAS Number</label>
                                                <p className="text-gray-900 font-semibold">{dv.engas_number}</p>
                                            </div>
                                            <div className="hover:bg-blue-100 p-2 rounded transition-all duration-300">
                                                <label className="text-sm font-medium text-gray-500">E-NGAS Date</label>
                                                <p className="text-gray-900 font-semibold">{formatDate(dv.engas_date)}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 italic flex items-center">
                                            <span className="mr-2">📝</span>
                                            No E-NGAS details available
                                        </p>
                                    )}
                                </div>

                                {/* CDJ Details */}
                                <div className="border-l-4 border-green-400 pl-4 hover:border-green-600 transition-all duration-300 transform hover:scale-105 hover:shadow-md rounded-lg p-4 hover:bg-green-50">
                                    <h4 className="font-medium text-green-700 mb-3 flex items-center">
                                        <span className="mr-2 animate-pulse">📊</span>
                                        CDJ Recording Details
                                    </h4>
                                    {dv.cdj_date ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="hover:bg-green-100 p-2 rounded transition-all duration-300">
                                                <label className="text-sm font-medium text-gray-500">CDJ Recording Date</label>
                                                <p className="text-gray-900 font-semibold">{formatDate(dv.cdj_date)}</p>
                                            </div>
                                            <div className="hover:bg-green-100 p-2 rounded transition-all duration-300">
                                                <label className="text-sm font-medium text-gray-500">CDJ Recorded By</label>
                                                <p className="text-gray-900 font-semibold">{dv.cdj_recorded_by || 'N/A'}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 italic flex items-center">
                                            <span className="mr-2">📋</span>
                                            No CDJ recording details available
                                        </p>
                                    )}
                                </div>

                                {/* LDDAP Certification */}
                                <div className="border-l-4 border-purple-400 pl-4 hover:border-purple-600 transition-all duration-300 transform hover:scale-105 hover:shadow-md rounded-lg p-4 hover:bg-purple-50">
                                    <h4 className="font-medium text-purple-700 mb-3 flex items-center">
                                        <span className="mr-2 animate-pulse">✅</span>
                                        LDDAP Certification
                                    </h4>
                                    {dv.lddap_certified_date ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="hover:bg-purple-100 p-2 rounded transition-all duration-300">
                                                <label className="text-sm font-medium text-gray-500">LDDAP Certified Date</label>
                                                <p className="text-gray-900 font-semibold">{formatDate(dv.lddap_certified_date)}</p>
                                            </div>
                                            <div className="hover:bg-purple-100 p-2 rounded transition-all duration-300">
                                                <label className="text-sm font-medium text-gray-500">LDDAP Certified By</label>
                                                <p className="text-gray-900 font-semibold">{dv.lddap_certified_by || 'N/A'}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 italic flex items-center">
                                            <span className="mr-2">🔍</span>
                                            No LDDAP certification details available
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ORS Entries */}
                        {dv.ors_entries && dv.ors_entries.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-2xl hover:border-gray-400 transition-all duration-500 transform hover:-translate-y-2 hover:scale-102 animate-fade-in-up">
                                <h3 className="text-xl font-bold mb-4 text-gray-700 border-b-2 border-gray-200 pb-2 flex items-center group cursor-pointer">
                                    <span className="mr-3 text-2xl group-hover:animate-bounce">📄</span>
                                    <span className="group-hover:text-gray-800 transition-colors">ORS Entries</span>
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full table-auto">
                                        <thead>
                                            <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700 hover:text-gray-900 transition-colors">ORS Number</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700 hover:text-gray-900 transition-colors">Fund Source</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700 hover:text-gray-900 transition-colors">UACS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dv.ors_entries.map((entry, index) => (
                                                <tr key={index} className="border-t hover:bg-gray-50 transition-all duration-300 transform hover:scale-102">
                                                    <td className="px-4 py-3 hover:text-blue-700 transition-colors font-medium">{entry.ors_number || 'N/A'}</td>
                                                    <td className="px-4 py-3 hover:text-green-700 transition-colors">{entry.fund_source || 'N/A'}</td>
                                                    <td className="px-4 py-3 hover:text-purple-700 transition-colors">{entry.uacs || 'N/A'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right sidebar (1 column) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            {/* Processing Duration Tracker */}
                            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-102 animate-fade-in-up">
                                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b-2 border-gradient-to-r from-blue-400 to-green-400 pb-2 flex items-center">
                                    <span className="animate-bounce mr-2">📊</span>
                                    Processing Duration
                                </h3>
                                <div className="space-y-4">
                                    <div className="bg-gradient-to-r from-green-100 to-green-200 rounded-xl p-4 hover:from-green-200 hover:to-green-300 transition-all duration-300 transform hover:scale-105 hover:shadow-md cursor-pointer group">
                                        <div className="text-center">
                                            <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">Duration Processed Inside Accounting</p>
                                            <p className="text-3xl font-bold text-green-700 group-hover:text-green-800 transition-all duration-300 transform group-hover:scale-110">{duration.insideDays}</p>
                                            <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">days</p>
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl p-4 hover:from-blue-200 hover:to-blue-300 transition-all duration-300 transform hover:scale-105 hover:shadow-md cursor-pointer group">
                                        <div className="text-center">
                                            <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">Total Days Processed</p>
                                            <p className="text-3xl font-bold text-blue-700 group-hover:text-blue-800 transition-all duration-300 transform group-hover:scale-110">{duration.totalDays}</p>
                                            <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">days</p>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300">
                                        <p className="font-semibold text-gray-700 mb-2 flex items-center">
                                            <span className="animate-pulse mr-1">🔄</span>
                                            Outside processing includes:
                                        </p>
                                        <ul className="list-none space-y-1">
                                            <li className="flex items-center hover:text-gray-700 transition-colors">
                                                <span className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse"></span>
                                                Out for approval
                                            </li>
                                            <li className="flex items-center hover:text-gray-700 transition-colors">
                                                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></span>
                                                Issued NORSA (out)
                                            </li>
                                            <li className="flex items-center hover:text-gray-700 transition-colors">
                                                <span className="w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse"></span>
                                                Issued RTS (out)
                                            </li>
                                            <li className="flex items-center hover:text-gray-700 transition-colors">
                                                <span className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></span>
                                                PR out for cashering
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Complete Transaction History */}
                            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-102 animate-fade-in-up">
                                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b-2 border-gradient-to-r from-green-400 to-blue-400 pb-2 flex items-center">
                                    <span className="animate-bounce mr-2">📋</span>
                                    Complete Transaction History
                                </h3>
                                {dv.transaction_history && dv.transaction_history.length > 0 ? (
                                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                        {dv.transaction_history.map((entry, index) => (
                                            <div key={index} className="border-l-4 border-green-500 pl-3 py-3 bg-gradient-to-r from-gray-50 to-white rounded-lg hover:from-green-50 hover:to-blue-50 transition-all duration-300 transform hover:scale-102 hover:shadow-md cursor-pointer group animate-slide-in" style={{animationDelay: `${index * 100}ms`}}>
                                                <div className="flex flex-col">
                                                    <p className="font-medium text-gray-900 text-sm group-hover:text-green-700 transition-colors">{entry.action}</p>
                                                    <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors">by {entry.user}</p>
                                                    <span className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors">{formatDate(entry.date)}</span>
                                                    {entry.details && Object.keys(entry.details).length > 0 && (
                                                        <div className="text-xs text-gray-500 mt-1 group-hover:text-gray-600 transition-colors">
                                                            {Object.entries(entry.details).map(([key, value]) => (
                                                                value && (
                                                                    <div key={key} className="flex items-center">
                                                                        <span className="w-1 h-1 bg-blue-400 rounded-full mr-1"></span>
                                                                        {key.replace(/_/g, ' ')}: {value}
                                                                    </div>
                                                                )
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm text-center py-8 italic">No transaction history available.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style jsx>{`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes slide-in {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }
                
                .animate-fade-in-up {
                    animation: fade-in-up 0.6s ease-out;
                }
                
                .animate-slide-in {
                    animation: slide-in 0.5s ease-out;
                }
                
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 3px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(45deg, #10b981, #3b82f6);
                    border-radius: 3px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(45deg, #059669, #2563eb);
                }
                
                .hover\\:scale-102:hover {
                    transform: scale(1.02);
                }
                
                .hover\\:scale-105:hover {
                    transform: scale(1.05);
                }
                
                .hover\\:scale-110:hover {
                    transform: scale(1.1);
                }
            `}</style>
        </div>
    );
}
