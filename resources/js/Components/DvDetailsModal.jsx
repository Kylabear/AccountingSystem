import { useState, useEffect } from 'react';

export default function DvDetailsModal({ dv, isOpen, onClose, onStatusUpdate }) {
  const [activeAction, setActiveAction] = useState(null);
  const [rtsReason, setRtsReason] = useState('');
  const [rtsDate, setRtsDate] = useState('');
  const [norsaNumber, setNorsaNumber] = useState('');
  const [norsaDate, setNorsaDate] = useState('');

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Auto-set today's date when opening RTS or NORSA actions
  useEffect(() => {
    if (activeAction === 'rts' || activeAction === 'box_c_rts') {
      setRtsDate(getTodayDate());
    } else if (activeAction === 'norsa' || activeAction === 'box_c_norsa') {
      setNorsaDate(getTodayDate());
    }
  }, [activeAction]);

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
    if (!norsaNumber.trim() || !norsaDate) {
      alert('Please fill in both NORSA number and date.');
      return;
    }
    
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

  const handleCertify = () => {
    if (confirm('Certify this DV?')) {
      fetch(`/incoming-dvs/${dv.id}/box-c`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
        },
        body: JSON.stringify({ action: 'certify' })
      }).then(() => {
        window.location.reload();
      });
      onClose();
    }
  };

  const handleBoxCRTS = () => {
    if (!rtsReason.trim() || !rtsDate) {
      alert('Please fill in both RTS date and reason.');
      return;
    }
    
    if (confirm('Return this DV to sender from Box C?')) {
      fetch(`/incoming-dvs/${dv.id}/box-c`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
        },
        body: JSON.stringify({
          action: 'rts',
          rts_out_date: rtsDate,
          rts_reason: rtsReason
        })
      }).then(() => {
        window.location.reload();
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
      fetch(`/incoming-dvs/${dv.id}/box-c`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
        },
        body: JSON.stringify({
          action: 'norsa',
          norsa_date: norsaDate,
          norsa_number: norsaNumber
        })
      }).then(() => {
        window.location.reload();
      });
      onClose();
      setActiveAction(null);
      setNorsaNumber('');
      setNorsaDate('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 modal-backdrop overflow-y-auto" style={{ zIndex: 50000, paddingTop: '100px', paddingBottom: '20px' }}>
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-green-700 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-lg font-semibold">DV Details</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

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
                  <p className="text-lg font-semibold">{dv.payee}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">DV Number</label>
                  <p className="text-lg font-semibold">{dv.dv_number}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Particulars</label>
                  <p className="text-sm bg-white p-3 rounded border">{dv.particulars}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Amount as stated by DV</label>
                  <p className="text-lg font-semibold text-green-600">
                    PHP {parseFloat(dv.amount).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Transaction Type</label>
                  <p className="text-sm">{dv.transaction_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Implementing Unit</label>
                  <p className="text-sm">{dv.implementing_unit}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Account Number</label>
                  <p className="text-sm">{dv.account_number || 'N/A'}</p>
                </div>
              </div>
              
              {/* ORS Details */}
              {dv.ors_entries && dv.ors_entries.length > 0 && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700">ORS Details</label>
                  <div className="space-y-2 mt-2">
                    {dv.ors_entries.map((ors, index) => (
                      <div key={index} className="bg-white p-3 rounded border text-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div>
                            <span className="font-medium">ORS No.:</span> {ors.ors_number || 'various'}
                          </div>
                          <div>
                            <span className="font-medium">Fund Source:</span> {ors.fund_source || 'various'}
                          </div>
                          <div>
                            <span className="font-medium">UACS/Object of Expenditure:</span> {ors.uacs || 'various'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RTS Information */}
            {(dv.rts_history && dv.rts_history.length > 0) && (
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

            {/* Cash Allocation Information */}
            {(dv.cash_allocation_date || dv.cash_allocation_number || dv.net_amount) && (
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

            {/* Box C Certification Information */}
            {(dv.status === 'for_approval' || dv.status === 'for_indexing' || dv.status === 'processed' || 
              (dv.transaction_history && dv.transaction_history.some(t => t.action.includes('Box C')))) && (
              <div className="mb-6 p-4 border-2 border-yellow-200 rounded-lg bg-yellow-50">
                <h3 className="text-lg font-semibold text-yellow-800 mb-4">Box C Certification</h3>
                <div className="bg-white p-4 rounded border">
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Date of Certification:</span>
                    <p>
                      {dv.transaction_history?.find(t => t.action.includes('Box C') || t.action.includes('Certified'))?.date || 
                       (dv.status === 'for_approval' ? new Date().toLocaleDateString() : 'Not certified yet')}
                    </p>
                  </div>
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
            {dv.status === 'recents' && (
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
                    <button
                      onClick={() => setActiveAction('certify')}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      ✔️ Certify
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

                {/* Certify Action */}
                {activeAction === 'certify' && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-3">Certify DV</h4>
                    <p className="text-sm text-gray-700 mb-4">
                      Certifying this DV means you are approving it for the next process. Please confirm your action.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCertify}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Confirm Certify
                      </button>
                      <button
                        onClick={() => setActiveAction(null)}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
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

                {/* Display RTS/NORSA Status for Box C */}
                {(dv.rts_history && dv.rts_history.some(rts => rts.origin === 'box_c')) && (
                  <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-800 mb-3">For RTS In (From Box C)</h4>
                    {dv.rts_history.filter(rts => rts.origin === 'box_c').map((rts, index) => (
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

                {(dv.norsa_history && dv.norsa_history.some(norsa => norsa.origin === 'box_c')) && (
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">For NORSA In (From Box C)</h4>
                    {dv.norsa_history.filter(norsa => norsa.origin === 'box_c').map((norsa, index) => (
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

            {/* Out to Cashiering Information */}
            {dv.status === 'out_to_cashiering' && (
              <div className="border-t pt-6">
                <div className="bg-purple-100 border border-purple-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-purple-800 mb-4">Out to Cashiering</h3>
                  <p className="text-sm text-purple-700 mb-4">
                    This DV is currently out for payroll register processing. Use the "In" button when it returns.
                  </p>
                  {dv.pr_out_date && (
                    <p className="text-sm text-purple-600">
                      Sent out: {new Date(dv.pr_out_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
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
                    .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date, newest first
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">No transaction history available</p>
                  <p className="text-xs text-gray-400">History will be automatically generated for this DV on the next page load.</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Download Section - Available for all DVs, but more options for processed */}
        <div className="bg-gray-100 px-6 py-4 border-t">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Download Options</h3>
            <div className="flex items-center space-x-3">
              {dv.status === 'processed' ? (
                // Full download options for processed DVs
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
                    onClick={() => window.open(`/incoming-dvs/${dv.id}/download?format=json`, '_blank')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                    </svg>
                    <span>Download JSON</span>
                  </button>
                </div>
              ) : (
                // Basic download for non-processed DVs
                <button
                  onClick={() => window.open(`/incoming-dvs/${dv.id}/download?format=pdf`, '_blank')}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Download Copy</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
