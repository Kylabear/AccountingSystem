import { useState, useEffect } from 'react';

export default function DvDetailsModal({ dv: originalDv, isOpen, onClose, onStatusUpdate }) {
  // Early return if dv is null or undefined to prevent errors
  if (!originalDv) {
    return null;
  }

  // Use the original DV data without any mock injection
  let dv = originalDv;
  const [activeAction, setActiveAction] = useState(null);
  const [rtsReason, setRtsReason] = useState('');
  const [rtsDate, setRtsDate] = useState('');
  const [norsaNumber, setNorsaNumber] = useState('');
  const [norsaError, setNorsaError] = useState('');
  const [showOldData, setShowOldData] = useState(false);

  // States for RTS In and NORSA In return dates (auto-populated)
  const [rtsReturnDate, setRtsReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [norsaReturnDate, setNorsaReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [norsaDate, setNorsaDate] = useState('');

  // Cash allocation state variables
  const [cashAllocationDate, setCashAllocationDate] = useState('');
  const [cashAllocationNumber, setCashAllocationNumber] = useState('');
  const [netAmount, setNetAmount] = useState('');

  // Check if this is a reallocated DV that should only show original DV and For Review data
  const isReallocationView = dv?.is_reallocated === true || dv?.isReallocationView === true;

  // Indexing state variables
  const [indexingDate, setIndexingDate] = useState('');

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to format amounts
  const formatAmount = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  // Auto-set today's date when opening RTS, NORSA, Cash Allocation, or Indexing actions
  useEffect(() => {
    if (activeAction === 'rts' || activeAction === 'box_c_rts') {
      setRtsDate(getTodayDate());
      // Reset RTS form states
      setRtsReason('');
      setCustomRtsReason('');
      setShowCustomRtsReason(false);
      setRtsDetailedReason('');
    } else if (activeAction === 'norsa' || activeAction === 'box_c_norsa') {
      setNorsaDate(getTodayDate());
      setNorsaNumber('');
      setNorsaError('');
    } else if (activeAction === 'cash_allocation') {
      setCashAllocationDate(getTodayDate());
      setNetAmount(dv?.amount || ''); // Pre-fill with original amount
    } else if (activeAction === 'indexing') {
      setIndexingDate(getTodayDate());
    }
  }, [activeAction, dv]);

  // Auto-fill indexing date when modal opens for indexing status
  useEffect(() => {
    if (isOpen && dv?.status === 'for_indexing') {
      setIndexingDate(getTodayDate());
    }
  }, [isOpen, dv?.status]);

  if (!isOpen || !dv) return null;

  const handleReviewDone = () => {
    if (confirm('Mark this DV as Review Done?')) {
      onStatusUpdate(dv.id, 'for_cash_allocation');
      onClose();
    }
  };

  const handleRTS = () => {
    // Determine the final reason to use
    let finalReason = '';
    if (rtsReason === 'Other') {
      if (!customRtsReason.trim()) {
        alert('Please enter a custom reason for RTS.');
        return;
      }
      finalReason = customRtsReason.trim();
    } else {
      if (!rtsReason.trim()) {
        alert('Please select a reason for RTS.');
        return;
      }
      finalReason = rtsReason;
    }
    
    if (!rtsDate) {
      alert('Please fill in the RTS date.');
      return;
    }
    
    // Require detailed reason if general reason is selected
    if (rtsReason && rtsReason !== 'Other' && !rtsDetailedReason.trim()) {
      alert('Please provide detailed reason/notes for RTS.');
      return;
    }
    
    // Combine general and detailed reasons
    let combinedReason = finalReason;
    if (rtsDetailedReason.trim() && rtsReason !== 'Other') {
      combinedReason = `${finalReason} - ${rtsDetailedReason.trim()}`;
    }
    
    if (confirm('Return this DV to sender?')) {
      onStatusUpdate(dv.id, 'for_rts_in', {
        rts_out_date: rtsDate,
        rts_reason: combinedReason
      });
      onClose();
      setActiveAction(null);
      setRtsReason('');
      setRtsDate('');
      setCustomRtsReason('');
      setShowCustomRtsReason(false);
      setRtsDetailedReason('');
    }
  };

  const handleNORSA = () => {
    const norsaPattern = /^\d{4}-\d{2}-\d{5}$/;
    if (!norsaNumber.trim() || !norsaDate) {
      setNorsaError('Please fill in both NORSA number and date.');
      return;
    }
    if (!norsaPattern.test(norsaNumber)) {
      setNorsaError('Format: YYYY-MM-NNNNN');
      return;
    }
    // Validate year and month
    const [year, month, serial] = norsaNumber.split('-');
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const currentYear = new Date().getFullYear();
    if (yearNum < 2020 || yearNum > currentYear + 1) {
      setNorsaError(`Year must be 2020-${currentYear + 1}`);
      return;
    }
    if (monthNum < 1 || monthNum > 12) {
      setNorsaError('Month must be 01-12');
      return;
    }
    setNorsaError('');
    if (confirm('Process NORSA for this DV?')) {
      onStatusUpdate(dv.id, 'for_norsa_in', {
        norsa_number: norsaNumber,
        norsa_date: norsaDate
      });
      onClose();
      setActiveAction(null);
      setNorsaNumber('');
      setNorsaDate('');
    }
  };

  // Handler for RTS In - mark as returned after RTS
  const handleRtsIn = () => {
    if (confirm('Mark this DV as returned after RTS?')) {
      onStatusUpdate(dv.id, 'for_review', {
        rts_in_date: rtsReturnDate
      });
      onClose();
    }
  };

  // Handler for NORSA In - mark as returned after NORSA
  const handleNorsaIn = () => {
    if (confirm('Mark this DV as returned after NORSA?')) {
      onStatusUpdate(dv.id, 'for_review', {
        norsa_in_date: norsaReturnDate
      });
      onClose();
    }
  };

  // Handler for Box C RTS In - mark as returned after RTS from Box C
  const handleBoxCRtsIn = () => {
    if (confirm('Mark this DV as returned after RTS from Box C?')) {
      onStatusUpdate(dv.id, 'for_box_c', {
        bc_rts_in_date: rtsReturnDate
      });
      onClose();
    }
  };

  // Handler for Box C NORSA In - mark as returned after NORSA from Box C
  const handleBoxCNorsaIn = () => {
    if (confirm('Mark this DV as returned after NORSA from Box C?')) {
      onStatusUpdate(dv.id, 'for_box_c', {
        bc_norsa_in_date: norsaReturnDate
      });
      onClose();
    }
  };

  const handleCashAllocation = () => {
    if (!cashAllocationDate || !cashAllocationNumber.trim() || !netAmount) {
      alert('Please fill in all cash allocation fields.');
      return;
    }
    
    if (confirm('Process cash allocation for this DV?')) {
      onStatusUpdate(dv.id, 'for_box_c', {
        cash_allocation_date: cashAllocationDate,
        cash_allocation_number: cashAllocationNumber,
        net_amount: netAmount
      });
      onClose();
      setActiveAction(null);
      setCashAllocationDate('');
      setCashAllocationNumber('');
      setNetAmount('');
    }
  };

  const handleCertify = () => {
    if (confirm('Certify this DV?')) {
      onStatusUpdate(
        dv.id,
        'for_approval',
        { action: 'certify' },
        () => {
          // After status update, use Inertia to visit For Approval tab
          if (typeof window !== 'undefined' && window.route) {
            window.route.visit(window.location.pathname + '?tab=for_approval', { replace: true });
          } else if (typeof window !== 'undefined') {
            const url = new URL(window.location);
            url.searchParams.set('tab', 'for_approval');
            window.history.replaceState({}, '', url);
            window.location.reload();
          }
        }
      );
      onClose();
    }
  };

  const handleBoxCRTS = () => {
    // Determine the final reason to use
    let finalReason = '';
    if (rtsReason === 'Other') {
      if (!customRtsReason.trim()) {
        alert('Please enter a custom reason for RTS.');
        return;
      }
      finalReason = customRtsReason.trim();
    } else {
      if (!rtsReason.trim()) {
        alert('Please select a reason for RTS.');
        return;
      }
      finalReason = rtsReason;
    }
    
    if (!rtsDate) {
      alert('Please fill in the RTS date.');
      return;
    }
    
    // Require detailed reason if general reason is selected
    if (rtsReason && rtsReason !== 'Other' && !rtsDetailedReason.trim()) {
      alert('Please provide detailed reason/notes for RTS.');
      return;
    }
    
    // Combine general and detailed reasons
    let combinedReason = finalReason;
    if (rtsDetailedReason.trim() && rtsReason !== 'Other') {
      combinedReason = `${finalReason} - ${rtsDetailedReason.trim()}`;
    }
    
    if (confirm('Return this DV to sender from Box C?')) {
      onStatusUpdate(dv.id, 'for_rts_in', {
        action: 'rts',
        rts_out_date: rtsDate,
        rts_reason: combinedReason,
        rts_origin: 'box_c'  // Set origin to track where RTS originated
      });
      onClose();
      setActiveAction(null);
      setRtsReason('');
      setRtsDate('');
      setCustomRtsReason('');
      setShowCustomRtsReason(false);
      setRtsDetailedReason('');
    }
  };

  const handleBoxCNORSA = () => {
    const norsaPattern = /^\d{4}-\d{2}-\d{5}$/;
    if (!norsaNumber.trim() || !norsaDate) {
      setNorsaError('Please fill in both NORSA number and date.');
      return;
    }
    if (!norsaPattern.test(norsaNumber)) {
      setNorsaError('Format: YYYY-MM-NNNNN');
      return;
    }
    // Validate year and month
    const [year, month, serial] = norsaNumber.split('-');
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const currentYear = new Date().getFullYear();
    if (yearNum < 2020 || yearNum > currentYear + 1) {
      setNorsaError(`Year must be 2020-${currentYear + 1}`);
      return;
    }
    if (monthNum < 1 || monthNum > 12) {
      setNorsaError('Month must be 01-12');
      return;
    }
    setNorsaError('');
    if (confirm('Process NORSA for this DV from Box C?')) {
      onStatusUpdate(dv.id, 'for_norsa_in', {
        action: 'norsa',
        norsa_date: norsaDate,
        norsa_number: norsaNumber,
        norsa_origin: 'box_c'  // Set origin to track where NORSA originated
      });
      onClose();
      setActiveAction(null);
      setNorsaNumber('');
      setNorsaDate('');
      setNorsaError('');
    }
  };

  const handleIndexing = () => {
    if (!indexingDate) {
      alert('Please select a date for indexing.');
      return;
    }
    if (confirm('Process indexing for this DV?')) {
      onStatusUpdate(dv.id, 'for_payment', {
        indexing_date: indexingDate
      });
      onClose();
      setActiveAction(null);
      setIndexingDate('');
    }
  };

  const handleReallocation = () => {
    if (confirm('Are you sure you want to reallocate this DV? This will move old data to history and restart the process from Cash Allocation.')) {
      // Call the reallocation API
      fetch(`/incoming-dvs/${dv.id}/reallocate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to reallocate DV');
        }
        return response.json();
      })
      .then(data => {
        alert('DV successfully reallocated. It has been moved to Cash Allocation stage.');
        onClose();
        // Trigger a refresh of the parent component
        if (onStatusUpdate) {
          onStatusUpdate(dv.id, 'for_cash_allocation', { reallocated: true });
        }
      })
      .catch(error => {
        console.error('Error reallocating DV:', error);
        alert('Failed to reallocate DV. Please try again.');
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 modal-backdrop overflow-y-auto" style={{ zIndex: 50000, paddingTop: '80px', paddingBottom: '20px' }}>
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="bg-green-700 text-white p-4 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {dv.status === 'for_review' && (
              <button
                onClick={onClose}
                className="text-white hover:text-gray-300 transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back</span>
              </button>
            )}
            <h2 className="text-lg font-semibold">
              DV Details
              {isReallocationView && (
                <span className="ml-3 px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
                  FOR CASH REALLOCATION
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Reallocation Notice */}
        {isReallocationView && (
          <div className="p-4 bg-orange-50 border-b-2 border-orange-200">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 13.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-sm font-medium text-orange-800">
                This DV is being reallocated. Only original DV and For Review data are shown below. All post-cash-allocation data has been cleared for reprocessing.
              </span>
            </div>
          </div>
        )}

        {/* Progressive Summary for For Review DVs - Only show RTS/NORSA if they exist */}
        {dv.status === 'for_review' && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            {/* Only show title if there are RTS or NORSA details to display */}
            {((dv.rts_out_date || dv.rts_in_date || dv.rts_reason) || (dv.norsa_out_date || dv.norsa_in_date || dv.norsa_number || dv.norsa_reason)) && (
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">📖</span>
                Previous Actions Taken
              </h3>
            )}
            <div className="space-y-4">

              {/* RTS Details - Only show if RTS was issued */}
              {(dv.rts_out_date || dv.rts_in_date || dv.rts_reason) && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-3">Return to Sender (RTS) Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">RTS Issued Date:</span>
                      <p>{dv.rts_out_date ? new Date(dv.rts_out_date).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">RTS Returned Date:</span>
                      <p>{dv.rts_in_date ? new Date(dv.rts_in_date).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    {dv.rts_reason && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-700">RTS Reason:</span>
                        <p>{dv.rts_reason}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* NORSA Details - Only show if NORSA was issued */}
              {(dv.norsa_out_date || dv.norsa_in_date || dv.norsa_number || dv.norsa_reason) && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-3">NORSA Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">NORSA Issued Date:</span>
                      <p>{dv.norsa_out_date ? new Date(dv.norsa_out_date).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">NORSA Completed Date:</span>
                      <p>{dv.norsa_in_date ? new Date(dv.norsa_in_date).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    {dv.norsa_number && (
                      <div>
                        <span className="font-medium text-gray-700">NORSA Number:</span>
                        <p>{dv.norsa_number}</p>
                      </div>
                    )}
                    {dv.norsa_reason && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-700">NORSA Details:</span>
                        <p>{dv.norsa_reason}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}


        {/* Removed Box C section - redundant information */}

        {/* Content - Two columns */}
        <div className="flex">
          {/* Left Column - DV Information and Actions */}
          <div className="flex-1 p-6 border-r border-gray-200">
            {/* Basic DV Information */}
            <div className="mb-6 p-4 border-2 border-green-200 rounded-lg bg-green-50">
              <h3 className="text-lg font-semibold text-green-800 mb-4">Disbursement Voucher Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Payee</label>
                  <p className="text-lg font-semibold">{dv.payee || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">DV Number</label>
                  <p className="text-lg font-semibold">{dv.dv_number || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Receive Date</label>
                  <p className="text-sm">{dv.created_at ? new Date(dv.created_at).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Particulars</label>
                  <p className="text-sm">{dv.particulars || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Amount as stated by DV</label>
                  <p className="text-lg font-semibold text-green-600">
                    {dv.amount !== undefined && dv.amount !== null && dv.amount !== '' && !isNaN(parseFloat(dv.amount))
                      ? `PHP ${parseFloat(dv.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Transaction Type</label>
                  <p className="text-sm">{dv.transaction_type || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Implementing Unit</label>
                  <p className="text-sm">{dv.implementing_unit || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Account Number</label>
                  <p className="text-sm">{dv.account_number || 'N/A'}</p>
                </div>
              </div>
              
              {/* ORS Details */}
              <div className="mt-4">
                {/* Removed 'ORS Details' label as requested */}
                {dv.ors_entries && dv.ors_entries.length > 0 ? (
                  <div className="space-y-2 mt-2">
                    {dv.ors_entries.map((ors, index) => (
                      <div key={index} className="text-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div>
                            <span className="font-medium">ORS No.:</span> {ors.ors_number ? ors.ors_number : 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Fund Source:</span> {ors.fund_source ? ors.fund_source : 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">UACS/Object of Expenditure:</span> {ors.uacs ? ors.uacs : 'N/A'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 mt-2">
                    <div className="text-sm">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div>
                          <span className="font-medium">ORS No.:</span> N/A
                        </div>
                        <div>
                          <span className="font-medium">Fund Source:</span> N/A
                        </div>
                        <div>
                          <span className="font-medium">UACS/Object of Expenditure:</span> N/A
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RTS Information - Only show if DV actually went through RTS process */}
            {(dv.rts_history && dv.rts_history.length > 0 && dv.rts_history.some(rts => rts.returned_date)) && (
              <div className="mb-6 p-4 border-2 border-orange-200 rounded-lg bg-orange-50">
                <h3 className="text-lg font-semibold text-orange-800 mb-4">RTS Information</h3>
                {dv.rts_history.map((rts, index) => (
                  <div key={index} className="bg-white p-4 rounded border mb-3 last:mb-0">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Date of RTS:</span>
                        <p>{rts.date}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Reason of RTS:</span>
                        <p>{rts.reason}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Date Returned After RTS:</span>
                        <p>{rts.returned_date ? rts.returned_date : 'Pending'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Reviewed by:</span>
                        <p>{rts.reviewed_by || '<name>'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* For Review Section - Only show if DV has RTS/NORSA data (not for clean new DVs) */}
            {(dv.status === 'for_review' && (dv.rts_out_date || dv.rts_in_date || dv.rts_reason || dv.norsa_out_date || dv.norsa_in_date || dv.norsa_number || dv.norsa_reason)) && (
              <div className="mb-6 p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">📖</span>
                  For Review
                </h3>
                
                {/* Review Done Date */}
                {dv.transaction_history?.find(entry => entry.action.toLowerCase().includes('review done')) && (
                  <div className="mb-4 p-2 bg-green-100 border border-green-300 rounded">
                    <span className="text-sm font-medium text-green-800">
                      Review completed on: {new Date(dv.transaction_history.find(entry => entry.action.toLowerCase().includes('review done')).date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* RTS Details Box - Only show if RTS actually occurred */}
                  {(dv.rts_out_date || dv.rts_in_date || dv.rts_reason) && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-3">RTS Details</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">RTS Issued Date:</span>
                          <p className="text-gray-600">{dv.rts_out_date ? new Date(dv.rts_out_date).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">RTS Returned Date:</span>
                          <p className="text-gray-600">{dv.rts_in_date ? new Date(dv.rts_in_date).toLocaleDateString() : 'Pending'}</p>
                        </div>
                        {dv.rts_reason && (
                          <div>
                            <span className="font-medium text-gray-700">RTS Reason:</span>
                            <p className="text-gray-600">{dv.rts_reason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* NORSA Details Box - Only show if NORSA actually occurred */}
                  {(dv.norsa_out_date || dv.norsa_in_date || dv.norsa_number || dv.norsa_reason) && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-3">NORSA Details</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">NORSA Issued Date:</span>
                          <p className="text-gray-600">{dv.norsa_out_date ? new Date(dv.norsa_out_date).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">NORSA Completed Date:</span>
                          <p className="text-gray-600">{dv.norsa_in_date ? new Date(dv.norsa_in_date).toLocaleDateString() : 'Pending'}</p>
                        </div>
                        {dv.norsa_number && (
                          <div>
                            <span className="font-medium text-gray-700">NORSA Number:</span>
                            <p className="text-gray-600">{dv.norsa_number}</p>
                          </div>
                        )}
                        {dv.norsa_reason && (
                          <div>
                            <span className="font-medium text-gray-700">NORSA Details:</span>
                            <p className="text-gray-600">{dv.norsa_reason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Progressive Summary Sections - Show based on workflow progression (NOT for for_review) */}
            {(['for_cash_allocation', 'for_box_c', 'for_approval', 'for_indexing', 'for_mode_of_payment', 'for_engas', 'out_for_cashiering', 'for_cdj', 'for_lddap', 'processed'].includes(dv.status) || isReallocationView) && (
              <>
                {/* For Review Section - Progressive Summary */}
                <div className="mb-6 p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="mr-2">📖</span>
                    For Review (Summary)
                  </h3>
                  
                  {/* Review Done Date */}
                  {dv.transaction_history?.find(entry => entry.action.toLowerCase().includes('review done')) && (
                    <div className="mb-4 p-2 bg-green-100 border border-green-300 rounded">
                      <span className="text-sm font-medium text-green-800">
                        Review completed on: {new Date(dv.transaction_history.find(entry => entry.action.toLowerCase().includes('review done')).date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* RTS Details Box - Only show if RTS actually occurred */}
                    {(dv.rts_out_date || dv.rts_in_date || dv.rts_reason) && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-semibold text-red-800 mb-3">RTS Details</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">RTS Issued Date:</span>
                            <p className="text-gray-600">{dv.rts_out_date ? new Date(dv.rts_out_date).toLocaleDateString() : 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">RTS Returned Date:</span>
                            <p className="text-gray-600">{dv.rts_in_date ? new Date(dv.rts_in_date).toLocaleDateString() : 'N/A'}</p>
                          </div>
                          {dv.rts_reason && (
                            <div>
                              <span className="font-medium text-gray-700">RTS Reason:</span>
                              <p className="text-gray-600">{dv.rts_reason}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* NORSA Details Box - Only show if NORSA actually occurred */}
                    {(dv.norsa_out_date || dv.norsa_in_date || dv.norsa_number || dv.norsa_reason) && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="font-semibold text-yellow-800 mb-3">NORSA Details</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">NORSA Issued Date:</span>
                            <p className="text-gray-600">{dv.norsa_out_date ? new Date(dv.norsa_out_date).toLocaleDateString() : 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">NORSA Completed Date:</span>
                            <p className="text-gray-600">{dv.norsa_in_date ? new Date(dv.norsa_in_date).toLocaleDateString() : 'N/A'}</p>
                          </div>
                          {dv.norsa_number && (
                            <div>
                              <span className="font-medium text-gray-700">NORSA Number:</span>
                              <p className="text-gray-600">{dv.norsa_number}</p>
                            </div>
                          )}
                          {dv.norsa_reason && (
                            <div>
                              <span className="font-medium text-gray-700">NORSA Details:</span>
                              <p className="text-gray-600">{dv.norsa_reason}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* For Cash Allocation Section */}
                <div className="mb-6 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                    <span className="mr-2">💰</span>
                    For Cash Allocation
                  </h3>
                  
                  {/* Cash Allocation Date */}
                  {/* Removed redundant green cash allocation box */}
                  
                  {/* Cash Allocation Details Box */}
                  <div className="mb-4 p-4 bg-blue-100 border border-blue-300 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Date Completed:</span>
                        <p className="text-gray-600">{dv.cash_allocation_date ? new Date(dv.cash_allocation_date).toLocaleDateString() : 'Not completed'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Date Processed:</span>
                        <p className="text-gray-600">{dv.cash_allocation_processed_date ? new Date(dv.cash_allocation_processed_date).toLocaleDateString() : 'Not processed yet'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">CA Number:</span>
                        <p className="text-gray-600">{dv.cash_allocation_number || 'Not assigned'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Net Amount:</span>
                        <p className="text-gray-600 font-semibold">
                          {dv.net_amount ? `PHP ${parseFloat(dv.net_amount).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}` : 'Not set'}
                        </p>
                      </div>
                      {dv.allocated_by && (
                        <div className="md:col-span-2">
                          <span className="font-medium text-gray-700">Allocated by:</span>
                          <p className="text-gray-600">{dv.allocated_by}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Cash Allocation RTS Details Box */}
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-3">RTS Details (Cash Allocation)</h4>
                      {(dv.ca_rts_out_date || dv.ca_rts_in_date || dv.ca_rts_reason) ? (
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">RTS Issued Date:</span>
                            <p className="text-gray-600">{dv.ca_rts_out_date ? new Date(dv.ca_rts_out_date).toLocaleDateString() : 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">RTS Returned Date:</span>
                            <p className="text-gray-600">{dv.ca_rts_in_date ? new Date(dv.ca_rts_in_date).toLocaleDateString() : 'Pending'}</p>
                          </div>
                          {dv.ca_rts_reason && (
                            <div>
                              <span className="font-medium text-gray-700">RTS Reason:</span>
                              <p className="text-gray-600">{dv.ca_rts_reason}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No RTS was issued during cash allocation.</p>
                      )}
                    </div>
                    
                    {/* Cash Allocation NORSA Details Box */}
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-3">NORSA Details (Cash Allocation)</h4>
                      {(dv.ca_norsa_out_date || dv.ca_norsa_in_date || dv.ca_norsa_number || dv.ca_norsa_reason) ? (
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">NORSA Issued Date:</span>
                            <p className="text-gray-600">{dv.ca_norsa_out_date ? new Date(dv.ca_norsa_out_date).toLocaleDateString() : 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">NORSA Completed Date:</span>
                            <p className="text-gray-600">{dv.ca_norsa_in_date ? new Date(dv.ca_norsa_in_date).toLocaleDateString() : 'Pending'}</p>
                          </div>
                          {dv.ca_norsa_number && (
                            <div>
                              <span className="font-medium text-gray-700">NORSA Number:</span>
                              <p className="text-gray-600">{dv.ca_norsa_number}</p>
                            </div>
                          )}
                          {dv.ca_norsa_reason && (
                            <div>
                              <span className="font-medium text-gray-700">NORSA Details:</span>
                              <p className="text-gray-600">{dv.ca_norsa_reason}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No NORSA was issued during cash allocation.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* For Box C Certification Section */}
                <div className="mb-6 p-4 border-2 border-yellow-200 rounded-lg bg-yellow-50">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
                    <span className="mr-2">📋</span>
                    For Box C Certification
                  </h3>
                  
                  {/* Box C Certification Date */}
                  {dv.transaction_history?.find(entry => entry.action.toLowerCase().includes('box c certified')) && (
                    <div className="mb-4 p-2 bg-green-100 border border-green-300 rounded">
                      <span className="text-sm font-medium text-green-800">
                        Box C certified on: {new Date(dv.transaction_history.find(entry => entry.action.toLowerCase().includes('box c certified')).date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Box C RTS Details Box */}
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-3">RTS Details (Box C)</h4>
                      {(dv.bc_rts_out_date || dv.bc_rts_in_date || dv.bc_rts_reason) ? (
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">RTS Issued Date:</span>
                            <p className="text-gray-600">{dv.bc_rts_out_date ? new Date(dv.bc_rts_out_date).toLocaleDateString() : 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">RTS Returned Date:</span>
                            <p className="text-gray-600">{dv.bc_rts_in_date ? new Date(dv.bc_rts_in_date).toLocaleDateString() : 'N/A'}</p>
                          </div>
                          {dv.bc_rts_reason && (
                            <div>
                              <span className="font-medium text-gray-700">RTS Reason:</span>
                              <p className="text-gray-600">{dv.bc_rts_reason}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No RTS was issued during Box C certification.</p>
                      )}
                    </div>
                    
                    {/* Box C NORSA Details Box */}
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-3">NORSA Details (Box C)</h4>
                      {(dv.bc_norsa_out_date || dv.bc_norsa_in_date || dv.bc_norsa_number || dv.bc_norsa_reason) ? (
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">NORSA Issued Date:</span>
                            <p className="text-gray-600">{dv.bc_norsa_out_date ? new Date(dv.bc_norsa_out_date).toLocaleDateString() : 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">NORSA Completed Date:</span>
                            <p className="text-gray-600">{dv.bc_norsa_in_date ? new Date(dv.bc_norsa_in_date).toLocaleDateString() : 'N/A'}</p>
                          </div>
                          {dv.bc_norsa_number && (
                            <div>
                              <span className="font-medium text-gray-700">NORSA Number:</span>
                              <p className="text-gray-600">{dv.bc_norsa_number}</p>
                            </div>
                          )}
                          {dv.bc_norsa_reason && (
                            <div>
                              <span className="font-medium text-gray-700">NORSA Details:</span>
                              <p className="text-gray-600">{dv.bc_norsa_reason}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No NORSA was issued during Box C certification.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* For Approval Section */}
                <div className="mb-6 p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="mr-2">✅</span>
                    For Approval
                  </h3>
                  
                  <div className="mb-4 p-2 bg-green-100 border border-green-300 rounded">
                    <span className="text-sm font-medium text-green-800">
                      Approval completed on: {new Date(dv.approval_in_date).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Approval Details */}
                  {(dv.approval_out_date || dv.approval_in_date) && (
                    <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-3">Approval Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Sent for Approval:</span>
                          <p className="text-gray-600">{formatDate(dv.approval_out_date)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Approval Returned:</span>
                          <p className="text-gray-600">{formatDate(dv.approval_in_date)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Approved by:</span>
                          <p className="text-gray-600">{dv.approved_by || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* For Indexing Section */}
                <div className="mb-6 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                    <span className="mr-2">📋</span>
                    For Indexing
                  </h3>
                  
                  <div className="mb-4 p-2 bg-green-100 border border-green-300 rounded">
                    <span className="text-sm font-medium text-green-800">
                      Indexing completed on: {new Date(dv.indexing_date).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Indexing Details */}
                  {dv.indexing_date && (
                    <div className="p-4 bg-blue-100 border border-blue-300 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-3">Indexing Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-blue-700">Indexing Date:</span>
                          <p className="text-blue-600">{formatDate(dv.indexing_date)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-blue-700">Processing Status:</span>
                          <p className="text-blue-600">Complete</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Out to Cashiering Information */}
                <div className="border-t pt-6">
                  <div className="bg-purple-100 border border-purple-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                      <span className="mr-2">🏦</span>
                      Out to Cashiering
                    </h3>
                    <p className="text-sm text-purple-700 mb-4">
                      This DV is currently out for payroll register processing. Use the "In" button when it returns.
                    </p>
                    {dv.pr_out_date && (
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                        <p className="text-sm text-purple-600">
                          <span className="font-medium">Sent out:</span> {formatDate(dv.pr_out_date)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column - Transaction History */}
          <div className="w-80 bg-gray-50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Transaction History</h3>
              <div className="text-xs text-gray-500">
                {dv.transaction_history && dv.transaction_history.length > 0 
                  ? `${dv.transaction_history.length} entries`
                  : 'No entries'
                }
              </div>
            </div>
            {dv.transaction_history && dv.transaction_history.length > 0 ? (
              <div className="bg-white border rounded-lg p-4 max-h-96 overflow-y-auto">
                <div className="space-y-3">
                  {dv.transaction_history
                    .sort((a, b) => new Date(a.date) - new Date(b.date)) // Sort by date, oldest first (ascending)
                    .map((entry, index) => (
                    <div key={index} className="flex items-start space-x-3 pb-3 border-b border-gray-200 last:border-b-0 last:pb-0">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{entry.action}</p>
                          <p className="text-xs text-gray-500">{new Date(entry.date).toLocaleDateString()}</p>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">by {entry.user}</p>
                        {entry.details && Object.keys(entry.details).length > 0 && (
                          <div className="mt-2 text-xs text-gray-700">
                            {entry.details.rts_reason && (
                              <p><span className="font-medium">Reason:</span> {entry.details.rts_reason}</p>
                            )}
                            {entry.details.norsa_number && (
                              <p><span className="font-medium">NORSA Number:</span> {entry.details.norsa_number}</p>
                            )}
                            {entry.details.cash_allocation_number && (
                              <p><span className="font-medium">Allocation Number:</span> {entry.details.cash_allocation_number}</p>
                            )}
                            {entry.details.net_amount && (
                              <p><span className="font-medium">Net Amount:</span> ₱{parseFloat(entry.details.net_amount).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}</p>
                            )}
                            {entry.details.amount && (
                              <p><span className="font-medium">Amount:</span> ₱{parseFloat(entry.details.amount).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}</p>
                            )}
                            {entry.details.dv_number && (
                              <p><span className="font-medium">DV Number:</span> {entry.details.dv_number}</p>
                            )}
                            {entry.details.status_display && (
                              <p><span className="font-medium">Status:</span> {entry.details.status_display}</p>
                            )}
                            {entry.details.rts_count && (
                              <p><span className="font-medium">RTS Count:</span> {entry.details.rts_count}</p>
                            )}
                            {entry.details.norsa_count && (
                              <p><span className="font-medium">NORSA Count:</span> {entry.details.norsa_count}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white border rounded-lg p-4">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 text-gray-400">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">No transaction history available</p>
                  <p className="text-xs text-gray-400">History will be automatically generated for this DV on the next page load.</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Reallocation Section - Only for processed DVs */}
        {dv.status === 'processed' && (
          <div className="bg-white/20 backdrop-blur-sm px-6 py-4 border-t border-white/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Reallocation Options</h3>
                <p className="text-sm text-gray-700">Reallocate this DV for fund source changes or corrections</p>
              </div>
              <button
                onClick={() => handleReallocation()}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2 font-medium"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                <span>Reallocate DV</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
