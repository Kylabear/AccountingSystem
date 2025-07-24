import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import ComboBox from './ComboBox';

const typeOptions = [
  'Professional/General/Job Order Services',
  'Communication (Telephone/Internet)',
  'Electricity/Water',
  'Supplies (office and other supplies)',
  'Seeds/fertilizer/medicine/drugs',
  'Equipment/Machinery/Motor Vehicles/Furniture and Fixtures',
  'Infrastructure - mobilization, partial and final billings',
  'Biological Assets',
  'Training- Meals, Snacks and Accommodation',
  'Remittances/Loans',
  'Fund Transfers',
  'Retention',
  'Salaries/Wages/Allowances/Benefit',
  'TEV inc. toll fees',
  'Fuel',
];

const unitOptions = [
  'RAED', 'SAAD', 'REGULATORY', 'RESEARCH', 'ILD', 'AFD', 'RICE',
  'CORN', 'LIVESTOCK', 'OAP', 'HVCDP', '4K', 'F2C2', 'AMAD', 'PMED', 'BP2',
];

const fundSourceOptions = [
  'GASS-GMS', 'GASS-APB', 'STO ICTMS', 'STO DOPP-PMED', 'STO DOPP-CRA', 'STO DOPP-F2C2', 'STO ILD', 'STO FPMA',
  'STO FPMA-RICE', 'STO FPMA-LVSTK', 'STO FPMA-CORN', 'STO FPMA-HVCDP', 'STO FPMA-OAP', 'STO FPMA-UPAP',
  'STO AFESA', 'STO QRF', 'PSS RICE', 'PSS LVSTK', 'PSS CORN', 'PSS HVCDP', 'PSS OAP', 'OTHER PSS', 'OTHER PSS-RD',
  'OTHER PSS-RICE', 'OTHER PSS-CORN', 'OTHER PSS-LVSTK', 'OTHER PSS-HVCDP', 'PSS UPAP', 'MDS', 'ESETS RICE',
  'ESETS LVSTK', 'ESETS CORN', 'ESETS HVCDP', 'ESETS OAP', 'OTHER ESETS', 'ESETS HALAL', 'ESETS UPAP', 'RD RICE',
  'RD LVSTK', 'RD CORN', 'OTHER RD', 'PAEF RICE', 'PAEF LVSTK', 'PAEF CORN', 'PAEF HVCDP', 'PAEF OAP', 'PAEF UPAP',
  'INS RICE', 'INS CORN', 'INS HVCDP', 'INS OAP', 'FMR', 'QCI', 'RL', 'SAAD', 'SAAD PHASE II', 'CRA', 'BP2',
  'RSBSA', '4K PROJECT', 'YFCF', 'RCEF RFFA', 'KAKP', 'SPF QRF-RRP', 'SPF QRF-RCP', 'SPF QRF-RLP', 'SPF QRF-RHVCDP',
  'SPF QRF-ROAP', 'SPF QRF-DRRMO', 'PGF-GASS', 'MPBF-GASS', 'FUEL ASSISTANCE', 'YFC PROGRAM', 'RCEP',
  'FFED PROGRAM (SAGIP SAKA ACT)', 'PRDP SCALE-UP', 'DAP', 'SIRP', 'PRDP SCALE-UP GOP', 'NSHP (Nat\'l Soil HP)',
  'CSEP (Cold Storage EP)', 'IFFE (Farmers & Fisherfolk Enterprise)', 'PIS',
];

export default function EditDvModal({ dv, isOpen, onClose, onUpdate }) {
  const [orsList, setOrsList] = useState([]);
  const [errors, setErrors] = useState({});

  const { data, setData, put, processing } = useForm({
    transaction_type: '',
    implementing_unit: '',
    dv_number: '',
    payee: '',
    account_number: '',
    amount: '',
    particulars: '',
    ors_entries: [],
  });

  useEffect(() => {
    if (dv && isOpen) {
      setData({
        transaction_type: dv.transaction_type || '',
        implementing_unit: dv.implementing_unit || '',
        dv_number: dv.dv_number || '',
        payee: dv.payee || '',
        account_number: dv.account_number || '',
        amount: dv.amount || '',
        particulars: dv.particulars || '',
        ors_entries: dv.ors_entries || [],
      });
      setOrsList(dv.ors_entries || [{ ors_number: '', fund_source: '', uacs: '' }]);
    }
  }, [dv, isOpen]);

  if (!isOpen || !dv) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(name, value);
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleOrsChange = (index, field, value) => {
    const updated = [...orsList];
    updated[index][field] = value;
    setOrsList(updated);
    setData('ors_entries', updated);
  };

  const addMoreOrs = () => {
    setOrsList([...orsList, { ors_number: '', fund_source: '', uacs: '' }]);
  };

  const removeOrsEntry = (index) => {
    if (orsList.length > 1) {
      const updated = orsList.filter((_, i) => i !== index);
      setOrsList(updated);
      setData('ors_entries', updated);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!data.transaction_type.trim()) {
      newErrors.transaction_type = 'Transaction type is required';
    }
    if (!data.dv_number.trim()) {
      newErrors.dv_number = 'DV number is required';
    }
    if (!data.payee.trim()) {
      newErrors.payee = 'Payee is required';
    }
    if (!data.amount || data.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!data.particulars.trim()) {
      newErrors.particulars = 'Particulars is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    put(`/incoming-dvs/${dv.id}`, {
      onSuccess: () => {
        onUpdate();
        onClose();
        window.location.reload();
      },
      onError: (errors) => {
        setErrors(errors);
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 modal-backdrop overflow-y-auto" style={{ zIndex: 50000, paddingTop: '80px', paddingBottom: '20px' }}>
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-bounce-in m-4">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3 text-3xl">✏️</span>
                Edit Disbursement Voucher
              </h2>
              <p className="text-gray-600 mt-1">DV Number: {dv.dv_number}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 transform hover:scale-110"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center">
                <span className="mr-2">📋</span>
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Transaction Type *
                  </label>
                  <ComboBox
                    name="transaction_type"
                    value={data.transaction_type}
                    onChange={(value) => setData('transaction_type', value)}
                    options={typeOptions}
                    placeholder="Select transaction type"
                    className={errors.transaction_type ? 'border-red-500' : ''}
                  />
                  {errors.transaction_type && (
                    <p className="text-red-500 text-xs mt-1">{errors.transaction_type}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Implementing Unit
                  </label>
                  <ComboBox
                    name="implementing_unit"
                    value={data.implementing_unit}
                    onChange={(value) => setData('implementing_unit', value)}
                    options={unitOptions}
                    placeholder="Select implementing unit"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    DV Number *
                  </label>
                  <input
                    type="text"
                    name="dv_number"
                    value={data.dv_number}
                    onChange={handleChange}
                    className={`w-full border-2 rounded-lg p-3 focus:outline-none transition-all duration-300 ${
                      errors.dv_number ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                    }`}
                  />
                  {errors.dv_number && (
                    <p className="text-red-500 text-xs mt-1">{errors.dv_number}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Payee *
                  </label>
                  <input
                    type="text"
                    name="payee"
                    value={data.payee}
                    onChange={handleChange}
                    className={`w-full border-2 rounded-lg p-3 focus:outline-none transition-all duration-300 ${
                      errors.payee ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                    }`}
                  />
                  {errors.payee && (
                    <p className="text-red-500 text-xs mt-1">{errors.payee}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    name="account_number"
                    value={data.account_number}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-500 focus:outline-none transition-all duration-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="col-span-1">
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Amount *
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={data.amount}
                    onChange={handleChange}
                    step="0.01"
                    className={`w-full border-2 rounded-lg p-3 focus:outline-none transition-all duration-300 ${
                      errors.amount ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                    }`}
                  />
                  {errors.amount && (
                    <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
                  )}
                </div>

                <div className="col-span-4">
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Particulars *
                  </label>
                  <textarea
                    name="particulars"
                    value={data.particulars}
                    onChange={handleChange}
                    rows="3"
                    className={`w-full border-2 rounded-lg p-3 focus:outline-none transition-all duration-300 ${
                      errors.particulars ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                    }`}
                  />
                  {errors.particulars && (
                    <p className="text-red-500 text-xs mt-1">{errors.particulars}</p>
                  )}
                </div>
              </div>
            </div>

            {/* ORS Information */}
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-lg font-semibold text-blue-700 mb-4 flex items-center">
                <span className="mr-2">📊</span>
                ORS Information
              </h3>
              
              {orsList.map((entry, index) => (
                <div key={index} className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-blue-800">ORS Entry {index + 1}</h4>
                    {orsList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOrsEntry(index)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        ORS Number
                      </label>
                      <input
                        type="text"
                        value={entry.ors_number}
                        onChange={(e) => handleOrsChange(index, 'ors_number', e.target.value)}
                        placeholder="NN-NNNNNNNN-YYYY-MM-NNNNNN"
                        className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:outline-none transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Fund Source
                      </label>
                      <ComboBox
                        value={entry.fund_source}
                        onChange={(value) => handleOrsChange(index, 'fund_source', value)}
                        options={fundSourceOptions}
                        placeholder="Select fund source"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        UACS
                      </label>
                      <input
                        type="text"
                        value={entry.uacs}
                        onChange={(e) => handleOrsChange(index, 'uacs', e.target.value)}
                        placeholder="NNNNNNNN-NN"
                        className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:outline-none transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addMoreOrs}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
              >
                + Add More ORS Entry
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all duration-300 transform hover:scale-105"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all duration-300 disabled:opacity-50 transform hover:scale-105 disabled:transform-none flex items-center"
              >
                {processing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  <>
                    <span className="mr-2">💾</span>
                    Update DV
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
