import { useState, useEffect } from 'react';

export default function DvDetailsModal({ dv, isOpen, onClose, onStatusUpdate }) {
  const [activeAction, setActiveAction] = useState(null);
  const [rtsReason, setRtsReason] = useState('');
  const [rtsDate, setRtsDate] = useState('');
  const [norsaNumber, setNorsaNumber] = useState('');
  const [norsaError, setNorsaError] = useState('');
  // Strict NORSA number input handler (auto-format as YYYY-MM-NNNNN)
  const handleNorsaNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Only digits
    value = value.slice(0, 11); // Max 11 digits (4 year + 2 month + 5 serial)
    let formatted = '';
    if (value.length > 0) {
      formatted = value.slice(0, 4);
      if (value.length > 4) {
        formatted += '-' + value.slice(4, 6);
        if (value.length > 6) {
          formatted += '-' + value.slice(6);
        }
      }
    }
    setNorsaNumber(formatted);
    // Validate as user types
    if (formatted.length === 12) {
      const norsaPattern = /^\d{4}-\d{2}-\d{5}$/;
      if (!norsaPattern.test(formatted)) {
        setNorsaError('Format: YYYY-MM-NNNNN');
      } else {
        // Validate year and month
        const [year, month, serial] = formatted.split('-');
        const yearNum = parseInt(year);
        const monthNum = parseInt(month);
        const currentYear = new Date().getFullYear();
        if (yearNum < 2020 || yearNum > currentYear + 1) {
          setNorsaError(`Year must be 2020-${currentYear + 1}`);
        } else if (monthNum < 1 || monthNum > 12) {
          setNorsaError('Month must be 01-12');
        } else {
          setNorsaError('');
        }
      }
    } else if (formatted.length > 0) {
      setNorsaError('Format: YYYY-MM-NNNNN');
    } else {
      setNorsaError('');
    }
  };
  const [norsaDate, setNorsaDate] = useState('');
  
  // Cash allocation state variables
  const [cashAllocationDate, setCashAllocationDate] = useState('');
  const [cashAllocationNumber, setCashAllocationNumber] = useState('');
  const [netAmount, setNetAmount] = useState('');

  // Check if this is a reallocated DV that should only show original DV and For Review data
  const isReallocationView = dv?.is_reallocated === true;

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
    } else if (activeAction === 'norsa' || activeAction === 'box_c_norsa') {
      setNorsaDate(getTodayDate());
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
    if (!rtsReason.trim() || !rtsDate) {
      alert('Please fill in both RTS date and reason.');
      return;
    }
    
    if (confirm('Return this DV to sender?')) {
      onStatusUpdate(dv.id, 'for_rts_in', {
        rts_out_date: rtsDate,
        rts_reason: rtsReason
      });
      onClose();
      setActiveAction(null);
      setRtsReason('');
      setRtsDate('');
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
        'certified',
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
    if (!rtsReason.trim() || !rtsDate) {
      alert('Please fill in both RTS date and reason.');
      return;
    }
    if (confirm('Return this DV to sender from Box C?')) {
      onStatusUpdate(dv.id, 'for_rts_in', {
        action: 'rts',
        rts_out_date: rtsDate,
        rts_reason: rtsReason
      });
      onClose();
      setActiveAction(null);
      setRtsReason('');
      setRtsDate('');
    }
  };

  const handleBoxCNORSA = () => {
    if (!norsaNumber.trim() || !norsaDate) {
      alert('Please fill in both NORSA number and date.');
      return;
    }
    if (confirm('Process NORSA for this DV from Box C?')) {
      onStatusUpdate(dv.id, 'for_norsa_in', {
        action: 'norsa',
        norsa_date: norsaDate,
        norsa_number: norsaNumber
      });
      onClose();
      setActiveAction(null);
      setNorsaNumber('');
      setNorsaDate('');
    }
  };

  const handleIndexing = () => {
    if (!indexingDate) {
      alert('Please select a date for indexing.');
      return;
    }
    if (confirm('Process indexing for this DV?')) {
      onStatusUpdate(dv.id, 'for_indexing', {
        indexing_date: indexingDate
      });
      onClose();
      setActiveAction(null);
      setIndexingDate('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 modal-backdrop overflow-y-auto" style={{ zIndex: 50000, paddingTop: '100px', paddingBottom: '20px' }}>
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
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

            {/* RTS Information - Only show if there are actual RTS records */}
            {(dv.rts_history && dv.rts_history.length > 0) && dv.status !== 'for_cash_allocation' && dv.status !== 'for_box_c' && (
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
                        <p>{rts.returned_date || 'Pending'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Reviewed by:</span>
                        <p>{rts.reviewed_by || '&lt;name&gt;'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                      <div>
                        <span className="font-medium text-gray-700">Accounting Staff in-charge:</span>
                        <p>{rts.staff_in_charge || '&lt;name&gt;'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Date when review was done:</span>
                        <p>{rts.review_date || new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* For Review Section - For Cash Allocation DVs or Reallocated DVs */}
            {(dv.status === 'for_cash_allocation' || isReallocationView) && (
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
                  {/* RTS Details Box */}
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-3">RTS Details</h4>
                    {(dv.rts_out_date || dv.rts_in_date || dv.rts_reason) ? (
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
                    ) : (
                      <p className="text-gray-500 italic">No RTS was issued for this DV.</p>
                    )}
                  </div>
                  
                  {/* NORSA Details Box */}
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-3">NORSA Details</h4>
                    {(dv.norsa_out_date || dv.norsa_in_date || dv.norsa_number || dv.norsa_reason) ? (
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
                    ) : (
                      <p className="text-gray-500 italic">No NORSA was issued for this DV.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Progressive Summary Sections - For Approval DVs */}
            {dv.status === 'for_approval' && !isReallocationView && (
              <>
                {/* For Review Section */}
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
                    {/* RTS Details Box */}
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-3">RTS Details</h4>
                      {(dv.rts_out_date || dv.rts_in_date || dv.rts_reason) ? (
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
                      ) : (
                        <p className="text-gray-500 italic">No RTS was issued for this DV.</p>
                      )}
                    </div>
                    
                    {/* NORSA Details Box */}
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-3">NORSA Details</h4>
                      {(dv.norsa_out_date || dv.norsa_in_date || dv.norsa_number || dv.norsa_reason) ? (
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
                      ) : (
                        <p className="text-gray-500 italic">No NORSA was issued for this DV.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* For Cash Allocation Section */}
                <div className="mb-6 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                    <span className="mr-2">💰</span>
                    For Cash Allocation
                  </h3>
                  
                  {/* Cash Allocation Date */}
                  {dv.cash_allocation_date && (
                    <div className="mb-4 p-2 bg-green-100 border border-green-300 rounded">
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="text-sm font-medium text-green-800">
                          Cash allocation completed on: {new Date(dv.cash_allocation_date).toLocaleDateString()}
                        </span>
                        {dv.cash_allocation_processed_date && (
                          <span className="text-sm font-medium text-green-800">
                            Processed on: {new Date(dv.cash_allocation_processed_date).toLocaleDateString()}
                          </span>
                        )}
                        {dv.cash_allocation_number && (
                          <span className="text-sm font-medium text-green-800">
                            CA No.: {dv.cash_allocation_number}
                          </span>
                        )}
                        {dv.net_amount && (
                          <span className="text-sm font-medium text-green-800">
                            Net Amount: PHP {parseFloat(dv.net_amount).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
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
                            <p className="text-gray-600">{dv.ca_rts_in_date ? new Date(dv.ca_rts_in_date).toLocaleDateString() : 'N/A'}</p>
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
                            <p className="text-gray-600">{dv.ca_norsa_in_date ? new Date(dv.ca_norsa_in_date).toLocaleDateString() : 'N/A'}</p>
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
              </>
            )}

            {/* Progressive Summary for For Indexing DVs */}
            {dv.status === 'for_indexing' && !isReallocationView && (
              <>
                {/* For Review Section */}
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
                    {/* RTS Details Box */}
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-3">RTS Details</h4>
                      {(dv.rts_out_date || dv.rts_in_date || dv.rts_reason) ? (
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
                      ) : (
                        <p className="text-gray-500 italic">No RTS was issued for this DV.</p>
                      )}
                    </div>
                    
                    {/* NORSA Details Box */}
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-3">NORSA Details</h4>
                      {(dv.norsa_out_date || dv.norsa_in_date || dv.norsa_number || dv.norsa_reason) ? (
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
                      ) : (
                        <p className="text-gray-500 italic">No NORSA was issued for this DV.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* For Cash Allocation Section */}
                <div className="mb-6 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                    <span className="mr-2">💰</span>
                    For Cash Allocation
                  </h3>
                  
                  {/* Cash Allocation Date */}
                  {dv.cash_allocation_date && (
                    <div className="mb-4 p-2 bg-green-100 border border-green-300 rounded">
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="text-sm font-medium text-green-800">
                          Cash allocation completed on: {new Date(dv.cash_allocation_date).toLocaleDateString()}
                        </span>
                        {dv.cash_allocation_processed_date && (
                          <span className="text-sm font-medium text-green-800">
                            Processed on: {new Date(dv.cash_allocation_processed_date).toLocaleDateString()}
                          </span>
                        )}
                        {dv.cash_allocation_number && (
                          <span className="text-sm font-medium text-green-800">
                            CA No.: {dv.cash_allocation_number}
                          </span>
                        )}
                        {dv.net_amount && (
                          <span className="text-sm font-medium text-green-800">
                            Net Amount: PHP {parseFloat(dv.net_amount).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
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
                            <p className="text-gray-600">{dv.ca_rts_in_date ? new Date(dv.ca_rts_in_date).toLocaleDateString() : 'N/A'}</p>
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
                            <p className="text-gray-600">{dv.ca_norsa_in_date ? new Date(dv.ca_norsa_in_date).toLocaleDateString() : 'N/A'}</p>
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

              </>
            )}

            {/* Cash Allocation Information */}
            {(dv.cash_allocation_date || dv.cash_allocation_number || dv.net_amount) && dv.status !== 'for_box_c' && dv.status !== 'for_approval' && dv.status !== 'for_indexing' && (
              <div className="mb-6 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Cash Allocation Information</h3>
                <div className="bg-white p-4 rounded border">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Date:</span>
                      <p>{dv.cash_allocation_date || 'Not set'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Cash Allocation No.:</span>
                      <p>{dv.cash_allocation_number || 'Not set'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Net Amount:</span>
                      <p className="font-semibold text-blue-600">
                        {dv.net_amount ? `PHP ${parseFloat(dv.net_amount).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}` : 'Not set'}
                      </p>
                    </div>
                  </div>
                  {dv.allocated_by && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium text-gray-700">Allocated by:</span>
                      <p>{dv.allocated_by}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Approval Information */}
            {(dv.approval_out_date || dv.approval_in_date || dv.approved_by) && (
              <div className="mb-6 p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Approval Information</h3>
                <div className="bg-white p-4 rounded border">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Sent Out for Approval:</span>
                      <p>{dv.approval_out_date ? new Date(dv.approval_out_date).toLocaleDateString() : 'Not sent yet'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Returned from Approval:</span>
                      <p>{dv.approval_in_date ? new Date(dv.approval_in_date).toLocaleDateString() : 'Not returned yet'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Approved by:</span>
                      <p>{dv.approved_by || 'Pending'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {dv.status === 'for_review' && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Review Actions</h3>
                
                {!activeAction && (
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleReviewDone}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      ✓ Review Done
                    </button>
                    <button
                      onClick={() => setActiveAction('rts')}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      ↩ Return to Sender (RTS)
                    </button>
                    <button
                      onClick={() => setActiveAction('norsa')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      📄 NORSA
                    </button>
                  </div>
                )}

                {/* RTS Form */}
                {activeAction === 'rts' && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-800 mb-3">Return to Sender Details</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">RTS Out Date</label>
                        <input
                          type="date"
                          value={rtsDate}
                          onChange={(e) => setRtsDate(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-2 focus:border-orange-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason for RTS</label>
                        <textarea
                          value={rtsReason}
                          onChange={(e) => setRtsReason(e.target.value)}
                          placeholder="Enter reason for returning to sender..."
                          className="w-full border border-gray-300 rounded-lg p-2 h-20 focus:border-orange-500 focus:outline-none resize-none"
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleRTS}
                          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                        >
                          Confirm RTS
                        </button>
                        <button
                          onClick={() => setActiveAction(null)}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* NORSA Form */}
                {activeAction === 'norsa' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">NORSA Details</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NORSA Date</label>
                        <input
                          type="date"
                          value={norsaDate}
                          onChange={(e) => setNorsaDate(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NORSA Number</label>
                        <input
                          type="text"
                          value={norsaNumber}
                          onChange={handleNorsaNumberChange}
                          placeholder="YYYY-MM-NNNNN"
                          className={`w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:outline-none ${norsaError ? 'border-red-500' : ''}`}
                          maxLength={13}
                          required
                        />
                        {norsaError && (
                          <p className="text-red-500 text-xs mt-1">{norsaError}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleNORSA}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Confirm NORSA
                        </button>
                        <button
                          onClick={() => setActiveAction(null)}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Box C Certification Actions */}
            {dv.status === 'for_box_c' && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Box C Certification Actions</h3>
                
                {!activeAction && (
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleCertify}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      ✓ Certify
                    </button>
                    <button
                      onClick={() => setActiveAction('box_c_rts')}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      ↩ Return to Sender (RTS)
                    </button>
                    <button
                      onClick={() => setActiveAction('box_c_norsa')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      📄 NORSA
                    </button>
                  </div>
                )}

                {/* Box C RTS Form */}
                {activeAction === 'box_c_rts' && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-800 mb-3">Return to Sender Details (From Box C)</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">RTS Out Date</label>
                        <input
                          type="date"
                          value={rtsDate}
                          onChange={(e) => setRtsDate(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-2 focus:border-orange-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason for RTS</label>
                        <textarea
                          value={rtsReason}
                          onChange={(e) => setRtsReason(e.target.value)}
                          placeholder="Enter reason for returning to sender..."
                          className="w-full border border-gray-300 rounded-lg p-2 h-20 focus:border-orange-500 focus:outline-none resize-none"
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleBoxCRTS}
                          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                        >
                          Confirm RTS
                        </button>
                        <button
                          onClick={() => setActiveAction(null)}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Box C NORSA Form */}
                {activeAction === 'box_c_norsa' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">NORSA Details (From Box C)</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NORSA Date</label>
                        <input
                          type="date"
                          value={norsaDate}
                          onChange={(e) => setNorsaDate(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NORSA Number</label>
                        <input
                          type="text"
                          value={norsaNumber}
                          onChange={(e) => setNorsaNumber(e.target.value)}
                          placeholder="Enter NORSA number..."
                          className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleBoxCNORSA}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Confirm NORSA
                        </button>
                        <button
                          onClick={() => setActiveAction(null)}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cash Allocation Actions */}
            {(dv.status === 'for_cash_allocation' || isReallocationView) && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Cash Allocation Actions</h3>
                
                {!activeAction && (
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setActiveAction('cash_allocation')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      💰 Process Cash Allocation
                    </button>
                    <button
                      onClick={() => setActiveAction('rts')}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      ↩ Return to Sender (RTS)
                    </button>
                    <button
                      onClick={() => setActiveAction('norsa')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      📄 NORSA
                    </button>
                  </div>
                )}

                {/* Cash Allocation Form */}
                {activeAction === 'cash_allocation' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Cash Allocation Details</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cash Allocation Date</label>
                        <input
                          type="date"
                          value={cashAllocationDate}
                          onChange={(e) => setCashAllocationDate(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-2 focus:border-green-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cash Allocation Number (YYYY-MM-NNNNN)</label>
                        <input
                          type="text"
                          value={cashAllocationNumber}
                          onChange={(e) => {
                            // Format as YYYY-MM-NNNNN
                            let value = e.target.value.replace(/\D/g, '');
                            value = value.slice(0, 11); // Max 11 digits
                            let formatted = '';
                            if (value.length > 0) {
                              if (value.length <= 4) {
                                formatted = value;
                              } else if (value.length <= 6) {
                                formatted = value.slice(0, 4) + '-' + value.slice(4);
                              } else {
                                formatted = value.slice(0, 4) + '-' + value.slice(4, 6) + '-' + value.slice(6);
                              }
                            }
                            setCashAllocationNumber(formatted);
                          }}
                          placeholder="e.g., 2025-06-04734"
                          className="w-full border border-gray-300 rounded-lg p-2 focus:border-green-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Net Amount (Final Payable Amount)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={netAmount}
                          onChange={(e) => setNetAmount(e.target.value)}
                          placeholder="Enter final amount after taxes and deductions"
                          className="w-full border border-gray-300 rounded-lg p-2 focus:border-green-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCashAllocation}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Confirm Cash Allocation
                        </button>
                        <button
                          onClick={() => setActiveAction(null)}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* RTS Form for Cash Allocation */}
                {activeAction === 'rts' && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-800 mb-3">Return to Sender Details</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">RTS Out Date</label>
                        <input
                          type="date"
                          value={rtsDate}
                          onChange={(e) => setRtsDate(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-2 focus:border-orange-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason for RTS</label>
                        <textarea
                          value={rtsReason}
                          onChange={(e) => setRtsReason(e.target.value)}
                          placeholder="Enter reason for returning to sender..."
                          className="w-full border border-gray-300 rounded-lg p-2 h-20 focus:border-orange-500 focus:outline-none resize-none"
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleRTS}
                          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                        >
                          Confirm RTS
                        </button>
                        <button
                          onClick={() => setActiveAction(null)}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* NORSA Form for Cash Allocation */}
                {activeAction === 'norsa' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">NORSA Details</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NORSA Date</label>
                        <input
                          type="date"
                          value={norsaDate}
                          onChange={(e) => setNorsaDate(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NORSA Number</label>
                        <input
                          type="text"
                          value={norsaNumber}
                          onChange={(e) => setNorsaNumber(e.target.value)}
                          placeholder="Enter NORSA number..."
                          className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleNORSA}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Confirm NORSA
                        </button>
                        <button
                          onClick={() => setActiveAction(null)}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Display RTS/NORSA Status for Review */}
            {dv.status === 'for_review' && (
              <>
                {(dv.rts_history && dv.rts_history.some(rts => !rts.origin || rts.origin === 'review')) && (
                  <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-800 mb-3">For RTS In (From Review)</h4>
                    {dv.rts_history.filter(rts => !rts.origin || rts.origin === 'review').map((rts, index) => (
                      <div key={index} className="mb-2 p-2 bg-white rounded border">
                        <p className="text-sm"><strong>Date Out:</strong> {rts.date}</p>
                        <p className="text-sm"><strong>Reason:</strong> {rts.reason}</p>
                        {rts.returned_date ? (
                          <p className="text-sm text-green-600"><strong>Returned:</strong> {rts.returned_date}</p>
                        ) : (
                          <p className="text-sm text-orange-600"><strong>Status:</strong> Pending Return</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {(dv.norsa_history && dv.norsa_history.some(norsa => !norsa.origin || norsa.origin === 'review')) && (
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">For NORSA In (From Review)</h4>
                    {dv.norsa_history.filter(norsa => !norsa.origin || norsa.origin === 'review').map((norsa, index) => (
                      <div key={index} className="mb-2 p-2 bg-white rounded border">
                        <p className="text-sm"><strong>Date:</strong> {norsa.date}</p>
                        <p className="text-sm"><strong>Number:</strong> {norsa.number}</p>
                        {norsa.returned_date ? (
                          <p className="text-sm text-green-600"><strong>Returned:</strong> {norsa.returned_date}</p>
                        ) : (
                          <p className="text-sm text-blue-600"><strong>Status:</strong> Pending Return</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* LDDAP Certification Action */}
            {dv.status === 'for_lddap' && (
              <div className="border-t pt-6">
                <div className="bg-black text-white p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">LDDAP Certification</h3>
                  <p className="text-sm mb-4">
                    Perform final verification. Confirm that all processing steps, bank account validation, 
                    and documentation are complete.
                  </p>
                  <div className="flex justify-end">
                    <button
                      onClick={async () => {
                        if (confirm('Certify this DV for LDDAP? This will complete the processing and redirect to the detailed view.')) {
                          try {
                            const response = await fetch(`/incoming-dvs/${dv.id}/lddap-certify`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                              }
                            });

                            if (response.ok) {
                              // The backend will handle the redirect
                              window.location.href = `/dv/${dv.id}/details`;
                            } else {
                              alert('Error certifying LDDAP');
                            }
                          } catch (error) {
                            console.error('Error:', error);
                            alert('Error certifying LDDAP');
                          }
                        }
                      }}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Certified
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Indexing Actions */}
            {dv.status === 'for_indexing' && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Indexing Actions</h3>
                
                {/* Indexing Form - Always shown for indexing status */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3">Process Indexing</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Indexing Date</label>
                      <input
                        type="date"
                        value={indexingDate}
                        onChange={(e) => setIndexingDate(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleIndexing}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        📋 Process Indexing
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Progressive Summary for Out to Cashiering DVs */}
            {dv.status === 'out_to_cashiering' && (
              <>
                {/* For Review Section */}
                <div className="mb-6 p-4 border-2 border-red-200 rounded-lg bg-red-50">
                  <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                    <span className="mr-2">📝</span>
                    For Review
                  </h3>
                  
                  <div className="mb-4 p-2 bg-green-100 border border-green-300 rounded">
                    <span className="text-sm font-medium text-green-800">
                      ✅ Review completed on: {formatDate(dv.review_date || dv.created_at)}
                    </span>
                  </div>

                  {/* RTS/NORSA Details Side by Side */}
                  {(dv.rts_reason || dv.norsa_number) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* RTS Details */}
                      {dv.rts_reason && (
                        <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                          <h4 className="font-semibold text-red-800 mb-2">🔄 RTS Details</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium text-red-700">RTS Date:</span>
                              <p className="text-red-600">{formatDate(dv.rts_date)}</p>
                            </div>
                            <div>
                              <span className="font-medium text-red-700">RTS Reason:</span>
                              <p className="text-red-600">{dv.rts_reason}</p>
                            </div>
                            <div>
                              <span className="font-medium text-red-700">RTS In Date:</span>
                              <p className="text-red-600">{formatDate(dv.rts_in_date)}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* NORSA Details */}
                      {dv.norsa_number && (
                        <div className="p-4 bg-purple-100 border border-purple-300 rounded-lg">
                          <h4 className="font-semibold text-purple-800 mb-2">📝 NORSA Details</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium text-purple-700">NORSA Number:</span>
                              <p className="text-purple-600">{dv.norsa_number}</p>
                            </div>
                            <div>
                              <span className="font-medium text-purple-700">NORSA Date:</span>
                              <p className="text-purple-600">{formatDate(dv.norsa_date)}</p>
                            </div>
                            <div>
                              <span className="font-medium text-purple-700">NORSA In Date:</span>
                              <p className="text-purple-600">{formatDate(dv.norsa_in_date)}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* For Cash Allocation Section */}
                <div className="mb-6 p-4 border-2 border-orange-200 rounded-lg bg-orange-50">
                  <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
                    <span className="mr-2">💰</span>
                    For Cash Allocation
                  </h3>
                  
                  <div className="mb-4 p-2 bg-green-100 border border-green-300 rounded">
                    <span className="text-sm font-medium text-green-800">
                      ✅ Cash allocation completed on: {formatDate(dv.cash_allocation_date)}
                    </span>
                  </div>

                  {/* Cash Allocation Details */}
                  {(dv.cash_allocation_date || dv.cash_allocation_number || dv.net_amount) && (
                    <div className="p-4 bg-orange-100 border border-orange-300 rounded-lg">
                      <h4 className="font-semibold text-orange-800 mb-3">Cash Allocation Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-orange-700">Allocation Date:</span>
                          <p className="text-orange-600">{formatDate(dv.cash_allocation_date)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-orange-700">Allocation Number:</span>
                          <p className="text-orange-600">{dv.cash_allocation_number || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-orange-700">Net Amount:</span>
                          <p className="text-orange-600 font-semibold">{formatAmount(dv.net_amount)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* For Box C Certification Section */}
                <div className="mb-6 p-4 border-2 border-yellow-200 rounded-lg bg-yellow-50">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
                    <span className="mr-2">📋</span>
                    For Box C Certification
                  </h3>
                  
                  <div className="mb-4 p-2 bg-green-100 border border-green-300 rounded">
                    <span className="text-sm font-medium text-green-800">
                      ✅ Box C certification completed on: {formatDate(dv.box_c_date)}
                    </span>
                  </div>

                  {/* Box C RTS/NORSA Details Side by Side */}
                  {(dv.box_c_rts_reason || dv.box_c_norsa_number) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Box C RTS Details */}
                      {dv.box_c_rts_reason && (
                        <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                          <h4 className="font-semibold text-red-800 mb-2">🔄 Box C RTS Details</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium text-red-700">RTS Date:</span>
                              <p className="text-red-600">{formatDate(dv.box_c_rts_date)}</p>
                            </div>
                            <div>
                              <span className="font-medium text-red-700">RTS Reason:</span>
                              <p className="text-red-600">{dv.box_c_rts_reason}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Box C NORSA Details */}
                      {dv.box_c_norsa_number && (
                        <div className="p-4 bg-purple-100 border border-purple-300 rounded-lg">
                          <h4 className="font-semibold text-purple-800 mb-2">📝 Box C NORSA Details</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium text-purple-700">NORSA Number:</span>
                              <p className="text-purple-600">{dv.box_c_norsa_number}</p>
                            </div>
                            <div>
                              <span className="font-medium text-purple-700">NORSA Date:</span>
                              <p className="text-purple-600">{formatDate(dv.box_c_norsa_date)}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* For Approval Section */}
                <div className="mb-6 p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="mr-2">✅</span>
                    For Approval
                  </h3>
                  
                  <div className="mb-4 p-2 bg-green-100 border border-green-300 rounded">
                    <span className="text-sm font-medium text-green-800">
                      ✅ Approval completed on: {formatDate(dv.approval_in_date)}
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
                      ✅ Indexing completed on: {formatDate(dv.indexing_date)}
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
        
        {/* Download Section - Only for processed DVs */}
        {dv.status === 'processed' && (
          <div className="bg-gray-100 px-6 py-4 border-t">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Download Options</h3>
              <div className="flex items-center space-x-3">
                {/* Full download options for processed DVs */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.open(`/incoming-dvs/${dv.id}/download?format=pdf`, '_blank')}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={() => window.open(`/incoming-dvs/${dv.id}/download?format=excel`, '_blank')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2v2h2V6H6zm4 0v2h2V6h-2zm-4 4v2h2v-2H6zm4 0v2h2v-2h-2z" clipRule="evenodd" />
                    </svg>
                    <span>Download Excel</span>
                  </button>
                  <button
                    onClick={() => window.open(`/incoming-dvs/${dv.id}/download?format=docx`, '_blank')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                    </svg>
                    <span>Download DOCX</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
