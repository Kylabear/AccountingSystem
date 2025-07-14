import { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import DvDetailsModal from '../Components/DvDetailsModal';
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
        console.log('Download URL:', downloadUrl);
        console.log('Download params:', params);
        
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

            console.log('Attempting to reallocate DV:', dv.id);

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

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            const responseData = await response.json();
            console.log('Response data:', responseData);

            if (response.ok) {
                alert('✅ DV successfully reallocated to Cash Allocation! Page will refresh.');
                // Close modal and refresh page to show updated data
                setIsProcessedModalOpen(false);
                setSelectedDv(null);
                // Force page refresh to show updated DV in correct tab
                window.location.reload();
            } else {
                console.error('Server error response:', responseData);
                alert(`❌ Error reallocating DV: ${responseData.message || responseData.error || 'Unknown server error'}`);
            }
        } catch (error) {
            console.error('Network or parsing error:', error);
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
            normalizeForSearch(dv.account_number).includes(normalizedSearchTerm);
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
            // Use inline style for custom colors
            return `border-r-4`;
        }
        // Fallback to default border
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

    // Handle approval actions
    const handleApprovalOut = async (dv) => {
        const today = new Date().toISOString().split('T')[0];
        
        try {
            const response = await fetch(`/incoming-dvs/${dv.id}/approval-out`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    out_date: today
                })
            });

            if (response.ok) {
                // Preserve current tab and refresh the page
                localStorage.setItem('incoming-dvs-active-tab', activeTab);
                window.location.reload();
            } else {
                alert('Error sending DV out for approval');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error sending DV out for approval');
        }
    };

    const handleApprovalIn = async (dv) => {
        const today = new Date().toISOString().split('T')[0];
        
        try {
            const response = await fetch(`/incoming-dvs/${dv.id}/approval-in`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    in_date: today
                })
            });

            if (response.ok) {
                // Preserve current tab and refresh the page
                localStorage.setItem('incoming-dvs-active-tab', activeTab);
                window.location.reload();
            } else {
                alert('Error processing DV return from approval');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error processing DV return from approval');
        }
    };

    // Handle DV card click
    const handleDvClick = (dv) => {
        setSelectedDv(dv);
        
        // Use DV Details modal for cash allocation status (has progressive summary)
        if (dv.status === 'for_cash_allocation') {
            setIsModalOpen(true);
        }
        // Use DV Details modal for box c status (has progressive summary)
        else if (dv.status === 'for_box_c') {
            setIsModalOpen(true);
        }
        // Use DV Details modal for indexing status (has progressive summary)
        else if (dv.status === 'for_indexing') {
            setIsModalOpen(true);
        }
        // Use Payment Method modal for payment status
        else if (dv.status === 'for_payment') {
            setIsPaymentMethodModalOpen(true);
        }
        // Use E-NGAS modal for E-NGAS recording status
        else if (dv.status === 'for_engas') {
            setIsEngasModalOpen(true);
        }
        // Use CDJ modal for CDJ recording status
        else if (dv.status === 'for_cdj') {
            setIsCdjModalOpen(true);
        }
        // Use LDDAP modal for LDDAP certification status
        else if (dv.status === 'for_lddap') {
            setIsLddapModalOpen(true);
        }
        // For processed DVs, show processed modal with reallocation option
        else if (dv.status === 'processed') {
            setIsProcessedModalOpen(true);
        }
        // Use DV Details modal for review status (has Review Done button and progressive summary)
        else if (dv.status === 'for_review') {
            setIsModalOpen(true);
        }
        // Use RTS/NORSA modal for RTS/NORSA specific statuses
        else if (['for_rts_in', 'for_norsa_in'].includes(dv.status)) {
            setIsRtsNorsaModalOpen(true);
        } 
        // Use DV Details modal for approval status (has progressive summary)
        else if (dv.status === 'for_approval') {
            setIsModalOpen(true);
        }
        // For out to cashiering, show info only
        else if (dv.status === 'out_to_cashiering') {
            setIsModalOpen(true);
        }
        // Use regular modal for other statuses
        else {
            setIsModalOpen(true);
        }
    };

    // Handle status update
    const handleStatusUpdate = async (dvId, newStatus, additionalData = {}) => {
        try {
            const response = await fetch(`/incoming-dvs/${dvId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    status: newStatus,
                    ...additionalData
                })
            });

            if (response.ok) {
                setIsModalOpen(false);
                setSelectedDv(null);
                // Force page refresh to show updated data
                window.location.reload();
            } else {
                const error = await response.json();
                console.error('Error updating status:', error);
                alert(`Error updating DV status: ${error.message || 'Please try again.'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error updating DV status. Please try again.');
        }
    };

    // Handle indexing
    const handleIndexingSubmit = async (data) => {
        try {
            const response = await fetch(`/incoming-dvs/${selectedDv.id}/indexing`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                setIsIndexingModalOpen(false);
                setSelectedDv(null);
                localStorage.setItem('incoming-dvs-active-tab', activeTab);
                window.location.reload();
            } else {
                alert('Error updating indexing');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error updating indexing');
        }
    };

    // Handle payment method
    const handlePaymentMethodSubmit = async (data) => {
        try {
            const response = await fetch(`/incoming-dvs/${selectedDv.id}/payment-method`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                setIsPaymentMethodModalOpen(false);
                setSelectedDv(null);
                localStorage.setItem('incoming-dvs-active-tab', activeTab);
                window.location.reload();
            } else {
                alert('Error setting payment method');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error setting payment method');
        }
    };

    // Handle payroll in
    const handlePayrollIn = async (dv) => {
        const today = new Date().toISOString().split('T')[0];
        
        try {
            const response = await fetch(`/incoming-dvs/${dv.id}/payroll-in`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ in_date: today })
            });

            if (response.ok) {
                localStorage.setItem('incoming-dvs-active-tab', activeTab);
                window.location.reload();
            } else {
                alert('Error processing return from cashiering');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error processing return from cashiering');
        }
    };

    // Handle E-NGAS recording
    const handleEngasSubmit = async (data) => {
        try {
            const response = await fetch(`/incoming-dvs/${selectedDv.id}/engas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                setIsEngasModalOpen(false);
                setSelectedDv(null);
                localStorage.setItem('incoming-dvs-active-tab', activeTab);
                window.location.reload();
            } else {
                alert('Error recording E-NGAS');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error recording E-NGAS');
        }
    };

    // Handle CDJ recording
    const handleCdjSubmit = async (data) => {
        try {
            const response = await fetch(`/incoming-dvs/${selectedDv.id}/cdj`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                setIsCdjModalOpen(false);
                setSelectedDv(null);
                localStorage.setItem('incoming-dvs-active-tab', activeTab);
                window.location.reload();
            } else {
                alert('Error recording CDJ');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error recording CDJ');
        }
    };

    const handleLddapSubmit = async (data) => {
        try {
            const response = await fetch(`/incoming-dvs/${selectedDv.id}/lddap-certify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                setIsLddapModalOpen(false);
                setSelectedDv(null);
                localStorage.setItem('incoming-dvs-active-tab', activeTab);
                window.location.reload();
            } else {
                alert('Error certifying LDDAP');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error certifying LDDAP');
        }
    };

    // Handle LDDAP certification
    const handleLddapCertify = async (dv) => {
        try {
            const response = await fetch(`/incoming-dvs/${dv.id}/lddap-certify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                }
            });

            if (response.ok) {
                // This will redirect to the detailed view as per requirements
                window.location.href = `/dv/${dv.id}/details`;
            } else {
                alert('Error certifying LDDAP');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error certifying LDDAP');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 relative overflow-hidden">
            {/* Background animation elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 text-green-300 opacity-10 animate-float">
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 4a1 1 0 011 1v6a1 1 0 11-2 0V9a1 1 0 011-1zM7 8a1 1 0 000 2h2a1 1 0 100-2H7zm0 4a1 1 0 100 2h2a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="absolute top-32 right-20 text-yellow-400 opacity-10 animate-float-delayed">
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>

            {/* Fixed Header with logo and title - Locked like the legend */}
            <div className="bg-green-700 text-white p-4 flex items-center justify-between header-fixed shadow-2xl backdrop-blur-sm bg-opacity-95">
                <div className="flex items-center group">
                    <img 
                        src="/DALOGO.png" 
                        alt="DA Logo" 
                        className="w-16 h-16 mr-4 object-contain transition-all duration-300 group-hover:scale-110 drop-shadow-lg"
                    />
                    <Link 
                        href="/"
                        className="text-xl font-bold text-yellow-400 hover:text-yellow-300 transition-all duration-300 cursor-pointer transform hover:scale-105 group"
                        style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
                    >
                        <span className="group-hover:scale-105 transition-transform duration-200">DA-CAR Accounting Section Monitoring System</span>
                    </Link>
                </div>
                <div className="flex items-center space-x-4">
                    <Link 
                        href="/statistics"
                        className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-800 transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:-translate-y-1 group"
                    >
                        <span className="group-hover:animate-bounce">📊</span>
                        <span className="ml-1">View Statistics</span>
                    </Link>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:-translate-y-1 group flex items-center"
                    >
                        <span className="mr-2 transition-transform duration-200 group-hover:scale-110">🚪</span>
                        <span className="group-hover:scale-105 transition-transform duration-200">Logout</span>
                    </Link>
                    <Link 
                        href="/profile"
                        className="hover:opacity-80 transition-all duration-300 transform hover:scale-110 hover:rotate-3 group"
                    >
                        <img 
                            src={auth?.user?.profile_image ? `/storage/${auth.user.profile_image}` : '/default-profile.png'} 
                            alt="Profile" 
                            className="w-12 h-12 rounded-full object-cover border-2 border-yellow-400 group-hover:border-yellow-300 transition-all duration-300 shadow-lg group-hover:shadow-2xl"
                        />
                    </Link>
                </div>
            </div>

            {/* Content with proper header spacing */}
            <div className="content-with-header">
                <div className="flex">
                {/* Left Sidebar - Fixed position with sticky legend - Extended height */}
                <div 
                    className="w-64 bg-white shadow-lg flex-shrink-0 sidebar-fixed overflow-y-auto" 
                    style={{ 
                        minHeight: '600px'
                    }}
                >
                    {/* DA Logo - Above Recents - Larger logo with more space */}
                    <div className="p-6 text-center border-b border-gray-200 hover:bg-gray-50 transition-all duration-300">
                        <img 
                            src="/APPLOGO.png" 
                            alt="DA App Logo" 
                            className="w-40 h-40 mx-auto object-contain mb-4 hover:scale-110 transition-transform duration-500 drop-shadow-lg"
                        />
                        <div className="text-lg font-bold text-gray-700 hover:text-green-600 transition-colors duration-300 cursor-default">DA CAR</div>
                        <div className="text-sm text-gray-500 hover:text-gray-600 transition-colors duration-300 cursor-default">Accounting System</div>
                    </div>

                    {/* Legend with Color Dots - Always visible while scrolling - With bottom padding */}
                    <div className="p-4 pb-20">
                        <h3 className="text-md font-bold text-gray-700 mb-3 uppercase tracking-wide flex items-center group cursor-default">
                            <span className="mr-2 text-lg group-hover:animate-bounce">📊</span>
                            <span className="group-hover:text-green-600 transition-colors duration-300">Legend</span>
                        </h3>
                        
                        {/* Main Process Statuses - With extra bottom space */}
                        <div className="space-y-2 mb-20">
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
                                        onClick={() => handleTabChange(status.key)}
                                        className={`w-full text-left p-2 rounded-lg flex items-center transition-all duration-300 transform hover:scale-105 hover:shadow-md group ${
                                            activeTab === status.key 
                                                ? 'bg-green-100 border-l-4 border-green-600 shadow-lg scale-105' 
                                                : 'hover:bg-gray-50 hover:border-l-4 hover:border-gray-300'
                                        }`}
                                    >
                                        <div 
                                            className={`w-3 h-3 rounded-full mr-3 flex-shrink-0 transition-all duration-200 group-hover:scale-110 ${!status.bgColor ? status.color.split(' ')[0] : ''}`}
                                            style={status.bgColor ? { backgroundColor: status.bgColor } : {}}
                                        ></div>
                                        <span className={`text-xs font-medium flex-1 transition-colors duration-300 ${
                                            activeTab === status.key ? 'text-green-700 font-semibold' : 'text-gray-700 group-hover:text-gray-900'
                                        }`}>
                                            {status.label}
                                        </span>
                                        {count > 0 && (
                                            <span className={`text-xs ml-2 px-2 py-1 rounded-full transition-all duration-300 ${
                                                activeTab === status.key 
                                                    ? 'text-green-700 bg-green-200' 
                                                    : 'text-gray-500 bg-gray-200 group-hover:bg-green-100 group-hover:text-green-600'
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

                {/* Main Content Area - Offset by sidebar width */}
                <div className="flex-1 ml-64 p-6">{/* Add margin-left to account for fixed sidebar */}
                    {/* Search Bar and Add Button - Enhanced with animations */}
                    <div className="flex justify-between items-center mb-6 animate-fade-in">
                        <div className="flex-1 max-w-lg group">
                            <div className="relative transform transition-all duration-200 group-hover:scale-102">
                                <input
                                    type="text"
                                    placeholder="Search by DV No., Payee, Transaction Type, or Account No..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 text-sm transition-all duration-300 shadow-sm hover:shadow-md group-focus-within:shadow-lg"
                                />
                                <svg 
                                    className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 transition-all duration-300 group-focus-within:text-green-500 group-focus-within:scale-110" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-3 top-3 p-1 rounded-full hover:bg-gray-200 transition-all duration-200 transform hover:scale-110"
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
                            className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 flex items-center ml-4 text-sm font-medium transform transition-all duration-300 hover:scale-110 hover:shadow-lg hover:-translate-y-1 group"
                        >
                            <span className="mr-2 transition-transform duration-200 group-hover:scale-110">+</span>
                            <span className="group-hover:scale-105 transition-transform duration-200">Add Incoming DV</span>
                        </Link>
                    </div>

                    {/* Current Tab Title - Enhanced with animations */}
                    <div className="mb-6 animate-fade-in">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center group cursor-default">
                            <span className="mr-3 text-3xl group-hover:animate-bounce">
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
                            <span className="group-hover:text-green-600 transition-colors duration-300">
                                {statuses.find(s => s.key === activeTab)?.label}
                            </span>
                        </h2>
                        <p className="text-gray-600 text-sm hover:text-gray-700 transition-colors duration-300 cursor-default">
                            {sortedDvs.length} {sortedDvs.length === 1 ? 'record' : 'records'} found
                            {searchTerm && (
                                <span className="ml-2 text-green-600 font-medium">
                                    for "{searchTerm}"
                                </span>
                            )}
                        </p>
                    </div>

                    {/* DV Cards - Show subsections for For Review and For Box C tabs */}
                    {activeTab === 'for_review' ? (
                        <div className="space-y-8">
                            {/* For Review Section */}
                            <div>
                                <div className="flex items-center mb-4">
                                    <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: '#D92F21' }}></div>
                                    <h3 className="text-lg font-semibold text-gray-800">For Review</h3>
                                    <span className="ml-2 text-sm text-gray-500">
                                        ({filteredDvs.filter(dv => dv.status === 'for_review').length})
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {filteredDvs.filter(dv => dv.status === 'for_review').length > 0 ? (
                                        filteredDvs.filter(dv => dv.status === 'for_review').map((dv) => (
                                            <div 
                                                key={dv.id} 
                                                className={`bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer ${getCurrentStatusColor(dv.status)}`}
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
                                                        <p className="text-gray-600 text-sm mb-2 italic line-clamp-2">
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
                                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
                                                                For Review
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
                                        <p className="text-gray-500 text-center py-8">No DVs in review status</p>
                                    )}
                                </div>
                            </div>

                            {/* For RTS In Section */}
                            <div>
                                <div className="flex items-center mb-4">
                                    <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: '#F08784' }}></div>
                                    <h3 className="text-lg font-semibold text-gray-800">For RTS In</h3>
                                    <span className="ml-2 text-sm text-gray-500">
                                        ({filteredDvs.filter(dv => dv.status === 'for_rts_in').length})
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {filteredDvs.filter(dv => dv.status === 'for_rts_in').length > 0 ? (
                                        filteredDvs.filter(dv => dv.status === 'for_rts_in').map((dv) => (
                                            <div 
                                                key={dv.id} 
                                                className={`bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer ${getCurrentStatusColor(dv.status)}`}
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
                                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-300 text-white">
                                                                For RTS In
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
                                        <p className="text-gray-500 text-center py-8">No DVs in RTS status</p>
                                    )}
                                </div>
                            </div>

                            {/* For NORSA In Section */}
                            <div>
                                <div className="flex items-center mb-4">
                                    <div className="w-3 h-3 rounded-full bg-purple-600 mr-3"></div>
                                    <h3 className="text-lg font-semibold text-gray-800">For NORSA In</h3>
                                    <span className="ml-2 text-sm text-gray-500">
                                        ({filteredDvs.filter(dv => dv.status === 'for_norsa_in').length})
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {filteredDvs.filter(dv => dv.status === 'for_norsa_in').length > 0 ? (
                                        filteredDvs.filter(dv => dv.status === 'for_norsa_in').map((dv) => (
                                            <div 
                                                key={dv.id} 
                                                className={`bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer ${getCurrentStatusColor(dv.status)}`}
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
                                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-600 text-white">
                                                                For NORSA In
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
                                        <p className="text-gray-500 text-center py-8">No DVs in NORSA status</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'for_cash_allocation' ? (
                        <div className="space-y-8">
                            {/* For Cash Allocation Section */}
                            <div>
                                <div className="flex items-center mb-4">
                                    <div className="w-3 h-3 rounded-full bg-orange-500 mr-3"></div>
                                    <h3 className="text-lg font-semibold text-gray-800">For Cash Allocation</h3>
                                    <span className="ml-2 text-sm text-gray-500">
                                        ({filteredDvs.filter(dv => dv.status === 'for_cash_allocation' && !dv.is_reallocated).length})
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {filteredDvs.filter(dv => dv.status === 'for_cash_allocation' && !dv.is_reallocated).length > 0 ? (
                                        filteredDvs.filter(dv => dv.status === 'for_cash_allocation' && !dv.is_reallocated).map((dv) => (
                                            <div 
                                                key={dv.id} 
                                                className={`bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer ${getCurrentStatusColor(dv.status)}`}
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
                                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500 text-white">
                                                                For Cash Allocation
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
                                        <p className="text-gray-500 text-center py-8">No DVs for cash allocation</p>
                                    )}
                                </div>
                            </div>

                            {/* For Cash Reallocation Section */}
                            <div>
                                <div className="flex items-center mb-4">
                                    <div className="w-3 h-3 rounded-full bg-orange-600 mr-3"></div>
                                    <h3 className="text-lg font-semibold text-gray-800">For Cash Reallocation</h3>
                                    <span className="ml-2 text-sm text-gray-500">
                                        ({filteredDvs.filter(dv => dv.status === 'for_cash_allocation' && dv.is_reallocated).length})
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {filteredDvs.filter(dv => dv.status === 'for_cash_allocation' && dv.is_reallocated).length > 0 ? (
                                        filteredDvs.filter(dv => dv.status === 'for_cash_allocation' && dv.is_reallocated).map((dv) => (
                                            <div 
                                                key={dv.id} 
                                                className="bg-orange-50 border-l-4 border-orange-600 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                                                onClick={() => handleDvClick(dv)}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center mb-2">
                                                            <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded-full mr-2">
                                                                🔄 Returned by Cashiering – Reallocate Cash
                                                            </span>
                                                        </div>
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
                                                        <p className="text-orange-600 text-xs mt-2">
                                                            Reallocated on: {new Date(dv.reallocation_date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex flex-col items-end space-y-2">
                                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-600 text-white">
                                                                For Cash Reallocation
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
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">No DVs for cash reallocation</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'for_box_c' ? (
                        <div className="space-y-8">
                            {/* For Box C Certification Section */}
                            <div>
                                <div className="flex items-center mb-4">
                                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-3"></div>
                                    <h3 className="text-lg font-semibold text-gray-800">For Box C Certification</h3>
                                    <span className="ml-2 text-sm text-gray-500">
                                        ({filteredDvs.filter(dv => dv.status === 'for_box_c').length})
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {filteredDvs.filter(dv => dv.status === 'for_box_c').length > 0 ? (
                                        filteredDvs.filter(dv => dv.status === 'for_box_c').map((dv) => (
                                            <div 
                                                key={dv.id} 
                                                className={`bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer ${getCurrentStatusColor(dv.status)}`}
                                                onClick={() => handleDvClick(dv)}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-800 text-lg mb-1">
                                                            {dv.payee}
                                                        </h3>
                                                        <p className="text-gray-600 text-sm mb-2">
                                                            {dv.dv_number}
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
                                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500 text-white">
                                                                For Box C Certification
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
                                        <p className="text-gray-500 text-center py-8">No DVs in Box C certification status</p>
                                    )}
                                </div>
                            </div>

                            {/* For RTS In Section (from Box C) */}
                            <div>
                                <div className="flex items-center mb-4">
                                    <div className="w-3 h-3 rounded-full bg-red-300 mr-3"></div>
                                    <h3 className="text-lg font-semibold text-gray-800">For RTS In</h3>
                                    <span className="ml-2 text-sm text-gray-500">
                                        ({filteredDvs.filter(dv => dv.status === 'for_rts_in' && dv.rts_origin === 'box_c').length})
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {filteredDvs.filter(dv => dv.status === 'for_rts_in' && dv.rts_origin === 'box_c').length > 0 ? (
                                        filteredDvs.filter(dv => dv.status === 'for_rts_in' && dv.rts_origin === 'box_c').map((dv) => (
                                            <div 
                                                key={dv.id} 
                                                className={`bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer ${getCurrentStatusColor(dv.status)}`}
                                                onClick={() => handleDvClick(dv)}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-800 text-lg mb-1">
                                                            {dv.payee}
                                                        </h3>
                                                        <p className="text-gray-600 text-sm mb-2">
                                                            {dv.dv_number}
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
                                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-300 text-white">
                                                                For RTS In
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
                                        <p className="text-gray-500 text-center py-8">No DVs in RTS status from Box C</p>
                                    )}
                                </div>
                            </div>

                            {/* For NORSA In Section (from Box C) */}
                            <div>
                                <div className="flex items-center mb-4">
                                    <div className="w-3 h-3 rounded-full bg-purple-600 mr-3"></div>
                                    <h3 className="text-lg font-semibold text-gray-800">For NORSA In</h3>
                                    <span className="ml-2 text-sm text-gray-500">
                                        ({filteredDvs.filter(dv => dv.status === 'for_norsa_in' && dv.norsa_origin === 'box_c').length})
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {filteredDvs.filter(dv => dv.status === 'for_norsa_in' && dv.norsa_origin === 'box_c').length > 0 ? (
                                        filteredDvs.filter(dv => dv.status === 'for_norsa_in' && dv.norsa_origin === 'box_c').map((dv) => (
                                            <div 
                                                key={dv.id} 
                                                className={`bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer ${getCurrentStatusColor(dv.status)}`}
                                                onClick={() => handleDvClick(dv)}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-800 text-lg mb-1">
                                                            {dv.payee}
                                                        </h3>
                                                        <p className="text-gray-600 text-sm mb-2">
                                                            {dv.dv_number}
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
                                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-600 text-white">
                                                                For NORSA In
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
                                        <p className="text-gray-500 text-center py-8">No DVs in NORSA status from Box C</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'for_approval' ? (
                        <div className="space-y-8">
                            {/* For Out Section */}
                            <div>
                                <div className="flex items-center mb-4">
                                    <div className="w-3 h-3 rounded-full bg-gray-500 mr-3"></div>
                                    <h3 className="text-lg font-semibold text-gray-800">For Out</h3>
                                    <span className="ml-2 text-sm text-gray-500">
                                        ({filteredDvs.filter(dv => dv.status === 'for_approval' && (dv.approval_status === 'pending' || !dv.approval_status)).length})
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {filteredDvs.filter(dv => dv.status === 'for_approval' && (dv.approval_status === 'pending' || !dv.approval_status)).length > 0 ? (
                                        filteredDvs.filter(dv => dv.status === 'for_approval' && (dv.approval_status === 'pending' || !dv.approval_status)).map((dv) => (
                                            <div 
                                                key={dv.id} 
                                                className={`bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer ${getCurrentStatusColor(dv.status)}`}
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
                                                        <p className="text-gray-600 text-sm mb-2 italic line-clamp-2">
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
                                                        <div className="flex flex-col space-y-2">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleApprovalOut(dv);
                                                                }}
                                                                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                                                            >
                                                                Out
                                                            </button>
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
                                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-500 text-white">
                                                                For Approval
                                                            </span>
                                                            {dv.created_at && (
                                                                <p className="text-xs text-gray-500 mt-2">
                                                                    {new Date(dv.created_at).toLocaleDateString()}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">No DVs ready to be sent out for approval</p>
                                    )}
                                </div>
                            </div>

                            {/* For In Section */}
                            <div>
                                <div className="flex items-center mb-4">
                                    <div className="w-3 h-3 rounded-full bg-gray-400 mr-3"></div>
                                    <h3 className="text-lg font-semibold text-gray-800">For In</h3>
                                    <span className="ml-2 text-sm text-gray-500">
                                        ({filteredDvs.filter(dv => dv.status === 'for_approval' && dv.approval_status === 'out').length})
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {filteredDvs.filter(dv => dv.status === 'for_approval' && dv.approval_status === 'out').length > 0 ? (
                                        filteredDvs.filter(dv => dv.status === 'for_approval' && dv.approval_status === 'out').map((dv) => (
                                            <div 
                                                key={dv.id} 
                                                className={`bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer ${getCurrentStatusColor(dv.status)}`}
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
                                                        <p className="text-gray-600 text-sm mb-2 italic line-clamp-2">
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
                                                        <div className="flex flex-col space-y-2">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleApprovalIn(dv);
                                                                }}
                                                                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                                                            >
                                                                In
                                                            </button>
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
                                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-400 text-white">
                                                                For In
                                                            </span>
                                                            {dv.approval_out_date && (
                                                                <p className="text-xs text-gray-500 mt-2">
                                                                    Out: {new Date(dv.approval_out_date).toLocaleDateString()}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">No DVs currently out for approval</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'for_payment' ? (
                        <div className="space-y-8">
                            {/* For Mode of Payment Section */}
                            <div>
                                <div className="flex items-center mb-4">
                                    <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: '#B00DD6' }}></div>
                                    <h3 className="text-lg font-semibold text-gray-800">For Mode of Payment</h3>
                                    <span className="ml-2 text-sm text-gray-500">
                                        ({filteredDvs.filter(dv => dv.status === 'for_payment').length})
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {filteredDvs.filter(dv => dv.status === 'for_payment').length > 0 ? (
                                        filteredDvs.filter(dv => dv.status === 'for_payment').map((dv) => (
                                            <div 
                                                key={dv.id} 
                                                className={`bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer ${getCurrentStatusColor(dv.status)}`}
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
                                                            <span 
                                                                className="px-3 py-1 rounded-full text-xs font-medium text-white"
                                                                style={{ backgroundColor: '#B00DD6' }}
                                                            >
                                                                For Payment
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
                                                        </div>
                                                        {dv.indexing_date && (
                                                            <p className="text-xs text-gray-500 mt-2">
                                                                Indexed: {new Date(dv.indexing_date).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">No DVs for payment method selection</p>
                                    )}
                                </div>
                            </div>

                            {/* Out to Cashiering Section */}
                            <div>
                                <div className="flex items-center mb-4">
                                    <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: '#B00DD6' }}></div>
                                    <h3 className="text-lg font-semibold text-gray-800">Out to Cashiering</h3>
                                    <span className="ml-2 text-sm text-gray-500">
                                        ({filteredDvs.filter(dv => dv.status === 'out_to_cashiering').length})
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {filteredDvs.filter(dv => dv.status === 'out_to_cashiering').length > 0 ? (
                                        filteredDvs.filter(dv => dv.status === 'out_to_cashiering').map((dv) => (
                                            <div 
                                                key={dv.id} 
                                                className={`bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer ${getCurrentStatusColor(dv.status)}`}
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
                                                        <div className="flex flex-col space-y-2">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handlePayrollIn(dv);
                                                                }}
                                                                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                                                            >
                                                                In
                                                            </button>
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
                                                            <span 
                                                                className="px-3 py-1 rounded-full text-xs font-medium text-white"
                                                                style={{ backgroundColor: '#B00DD6' }}
                                                            >
                                                                Out to Cashiering
                                                            </span>
                                                            {dv.pr_out_date && (
                                                                <p className="text-xs text-gray-500 mt-2">
                                                                    Out: {new Date(dv.pr_out_date).toLocaleDateString()}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">No DVs currently out to cashiering</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'processed' ? (
                        /* Processed tab with download functionality */
                        <div className="space-y-6">
                            {/* Download Section */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-green-800 mb-1">📥 Download Processed DVs</h3>
                                            <p className="text-green-600 text-sm">Generate reports with customizable filters and file formats</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsDownloadModalOpen(true)}
                                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Download
                                    </button>
                                </div>
                            </div>

                            {/* DV List */}
                            <div className="space-y-3">
                                {sortedDvs.length > 0 ? (
                                    sortedDvs.map((dv) => (
                                        <div 
                                            key={dv.id} 
                                            className={`bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer ${getCurrentStatusColor(dv.status)}`}
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
                                                    {(() => {
                                                        const statusObj = statuses.find(s => s.key === dv.status);
                                                        const hasCustomColor = statusObj?.bgColor;
                                                        
                                                        return (
                                                            <div className="flex flex-col items-end space-y-2">
                                                                <span 
                                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                                        hasCustomColor ? 'text-white' : (statusObj?.color || 'bg-gray-400 text-white')
                                                                    }`}
                                                                    style={hasCustomColor ? { backgroundColor: statusObj.bgColor } : {}}
                                                                >
                                                                    {statusObj?.label || dv.status}
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
                                                            </div>
                                                        );
                                                    })()}
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
                                    <div className="text-center py-12">
                                        <div className="text-gray-400 mb-4">
                                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-500 text-lg mb-2">No processed disbursement vouchers found</p>
                                        <p className="text-gray-400 text-sm">
                                            {searchTerm ? 'Try adjusting your search terms' : 'No processed DVs available for download'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Regular single-section display for other tabs */
                        <div className="space-y-3">
                            {sortedDvs.length > 0 ? (
                                sortedDvs.map((dv) => (
                                    <div 
                                        key={dv.id} 
                                        className={`bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer ${getCurrentStatusColor(dv.status)}`}
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
                                                {(() => {
                                                    const statusObj = statuses.find(s => s.key === dv.status);
                                                    const hasCustomColor = statusObj?.bgColor;
                                                    
                                                    return (
                                                        <div className="flex flex-col items-end space-y-2">
                                                            <span 
                                                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                                    hasCustomColor ? 'text-white' : (statusObj?.color || 'bg-gray-400 text-white')
                                                                }`}
                                                                style={hasCustomColor ? { backgroundColor: statusObj.bgColor } : {}}
                                                            >
                                                                {statusObj?.label || dv.status}
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
                                                        </div>
                                                    );
                                                })()}
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
                                <div className="text-center py-12">
                                    <div className="text-gray-400 mb-4">
                                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 text-lg mb-2">No disbursement vouchers found</p>
                                    <p className="text-gray-400 text-sm">
                                        {searchTerm ? 'Try adjusting your search terms' : `No DVs in ${statuses.find(s => s.key === activeTab)?.label} status`}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* DV Details Modal */}
            <DvDetailsModal
                dv={selectedDv}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedDv(null);
                }}
                onStatusUpdate={handleStatusUpdate}
            />

            {/* RTS/NORSA Modal */}
            <RtsNorsaModal
                dv={selectedDv}
                isOpen={isRtsNorsaModalOpen}
                onClose={() => {
                    setIsRtsNorsaModalOpen(false);
                    setSelectedDv(null);
                }}
                onUpdate={() => {
                    // Preserve current tab and refresh the page to get updated data
                    localStorage.setItem('incoming-dvs-active-tab', activeTab);
                    window.location.reload();
                }}
            />

            {/* Cash Allocation Modal */}
            <CashAllocationModal
                dv={selectedDv}
                isOpen={isCashAllocationModalOpen}
                onClose={() => {
                    setIsCashAllocationModalOpen(false);
                    setSelectedDv(null);
                }}
                onUpdate={() => {
                    // Preserve current tab and refresh the page to get updated data
                    localStorage.setItem('incoming-dvs-active-tab', activeTab);
                    window.location.reload();
                }}
            />

            {/* Indexing Modal */}
            <IndexingModal
                dv={selectedDv}
                isOpen={isIndexingModalOpen}
                onClose={() => {
                    setIsIndexingModalOpen(false);
                    setSelectedDv(null);
                }}
                onSubmit={handleIndexingSubmit}
            />

            {/* Payment Method Modal */}
            <PaymentMethodModal
                dv={selectedDv}
                isOpen={isPaymentMethodModalOpen}
                onClose={() => {
                    setIsPaymentMethodModalOpen(false);
                    setSelectedDv(null);
                }}
                onSubmit={handlePaymentMethodSubmit}
            />

            {/* E-NGAS Modal */}
            <EngasModal
                dv={selectedDv}
                isOpen={isEngasModalOpen}
                onClose={() => {
                    setIsEngasModalOpen(false);
                    setSelectedDv(null);
                }}
                onSubmit={handleEngasSubmit}
            />

            {/* CDJ Modal */}
            <CdjModal
                dv={selectedDv}
                isOpen={isCdjModalOpen}
                onClose={() => {
                    setIsCdjModalOpen(false);
                    setSelectedDv(null);
                }}
                onSubmit={handleCdjSubmit}
            />

            {/* LDDAP Modal */}
            <LddapModal
                dv={selectedDv}
                isOpen={isLddapModalOpen}
                onClose={() => {
                    setIsLddapModalOpen(false);
                    setSelectedDv(null);
                }}
                onSubmit={handleLddapSubmit}
            />

            {/* Edit DV Modal */}
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

            {/* Processed DV Modal */}
            <ProcessedDvModal
                dv={selectedDv}
                isOpen={isProcessedModalOpen}
                onClose={() => {
                    setIsProcessedModalOpen(false);
                    setSelectedDv(null);
                }}
                onReallocate={handleCashReallocation}
            />

            {/* Download Modal */}
            <DownloadModal
                isOpen={isDownloadModalOpen}
                onClose={() => setIsDownloadModalOpen(false)}
                onDownload={handleDownload}
            />

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    33% { transform: translateY(-10px) rotate(2deg); }
                    66% { transform: translateY(5px) rotate(-1deg); }
                }
                
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    33% { transform: translateY(8px) rotate(-2deg); }
                    66% { transform: translateY(-12px) rotate(1deg); }
                }
                
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes bounce-in {
                    0% { opacity: 0; transform: scale(0.3); }
                    50% { opacity: 1; transform: scale(1.05); }
                    70% { transform: scale(0.9); }
                    100% { opacity: 1; transform: scale(1); }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.6s ease-out;
                }
                
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                
                .animate-float-delayed {
                    animation: float-delayed 8s ease-in-out infinite;
                }
                
                .animate-slide-up {
                    animation: slide-up 0.5s ease-out;
                }
                
                .animate-bounce-in {
                    animation: bounce-in 0.8s ease-out;
                }
                
                .stagger-animation:nth-child(1) { animation-delay: 0.1s; }
                .stagger-animation:nth-child(2) { animation-delay: 0.2s; }
                .stagger-animation:nth-child(3) { animation-delay: 0.3s; }
                .stagger-animation:nth-child(4) { animation-delay: 0.4s; }
                .stagger-animation:nth-child(5) { animation-delay: 0.5s; }
                .stagger-animation:nth-child(6) { animation-delay: 0.6s; }
                .stagger-animation:nth-child(7) { animation-delay: 0.7s; }
                .stagger-animation:nth-child(8) { animation-delay: 0.8s; }
                .stagger-animation:nth-child(9) { animation-delay: 0.9s; }
                .stagger-animation:nth-child(10) { animation-delay: 1.0s; }
                
                .hover-lift:hover {
                    transform: translateY(-8px) scale(1.02);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                }
                
                .glass-effect {
                    backdrop-filter: blur(10px);
                    background: rgba(255, 255, 255, 0.9);
                }
            `}</style>
            </div>

            {/* Clean Footer without containers or phone */}
            <footer className="relative mt-20 overflow-hidden">
                {/* Animated background with glass effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-indigo-100 opacity-80"></div>
                <div className="absolute inset-0 backdrop-blur-sm bg-white/30"></div>
                
                {/* Floating animation elements */}
                <div className="absolute top-6 left-10 w-20 h-20 bg-green-200/20 rounded-full blur-xl animate-float"></div>
                <div className="absolute bottom-8 right-16 w-16 h-16 bg-blue-200/20 rounded-full blur-lg animate-float-delayed"></div>
                <div className="absolute top-1/2 left-1/3 w-12 h-12 bg-indigo-200/20 rounded-full blur-md animate-pulse"></div>

                <div className="relative z-10 py-16 px-8">
                    {/* Main content grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-12">
                        {/* Department Info */}
                        <div className="text-center md:text-left group">
                            <div className="flex items-center justify-center md:justify-start mb-8 transform transition-all duration-500 hover:scale-105">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                                    <div className="relative bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-white/20 shadow-xl">
                                        <img 
                                            src="/DALOGO.png" 
                                            alt="DA Logo" 
                                            className="w-16 h-16 object-contain filter drop-shadow-lg transform transition-transform duration-500 group-hover:rotate-12"
                                        />
                                    </div>
                                </div>
                                <div className="ml-6">
                                    <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                                        DA-CAR
                                    </h3>
                                    <p className="text-sm text-gray-600 font-medium">
                                        Accounting Monitoring System
                                    </p>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-gray-800 mb-6 relative">
                                    <span className="relative z-10">Department Information</span>
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-green-400 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                                </h4>
                                
                                <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-500 hover:transform hover:-translate-y-1">
                                    <p className="text-gray-700 text-sm leading-relaxed mb-3 font-medium">
                                        Department of Agriculture - Cordillera Administrative Region
                                    </p>
                                    <p className="text-gray-600 text-sm italic">
                                        Excellence in agricultural development and financial accountability
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="text-center md:text-right group">
                            <h4 className="text-lg font-semibold text-gray-800 mb-8 relative">
                                <span className="relative z-10">Contact Information</span>
                                <div className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-l from-blue-400 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                            </h4>
                            
                            <div className="space-y-6">
                                {/* Email */}
                                <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-500 hover:transform hover:-translate-y-1 group/item">
                                    <div className="flex items-center justify-center md:justify-end">
                                        <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mr-4 transform transition-transform duration-300 group-hover/item:scale-110 group-hover/item:rotate-12">
                                            <span className="text-white text-lg">📧</span>
                                        </div>
                                        <div className="text-left md:text-right">
                                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
                                            <a href="mailto:accounting@da-car.gov.ph" className="text-gray-700 hover:text-green-600 transition-colors font-medium text-sm">
                                                accounting@da-car.gov.ph
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-500 hover:transform hover:-translate-y-1 group/item">
                                    <div className="flex items-center justify-center md:justify-end">
                                        <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mr-4 transform transition-transform duration-300 group-hover/item:scale-110 group-hover/item:rotate-12">
                                            <span className="text-white text-lg">📍</span>
                                        </div>
                                        <div className="text-left md:text-right">
                                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Location</p>
                                            <p className="text-gray-700 font-medium text-sm">Easter Rd, Baguio</p>
                                            <p className="text-gray-600 text-xs">2600 Benguet</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom section with enhanced glass effect */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-200/20 via-blue-200/20 to-purple-200/20 rounded-3xl blur-xl"></div>
                        <div className="relative bg-white/50 backdrop-blur-md rounded-3xl border border-white/30 shadow-2xl p-8">
                            <div className="text-center">
                                <div className="flex items-center justify-center mb-4">
                                    <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-6 py-2 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-500 hover:transform hover:-translate-y-1">
                                        <span className="text-gray-600 text-sm">©</span>
                                        <span className="text-gray-700 font-medium text-sm">
                                            {new Date().getFullYear()} Department of Agriculture - CAR. All rights reserved.
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-center">
                                    <div className="flex items-center space-x-2 bg-gradient-to-r from-pink-100/60 to-red-100/60 backdrop-blur-sm rounded-full px-6 py-2 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-500 hover:transform hover:-translate-y-1 group">
                                        <span className="text-gray-600 text-sm">Developed with</span>
                                        <span className="text-red-500 text-lg transform transition-transform duration-300 group-hover:scale-125 group-hover:animate-pulse">❤️</span>
                                        <span className="text-gray-600 text-sm">for efficient financial monitoring</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional CSS for animations - moved to inline styles */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes float {
                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                        33% { transform: translateY(-20px) rotate(1deg); }
                        66% { transform: translateY(10px) rotate(-1deg); }
                    }
                    
                    @keyframes float-delayed {
                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                        33% { transform: translateY(15px) rotate(-1deg); }
                        66% { transform: translateY(-25px) rotate(1deg); }
                    }
                    
                    .animate-float {
                        animation: float 8s ease-in-out infinite;
                    }
                    
                    .animate-float-delayed {
                        animation: float-delayed 10s ease-in-out infinite;
                    }
                    `
                }} />
            </footer>
        </div>
    );
}
