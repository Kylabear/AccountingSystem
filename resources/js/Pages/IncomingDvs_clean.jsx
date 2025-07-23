import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import AnimatedBackground from '../Components/AnimatedBackground';
import DvDetailsModal from '../Components/DvDetailsModal';
    // Handler to update DV status using PUT
    const handleStatusUpdate = (dvId, newStatus, extraData = {}) => {
        router.put(`/incoming-dvs/${dvId}/status`, {
            status: newStatus,
            ...extraData
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsModalOpen(false);
                setSelectedDv(null);
            },
            onError: (errors) => {
                alert('❌ Error updating status: ' + (errors.status || 'Unknown error'));
            }
        });
    };
import RtsNorsaModal from '../Components/RtsNorsaModal';
import CashAllocationModal from '../Components/CashAllocationModal';
import IndexingModal from '../Components/IndexingModal';
import PaymentMethodModal from '../Components/PaymentMethodModal';
import EngasModal from '../Components/EngasModal';
import CdjModal from '../Components/CdjModal';
import LddapModal from '../Components/LddapModal';
import EditDvModal from '../Components/EditDvModal';
import DownloadModal from '../Components/DownloadModal';
import ProcessedDvModal from '../Components/ProcessedDvModal';

const statuses = [
    { key: 'recents', label: 'Recents', color: 'text-white', bgColor: '#73FBFD' },
    { key: 'for_review', label: 'For Review', color: 'text-white', bgColor: '#D92F21' },
    { key: 'for_rts_in', label: 'For RTS In', color: 'text-white', bgColor: '#F08784' },
    { key: 'for_norsa_in', label: 'For NORSA In', color: 'text-white', bgColor: '#FFBAB3' },
    { key: 'for_cash_allocation', label: 'For Cash Allocation', color: 'text-white', bgColor: '#F07B1D' },
    { key: 'for_box_c', label: 'For Box C Certification', color: 'text-black', bgColor: '#FFF449' },
    { key: 'for_approval', label: 'For Approval', color: 'text-white', bgColor: '#6B6B6B' },
    { key: 'for_indexing', label: 'For Indexing', color: 'text-white', bgColor: '#0023F5' },
    { key: 'for_payment', label: 'For Mode of Payment', color: 'text-white', bgColor: '#6B28E3' },
    { key: 'out_to_cashiering', label: 'Out to Cashiering', color: 'text-white', bgColor: '#C85AFF' },
    { key: 'for_engas', label: 'For E-NGAS Recording', color: 'text-white', bgColor: '#EA3680' },
    { key: 'for_cdj', label: 'For CDJ Recording', color: 'text-white', bgColor: '#784315' },
    { key: 'for_lddap', label: 'For LDDAP Certification', color: 'text-white', bgColor: '#000000' },
    { key: 'processed', label: 'Processed', color: 'text-white', bgColor: '#3E8C26' },
];

export default function IncomingDvs() {
    const { dvs, auth } = usePage().props;
    
    // State for responsive design
    const [isMobile, setIsMobile] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Check for mobile screen size
    useEffect(() => {
        const checkMobile = () => {
            const isMobileSize = window.innerWidth < 1024; // lg breakpoint
            setIsMobile(isMobileSize);
            if (!isMobileSize) {
                setSidebarOpen(false); // Close sidebar when switching to desktop
            }
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    // Get active tab from URL params or localStorage, default to 'recents'
    const getInitialTab = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const tabFromUrl = urlParams.get('tab');
        if (tabFromUrl && statuses.some(s => s.key === tabFromUrl)) {
            return tabFromUrl;
        }
        const savedTab = localStorage.getItem('incoming-dvs-active-tab');
        if (savedTab && statuses.some(s => s.key === savedTab)) {
            return savedTab;
        }
        return 'recents';
    };
    
    const [activeTab, setActiveTab] = useState(getInitialTab());
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDv, setSelectedDv] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRtsNorsaModalOpen, setIsRtsNorsaModalOpen] = useState(false);
    const [isCashAllocationModalOpen, setIsCashAllocationModalOpen] = useState(false);
    const [isIndexingModalOpen, setIsIndexingModalOpen] = useState(false);
    const [isPaymentMethodModalOpen, setIsPaymentMethodModalOpen] = useState(false);
    const [isEngasModalOpen, setIsEngasModalOpen] = useState(false);
    const [isCdjModalOpen, setIsCdjModalOpen] = useState(false);
    const [isLddapModalOpen, setIsLddapModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [isProcessedModalOpen, setIsProcessedModalOpen] = useState(false);
    // Removed GalleryModal state
    
    // Save active tab to localStorage and URL when it changes
    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
        localStorage.setItem('incoming-dvs-active-tab', newTab);
        
        // Update URL without page reload
        const url = new URL(window.location);
        url.searchParams.set('tab', newTab);
        window.history.replaceState({}, '', url);
    };

    // Handle download
    const handleDownload = (params) => {
        // Close the modal
        setIsDownloadModalOpen(false);
        
        // Create query parameters for the download endpoint
        const queryParams = new URLSearchParams();
        queryParams.append('filter_type', params.filterType);
        queryParams.append('file_type', params.fileType);
        
        // Use date range instead of period filters
        if (params.startDate) {
            queryParams.append('start_date', params.startDate);
        }
        if (params.endDate) {
            queryParams.append('end_date', params.endDate);
        }
        if (params.transactionType) {
            queryParams.append('transaction_type', params.transactionType);
        }
        if (params.implementingUnit) {
            queryParams.append('implementing_unit', params.implementingUnit);
        }
        if (params.payee) {
            queryParams.append('payee', params.payee);
        }
        
        // Create download URL
        const downloadUrl = `/download-processed-dvs?${queryParams.toString()}`;
        
        // Trigger download - this should work with authenticated sessions
        window.open(downloadUrl, '_blank');
    };

    // Handle cash reallocation
    const handleCashReallocation = async (dv) => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            if (!csrfToken) {
                alert('CSRF token not found. Please refresh the page and try again.');
                return;
            }

            const response = await fetch(`/incoming-dvs/${dv.id}/reallocate-cash`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    reallocation_date: new Date().toISOString().split('T')[0],
                    reallocation_reason: 'Returned by cashiering for reallocation'
                })
            });

            const responseData = await response.json();

            if (response.ok) {
                alert('✅ DV successfully reallocated to Cash Allocation! Page will refresh.');
                // Close modal and refresh page to show updated data
                setIsProcessedModalOpen(false);
                setSelectedDv(null);
                // Force page refresh to show updated DV in correct tab
                window.location.reload();
            } else {
                alert(`❌ Error reallocating DV: ${responseData.message || responseData.error || 'Unknown server error'}`);
            }
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                alert('❌ Network error: Could not connect to server. Please check if the server is running.');
            } else {
                alert(`❌ Error reallocating DV: ${error.message}`);
            }
        }
    };

    // Helper function to normalize text for searching (case-insensitive, trim whitespace)
    const normalizeForSearch = (text) => {
        return text ? text.toString().trim().toLowerCase() : '';
    };

    // Filter DVs based on active tab and search term
    const filteredDvs = dvs.filter((dv) => {
        let matchesStatus;
        
        if (activeTab === 'recents') {
            // Recents shows DVs from the last 7 days regardless of status
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const dvDate = new Date(dv.created_at);
            matchesStatus = dvDate >= sevenDaysAgo;
        } else {
            // Other tabs filter by actual status
            if (activeTab === 'for_review') {
                // For Review tab shows DVs in for_review, for_rts_in, or for_norsa_in status
                matchesStatus = ['for_review', 'for_rts_in', 'for_norsa_in'].includes(dv.status);
            } else if (activeTab === 'for_box_c') {
                // For Box C tab shows DVs in for_box_c status OR those in RTS/NORSA cycles that originated from box_c
                matchesStatus = dv.status === 'for_box_c' || 
                    (dv.status === 'for_rts_in' && dv.rts_origin === 'box_c') ||
                    (dv.status === 'for_norsa_in' && dv.norsa_origin === 'box_c');
            } else if (activeTab === 'for_approval') {
                // For Approval tab shows DVs in for_approval status with any approval_status
                matchesStatus = dv.status === 'for_approval';
            } else if (activeTab === 'for_cash_allocation') {
                // For Cash Allocation tab shows DVs in for_cash_allocation status (including reallocated ones)
                matchesStatus = dv.status === 'for_cash_allocation';
            } else if (activeTab === 'for_payment') {
                // For Payment tab shows DVs in for_payment OR out_to_cashiering status
                matchesStatus = ['for_payment', 'out_to_cashiering'].includes(dv.status);
            } else {
                matchesStatus = dv.status === activeTab;
            }
        }
        
        // Normalize search term (trim and convert to lowercase)
        const normalizedSearchTerm = normalizeForSearch(searchTerm);
        
        const matchesSearch = normalizedSearchTerm === '' || 
            normalizeForSearch(dv.dv_number).includes(normalizedSearchTerm) ||
            normalizeForSearch(dv.payee).includes(normalizedSearchTerm) ||
            normalizeForSearch(dv.transaction_type).includes(normalizedSearchTerm) ||
            normalizeForSearch(dv.account_number).includes(normalizedSearchTerm) ||
            normalizeForSearch(dv.particulars).includes(normalizedSearchTerm);
        return matchesStatus && matchesSearch;
    });

    // Sort DVs - for recents tab, show newest first
    const sortedDvs = activeTab === 'recents' 
        ? [...filteredDvs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        : filteredDvs;

    // Get current status color for the right border
    const getCurrentStatusColor = (status) => {
        const statusObj = statuses.find(s => s.key === status);
        if (statusObj && statusObj.bgColor) {
            return `border-r-4`;
        }
        return 'border-r-4 border-gray-400';
    };

    // Get border color style object for inline styling
    const getBorderStyle = (status) => {
        const statusObj = statuses.find(s => s.key === status);
        if (statusObj && statusObj.bgColor) {
            return { borderRightColor: statusObj.bgColor };
        }
        return { borderRightColor: '#9CA3AF' }; // gray-400
    };

    // Handle DV card click
    const handleDvClick = (dv) => {
        if (dv && dv.id) {
            setSelectedDv(dv);
            setIsModalOpen(true);
        } else {
            alert('Error: This DV record is invalid or missing.');
        }
    };

    return (
        <div className="min-h-screen relative bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            {/* Animated Background */}
            <AnimatedBackground />
            {/* Fixed Header - Simple design with backdrop blur */}
            <div className="bg-green-700/90 backdrop-blur-sm text-white p-4 flex items-center justify-between header-fixed shadow-lg relative z-50">
                <div className="flex items-center">
                    <img 
                        src="/DALOGO.png" 
                        alt="DA Logo" 
                        className="w-12 h-12 lg:w-16 lg:h-16 mr-4 object-contain transition-transform duration-200 hover:scale-105"
                    />
                    <Link 
                        href="/"
                        className="text-lg lg:text-xl font-bold text-yellow-400 hover:text-yellow-300 transition-colors duration-200"
                    >
                        {isMobile ? 'DA-CAR Accounting' : 'DA-CAR Accounting Section Monitoring System'}
                    </Link>
                </div>
                <div className="flex items-center space-x-4">
                    <Link 
                        href="/statistics"
                        className="bg-green-600 text-white px-3 py-2 lg:px-4 lg:py-2 rounded text-sm hover:bg-green-800 transition-colors duration-200"
                    >
                        📊 <span className="hidden sm:inline ml-1">Statistics</span>
                    </Link>
                    <button
                        onClick={() => setIsDownloadModalOpen(true)}
                        className="bg-blue-600 text-white px-3 py-2 lg:px-4 lg:py-2 rounded text-sm hover:bg-blue-700 transition-colors duration-200"
                    >
                        📥 <span className="hidden sm:inline ml-1">Download</span>
                    </button>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="bg-red-600 text-white px-3 py-2 lg:px-4 lg:py-2 rounded-lg text-sm hover:bg-red-700 transition-colors duration-200"
                    >
                        🚪 <span className="hidden sm:inline ml-1">Logout</span>
                    </Link>
                    <Link 
                        href="/profile"
                        className="hover:opacity-80 transition-opacity duration-200"
                    >
                        <img 
                            src={auth?.user?.profile_image ? `/storage/${auth.user.profile_image}` : '/default-profile.png'} 
                            alt="Profile" 
                            className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover border-2 border-yellow-400"
                        />
                    </Link>
                </div>
            </div>

            {/* Content with proper header spacing and z-index - transparent background */}
            <div className="content-with-header relative z-20 bg-transparent">
                <div className="flex bg-transparent min-h-screen">
                    {/* Mobile toggle for sidebar */}
                    {isMobile && (
                        <div className="lg:hidden p-4 bg-white/80 backdrop-blur-sm shadow-md">
                            <button 
                                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors duration-200 hover:bg-green-700"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                            >
                                <span className="mr-2">📊</span>
                                {sidebarOpen ? 'Hide Categories' : 'View Categories'}
                            </button>
                        </div>
                    )}

                    {/* Left Sidebar - Simple responsive design */}
                    <div 
                        className={`
                            ${isMobile 
                                ? `fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-80 z-50 transition-transform duration-300 shadow-lg`
                                : 'w-64 flex-shrink-0 sidebar-fixed'
                            } 
                            bg-white/95 backdrop-blur-sm overflow-y-auto shadow-xl border-r border-white/20
                        `} 
                        style={isMobile ? {} : { minHeight: '600px' }}
                    >
                        {/* Mobile overlay */}
                        {isMobile && sidebarOpen && (
                            <div 
                                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                                onClick={() => setSidebarOpen(false)}
                            ></div>
                        )}

                        {/* DA Logo */}
                        <div className="p-6 text-center border-b border-gray-200">
                            <img 
                                src="/APPLOGO.png" 
                                alt="DA App Logo" 
                                className="w-32 h-32 lg:w-40 lg:h-40 mx-auto object-contain mb-4"
                            />
                            <div className="text-lg font-bold text-gray-700">DA-CAR</div>
                            <div className="text-sm text-gray-500">Accounting Section</div>
                        </div>

                        {/* Legend with Color Dots */}
                        <div className="p-4">
                            <h3 className="text-md font-bold text-gray-700 mb-3 uppercase tracking-wide">
                                📊 Legend
                            </h3>
                            
                            {/* Main Process Statuses */}
                            <div className="space-y-2 mb-20">{/* Added bottom margin for scrolling */}
                                {statuses.map((status) => {
                                    let count;
                                    if (status.key === 'recents') {
                                        // Count DVs from the last 7 days
                                        const sevenDaysAgo = new Date();
                                        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                                        count = dvs.filter(dv => {
                                            const dvDate = new Date(dv.created_at);
                                            return dvDate >= sevenDaysAgo;
                                        }).length;
                                    } else if (status.key === 'for_review') {
                                        // Count all DVs in review-related statuses
                                        count = dvs.filter(dv => ['for_review', 'for_rts_in', 'for_norsa_in'].includes(dv.status)).length;
                                    } else if (status.key === 'for_box_c') {
                                        // Count all DVs in box_c-related statuses
                                        count = dvs.filter(dv => 
                                            dv.status === 'for_box_c' ||
                                            (dv.status === 'for_rts_in' && dv.rts_origin === 'box_c') ||
                                            (dv.status === 'for_norsa_in' && dv.norsa_origin === 'box_c')
                                        ).length;
                                    } else {
                                        // Count DVs with this specific status
                                        count = dvs.filter(dv => dv.status === status.key).length;
                                    }
                                    
                                    return (
                                        <button
                                            key={status.key}
                                            onClick={() => {
                                                handleTabChange(status.key);
                                                if (isMobile) setSidebarOpen(false);
                                            }}
                                            className={`w-full text-left p-3 rounded-lg flex items-center transition-all duration-200 hover:bg-white/40 hover:backdrop-blur-lg bg-white/30 backdrop-blur-md border border-white/60 shadow-xl ${
                                                activeTab === status.key 
                                                    ? 'bg-green-100/90 border-l-4 border-green-600 backdrop-blur-lg shadow-2xl' 
                                                    : ''
                                            }`}
                                        >
                                            <div 
                                                className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                                                style={status.bgColor ? { backgroundColor: status.bgColor } : {}}
                                            ></div>
                                            <span className={`text-xs font-medium flex-1 ${
                                                activeTab === status.key ? 'text-green-700 font-semibold' : 'text-gray-700'
                                            }`}>
                                                {status.label}
                                            </span>
                                            {count > 0 && (
                                                <span className={`text-xs ml-2 px-2 py-1 rounded-full ${
                                                    activeTab === status.key 
                                                        ? 'text-green-700 bg-green-200' 
                                                        : 'text-gray-500 bg-gray-200'
                                                }`}>
                                                    {count}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area with transparent background to show aurora */}
                    <div className={`flex-1 p-6 bg-transparent ${isMobile ? '' : 'ml-64'}`}>
                        {/* Search Bar and Add Button */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <div className="flex-1 max-w-lg">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search by DV No., Payee, Transaction Type, Account No., or Particulars..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 text-sm transition-all duration-200"
                                    />
                                    <svg 
                                        className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="absolute right-3 top-3 p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
                                        >
                                            <svg className="w-4 h-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <Link
                                href="/incoming-dvs/new"
                                className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 flex items-center text-lg font-bold transition-all duration-200 hover:scale-105 shadow-md"
                            >
                                <span className="mr-3 text-2xl">+</span>
                                Add Incoming DV
                            </Link>
                        </div>

                        {/* Current Tab Title */}
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                                <span className="mr-3 text-3xl">
                                    {activeTab === 'recents' && '🕐'}
                                    {activeTab === 'for_review' && '🔍'}
                                    {activeTab === 'for_cash_allocation' && '💰'}
                                    {activeTab === 'for_box_c' && '📋'}
                                    {activeTab === 'for_approval' && '✅'}
                                    {activeTab === 'for_indexing' && '📇'}
                                    {activeTab === 'for_payment' && '💳'}
                                    {activeTab === 'for_engas' && '🌐'}
                                    {activeTab === 'for_cdj' && '📊'}
                                    {activeTab === 'for_lddap' && '🔒'}
                                    {activeTab === 'processed' && '✨'}
                                </span>
                                {statuses.find(s => s.key === activeTab)?.label}
                            </h2>
                            <p className="text-gray-600 text-sm">
                                {sortedDvs.length} {sortedDvs.length === 1 ? 'record' : 'records'} found
                                {searchTerm && (
                                    <span className="ml-2 text-green-600 font-medium">
                                        for "{searchTerm}"
                                    </span>
                                )}
                            </p>
                        </div>

                        {/* DV Cards - Simple clean design */}
                        <div className="space-y-4">
                            {sortedDvs.length > 0 ? (
                                sortedDvs.map((dv) => (
                                    <div 
                                        key={dv.id} 
                                        className={`bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer ${getCurrentStatusColor(dv.status)}`}
                                        style={getBorderStyle(dv.status)}
                                        onClick={() => handleDvClick(dv)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-800 text-lg mb-1">
                                                    {dv.payee}
                                                </h3>
                                                <p className="text-gray-600 text-sm mb-1">
                                                    {dv.dv_number}
                                                </p>
                                                <p className="text-gray-600 text-sm mb-2 italic">
                                                    {dv.particulars && dv.particulars.length > 50 
                                                        ? dv.particulars.substring(0, 50) + '...'
                                                        : dv.particulars || 'No particulars specified'}
                                                </p>
                                                <p className="text-gray-800 font-medium">
                                                    ₱{parseFloat(dv.net_amount || dv.amount).toLocaleString('en-US', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
                                                    {dv.net_amount && (
                                                        <span className="text-xs text-gray-500 ml-1">(Net)</span>
                                                    )}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex flex-col items-end space-y-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium text-white`}
                      style={{ backgroundColor: statuses.find(s => s.key === dv.status)?.bgColor || '#6B7280' }}>
                    {statuses.find(s => s.key === dv.status)?.label || dv.status}
                </span>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDv(dv);
                        setIsEditModalOpen(true);
                    }}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors duration-200"
                >
                    Edit
                </button>
                {/* Payment Modal Trigger: Only for for_payment or out_to_cashiering */}
                {(dv.status === 'for_payment' || dv.status === 'out_to_cashiering') && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDv(dv);
                            setIsPaymentMethodModalOpen(true);
                        }}
                        className="bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700 transition-colors duration-200"
                        style={{ marginTop: '2px' }}
                    >
                        Payment
                    </button>
                )}
                {/* E-NGAS Modal Trigger: Only for for_engas */}
                {dv.status === 'for_engas' && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDv(dv);
                            setIsEngasModalOpen(true);
                        }}
                        className="bg-pink-600 text-white px-3 py-1 rounded text-xs hover:bg-pink-700 transition-colors duration-200"
                        style={{ marginTop: '2px' }}
                    >
                        E-NGAS
                    </button>
                )}
                {/* CDJ Modal Trigger: Only for for_cdj */}
                {dv.status === 'for_cdj' && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDv(dv);
                            setIsCdjModalOpen(true);
                        }}
                        className="bg-yellow-700 text-white px-3 py-1 rounded text-xs hover:bg-yellow-800 transition-colors duration-200"
                        style={{ marginTop: '2px' }}
                    >
                        CDJ
                    </button>
                )}
                                                </div>
                                                {dv.created_at && (
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        {new Date(dv.created_at).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-8">
                                    No DVs found {searchTerm && `for "${searchTerm}"`}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* All Modals */}
            <DvDetailsModal
                dv={selectedDv}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedDv(null);
                }}
                onStatusUpdate={handleStatusUpdate}
            />

            <RtsNorsaModal
                dv={selectedDv}
                isOpen={isRtsNorsaModalOpen}
                onClose={() => {
                    setIsRtsNorsaModalOpen(false);
                    setSelectedDv(null);
                }}
            />

            <CashAllocationModal
                dv={selectedDv}
                isOpen={isCashAllocationModalOpen}
                onClose={() => {
                    setIsCashAllocationModalOpen(false);
                    setSelectedDv(null);
                }}
            />

            <IndexingModal
                dv={selectedDv}
                isOpen={isIndexingModalOpen}
                onClose={() => {
                    setIsIndexingModalOpen(false);
                    setSelectedDv(null);
                }}
            />

            <PaymentMethodModal
                dv={selectedDv}
                isOpen={isPaymentMethodModalOpen}
                onClose={() => {
                    setIsPaymentMethodModalOpen(false);
                    setSelectedDv(null);
                }}
            />

            <EngasModal
                dv={selectedDv}
                isOpen={isEngasModalOpen}
                onClose={() => {
                    setIsEngasModalOpen(false);
                    setSelectedDv(null);
                }}
            />

            <CdjModal
                dv={selectedDv}
                isOpen={isCdjModalOpen}
                onClose={() => {
                    setIsCdjModalOpen(false);
                    setSelectedDv(null);
                }}
            />

            <LddapModal
                dv={selectedDv}
                isOpen={isLddapModalOpen}
                onClose={() => {
                    setIsLddapModalOpen(false);
                    setSelectedDv(null);
                }}
            />

            <EditDvModal
                dv={selectedDv}
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedDv(null);
                }}
                onUpdate={() => {
                    setIsEditModalOpen(false);
                    setSelectedDv(null);
                    window.location.reload();
                }}
            />

            <ProcessedDvModal
                dv={selectedDv}
                isOpen={isProcessedModalOpen}
                onClose={() => {
                    setIsProcessedModalOpen(false);
                    setSelectedDv(null);
                }}
                onReallocate={handleCashReallocation}
            />

            <DownloadModal
                isOpen={isDownloadModalOpen}
                onClose={() => setIsDownloadModalOpen(false)}
                onDownload={handleDownload}
            />

            {/* Removed GalleryModal component usage */}
        </div>
    );
}
