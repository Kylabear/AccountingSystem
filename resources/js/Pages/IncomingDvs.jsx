import { useState, useEffect } from 'react';
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
import GalleryModal from '../Components/GalleryModal';

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
    const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
    
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

    // Handle sending DV out for approval
    const handleSendForApproval = async (dv) => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            if (!csrfToken) {
                alert('CSRF token not found. Please refresh the page and try again.');
                return;
            }

            const response = await fetch(`/incoming-dvs/${dv.id}/approval-out`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    out_date: new Date().toISOString().split('T')[0] // Today's date
                })
            });

            const responseData = await response.json();

            if (response.ok) {
                alert('✅ DV successfully sent out for approval! Page will refresh.');
                // Force page refresh to show updated DV status
                window.location.reload();
            } else {
                alert(`❌ Error sending DV for approval: ${responseData.message || responseData.error || 'Unknown server error'}`);
            }
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                alert('❌ Network error: Could not connect to server. Please check if the server is running.');
            } else {
                alert(`❌ Error sending DV for approval: ${error.message}`);
            }
        }
    };

    // Handle LDDAP certification
    const handleLddapCertification = async (data) => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            if (!csrfToken) {
                alert('CSRF token not found. Please refresh the page and try again.');
                return;
            }

            const response = await fetch(`/incoming-dvs/${selectedDv.id}/lddap-certify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    lddap_date: data.lddap_date
                })
            });

            if (response.ok) {
                alert('✅ LDDAP certification completed successfully! DV is now processed.');
                // Close modal and refresh page to show updated DV status
                setIsLddapModalOpen(false);
                setSelectedDv(null);
                window.location.reload();
            } else {
                const responseData = await response.json();
                alert(`❌ Error certifying LDDAP: ${responseData.message || responseData.error || 'Unknown server error'}`);
            }
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                alert('❌ Network error: Could not connect to server. Please check if the server is running.');
            } else {
                alert(`❌ Error certifying LDDAP: ${error.message}`);
            }
        }
    };

    // Handle DV returned from approval
    const handleApprovalIn = async (dv) => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            if (!csrfToken) {
                alert('CSRF token not found. Please refresh the page and try again.');
                return;
            }

            const response = await fetch(`/incoming-dvs/${dv.id}/approval-in`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    in_date: new Date().toISOString().split('T')[0], // Today's date
                    approval_status: 'approved' // Default to approved, could be made configurable
                })
            });

            const responseData = await response.json();

            if (response.ok) {
                alert('✅ DV successfully marked as returned from approval! Page will refresh.');
                // Force page refresh to show updated DV status
                window.location.reload();
            } else {
                alert(`❌ Error marking DV as returned from approval: ${responseData.message || responseData.error || 'Unknown server error'}`);
            }
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                alert('❌ Network error: Could not connect to server. Please check if the server is running.');
            } else {
                alert(`❌ Error marking DV as returned from approval: ${error.message}`);
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
                // For Approval tab shows DVs in for_approval status that haven't been sent out yet
                // DVs that have been sent out will be shown in a separate "Out for Approval" section
                matchesStatus = dv.status === 'for_approval' && !dv.approval_out_date;
            } else if (activeTab === 'for_cash_allocation') {
                // For Cash Allocation tab shows DVs in for_cash_allocation status (excluding reallocated ones)
                // Reallocated DVs are now handled in their own section
                matchesStatus = dv.status === 'for_cash_allocation' && !dv.is_reallocated;
            } else if (activeTab === 'for_payment') {
                // For Payment tab shows DVs in for_payment OR out_to_cashiering status
                matchesStatus = ['for_payment', 'out_to_cashiering'].includes(dv.status);
            } else if (activeTab === 'for_lddap') {
                // For LDDAP tab shows DVs in for_lddap status
                matchesStatus = dv.status === 'for_lddap';
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

    // Filter reallocated DVs for cash allocation tab
    const reallocatedDvs = activeTab === 'for_cash_allocation' ? dvs.filter((dv) => {
        // Only show reallocated DVs in for_cash_allocation status
        const isReallocated = dv.status === 'for_cash_allocation' && dv.is_reallocated;
        
        // Apply search filter to reallocated DVs too
        const normalizedSearchTerm = normalizeForSearch(searchTerm);
        const matchesSearch = normalizedSearchTerm === '' || 
            normalizeForSearch(dv.dv_number).includes(normalizedSearchTerm) ||
            normalizeForSearch(dv.payee).includes(normalizedSearchTerm) ||
            normalizeForSearch(dv.transaction_type).includes(normalizedSearchTerm) ||
            normalizeForSearch(dv.account_number).includes(normalizedSearchTerm) ||
            normalizeForSearch(dv.particulars).includes(normalizedSearchTerm);
        
        return isReallocated && matchesSearch;
    }) : [];

    // Filter approval DVs into two groups for approval tab
    const approvalOutDvs = activeTab === 'for_approval' ? dvs.filter((dv) => {
        // Show DVs that have been sent out for approval (have approval_out_date but no approval_in_date)
        const isSentOut = dv.status === 'for_approval' && dv.approval_out_date && !dv.approval_in_date;
        
        // Apply search filter to sent out DVs too
        const normalizedSearchTerm = normalizeForSearch(searchTerm);
        const matchesSearch = normalizedSearchTerm === '' || 
            normalizeForSearch(dv.dv_number).includes(normalizedSearchTerm) ||
            normalizeForSearch(dv.payee).includes(normalizedSearchTerm) ||
            normalizeForSearch(dv.transaction_type).includes(normalizedSearchTerm) ||
            normalizeForSearch(dv.account_number).includes(normalizedSearchTerm) ||
            normalizeForSearch(dv.particulars).includes(normalizedSearchTerm);
        
        return isSentOut && matchesSearch;
    }) : [];

    // Filter LDDAP DVs for LDDAP tab
    const lddapDvs = activeTab === 'for_lddap' ? dvs.filter((dv) => {
        // Show DVs in for_lddap status
        const isLddap = dv.status === 'for_lddap';
        
        // Apply search filter to LDDAP DVs too
        const normalizedSearchTerm = normalizeForSearch(searchTerm);
        const matchesSearch = normalizedSearchTerm === '' || 
            normalizeForSearch(dv.dv_number).includes(normalizedSearchTerm) ||
            normalizeForSearch(dv.payee).includes(normalizedSearchTerm) ||
            normalizeForSearch(dv.transaction_type).includes(normalizedSearchTerm) ||
            normalizeForSearch(dv.account_number).includes(normalizedSearchTerm) ||
            normalizeForSearch(dv.particulars).includes(normalizedSearchTerm);
        
        return isLddap && matchesSearch;
    }) : [];

    // Debug logging for cash allocation tab to check PLHHH and Frenzel Atuan
    if (activeTab === 'for_cash_allocation') {
        console.log('🔍 For Cash Allocation Debug:');
        console.log('Total DVs:', dvs.length);
        console.log('DVs with for_cash_allocation status:', dvs.filter(dv => dv.status === 'for_cash_allocation').length);
        console.log('New allocations (not reallocated):', sortedDvs.length);
        console.log('Reallocated DVs (is_reallocated=true):', reallocatedDvs.length);
        
        // Look specifically for PLHHH and Frenzel Atuan
        const plhhhDv = dvs.find(dv => dv.payee && dv.payee.toLowerCase().includes('plhhh'));
        const frenzelDv = dvs.find(dv => dv.payee && dv.payee.toLowerCase().includes('frenzel'));
        
        console.log('PLHHH DV found:', plhhhDv ? {
            id: plhhhDv.id,
            payee: plhhhDv.payee,
            status: plhhhDv.status,
            reallocation_date: plhhhDv.reallocation_date,
            reallocation_reason: plhhhDv.reallocation_reason,
            is_reallocated: plhhhDv.is_reallocated
        } : 'Not found');
        
        console.log('Frenzel DV found:', frenzelDv ? {
            id: frenzelDv.id,
            payee: frenzelDv.payee,
            status: frenzelDv.status,
            reallocation_date: frenzelDv.reallocation_date,
            reallocation_reason: frenzelDv.reallocation_reason,
            is_reallocated: frenzelDv.is_reallocated
        } : 'Not found');
        
        // Show all DVs with is_reallocated=true
        const allReallocatedDvs = dvs.filter(dv => dv.is_reallocated);
        console.log('All DVs with is_reallocated=true:', allReallocatedDvs.map(dv => ({
            id: dv.id,
            payee: dv.payee,
            status: dv.status,
            is_reallocated: dv.is_reallocated
        })));
    }

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
        setSelectedDv(dv);
        
        // Use specific modals based on DV status
        if (dv.status === 'processed') {
            setIsProcessedModalOpen(true);
        }
        // Use CashAllocationModal for cash allocation status (dedicated for cash allocation)
        else if (dv.status === 'for_cash_allocation') {
            setIsCashAllocationModalOpen(true);
        }
        // Use DV Details modal for box c status (has progressive summary)
        else if (dv.status === 'for_box_c') {
            setIsModalOpen(true);
        }
        // For review statuses might need RTS/NORSA modal in some cases
        else if (dv.status === 'for_rts_in' || dv.status === 'for_norsa_in') {
            // Check if it's part of RTS/NORSA cycle, otherwise use regular modal
            setIsRtsNorsaModalOpen(true);
        }
        // For LDDAP certification, open LDDAP modal
        else if (dv.status === 'for_lddap') {
            setIsLddapModalOpen(true);
        }
        // Default to DV Details modal for all other statuses
        else {
            setIsModalOpen(true);
        }
    };

    // Helper to render a DV card (to avoid code duplication in grouped sections)
    function renderDvCard(dv) {
      return (
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
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statuses.find(s => s.key === dv.status)?.color || 'text-white'}`}
                  style={{ backgroundColor: statuses.find(s => s.key === dv.status)?.bgColor || '#6B7280' }}>
                  {statuses.find(s => s.key === dv.status)?.label || dv.status}
                </span>
                <div className="flex space-x-2">
                  {/* Show "Out" button for approval tab */}
                  {activeTab === 'for_approval' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendForApproval(dv);
                      }}
                      className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition-colors duration-200"
                    >
                      Out
                    </button>
                  )}
                  {/* Show "Certify" button for LDDAP tab */}
                  {activeTab === 'for_lddap' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDv(dv);
                        setIsLddapModalOpen(true);
                      }}
                      className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700 transition-colors duration-200"
                    >
                      Certify
                    </button>
                  )}
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
              {dv.created_at && (
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(dv.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Fixed Header - Simple design */}
            <div className="bg-green-700 text-white p-4 flex items-center justify-between header-fixed shadow-lg">
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

            {/* Content with proper header spacing */}
            <div className="content-with-header">
                <div className="flex">
                    {/* Mobile toggle for sidebar */}
                    {isMobile && (
                        <div className="lg:hidden p-4 bg-white shadow-md">
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
                            bg-white overflow-y-auto
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
                            <div className="space-y-2">
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
                                    } else if (status.key === 'for_payment') {
                                        // Count DVs in for_payment OR out_to_cashiering status
                                        count = dvs.filter(dv => ['for_payment', 'out_to_cashiering'].includes(dv.status)).length;                    } else if (status.key === 'for_cash_allocation') {
                        // Count DVs in for_cash_allocation status (excluding reallocated ones)
                        count = dvs.filter(dv => dv.status === 'for_cash_allocation' && !dv.is_reallocated).length;
                                    } else if (status.key === 'for_lddap') {
                                        // Count DVs in for_lddap status
                                        count = dvs.filter(dv => dv.status === 'for_lddap').length;
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
                                            className={`w-full text-left p-2 rounded-lg flex items-center transition-all duration-200 hover:bg-gray-50 ${
                                                activeTab === status.key 
                                                    ? 'bg-green-100 border-l-4 border-green-600' 
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

                    {/* Main Content Area - Simple responsive design */}
                    <div className={`flex-1 p-6 ${isMobile ? '' : 'ml-64'}`}>
                        {/* Search Bar and Add Button */}
                        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-end">
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
                            
                            {/* Add Incoming DV Button - Aligned to the right */}
                            <div className="flex-shrink-0">
                                <Link
                                    href="/incoming-dvs/new"
                                    className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 flex items-center text-lg font-bold transition-all duration-200 hover:scale-[1.02] shadow-lg whitespace-nowrap"
                                >
                                    <span className="mr-3 text-2xl">+</span>
                                    Add Incoming DV
                                </Link>
                            </div>
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
                                {/* Show breakdown for cash allocation */}
                                {activeTab === 'for_cash_allocation' && (
                                    <span className="ml-4 text-gray-500 text-xs">
                                        ({sortedDvs.length} new allocation{sortedDvs.length !== 1 ? 's' : ''}{reallocatedDvs.length > 0 ? `, ${reallocatedDvs.length} for reallocation` : ''})
                                    </span>
                                )}
                                {/* Show breakdown for approval */}
                                {activeTab === 'for_approval' && (
                                    <span className="ml-4 text-gray-500 text-xs">
                                        ({sortedDvs.length} waiting to be sent{approvalOutDvs.length > 0 ? `, ${approvalOutDvs.length} out for approval` : ''})
                                    </span>
                                )}
                                {/* Show breakdown for LDDAP */}
                                {activeTab === 'for_lddap' && (
                                    <span className="ml-4 text-gray-500 text-xs">
                                        ({lddapDvs.length} DVs for LDDAP certification)
                                    </span>
                                )}
                            </p>
                        </div>

                        {/* DV Cards - Grouped by tab requirements */}
                        {activeTab === 'for_review' && (
                          <div className="space-y-12">
                            {/* For Review Section */}
                            <div>
                              <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center"><span className="mr-2">🔍</span>For Review</h3>
                              <div className="space-y-4">
                                {sortedDvs.filter(dv => dv.status === 'for_review').length > 0 ? (
                                  sortedDvs.filter(dv => dv.status === 'for_review').map((dv) => renderDvCard(dv))
                                ) : (
                                  <p className="text-gray-500 text-center py-4">No DVs in For Review</p>
                                )}
                              </div>
                            </div>
                            {/* For RTS In Section */}
                            <div>
                              <h3 className="text-xl font-bold text-orange-700 mb-4 flex items-center"><span className="mr-2">🔄</span>For RTS In</h3>
                              <div className="space-y-4">
                                {sortedDvs.filter(dv => dv.status === 'for_rts_in').length > 0 ? (
                                  sortedDvs.filter(dv => dv.status === 'for_rts_in').map((dv) => renderDvCard(dv))
                                ) : (
                                  <p className="text-gray-500 text-center py-4">No DVs in For RTS In</p>
                                )}
                              </div>
                            </div>
                            {/* For NORSA In Section */}
                            <div>
                              <h3 className="text-xl font-bold text-pink-700 mb-4 flex items-center"><span className="mr-2">📝</span>For NORSA In</h3>
                              <div className="space-y-4">
                                {sortedDvs.filter(dv => dv.status === 'for_norsa_in').length > 0 ? (
                                  sortedDvs.filter(dv => dv.status === 'for_norsa_in').map((dv) => renderDvCard(dv))
                                ) : (
                                  <p className="text-gray-500 text-center py-4">No DVs in For NORSA In</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        {activeTab === 'for_rts_in' && (
                          <div className="space-y-12">
                            {/* Under For Review Section */}
                            <div>
                              <h3 className="text-xl font-bold text-orange-700 mb-4 flex items-center"><span className="mr-2">🔄</span>Under For Review</h3>
                              <div className="space-y-4">
                                {sortedDvs.filter(dv => dv.status === 'for_rts_in' && (!dv.rts_origin || dv.rts_origin === 'review')).length > 0 ? (
                                  sortedDvs.filter(dv => dv.status === 'for_rts_in' && (!dv.rts_origin || dv.rts_origin === 'review')).map((dv) => renderDvCard(dv))
                                ) : (
                                  <p className="text-gray-500 text-center py-4">No DVs under For Review</p>
                                )}
                              </div>
                            </div>
                            {/* Under For Cash Allocation Section */}
                            <div>
                              <h3 className="text-xl font-bold text-orange-700 mb-4 flex items-center"><span className="mr-2">💰</span>Under For Cash Allocation</h3>
                              <div className="space-y-4">
                                {sortedDvs.filter(dv => dv.status === 'for_rts_in' && dv.rts_origin === 'cash_allocation').length > 0 ? (
                                  sortedDvs.filter(dv => dv.status === 'for_rts_in' && dv.rts_origin === 'cash_allocation').map((dv) => renderDvCard(dv))
                                ) : (
                                  <p className="text-gray-500 text-center py-4">No DVs under For Cash Allocation</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        {activeTab === 'for_norsa_in' && (
                          <div className="space-y-12">
                            {/* Under For Review Section */}
                            <div>
                              <h3 className="text-xl font-bold text-pink-700 mb-4 flex items-center"><span className="mr-2">📝</span>Under For Review</h3>
                              <div className="space-y-4">
                                {sortedDvs.filter(dv => dv.status === 'for_norsa_in' && (!dv.norsa_origin || dv.norsa_origin === 'review')).length > 0 ? (
                                  sortedDvs.filter(dv => dv.status === 'for_norsa_in' && (!dv.norsa_origin || dv.norsa_origin === 'review')).map((dv) => renderDvCard(dv))
                                ) : (
                                  <p className="text-gray-500 text-center py-4">No DVs under For Review</p>
                                )}
                              </div>
                            </div>
                            {/* Under For Cash Allocation Section */}
                            <div>
                              <h3 className="text-xl font-bold text-pink-700 mb-4 flex items-center"><span className="mr-2">💰</span>Under For Cash Allocation</h3>
                              <div className="space-y-4">
                                {sortedDvs.filter(dv => dv.status === 'for_norsa_in' && dv.norsa_origin === 'cash_allocation').length > 0 ? (
                                  sortedDvs.filter(dv => dv.status === 'for_norsa_in' && dv.norsa_origin === 'cash_allocation').map((dv) => renderDvCard(dv))
                                ) : (
                                  <p className="text-gray-500 text-center py-4">No DVs under For Cash Allocation</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        {/* Default rendering for other tabs */}
                        {!(activeTab === 'for_review' || activeTab === 'for_rts_in' || activeTab === 'for_norsa_in') && (
                          <div className="space-y-4">
                            {sortedDvs.length > 0 ? (
                              sortedDvs.map((dv) => renderDvCard(dv))
                            ) : (
                              <p className="text-gray-500 text-center py-8">
                                No DVs found {searchTerm && `for "${searchTerm}"`}
                              </p>
                            )}
                          </div>
                        )}


                        {/* For Cash Reallocation Section - Only show in Cash Allocation tab */}
                        {activeTab === 'for_cash_allocation' && (
                            <div className="mt-12">
                                {/* Section Header */}
                                <div className="mb-6 border-t pt-8">
                                    <h2 className="text-2xl font-bold text-orange-800 mb-2 flex items-center">
                                        <span className="mr-3 text-3xl">🔄</span>
                                        For Cash Reallocation
                                    </h2>
                                    {reallocatedDvs.length > 0 ? (
                                        <p className="text-orange-600 text-sm">
                                            {reallocatedDvs.length} {reallocatedDvs.length === 1 ? 'DV' : 'DVs'} returned by cashiering for reallocation
                                            {searchTerm && (
                                                <span className="ml-2 text-orange-700 font-medium">
                                                    matching "{searchTerm}"
                                                </span>
                                            )}
                                        </p>
                                    ) : (
                                        <p className="text-orange-500 text-sm italic">
                                            No reallocated DVs at the moment. DVs will appear here when returned by cashiering for reallocation.
                                        </p>
                                    )}
                                </div>

                                {/* Reallocated DV Cards */}
                                {reallocatedDvs.length > 0 && (
                                    <div className="space-y-4">
                                        {reallocatedDvs.map((dv) => (
                                            <div 
                                                key={`realloc-${dv.id}`}
                                                className="bg-orange-50 border-l-4 border-orange-400 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                                                onClick={() => handleDvClick(dv)}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-800 text-lg mb-1 flex items-center">
                                                            {dv.payee}
                                                            {/* Reallocation status tag */}
                                                            <span className="ml-2 px-3 py-1 bg-orange-200 text-orange-800 text-xs rounded-full border border-orange-300 font-semibold">
                                                                🔄 Returned by Cashiering – Reallocate Cash
                                                            </span>
                                                        </h3>
                                                        <p className="text-gray-600 text-sm mb-1">
                                                            {dv.dv_number}
                                                        </p>
                                                        <p className="text-gray-600 text-sm mb-2 italic">
                                                            {dv.particulars && dv.particulars.length > 50 
                                                                ? dv.particulars.substring(0, 50) + '...'
                                                                : dv.particulars || 'No particulars specified'}
                                                        </p>
                                                        {/* Show reallocation info */}
                                                        {dv.reallocation_reason && (
                                                            <p className="text-orange-700 text-xs mb-2 italic font-medium">
                                                                Return Reason: {dv.reallocation_reason}
                                                            </p>
                                                        )}
                                                        {dv.reallocation_date && (
                                                            <p className="text-orange-600 text-xs mb-2">
                                                                Returned on: {new Date(dv.reallocation_date).toLocaleDateString()}
                                                            </p>
                                                        )}
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
                                                            <span className="px-3 py-1 rounded-full text-xs font-medium text-white bg-orange-500">
                                                                For Reallocation
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
                                                                Original: {new Date(dv.created_at).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Out for Approval Section - Only show in Approval tab */}
                        {activeTab === 'for_approval' && (
                            <div className="mt-12">
                                {/* Section Header */}
                                <div className="mb-6 border-t pt-8">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                                        <span className="mr-3 text-3xl">📤</span>
                                        Out for Approval
                                    </h2>
                                    {approvalOutDvs.length > 0 ? (
                                        <p className="text-gray-600 text-sm">
                                            {approvalOutDvs.length} {approvalOutDvs.length === 1 ? 'DV' : 'DVs'} currently out for approval
                                            {searchTerm && (
                                                <span className="ml-2 text-green-600 font-medium">
                                                    matching "{searchTerm}"
                                                </span>
                                            )}
                                        </p>
                                    ) : (
                                        <p className="text-gray-500 text-sm italic">
                                            No DVs currently out for approval. DVs will appear here when sent out for approval.
                                        </p>
                                    )}
                                </div>

                                {/* Approval Out DV Cards */}
                                {approvalOutDvs.length > 0 && (
                                    <div className="space-y-4">
                                        {approvalOutDvs.map((dv) => (
                                            <div 
                                                key={`approval-out-${dv.id}`}
                                                className="bg-gray-50 border-l-4 border-gray-400 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                                                onClick={() => handleDvClick(dv)}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-800 text-lg mb-1 flex items-center">
                                                            {dv.payee}
                                                            {/* Approval out status tag */}
                                                            <span className="ml-2 px-3 py-1 bg-gray-200 text-gray-800 text-xs rounded-full border border-gray-300 font-semibold">
                                                                📤 Out for Approval
                                                            </span>
                                                        </h3>
                                                        <p className="text-gray-600 text-sm mb-1">
                                                            {dv.dv_number}
                                                        </p>
                                                        <p className="text-gray-600 text-sm mb-2 italic">
                                                            {dv.particulars && dv.particulars.length > 50 
                                                                ? dv.particulars.substring(0, 50) + '...'
                                                                : dv.particulars || 'No particulars specified'}
                                                        </p>
                                                        {/* Show approval out info */}
                                                        {dv.approval_out_date && (
                                                            <p className="text-gray-600 text-xs mb-2">
                                                                Sent out on: {new Date(dv.approval_out_date).toLocaleDateString()}
                                                            </p>
                                                        )}
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
                                                            <span className="px-3 py-1 rounded-full text-xs font-medium text-white bg-gray-500">
                                                                Out for Approval
                                                            </span>
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleApprovalIn(dv);
                                                                    }}
                                                                    className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition-colors duration-200"
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
                                                            </div>
                                                        </div>
                                                        {dv.created_at && (
                                                            <p className="text-xs text-gray-500 mt-2">
                                                                Original: {new Date(dv.created_at).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* For LDDAP Certification Section - Only show in LDDAP tab */}
                        {activeTab === 'for_lddap' && (
                            <div className="mt-12">
                                {/* Section Header */}
                                <div className="mb-6 border-t pt-8">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                                        <span className="mr-3 text-3xl">🔒</span>
                                        For LDDAP Certification
                                    </h2>
                                    {lddapDvs.length > 0 ? (
                                        <p className="text-gray-600 text-sm">
                                            {lddapDvs.length} {lddapDvs.length === 1 ? 'DV' : 'DVs'} currently awaiting LDDAP certification
                                            {searchTerm && (
                                                <span className="ml-2 text-gray-600 font-medium">
                                                    matching "{searchTerm}"
                                                </span>
                                            )}
                                        </p>
                                    ) : (
                                        <p className="text-gray-500 text-sm italic">
                                            No DVs currently awaiting LDDAP certification. DVs will appear here when they are ready for certification.
                                        </p>
                                    )}
                                </div>

                                {/* LDDAP DV Cards */}
                                {lddapDvs.length > 0 && (
                                    <div className="space-y-4">
                                        {lddapDvs.map((dv) => (
                                            <div 
                                                key={`lddap-${dv.id}`}
                                                className="bg-gray-50 border-l-4 border-gray-400 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                                                onClick={() => handleDvClick(dv)}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-800 text-lg mb-1 flex items-center">
                                                            {dv.payee}
                                                            {/* LDDAP status tag */}
                                                            <span className="ml-2 px-3 py-1 bg-gray-200 text-gray-800 text-xs rounded-full border border-gray-300 font-semibold">
                                                                🔒 Awaiting LDDAP Certification
                                                            </span>
                                                        </h3>
                                                        <p className="text-gray-600 text-sm mb-1">
                                                            {dv.dv_number}
                                                        </p>
                                                        <p className="text-gray-600 text-sm mb-2 italic">
                                                            {dv.particulars && dv.particulars.length > 50 
                                                                ? dv.particulars.substring(0, 50) + '...'
                                                                : dv.particulars || 'No particulars specified'}
                                                        </p>
                                                        {/* Show LDDAP info */}
                                                        {dv.lddap_date && (
                                                            <p className="text-gray-600 text-xs mb-2">
                                                                Awaiting LDDAP on: {new Date(dv.lddap_date).toLocaleDateString()}
                                                            </p>
                                                        )}
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
                                                            <span className="px-3 py-1 rounded-full text-xs font-medium text-white bg-gray-500">
                                                                Awaiting LDDAP
                                                            </span>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedDv(dv);
                                                                    setIsLddapModalOpen(true);
                                                                }}
                                                                className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors duration-200"
                                                            >
                                                                Certify
                                                            </button>
                                                        </div>
                                                        {dv.created_at && (
                                                            <p className="text-xs text-gray-500 mt-2">
                                                                Original: {new Date(dv.created_at).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
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
                onStatusUpdate={async (dvId, newStatus, additionalData = {}) => {
                    try {
                        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                        if (!csrfToken) {
                            throw new Error('CSRF token not found. Please refresh the page.');
                        }

                        // Add the _method field to force PUT method
                        const formData = {
                            _method: 'PUT',
                            status: newStatus,
                            ...additionalData
                        };

                        const response = await fetch(`/incoming-dvs/${dvId}/status`, {
                            method: 'POST', // Using POST but with _method: 'PUT' for Laravel
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                'X-CSRF-TOKEN': csrfToken,
                            },
                            body: JSON.stringify(formData)
                        });

                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.message || 'Failed to update DV status');
                        }

                        const data = await response.json();
                        if (data.success) {
                            setIsModalOpen(false);
                            setSelectedDv(null);
                            window.location.reload();
                        } else {
                            throw new Error(data.message || 'Failed to update DV status');
                        }
                    } catch (error) {
                        console.error('Error updating DV status:', error);
                        alert(error.message || 'Error updating DV status. Please try again.');
                    }
                }}
            />

            <RtsNorsaModal
                dv={selectedDv}
                isOpen={isRtsNorsaModalOpen}
                onClose={() => {
                    setIsRtsNorsaModalOpen(false);
                    setSelectedDv(null);
                }}
                onUpdate={() => {
                    setIsRtsNorsaModalOpen(false);
                    setSelectedDv(null);
                    window.location.reload();
                }}
            />

            <CashAllocationModal
                dv={selectedDv}
                isOpen={isCashAllocationModalOpen}
                onClose={() => {
                    setIsCashAllocationModalOpen(false);
                    setSelectedDv(null);
                }}
                onUpdate={() => {
                    setIsCashAllocationModalOpen(false);
                    setSelectedDv(null);
                    window.location.reload();
                }}
            />

            <IndexingModal
                dv={selectedDv}
                isOpen={isIndexingModalOpen}
                onClose={() => {
                    setIsIndexingModalOpen(false);
                    setSelectedDv(null);
                }}
                onSubmit={() => {
                    setIsIndexingModalOpen(false);
                    setSelectedDv(null);
                    window.location.reload();
                }}
            />

            <PaymentMethodModal
                dv={selectedDv}
                isOpen={isPaymentMethodModalOpen}
                onClose={() => {
                    setIsPaymentMethodModalOpen(false);
                    setSelectedDv(null);
                }}
                onSubmit={() => {
                    setIsPaymentMethodModalOpen(false);
                    setSelectedDv(null);
                    window.location.reload();
                }}
            />

            <EngasModal
                dv={selectedDv}
                isOpen={isEngasModalOpen}
                onClose={() => {
                    setIsEngasModalOpen(false);
                    setSelectedDv(null);
                }}
                onSubmit={() => {
                    setIsEngasModalOpen(false);
                    setSelectedDv(null);
                    window.location.reload();
                }}
            />

            <CdjModal
                dv={selectedDv}
                isOpen={isCdjModalOpen}
                onClose={() => {
                    setIsCdjModalOpen(false);
                    setSelectedDv(null);
                }}
                onSubmit={() => {
                    setIsCdjModalOpen(false);
                    setSelectedDv(null);
                    window.location.reload();
                }}
            />

            <LddapModal
                dv={selectedDv}
                isOpen={isLddapModalOpen}
                onClose={() => {
                    setIsLddapModalOpen(false);
                    setSelectedDv(null);
                }}
                onSubmit={handleLddapCertification}
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

            <GalleryModal
                isOpen={isGalleryModalOpen}
                onClose={() => setIsGalleryModalOpen(false)}
            />
        </div>
    );
}
