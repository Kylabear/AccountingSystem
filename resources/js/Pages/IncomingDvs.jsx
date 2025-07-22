// Helper component for For Review tab with section buttons
import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import DvDetailsModal from '../Components/DvDetailsModal';
import RtsNorsaModal from '../Components/RtsNorsaModal';
import CashAllocationModal from '../Components/CashAllocationModal';
import IndexingModal from '../Components/IndexingModal';
import EngasModal from '../Components/EngasModal';
import CdjModal from '../Components/CdjModal';
import LddapModal from '../Components/LddapModal';
import EditDvModal from '../Components/EditDvModal';
import DownloadModal from '../Components/DownloadModal';
import ProcessedDvModal from '../Components/ProcessedDvModal';
import AnimatedBackground from '../Components/AnimatedBackground';


const statuses = [
    { key: 'recents', label: 'Recent Activity', color: 'text-white', bgColor: '#73FBFD' },
    { key: 'for_review', label: 'For Review', color: 'text-white', bgColor: '#D92F21' },
    { key: 'for_rts_in', label: 'For RTS In', color: 'text-white', bgColor: '#FF6E63' },
    { key: 'for_norsa_in', label: 'For NORSA In', color: 'text-white', bgColor: '#CD5C5C' },
    { key: 'for_cash_allocation', label: 'For Cash Allocation', color: 'text-white', bgColor: '#F07B1D' },
    { key: 'for_cash_reallocation', label: 'For Cash Reallocation', color: 'text-orange-900', bgColor: '#FFD9B3' }, // lighter orange
    { key: 'for_box_c', label: 'For Box C Certification', color: 'text-black', bgColor: '#FFF449' },
    { key: 'for_approval', label: 'For Approval', color: 'text-white', bgColor: '#6B6B6B' },
    { key: 'for_indexing', label: 'For Indexing', color: 'text-white', bgColor: '#0023F5' },
    { key: 'for_mode_of_payment', label: 'For Mode of Payment', color: 'text-white', bgColor: '#6B28E3' },
    { key: 'out_to_cashiering', label: 'Out for Cashiering', color: 'text-purple-900', bgColor: '#C4B5FD' }, // lighter violet
    { key: 'for_engas', label: 'For E-NGAS Recording', color: 'text-white', bgColor: '#EA3680' },
    { key: 'for_cdj', label: 'For CDJ Recording', color: 'text-white', bgColor: '#784315' },
    { key: 'for_lddap', label: 'For LDDAP Certification', color: 'text-white', bgColor: '#000000' },
    { key: 'processed', label: 'Processed', color: 'text-white', bgColor: '#3E8C26' },
];

export default function IncomingDvs() {
// For menu hover effect in Box C Certification tab
    const [boxCHoveredButton, setBoxCHoveredButton] = useState(null);
    // For menu hover effect in For Review tab
    const [hoveredButton, setHoveredButton] = useState(null);
// Add state for Box C Certification tab sections
    const [boxCSection, setBoxCSection] = React.useState('box_c');
    const { dvs, auth, debug } = usePage().props;
    
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
    const [isEngasModalOpen, setIsEngasModalOpen] = useState(false);
    const [isCdjModalOpen, setIsCdjModalOpen] = useState(false);
    const [isLddapModalOpen, setIsLddapModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [isProcessedModalOpen, setIsProcessedModalOpen] = useState(false);
    const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
    // Add missing state for For Review tab section
    const [forReviewSection, setForReviewSection] = useState('for_review');
    
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

    // Handle E-NGAS recording
    const handleEngasRecording = async (data) => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            if (!csrfToken) {
                alert('CSRF token not found. Please refresh the page and try again.');
                return;
            }

            const response = await fetch(`/incoming-dvs/${selectedDv.id}/engas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    engas_number: data.engas_number,
                    engas_date: data.engas_date
                })
            });

            if (response.ok) {
                alert('✅ E-NGAS number recorded successfully! DV is now ready for CDJ recording.');
                // Close modal and refresh page to show updated DV status
                setIsEngasModalOpen(false);
                setSelectedDv(null);
                window.location.reload();
            } else {
                const responseData = await response.json();
                alert(`❌ Error recording E-NGAS: ${responseData.message || responseData.error || 'Unknown server error'}`);
            }
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                alert('❌ Network error: Could not connect to server. Please check if the server is running.');
            } else {
                alert(`❌ Error recording E-NGAS: ${error.message}`);
            }
        }
    };

    // Handle CDJ recording
    const handleCdjRecording = async (data) => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            if (!csrfToken) {
                alert('CSRF token not found. Please refresh the page and try again.');
                return;
            }

            const response = await fetch(`/incoming-dvs/${selectedDv.id}/cdj`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    cdj_date: data.cdj_date
                })
            });

            if (response.ok) {
                alert('✅ CDJ recording completed successfully! DV is now ready for LDDAP certification.');
                // Close modal and refresh page to show updated DV status
                setIsCdjModalOpen(false);
                setSelectedDv(null);
                window.location.reload();
            } else {
                const responseData = await response.json();
                alert(`❌ Error recording CDJ: ${responseData.message || responseData.error || 'Unknown server error'}`);
            }
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                alert('❌ Network error: Could not connect to server. Please check if the server is running.');
            } else {
                alert(`❌ Error recording CDJ: ${error.message}`);
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
                    lddap_date: data.lddap_date,
                    lddap_number: data.lddap_number
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
            // Recents shows ALL DVs regardless of status (serves as notification center)
            matchesStatus = true;
        } else {
            // Other tabs filter by actual status
            if (activeTab === 'for_review') {
                // For Review tab shows DVs in for_review, for_rts_in, or for_norsa_in status
                matchesStatus = ['for_review', 'for_rts_in', 'for_norsa_in'].includes(dv.status);
            } else if (activeTab === 'for_box_c') {
// For Box C Certification tab shows DVs in for_box_c status OR those in RTS/NORSA cycles that originated from box_c
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
            } else if (activeTab === 'for_mode_of_payment') {
                // For Payment tab shows DVs in for_payment, for_mode_of_payment, OR out_to_cashiering status
                matchesStatus = ['for_payment', 'for_mode_of_payment', 'out_to_cashiering'].includes(dv.status);
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

    // Sort DVs - for recents tab, show newest first based on latest activity
    const sortedDvs = activeTab === 'recents' 
        ? [...filteredDvs].sort((a, b) => {
            // Get the most recent activity date from multiple possible date fields
            const getLatestActivityDate = (dv) => {
                const dates = [];
                
                // Add all possible date fields with proper parsing
                const addDateIfValid = (dateStr) => {
                    if (dateStr) {
                        const date = new Date(dateStr);
                        if (!isNaN(date.getTime())) {
                            dates.push(date.getTime()); // Use timestamp for accurate comparison
                        }
                    }
                };
                
                // Add all possible date fields
                addDateIfValid(dv.created_at);
                addDateIfValid(dv.updated_at);
                addDateIfValid(dv.cash_allocation_date);
                addDateIfValid(dv.cash_allocation_processed_date);
                addDateIfValid(dv.box_c_date);
                addDateIfValid(dv.approval_out_date);
                addDateIfValid(dv.approval_in_date);
                addDateIfValid(dv.indexing_date);
                addDateIfValid(dv.engas_date);
                addDateIfValid(dv.cdj_date);
                addDateIfValid(dv.lddap_date);
                addDateIfValid(dv.processed_date);
                addDateIfValid(dv.reallocation_date);
                
                // Add RTS and NORSA dates
                addDateIfValid(dv.ca_rts_out_date);
                addDateIfValid(dv.ca_rts_in_date);
                addDateIfValid(dv.ca_norsa_out_date);
                addDateIfValid(dv.ca_norsa_in_date);
                addDateIfValid(dv.bc_rts_out_date);
                addDateIfValid(dv.bc_rts_in_date);
                addDateIfValid(dv.bc_norsa_out_date);
                addDateIfValid(dv.bc_norsa_in_date);
                
                // Return the most recent timestamp, or fallback to created_at
                const latestTimestamp = dates.length > 0 ? Math.max(...dates) : new Date(dv.created_at || Date.now()).getTime();
                
                return latestTimestamp;
            };
            
            const timestampA = getLatestActivityDate(a);
            const timestampB = getLatestActivityDate(b);
            
            return timestampB - timestampA; // Most recent first (descending order)
        })
        : filteredDvs;

// Filter reallocated DVs for Cash Allocation tab
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

// ...existing code...

    // Get current status color for the right border
    const getCurrentStatusColor = (status) => {
        const statusObj = statuses.find(s => s.key === status);
        if (statusObj && statusObj.bgColor) {
            return statusObj.bgColor;
        }
        // fallback for legacy or unknown statuses
        switch (status) {
            case 'for_mode_of_payment':
            case 'for_payment':
                return '#6B28E3'; // Deep violet
            case 'out_to_cashiering':
                return '#C4B5FD'; // Lighter violet
            default:
                return '#e5e7eb'; // gray-200
        }
    };

    // Get border color style object for inline styling
    const getBorderStyle = (status) => {
        return { borderRight: `8px solid ${getCurrentStatusColor(status)}` };
    };

    // Handle DV card click
    const handleDvClick = (dv) => {
        setSelectedDv(dv);
        // Open the correct modal for each workflow stage
        if (dv.status === 'processed') {
            setIsProcessedModalOpen(true);
        } else if (dv.status === 'for_cash_allocation') {
            setIsCashAllocationModalOpen(true);
        } else if (dv.status === 'for_lddap') {
            setIsLddapModalOpen(true);
        } else if (dv.status === 'for_engas') {
            setIsEngasModalOpen(true);
        } else if (dv.status === 'for_cdj') {
            setIsCdjModalOpen(true);
        } else {
            setIsModalOpen(true);
        }
    };

    // Helper to render a DV card (to avoid code duplication in grouped sections)
    function renderDvCard(dv) {
      // Use lighter orange indicator for reallocated DVs in cash reallocation section
      let statusObj;
      let overrideBgColor = null;
      // Cash Reallocation: lighter orange
      if (dv.status === 'for_cash_allocation' && dv.is_reallocated) {
        statusObj = statuses.find(s => s.key === 'for_cash_reallocation');
      } else if (
        // Out for Cashiering in the multi-section tab (not global tab)
        dv.status === 'out_to_cashiering' &&
        activeTab === 'for_mode_of_payment' &&
        paymentSection === 'out_to_cashiering'
      ) {
        statusObj = statuses.find(s => s.key === 'out_to_cashiering');
        overrideBgColor = '#C4B5FD'; // lighter violet
      } else if (
        // For Mode of Payment in the multi-section tab
        dv.status === 'for_payment' &&
        activeTab === 'for_mode_of_payment' &&
        paymentSection === 'for_payment'
      ) {
        statusObj = statuses.find(s => s.key === 'for_mode_of_payment');
        overrideBgColor = '#6B28E3'; // deep violet
      } else {
        statusObj = statuses.find(s => s.key === dv.status);
      }
      return (
        <div
          key={dv.id}
          className="bg-white/20 backdrop-blur-md border border-white/30 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-row min-h-[56px] hover:bg-white/30"
          onClick={() => handleDvClick(dv)}
        >
          {/* Main content */}
          <div className="flex-1 p-2 md:p-3 flex flex-col justify-center">
            <h3 className="font-semibold text-white text-base md:text-lg mb-0.5 truncate">
              {dv.payee}
            </h3>
            <p className="text-white/80 text-xs md:text-sm mb-0.5 truncate">
              {dv.dv_number}
            </p>
            <p className="text-white/80 text-xs md:text-sm mb-0.5 italic truncate">
              {dv.particulars && dv.particulars.length > 50
                ? dv.particulars.substring(0, 50) + '...'
                : dv.particulars || 'No particulars specified'}
            </p>
            <p className="text-white font-medium text-xs md:text-sm mb-0.5">
              ₱{parseFloat(dv.net_amount || dv.amount).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
              {dv.net_amount && (
                <span className="text-xs text-white/70 ml-1">(Net)</span>
              )}
            </p>
          </div>
          {/* Right section: date, status, actions at top-right */}
          <div className="flex flex-col items-end justify-start px-2 pt-2 min-w-[110px] max-w-[150px]">
            <div className="flex flex-row items-center space-x-2 mb-1">
              {/* Status */}
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusObj?.color || 'text-white'}`}
                style={{ backgroundColor: statusObj?.bgColor || '#6B7280' }}
              >
                {statusObj?.label || dv.status}
              </span>
            </div>
            <div className="flex flex-row items-center space-x-1 mb-1">
              {dv.status === 'for_approval' && !dv.approval_out_date && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleSendForApproval(dv);
                  }}
                  className="bg-green-500 text-white px-2 py-0.5 rounded text-xs hover:bg-green-600 transition-colors duration-200"
                >
                  Out
                </button>
              )}
              {dv.status === 'for_approval' && dv.approval_out_date && !dv.approval_in_date && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleApprovalIn(dv);
                  }}
                  className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs hover:bg-blue-600 transition-colors duration-200"
                >
                  In
                </button>
              )}
              <button
                onClick={e => {
                  e.stopPropagation();
                  setSelectedDv(dv);
                  setIsEditModalOpen(true);
                }}
                className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs hover:bg-blue-600 transition-colors duration-200"
              >
                Edit
              </button>
            </div>
            {/* Date below action buttons */}
            {dv.created_at && (
              <span className="text-xs text-gray-500 mt-0.5">
                {new Date(dv.created_at).toLocaleDateString()}
              </span>
            )}
          </div>
          {/* Slimmer color indicator bar at far right, full height */}
          <div
            className="w-1 md:w-1.5 rounded-r-lg"
            style={{ backgroundColor: overrideBgColor || statusObj?.bgColor || '#9CA3AF', minHeight: '100%', alignSelf: 'stretch' }}
          />
        </div>
      );
    }

    // Add state for cash section tab at the top of the function
    const [cashSection, setCashSection] = React.useState('allocation');
    // Add approvalSection state for tab logic
    const [approvalSection, setApprovalSection] = useState('for_approval');
    // Add paymentSection state for tab logic
    const [paymentSection, setPaymentSection] = useState('for_payment');
    // Define outToCashieringDvs for unified card
    const outToCashieringDvs = Array.isArray(sortedDvs)
      ? sortedDvs.filter(dv => dv.status === 'out_to_cashiering')
      : [];
    return (
        <div className="min-h-screen relative bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            {/* Animated Background */}
            <AnimatedBackground />
            
            {/* Fixed Header - Simple design */}
            <div className="bg-green-700/90 backdrop-blur-sm text-white p-4 flex items-center justify-between header-fixed shadow-lg relative z-50">
                <div className="flex items-center">
                    <Link 
                        href="/"
                        className="flex items-center hover:scale-105 transition-all duration-300"
                    >
                        <img 
                            src="/DALOGO.png" 
                            alt="DA Logo" 
                            className="w-12 h-12 lg:w-16 lg:h-16 mr-4 object-contain drop-shadow-lg"
                        />
                        <div className="text-lg lg:text-2xl font-bold text-yellow-400 hover:text-yellow-300 transition-colors duration-200 cursor-pointer" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                            {isMobile ? 'DA-CAR Accounting' : 'DA-CAR Accounting Section Monitoring System'}
                        </div>
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
                        <div className="lg:hidden p-4 bg-white/20 backdrop-blur-md border border-white/30 shadow-md">
                            <button 
                                className="w-full bg-green-600/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-green-700/90"
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
                                ? `fixed top-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-80 z-50 transition-transform duration-300 shadow-lg`
                                : 'w-64 flex-shrink-0 sidebar-fixed'
                            } 
                            bg-white/20 backdrop-blur-md border border-white/30 overflow-y-auto pb-4
                        `} 
                        style={isMobile ? { height: 'auto', maxHeight: 'fit-content' } : { minHeight: 'auto', maxHeight: 'fit-content' }}
                    >
                        {/* Mobile overlay */}
                        {isMobile && sidebarOpen && (
                            <div 
                                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                                onClick={() => setSidebarOpen(false)}
                            ></div>
                        )}

                        {/* DA Logo */}
                        <div className="p-6 text-center border-b border-white/30">
                            <img 
                                src="/APPLOGO.png" 
                                alt="DA App Logo" 
                                className="w-32 h-32 lg:w-40 lg:h-40 mx-auto object-contain mb-4"
                            />
                            <div className="text-lg font-bold text-white">DA-CAR</div>
                            <div className="text-sm text-white/80">Accounting Section</div>
                        </div>

                        {/* Legend with Color Dots */}
                        <div className="p-4 pb-6">
                            <h3 className="text-md font-bold text-white mb-3 uppercase tracking-wide">
                                📊 Stages
                            </h3>
                            
                            {/* Main Process Statuses */}
                            <div className="space-y-2 mb-4">
                                {statuses
                                  .filter(status => status.key !== 'for_rts_in' && status.key !== 'for_norsa_in' && status.key !== 'for_cash_reallocation' && status.key !== 'out_to_cashiering')
                                  .map((status) => {
                                    let count;
                                    if (status.key === 'recents') {
                                        // Count ALL DVs regardless of status (notification center)
                                        count = dvs.length;
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
                                    } else if (status.key === 'for_mode_of_payment') {
                                        // Count DVs in for_payment OR out_to_cashiering status
                                        count = dvs.filter(dv => ['for_payment', 'for_mode_of_payment', 'out_to_cashiering'].includes(dv.status)).length;                    } else if (status.key === 'for_cash_allocation') {
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
                                            className={`w-full text-left p-2 rounded-lg flex items-center transition-all duration-200 hover:bg-white/20 ${
                                                activeTab === status.key 
                                                    ? 'bg-white/30 border-l-4 border-green-400' 
                                                    : ''
                                            }`}
                                        >
                                            <div 
                                                className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                                                style={status.bgColor ? { backgroundColor: status.bgColor } : {}}
                                            ></div>
                                            <span className={`text-xs font-medium flex-1 ${
                                                activeTab === status.key ? 'text-white font-semibold' : 'text-white/90'
                                            }`}>
                                                {status.label}
                                            </span>
                                            {count > 0 && (
                                                <span className={`text-xs ml-2 px-2 py-1 rounded-full ${
                                                    activeTab === status.key 
                                                        ? 'text-white bg-green-500/80' 
                                                        : 'text-white/80 bg-white/20'
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
                    <div className={`flex-1 p-6 ${isMobile ? '' : 'ml-64'}`} style={{background: 'transparent', boxShadow: 'none', outline: 'none', border: 'none', filter: 'none'}}>
        {/* Search Bar and Add Button - Responsive, same height, button right-aligned */}
        <div className="mb-6 w-full flex flex-col sm:flex-row gap-4 items-stretch sm:items-stretch">
            {/* Search Bar */}
            <div className="flex-1 min-w-0">
                <div className="relative h-full">
                    <input
                        type="text"
                        placeholder="Search by DV No., Payee, Transaction Type, Account No., or Particulars..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 border border-white/30 bg-white/20 backdrop-blur-md rounded-lg focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/50 text-base transition-all duration-200 h-full min-h-[56px] text-white placeholder-white/70"
                    />
                    <svg 
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors duration-200"
                        >
                            <svg className="w-4 h-4 text-white/70 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
            {/* Add Incoming DV Button */}
            <div className="flex-shrink-0 flex items-stretch w-full sm:w-auto">
                <Link
                    href="/incoming-dvs/new"
                    className="bg-green-600/80 backdrop-blur-sm text-white px-8 py-4 rounded-lg hover:bg-green-700/90 flex items-center justify-center text-lg font-bold transition-all duration-200 hover:scale-[1.02] shadow-lg whitespace-nowrap w-full sm:w-auto h-full min-h-[56px]"
                    style={{ height: '100%' }}
                >
                    <span className="mr-3 text-2xl">+</span>
                    Add Incoming DV
                </Link>
            </div>
        </div>

                        {/* Removed section titles outside DV cards for consistency. Only section titles inside DV cards remain. */}

                        {/* DV Cards - All sections use green card containers with section title and count */}
{activeTab === 'recents' && (
<div className="flex flex-col" style={{ minHeight: '400px', maxHeight: 'calc(100vh - 220px)', background: 'transparent', boxShadow: 'none', border: 'none' }}>
    <div className="mb-4">
      <div className="flex items-center px-4 py-2 rounded-lg bg-transparent w-fit">
        <h3 className="text-xl font-bold flex items-center m-0 transition-colors duration-200 text-cyan-600">
          <span className="mr-2">🕐</span>Recents
          <span className="ml-3 px-3 py-1 rounded-full text-sm font-semibold transition-colors duration-200 bg-cyan-400 text-white">{sortedDvs.length}</span>
        </h3>
      </div>
    </div>
                            <div className="space-y-4 overflow-y-auto flex-1">
                              {sortedDvs.length > 0 ? (
                                sortedDvs.map((dv) => renderDvCard(dv))
                              ) : (
                                <p className="text-white/70 text-center py-4">No disbursement vouchers available. All DV activities will appear here in chronological order.</p>
                              )}
                            </div>
                          </div>
                        )}
{activeTab === 'for_review' && (
<div className="flex flex-col" style={{ minHeight: '400px', maxHeight: 'calc(100vh - 220px)', height: 'calc(100vh - 220px)', background: 'transparent', boxShadow: 'none', border: 'none' }}>
    {/* Section Headers - filter logic preserved */}
    <div className="flex items-center justify-between mb-4 flex-shrink-0">
      <div className="flex space-x-4">
        <button
          className={`text-xl font-bold flex items-center px-4 py-2 rounded-lg transition-colors duration-200 bg-transparent shadow-none border-none ${forReviewSection === 'for_review' ? 'text-red-400' : 'text-white'}`}
          style={{ background: 'none', boxShadow: 'none', border: 'none', textShadow: '1px 0 0 white, -1px 0 0 white, 0 1px 0 white, 0 -1px 0 white, 0.5px 0.5px 0 white, -0.5px -0.5px 0 white, 0.5px -0.5px 0 white, -0.5px 0.5px 0 white' }}
          onClick={() => setForReviewSection('for_review')}
        >
          <span className="mr-2">🔄</span>
          <span className={`transition-colors duration-200 ${forReviewSection === 'for_review' ? 'text-red-400' : 'text-white'}`} style={{ textShadow: '1px 0 0 white, -1px 0 0 white, 0 1px 0 white, 0 -1px 0 white, 0.5px 0.5px 0 white, -0.5px -0.5px 0 white, 0.5px -0.5px 0 white, -0.5px 0.5px 0 white' }}>For Review</span>
          <span className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold transition-colors duration-200 ${forReviewSection === 'for_review' ? 'bg-red-500/80 text-white' : 'bg-white/20 text-red-400'}`}>{sortedDvs.filter(dv => dv.status === 'for_review').length}</span>
        </button>
        <button
          className={`text-xl font-bold flex items-center px-4 py-2 rounded-lg transition-colors duration-200 bg-transparent shadow-none border-none ${forReviewSection === 'for_rts_in' ? 'text-red-400' : 'text-white'}`}
          style={{ background: 'none', boxShadow: 'none', border: 'none', textShadow: '1px 0 0 white, -1px 0 0 white, 0 1px 0 white, 0 -1px 0 white, 0.5px 0.5px 0 white, -0.5px -0.5px 0 white, 0.5px -0.5px 0 white, -0.5px 0.5px 0 white' }}
          onClick={() => setForReviewSection('for_rts_in')}
        >
          <span className="mr-2">📦</span>
          <span className={`transition-colors duration-200 ${forReviewSection === 'for_rts_in' ? 'text-red-600' : 'text-black'}`} style={{ textShadow: '1px 0 0 white, -1px 0 0 white, 0 1px 0 white, 0 -1px 0 white, 0.5px 0.5px 0 white, -0.5px -0.5px 0 white, 0.5px -0.5px 0 white, -0.5px 0.5px 0 white' }}>For RTS In</span>
          <span className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold transition-colors duration-200 ${forReviewSection === 'for_rts_in' ? 'bg-red-600 text-white' : 'bg-transparent text-red-600'}`}>{sortedDvs.filter(dv => dv.status === 'for_rts_in').length}</span>
        </button>
        <button
          className={`text-xl font-bold flex items-center px-4 py-2 rounded-lg transition-colors duration-200 bg-transparent shadow-none border-none ${forReviewSection === 'for_norsa_in' ? 'text-red-600' : 'text-black'}`}
          style={{ background: 'none', boxShadow: 'none', border: 'none', textShadow: '1px 0 0 white, -1px 0 0 white, 0 1px 0 white, 0 -1px 0 white, 0.5px 0.5px 0 white, -0.5px -0.5px 0 white, 0.5px -0.5px 0 white, -0.5px 0.5px 0 white' }}
          onClick={() => setForReviewSection('for_norsa_in')}
        >
          <span className="mr-2">🌐</span>
          <span className={`transition-colors duration-200 ${forReviewSection === 'for_norsa_in' ? 'text-red-600' : 'text-black'}`} style={{ textShadow: '1px 0 0 white, -1px 0 0 white, 0 1px 0 white, 0 -1px 0 white, 0.5px 0.5px 0 white, -0.5px -0.5px 0 white, 0.5px -0.5px 0 white, -0.5px 0.5px 0 white' }}>For NORSA In</span>
          <span className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold transition-colors duration-200 ${forReviewSection === 'for_norsa_in' ? 'bg-red-600 text-white' : 'bg-transparent text-red-600'}`}>{sortedDvs.filter(dv => dv.status === 'for_norsa_in').length}</span>
        </button>
      </div>
    </div>
                            {/* Scrollable DV Tiles Area */}
                            <div className="space-y-4 overflow-y-auto flex-1">
                              {(() => {
                                let filtered;
                                if (forReviewSection === 'for_review') {
                                  filtered = sortedDvs.filter(dv => dv.status === 'for_review');
                                } else if (forReviewSection === 'for_rts_in') {
                                  filtered = sortedDvs.filter(dv => dv.status === 'for_rts_in');
                                } else if (forReviewSection === 'for_norsa_in') {
                                  filtered = sortedDvs.filter(dv => dv.status === 'for_norsa_in');
                                } else {
                                  filtered = [];
                                }
                                return filtered.length > 0 ? (
                                  filtered.map((dv) => renderDvCard(dv))
                                ) : (
                                  <p className="text-gray-500 text-center py-4">No disbursement vouchers in this section. Check back later.</p>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                        {activeTab === 'for_rts_in' && (
                          <>
<div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl shadow-md">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-white flex items-center"><span className="mr-2">🔄</span>Under For Review</h3>
                                <span className="bg-blue-500/80 text-white px-3 py-1 rounded-full text-sm font-semibold">{sortedDvs.filter(dv => !dv.rts_origin || dv.rts_origin === 'review').length}</span>
                              </div>
                              <div className="space-y-4">
                                {sortedDvs.filter(dv => !dv.rts_origin || dv.rts_origin === 'review').length > 0 ? (
                                  sortedDvs.filter(dv => !dv.rts_origin || dv.rts_origin === 'review').map((dv) => renderDvCard(dv))
                                ) : (
                                  <p className="text-white/70 text-center py-4">No disbursement vouchers are under review at the moment. Check back later.</p>
                                )}
                              </div>
                            </div>
<div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl shadow-md">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-white flex items-center"><span className="mr-2">📦</span>Under For Box C Certification</h3>
                                <span className="bg-blue-500/80 text-white px-3 py-1 rounded-full text-sm font-semibold">{sortedDvs.filter(dv => dv.rts_origin === 'cash_allocation').length}</span>
                              </div>
                              <div className="space-y-4">
                                {sortedDvs.filter(dv => dv.rts_origin === 'cash_allocation').length > 0 ? (
                                  sortedDvs.filter(dv => dv.rts_origin === 'cash_allocation').map((dv) => renderDvCard(dv))
                                ) : (
                                  <p className="text-white/70 text-center py-4">No disbursement vouchers are pending Box C certification. You're up to date.</p>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                        {activeTab === 'for_norsa_in' && (
                          <>
<div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl shadow-md">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-white flex items-center"><span className="mr-2">🔄</span>Under For Review</h3>
                                <span className="bg-blue-500/80 text-white px-3 py-1 rounded-full text-sm font-semibold">{sortedDvs.filter(dv => !dv.norsa_origin || dv.norsa_origin === 'review').length}</span>
                              </div>
                              <div className="space-y-4">
                                {sortedDvs.filter(dv => !dv.norsa_origin || dv.norsa_origin === 'review').length > 0 ? (
                                  sortedDvs.filter(dv => !dv.norsa_origin || dv.norsa_origin === 'review').map((dv) => renderDvCard(dv))
                                ) : (
                                  <p className="text-white/70 text-center py-4">No disbursement vouchers are under review at the moment. Check back later.</p>
                                )}
                              </div>
                            </div>
<div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl shadow-md">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-white flex items-center"><span className="mr-2">📋</span>Under For Box C Certification</h3>
                                <span className="bg-blue-500/80 text-white px-3 py-1 rounded-full text-sm font-semibold">{sortedDvs.filter(dv => dv.norsa_origin === 'cash_allocation').length}</span>
                              </div>
                              <div className="space-y-4">
                                {sortedDvs.filter(dv => dv.norsa_origin === 'cash_allocation').length > 0 ? (
                                  sortedDvs.filter(dv => dv.norsa_origin === 'cash_allocation').map((dv) => renderDvCard(dv))
                                ) : (
                                  <p className="text-white/70 text-center py-4">No disbursement vouchers are pending Box C certification. You're up to date.</p>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                        {/* Only show the unified card for allocation/reallocation in Cash Allocation tab */}
{activeTab === 'for_box_c' && (
  <div className="flex flex-col flex-1" style={{ minHeight: '400px', maxHeight: 'calc(100vh - 220px)', height: 'calc(100vh - 220px)', background: 'transparent', boxShadow: 'none', border: 'none' }}>
                            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                              <div className="flex space-x-4 group" onMouseLeave={() => setBoxCHoveredButton(null)}>
                                {['box_c', 'rts_in', 'norsa_in'].map((key) => {
                                  const label = key === 'box_c' ? 'For Box C Certification' : key === 'rts_in' ? 'For RTS In' : 'For NORSA In';
                                  const icon = key === 'box_c' ? '📦' : key === 'rts_in' ? '🔄' : '🌐';
                                  const count = sortedDvs.filter(dv => dv.status === (key === 'box_c' ? 'for_box_c' : key === 'rts_in' ? 'for_rts_in' : 'for_norsa_in')).length;
                                  return (
                                    <button
                                      key={key}
                                      className={`text-xl font-bold flex items-center px-4 py-2 rounded-lg transition-colors duration-200 bg-transparent shadow-none border-none ${((boxCHoveredButton === key) || (boxCSection === key)) ? 'text-yellow-600' : 'text-black'} ${boxCHoveredButton !== null && boxCHoveredButton !== key ? 'opacity-20' : 'opacity-100'}`}
                                      style={{ background: 'none', boxShadow: 'none', border: 'none', textShadow: '1px 0 0 white, -1px 0 0 white, 0 1px 0 white, 0 -1px 0 white, 0.5px 0.5px 0 white, -0.5px -0.5px 0 white, 0.5px -0.5px 0 white, -0.5px 0.5px 0 white' }}
                                      onClick={() => setBoxCSection(key)}
                                      onMouseEnter={() => setBoxCHoveredButton(key)}
                                      onMouseLeave={() => setBoxCHoveredButton(null)}
                                    >
                                      <span className="mr-2">{icon}</span>
                                      <span className={`transition-colors duration-200 ${((boxCHoveredButton === key) || (boxCSection === key)) ? 'text-yellow-600' : 'text-black'}`} style={{ textShadow: '1px 0 0 white, -1px 0 0 white, 0 1px 0 white, 0 -1px 0 white, 0.5px 0.5px 0 white, -0.5px -0.5px 0 white, 0.5px -0.5px 0 white, -0.5px 0.5px 0 white' }}>{label}</span>
                                      <span className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold transition-colors duration-200 ${((boxCHoveredButton === key) || (boxCSection === key)) ? 'bg-yellow-400 text-white' : 'bg-transparent text-yellow-600'}`}>{count}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="space-y-4 overflow-y-auto flex-1">
                              {(() => {
                                let filtered, emptyMsg;
                                if (boxCSection === 'box_c') {
                                  filtered = sortedDvs.filter(dv => dv.status === 'for_box_c');
                                  emptyMsg = "No disbursement vouchers are pending Box C certification. You're up to date.";
                                } else if (boxCSection === 'rts_in') {
                                  filtered = sortedDvs.filter(dv => dv.status === 'for_rts_in');
                                  emptyMsg = "No disbursement vouchers are pending RTS In for Box C. Check back later.";
                                } else if (boxCSection === 'norsa_in') {
                                  filtered = sortedDvs.filter(dv => dv.status === 'for_norsa_in');
                                  emptyMsg = "No disbursement vouchers are pending NORSA In for Box C. Check back later.";
                                } else {
                                  filtered = [];
                                  emptyMsg = "No disbursement vouchers in this section. Check back later.";
                                }
                                return filtered.length > 0 ? (
                                  filtered.map((dv) => renderDvCard(dv))
                                ) : (
                                  <p className="text-gray-500 text-center py-4">{emptyMsg}</p>
                                );
                              })()}
                            </div>
                          </div>
                        )}
{activeTab === 'for_approval' && (
  <div className="flex flex-col flex-1" style={{ minHeight: '400px', maxHeight: 'calc(100vh - 220px)', height: 'calc(100vh - 220px)', background: 'transparent', boxShadow: 'none', border: 'none' }}>
                            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                              <div className="flex space-x-4">
                                <button
                                  className={`text-xl font-bold flex items-center px-4 py-2 rounded-lg transition-colors duration-200 bg-transparent shadow-none border-none ${approvalSection === 'for_approval' ? 'text-gray-700' : 'text-black'}`}
                                  style={{ background: 'none', boxShadow: 'none', border: 'none', textShadow: '1px 0 0 white, -1px 0 0 white, 0 1px 0 white, 0 -1px 0 white, 0.5px 0.5px 0 white, -0.5px -0.5px 0 white, 0.5px -0.5px 0 white, -0.5px 0.5px 0 white' }}
                                  onClick={() => setApprovalSection('for_approval')}
                                >
                                  <span className="mr-2">✅</span>
                                  <span className={`transition-colors duration-200 ${approvalSection === 'for_approval' ? 'text-gray-700' : 'text-black'}`} style={{ textShadow: '1px 0 0 white, -1px 0 0 white, 0 1px 0 white, 0 -1px 0 white, 0.5px 0.5px 0 white, -0.5px -0.5px 0 white, 0.5px -0.5px 0 white, -0.5px 0.5px 0 white' }}>For Approval</span>
                                  <span className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold transition-colors duration-200 ${approvalSection === 'for_approval' ? 'bg-gray-700 text-white' : 'bg-transparent text-gray-700'}`}>{sortedDvs.length}</span>
                                </button>
                                <button
                                  className={`text-xl font-bold flex items-center px-4 py-2 rounded-lg transition-colors duration-200 bg-transparent shadow-none border-none ${approvalSection === 'out_for_approval' ? 'text-gray-700' : 'text-black'}`}
                                  style={{ background: 'none', boxShadow: 'none', border: 'none', textShadow: '1px 0 0 white, -1px 0 0 white, 0 1px 0 white, 0 -1px 0 white, 0.5px 0.5px 0 white, -0.5px -0.5px 0 white, 0.5px -0.5px 0 white, -0.5px 0.5px 0 white' }}
                                  onClick={() => setApprovalSection('out_for_approval')}
                                >
                                  <span className="mr-2">📤</span>
                                  <span className={`transition-colors duration-200 ${approvalSection === 'out_for_approval' ? 'text-gray-700' : 'text-black'}`} style={{ textShadow: '1px 0 0 white, -1px 0 0 white, 0 1px 0 white, 0 -1px 0 white, 0.5px 0.5px 0 white, -0.5px -0.5px 0 white, 0.5px -0.5px 0 white, -0.5px 0.5px 0 white' }}>Out For Approval</span>
                                  <span className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold transition-colors duration-200 ${approvalSection === 'out_for_approval' ? 'bg-gray-700 text-white' : 'bg-transparent text-gray-700'}`}>{approvalOutDvs.length}</span>
                                </button>
                              </div>
                            </div>
                            <div className="space-y-4 overflow-y-auto flex-1">
                              {(() => {
                                let filtered, emptyMsg, tabKey;
                                if (approvalSection === 'for_approval') {
                                  filtered = sortedDvs;
                                  emptyMsg = "No disbursement vouchers are waiting for approval. All items have been reviewed.";
                                  tabKey = 'for_approval';
                                } else {
                                  filtered = approvalOutDvs;
                                  emptyMsg = "No disbursement vouchers are currently out for approval. You’re all set.";
                                  tabKey = 'out_for_approval';
                                }
                                return filtered.length > 0 ? (
                                  filtered.map((dv) => renderDvCard(dv, { tab: tabKey }))
                                ) : (
                                  <p className="text-gray-500 text-center py-4">{emptyMsg}</p>
                                );
                              })()}
                            </div>
                          </div>
                        )}
{activeTab === 'for_indexing' && (
<div className="flex flex-col flex-1" style={{ minHeight: '400px', maxHeight: 'calc(100vh - 220px)', height: 'calc(100vh - 220px)', background: 'transparent', boxShadow: 'none', border: 'none' }}>
    <div className="mb-4">
      <div className="flex items-center px-4 py-2 rounded-lg bg-transparent w-fit">
        <h3 className="text-xl font-bold flex items-center m-0 transition-colors duration-200 text-blue-700">
          <span className="mr-2">📇</span>For Indexing
          <span className={`ml-3 px-3 py-1 rounded-full text-sm font-semibold transition-colors duration-200 ${activeTab === 'for_indexing' ? 'bg-blue-700 text-white' : 'bg-transparent text-blue-700'}`}>{sortedDvs.length}</span>
        </h3>
      </div>
    </div>
                            <div className="space-y-4">
                              {sortedDvs.length > 0 ? (
                                sortedDvs.map((dv) => renderDvCard(dv))
                              ) : (
                                <p className="text-gray-500 text-center py-4">No disbursement vouchers are queued for indexing. Everything’s been filed.</p>
                              )}
                            </div>
                          </div>
                        )}
{activeTab === 'for_mode_of_payment' && (
  <div className="flex flex-col flex-1" style={{ minHeight: '400px', maxHeight: 'calc(100vh - 220px)', height: 'calc(100vh - 220px)', background: 'transparent', boxShadow: 'none', border: 'none' }}>
    <div className="flex items-center justify-between mb-4 flex-shrink-0">
      <div className="flex space-x-4">
        <button
          className={`text-xl font-bold flex items-center px-4 py-2 rounded-lg transition-colors duration-200 bg-transparent shadow-none border-none ${paymentSection === 'for_payment' ? 'text-purple-700' : 'text-black'}`}
          style={{ background: 'none', boxShadow: 'none', border: 'none', textShadow: '1px 0 0 white, -1px 0 0 white, 0 1px 0 white, 0 -1px 0 white, 0.5px 0.5px 0 white, -0.5px -0.5px 0 white, 0.5px -0.5px 0 white, -0.5px 0.5px 0 white' }}
          onClick={() => setPaymentSection('for_payment')}
        >
          <span className="mr-2">💳</span>
          <span className={`transition-colors duration-200 ${paymentSection === 'for_payment' ? 'text-purple-700' : 'text-black'}`} style={{ textShadow: '1px 0 0 white, -1px 0 0 white, 0 1px 0 white, 0 -1px 0 white, 0.5px 0.5px 0 white, -0.5px -0.5px 0 white, 0.5px -0.5px 0 white, -0.5px 0.5px 0 white' }}>For Mode of Payment</span>
          <span className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold transition-colors duration-200 ${paymentSection === 'for_payment' ? 'bg-purple-700 text-white' : 'bg-transparent text-purple-700'}`}>{dvs.filter(dv => dv.status === 'for_payment' || dv.status === 'for_mode_of_payment').length}</span>
        </button>
        <button
          className={`text-xl font-bold flex items-center px-4 py-2 rounded-lg transition-colors duration-200 bg-transparent shadow-none border-none ${paymentSection === 'out_to_cashiering' ? 'text-purple-700' : 'text-black'}`}
          style={{ background: 'none', boxShadow: 'none', border: 'none', textShadow: '1px 0 0 white, -1px 0 0 white, 0 1px 0 white, 0 -1px 0 white, 0.5px 0.5px 0 white, -0.5px -0.5px 0 white, 0.5px -0.5px 0 white, -0.5px 0.5px 0 white' }}
          onClick={() => setPaymentSection('out_to_cashiering')}
        >
          <span className="mr-2">💵</span>
          <span className={`transition-colors duration-200 ${paymentSection === 'out_to_cashiering' ? 'text-purple-700' : 'text-black'}`} style={{ textShadow: '1px 0 0 white, -1px 0 0 white, 0 1px 0 white, 0 -1px 0 white, 0.5px 0.5px 0 white, -0.5px -0.5px 0 white, 0.5px -0.5px 0 white, -0.5px 0.5px 0 white' }}>Out for Cashiering</span>
          <span className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold transition-colors duration-200 ${paymentSection === 'out_to_cashiering' ? 'bg-purple-700 text-white' : 'bg-transparent text-purple-700'}`}>{dvs.filter(dv => dv.status === 'out_to_cashiering').length}</span>
        </button>
      </div>
    </div>
    <div className="space-y-4 overflow-y-auto flex-1">
      {paymentSection === 'for_payment' ? (
        (() => {
          const filtered = dvs.filter(dv => dv.status === 'for_payment' || dv.status === 'for_mode_of_payment');
          return filtered.length > 0 ? (
            filtered.map((dv) => renderDvCard(dv, { tab: 'for_payment' }))
          ) : (
            <p className="text-gray-500 text-center py-4">No disbursement vouchers are pending mode of payment selection. This section is clear.</p>
          );
        })()
      ) : (
        (() => {
          const filtered = dvs.filter(dv => dv.status === 'out_to_cashiering');
          return filtered.length > 0 ? (
            filtered.map((dv) => renderDvCard(dv, { tab: 'out_to_cashiering' }))
          ) : (
            <p className="text-gray-500 text-center py-4">No disbursement vouchers are out for cashiering. All transactions are in place.</p>
          );
        })()
      )}
    </div>
  </div>
)}
                        {activeTab === 'out_to_cashiering' && (
<div className="bg-green-100 rounded-xl shadow-md mb-6 flex flex-col" style={{ minHeight: '400px', maxHeight: 'calc(100vh - 220px)' }}>
    <div className="mb-4">
      <div className="flex items-center px-4 py-2 rounded-lg bg-green-700 w-fit">
        <h3 className="text-xl font-bold text-white flex items-center m-0">
          <span className="mr-2">💵</span>Out to Cashiering
          <span className="ml-3 px-3 py-1 rounded-full text-sm font-semibold bg-green-600 text-white">{sortedDvs.length}</span>
        </h3>
      </div>
    </div>
                            <div className="space-y-4">
                              {sortedDvs.length > 0 ? (
                                sortedDvs.map((dv) => renderDvCard(dv))
                              ) : (
                                <p className="text-gray-500 text-center py-4">No disbursement vouchers are out to cashiering. All transactions are in place.</p>
                              )}
                            </div>
                          </div>
                        )}
{activeTab === 'for_engas' && (
<div className="flex flex-col flex-1" style={{ minHeight: '400px', maxHeight: 'calc(100vh - 220px)', height: 'calc(100vh - 220px)', background: 'transparent', boxShadow: 'none', border: 'none' }}>
    <div className="mb-4">
      <div className="flex items-center px-4 py-2 rounded-lg bg-transparent w-fit">
        <h3 className="text-xl font-bold flex items-center m-0 transition-colors duration-200 text-pink-700">
          <span className="mr-2">🌐</span>For E-NGAS Recording
          <span className={`ml-3 px-3 py-1 rounded-full text-sm font-semibold transition-colors duration-200 ${activeTab === 'for_engas' ? 'bg-pink-700 text-white' : 'bg-transparent text-pink-700'}`}>{sortedDvs.length}</span>
        </h3>
      </div>
    </div>
                            <div className="space-y-4">
                              {sortedDvs.length > 0 ? (
                                sortedDvs.map((dv) => renderDvCard(dv))
                              ) : (
                                <p className="text-gray-500 text-center py-4">No disbursement vouchers are waiting for E-NGAS recording. You're up to date.</p>
                              )}
                            </div>
                          </div>
                        )}
{activeTab === 'for_cdj' && (
<div className="flex flex-col flex-1" style={{ minHeight: '400px', maxHeight: 'calc(100vh - 220px)', height: 'calc(100vh - 220px)', background: 'transparent', boxShadow: 'none', border: 'none' }}>
    <div className="mb-4">
      <div className="flex items-center px-4 py-2 rounded-lg bg-transparent w-fit">
        <h3 className="text-xl font-bold flex items-center m-0 transition-colors duration-200 text-orange-600">
          <span className="mr-2">📊</span>For CDJ Recording
          <span className={`ml-3 px-3 py-1 rounded-full text-sm font-semibold transition-colors duration-200 ${activeTab === 'for_cdj' ? 'bg-orange-600 text-white' : 'bg-transparent text-orange-600'}`}>{sortedDvs.length}</span>
        </h3>
      </div>
    </div>
                            <div className="space-y-4">
                              {sortedDvs.length > 0 ? (
                                sortedDvs.map((dv) => renderDvCard(dv))
                              ) : (
                                <p className="text-gray-500 text-center py-4">No disbursement vouchers are pending CDJ recording. All entries have been logged.</p>
                              )}
                            </div>
                          </div>
                        )}
{activeTab === 'for_lddap' && (
<div className="flex flex-col flex-1" style={{ minHeight: '400px', maxHeight: 'calc(100vh - 220px)', height: 'calc(100vh - 220px)', background: 'transparent', boxShadow: 'none', border: 'none' }}>
    <div className="mb-4">
      <div className="flex items-center px-4 py-2 rounded-lg bg-transparent w-fit">
        <h3 className="text-xl font-bold flex items-center m-0 transition-colors duration-200 text-black">
          <span className="mr-2">🔒</span>For LDDAP Preparation
          <span className={`ml-3 px-3 py-1 rounded-full text-sm font-semibold transition-colors duration-200 ${activeTab === 'for_lddap' ? 'bg-black text-white' : 'bg-transparent text-black'}`}>{sortedDvs.length}</span>
        </h3>
      </div>
    </div>
                            <div className="space-y-4">
                              {sortedDvs.length > 0 ? (
                                sortedDvs.map((dv) => renderDvCard(dv))
                              ) : (
                                <p className="text-gray-500 text-center py-4">No disbursement vouchers are queued for LDDAP preparation. Everything’s ready.</p>
                              )}
                            </div>
                          </div>
                        )}
{activeTab === 'processed' && (
<div className="flex flex-col flex-1" style={{ minHeight: '400px', maxHeight: 'calc(100vh - 220px)', height: 'calc(100vh - 220px)', background: 'transparent', boxShadow: 'none', border: 'none' }}>
    <div className="mb-4">
      <div className="flex items-center px-4 py-2 rounded-lg bg-transparent w-fit">
        <h3 className="text-xl font-bold flex items-center m-0 transition-colors duration-200 text-green-700">
          <span className="mr-2">✨</span>Processed
          <span className={`ml-3 px-3 py-1 rounded-full text-sm font-semibold transition-colors duration-200 ${activeTab === 'processed' ? 'bg-green-700 text-white' : 'bg-transparent text-green-700'}`}>{sortedDvs.length}</span>
        </h3>
      </div>
    </div>
                            <div className="space-y-4 overflow-y-auto flex-1">
                              {sortedDvs.length > 0 ? (
                                sortedDvs.map((dv) => renderDvCard(dv))
                              ) : (
                                <p className="text-gray-500 text-center py-4">No disbursement vouchers have been fully processed yet. Completed items will appear here.</p>
                              )}
                            </div>
                          </div>
                        )}


                        {/* For Cash Reallocation Section - Only show in Cash Allocation tab */}
{activeTab === 'for_cash_allocation' && (
    <div className="flex flex-col flex-1" style={{ minHeight: '400px', maxHeight: 'calc(100vh - 220px)', height: 'calc(100vh - 220px)', background: 'transparent', boxShadow: 'none', border: 'none' }}>
                                {/* Section Tabs */}
                                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                                    <div className="flex space-x-4">
                                        <button
                                            className={`text-xl font-bold flex items-center px-4 py-2 rounded-lg transition-colors duration-200 bg-transparent shadow-none border-none ${cashSection === 'allocation' ? 'text-orange-600' : 'text-black'}`}
                                            style={{ background: 'none', boxShadow: 'none', border: 'none', textShadow: '1px 0 0 white, -1px 0 0 white, 0 1px 0 white, 0 -1px 0 white, 0.5px 0.5px 0 white, -0.5px -0.5px 0 white, 0.5px -0.5px 0 white, -0.5px 0.5px 0 white' }}
                                            onClick={() => setCashSection('allocation')}
                                        >
                                            <span className="mr-2">💰</span>
                                            <span className={`transition-colors duration-200 ${cashSection === 'allocation' ? 'text-orange-600' : 'text-black'}`} style={{ textShadow: '1px 0 0 white, -1px 0 0 white, 0 1px 0 white, 0 -1px 0 white, 0.5px 0.5px 0 white, -0.5px -0.5px 0 white, 0.5px -0.5px 0 white, -0.5px 0.5px 0 white' }}>For Cash Allocation</span>
                                            <span className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold transition-colors duration-200 ${cashSection === 'allocation' ? 'bg-orange-600 text-white' : 'bg-transparent text-orange-600'}`}>{sortedDvs.length}</span>
                                        </button>
                                        <button
                                            className={`text-xl font-bold flex items-center px-4 py-2 rounded-lg transition-colors duration-200 bg-transparent shadow-none border-none ${cashSection === 'reallocation' ? 'text-orange-600' : 'text-black'}`}
                                            style={{ background: 'none', boxShadow: 'none', border: 'none', textShadow: '1px 0 0 white, -1px 0 0 white, 0 1px 0 white, 0 -1px 0 white, 0.5px 0.5px 0 white, -0.5px -0.5px 0 white, 0.5px -0.5px 0 white, -0.5px 0.5px 0 white' }}
                                            onClick={() => setCashSection('reallocation')}
                                        >
                                            <span className="mr-2">🔄</span>
                                            <span className={`transition-colors duration-200 ${cashSection === 'reallocation' ? 'text-orange-600' : 'text-black'}`} style={{ textShadow: '1px 0 0 white, -1px 0 0 white, 0 1px 0 white, 0 -1px 0 white, 0.5px 0.5px 0 white, -0.5px -0.5px 0 white, 0.5px -0.5px 0 white, -0.5px 0.5px 0 white' }}>For Cash Reallocation</span>
                                            <span className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold transition-colors duration-200 ${cashSection === 'reallocation' ? 'bg-orange-600 text-white' : 'bg-transparent text-orange-600'}`}>{reallocatedDvs.length}</span>
                                        </button>
                                    </div>
                                </div>
                                {/* Section Content */}
                                <div className="flex-1 overflow-y-auto space-y-4">
                                    {cashSection === 'allocation' ? (
                                        sortedDvs.length > 0 ? (
                                            sortedDvs.map((dv) => renderDvCard(dv))
                                        ) : (
                                            <p className="text-gray-500 text-center py-4">No disbursement vouchers are awaiting cash allocation. Nothing is pending at this time.</p>
                                        )
                                    ) : (
                                        reallocatedDvs.length > 0 ? (
                                            reallocatedDvs.map((dv) => renderDvCard(dv))
                                        ) : (
                                            <p className="text-gray-500 text-center py-4">No disbursement vouchers need reallocation. All funds are properly assigned.</p>
                                        )
                                    )}
                                </div>
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

            <EngasModal
                dv={selectedDv}
                isOpen={isEngasModalOpen}
                onClose={() => {
                    setIsEngasModalOpen(false);
                    setSelectedDv(null);
                }}
                onSubmit={handleEngasRecording}
            />

            <CdjModal
                dv={selectedDv}
                isOpen={isCdjModalOpen}
                onClose={() => {
                    setIsCdjModalOpen(false);
                    setSelectedDv(null);
                }}
                onSubmit={handleCdjRecording}
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

            {/* Removed GalleryModal component usage to fix runtime error */}
        </div>
    );
}
