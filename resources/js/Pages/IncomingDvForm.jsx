import React, { useState, useEffect } from 'react';
import { useForm, Link } from '@inertiajs/react';
import ComboBox from '../Components/ComboBox';
import AnimatedBackground from '../Components/AnimatedBackground';

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

const uacsOptions = [
  '50101000-00', '50101010-01', '50101020-00', '50102000-00', '50102010-01',
  '50102020-00', '50102030-01', '50102040-01', '50102040-02', '50102050-02',
  '50102050-03', '50102050-04', '50102060-01', '50102060-03', '50102060-04',
  '50102060-05', '50102070-01', '50102070-03', '50102070-04', '50102070-05',
  '50102080-01', '50102090-01', '50102100-01', '50102100-03', '50102100-04',
  '50102100-05', '50102110-01', '50102110-02', '50102110-04', '50102110-05',
  '50102110-06', '50102120-01', '50102120-03', '50102120-04', '50102120-05',
  '50102130-01', '50102140-01', '50102150-01', '50102160-01', '50102990-00',
  '50102990-01', '50102990-11', '50102990-12', '50102990-14', '50102990-38',
  '50103000-00', '50103010-00', '50103020-01', '50103030-01', '50103040-01',
  '50104000-00', '50104010-01', '50104020-01', '50104030-01', '50104990-01',
  '50104990-03', '50104990-06', '50104990-07', '50104990-09', '50104990-10',
  '50104990-11', '50104990-12', '50104990-15', '50104990-99', '50201000-00',
  '50201010-00', '50201020-00', '50202000-00', '50202010-01', '50202010-02',
  '50202020-00', '50203000-00', '50203010-01', '50203010-02', '50203020-00',
  '50203030-00', '50203040-00', '50203050-00', '50203060-00', '50203070-00',
  '50203080-00', '50203090-00', '50203100-00', '50203110-01', '50203130-00',
  '50203210-00', '50203210-01', '50203210-02', '50203210-03', '50203210-04',
  '50203210-05', '50203210-06', '50203210-07', '50203210-08', '50203210-09',
  '50203210-10', '50203210-11', '50203210-12', '50203210-13', '50203210-99',
  '50203220-00', '50203220-01', '50203220-02', '50203990-00', '50204000-00',
  '50204010-00', '50204020-00', '50204030-00', '50205000-00', '50205010-00',
  '50205020-01', '50205020-02', '50205030-00', '50205040-00', '50206000-00',
  '50206010-01', '50206010-02', '50206020-00', '50207000-00', '50207010-00',
  '50207020-01', '50207020-02', '50208000-00', '50208010-00', '50208020-00',
  '50209000-00', '50209010-01', '50209010-02', '50210000-00', '50210010-00',
  '50210020-00', '50210030-00', '50211000-00', '50211010-00', '50211020-00',
  '50211030-01', '50211030-02', '50211990-00', '50212000-00', '50212010-00',
  '50212020-00', '50212030-00', '50212990-01', '50212990-99', '50213000-00',
  '50213010-00', '50213020-00', '50213020-01', '50213020-02', '50213020-99',
  '50213030-00', '50213030-01', '50213030-02', '50213030-03', '50213030-04',
  '50213030-05', '50213030-06', '50213030-07', '50213030-99', '50213040-00',
  '50213040-01', '50213040-04', '50213040-05', '50213040-06', '50213040-99',
  '50213050-00', '50213050-01', '50213050-02', '50213050-03', '50213050-04',
  '50213050-05', '50213050-07', '50213050-08', '50213050-09', '50213050-11',
  '50213050-12', '50213050-13', '50213050-14', '50213050-99', '50213060-00',
  '50213060-01', '50213060-04', '50213060-99', '50213070-00', '50213080-00',
  '50213080-01', '50213080-02', '50213080-03', '50213080-99', '50213090-00',
  '50213090-01', '50213090-02', '50213090-99', '50213210-00', '50213210-01',
  '50213210-02', '50213210-03', '50213210-04', '50213210-05', '50213210-07',
  '50213210-08', '50213210-09', '50213210-10', '50213210-11', '50213210-12',
  '50213210-13', '50213210-99', '50213220-00', '50213220-01', '50213220-02',
  '50213980-00', '50213990-00', '50213990-01', '50213990-99', '50214000-00',
  '50214010-00', '50214020-00', '50214030-00', '50214040-00', '50214040-01',
  '50214040-02', '50214040-03', '50214040-04', '50214040-05', '50214040-06',
  '50214040-07', '50214040-08', '50214040-11', '50214040-99', '50214050-00',
  '50214990-00', '50215000-00', '50215010-01', '50215010-02', '50215020-00',
  '50215030-00', '50216000-00', '50216010-00', '50299000-00', '50299010-00',
  '50299020-00', '50299030-00', '50299040-00', '50299050-00', '50299050-01',
  '50299050-02', '50299050-03', '50299050-04', '50299050-05', '50299050-06',
  '50299050-07', '50299050-08', '50299060-00', '50299070-00', '50299070-01',
  '50299070-02', '50299070-03', '50299070-04', '50299070-99', '50299080-00',
  '50299090-00', '50299990-00', '50299990-01', '50299990-99', '50299210-00',
  '50299220-00', '50601000-00', '50601010-00', '50601010-01', '50601010-02',
  '50601010-03', '50601010-04', '50601010-05', '50601010-06', '50601010-07',
  '50601010-08', '50601010-99', '50601020-00', '50602000-00', '50602010-00',
  '50602020-00', '50602990-00', '50603000-00', '50603010-01', '50603010-02',
  '50604000-00', '50604010-00', '50604010-01', '50604020-00', '50604020-01',
  '50604020-02', '50604020-99', '50604030-00', '50604030-01', '50604030-02',
  '50604030-03', '50604030-04', '50604030-05', '50604030-06', '50604030-07',
  '50604030-99', '50604040-00', '50604040-01', '50604040-04', '50604040-05',
  '50604040-06', '50604040-99', '50604050-00', '50604050-01', '50604050-02',
  '50604050-03', '50604050-04', '50604050-05', '50604050-07', '50604050-08',
  '50604050-09', '50604050-11', '50604050-12', '50604050-13', '50604050-14',
  '50604050-15', '50604050-99', '50604060-00', '50604060-01', '50604060-04',
  '50604060-99', '50604070-00', '50604070-01', '50604070-02', '50604090-00',
  '50604090-01', '50604090-99', '50605000-00', '50605010-01', '50605010-02',
  '50605010-03', '50605010-04', '50605010-99', '50606000-00', '50606010-00',
  '50606020-00', '50606990-00',
];

export default function IncomingDvForm() {
  const [orsList, setOrsList] = useState([{ ors_number: '', fund_source: '', uacs: '' }]);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const { data, setData, post, processing } = useForm({
    transaction_type: '',
    implementing_unit: '',
    dv_number: '',
    payee: '',
    account_number: '',
    amount: '',
    particulars: '',
    ors_entries: orsList,
  });

  // Initialize DV number with current year and month
  useEffect(() => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    setData('dv_number', `${year}-${month}-`);
  }, []);

  // Validation functions
  const validateDvNumber = (value) => {
    const dvPattern = /^\d{4}-\d{2}-\d{5}$/;
    if (!dvPattern.test(value)) {
      return 'DV Number must have a 5-digit serial number';
    }
    return '';
  };

  const validateUacs = (value) => {
    const uacsPattern = /^\d{8}-\d{2}$/;
    if (value && !uacsPattern.test(value)) {
      return 'UACS must be in format: NNNNNNNN-NN (e.g., 50202010-02)';
    }
    return '';
  };

  const validateOrs = (value) => {
    const orsPattern = /^\d{2}-\d{8}-\d{4}-\d{2}-\d{6}$/;
    if (value && !orsPattern.test(value)) {
      return 'ORS Number must be in format: NN-NNNNNNNN-YYYY-MM-NNNNNN (e.g., 02-01101101-2024-04-002261)';
    }
    return '';
  };

  const validateAmount = (value) => {
    if (value <= 0) {
      return 'Amount must be greater than 0';
    }
    return '';
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!data.transaction_type.trim()) {
      newErrors.transaction_type = 'Transaction type is required';
    }
    
    if (!data.dv_number.trim()) {
      newErrors.dv_number = 'Disbursement number is required';
    } else {
      const dvError = validateDvNumber(data.dv_number);
      if (dvError) newErrors.dv_number = dvError;
    }
    
    if (!data.payee.trim()) {
      newErrors.payee = 'Payee is required';
    }
    
    if (!data.amount || data.amount <= 0) {
      newErrors.amount = 'Amount is required and must be greater than 0';
    }
    
    if (!data.particulars.trim()) {
      newErrors.particulars = 'Particulars is required';
    }

    // Validate ORS entries only if they have values
    orsList.forEach((entry, index) => {
      if (entry.ors_number) {
        const orsError = validateOrs(entry.ors_number);
        if (orsError) newErrors[`ors_${index}`] = orsError;
      }
      if (entry.uacs) {
        const uacsError = validateUacs(entry.uacs);
        if (uacsError) newErrors[`uacs_${index}`] = uacsError;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDvNumberFocus = (e) => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const yearMonthPrefix = `${year}-${month}-`;
    
    setTimeout(() => {
      const cursorPosition = yearMonthPrefix.length;
      e.target.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    let formattedValue = value;
    
    if (name === 'dv_number') {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const yearMonthPrefix = `${year}-${month}-`;
      
      if (value.startsWith(yearMonthPrefix)) {
        let serialNumber = value.substring(yearMonthPrefix.length).replace(/\D/g, '');
        serialNumber = serialNumber.slice(0, 5);
        formattedValue = yearMonthPrefix + serialNumber;
      } else {
        formattedValue = yearMonthPrefix;
      }
    }
    
    if (name === 'amount') {
      formattedValue = value.replace(/[^\d.]/g, '');
      const parts = formattedValue.split('.');
      if (parts.length > 2) {
        formattedValue = parts[0] + '.' + parts.slice(1).join('');
      }
    }
    
    setData(name, formattedValue);
  };

  const handleOrsChange = (index, field, value) => {
    if (errors[`${field}_${index}`]) {
      setErrors(prev => ({ ...prev, [`${field}_${index}`]: '' }));
    }
    
    let formattedValue = value;
    
    if (field === 'ors_number') {
      let numbers = value.replace(/\D/g, '');
      numbers = numbers.slice(0, 22);
      
      if (numbers.length > 0) {
        if (numbers.length <= 2) {
          formattedValue = numbers;
        } else if (numbers.length <= 10) {
          formattedValue = numbers.slice(0, 2) + '-' + numbers.slice(2);
        } else if (numbers.length <= 14) {
          formattedValue = numbers.slice(0, 2) + '-' + numbers.slice(2, 10) + '-' + numbers.slice(10);
        } else if (numbers.length <= 16) {
          formattedValue = numbers.slice(0, 2) + '-' + numbers.slice(2, 10) + '-' + numbers.slice(10, 14) + '-' + numbers.slice(14);
        } else {
          formattedValue = numbers.slice(0, 2) + '-' + numbers.slice(2, 10) + '-' + numbers.slice(10, 14) + '-' + numbers.slice(14, 16) + '-' + numbers.slice(16);
        }
      } else {
        formattedValue = '';
      }
    }
    
    if (field === 'uacs') {
      let numbers = value.replace(/\D/g, '');
      numbers = numbers.slice(0, 10);
      
      if (numbers.length > 0) {
        if (numbers.length <= 8) {
          formattedValue = numbers;
        } else {
          formattedValue = numbers.slice(0, 8) + '-' + numbers.slice(8);
        }
      } else {
        formattedValue = '';
      }
    }
    
    const updated = [...orsList];
    updated[index][field] = formattedValue;
    setOrsList(updated);
    setData('ors_entries', updated);
  };

  const addMore = () => {
    setOrsList([...orsList, { ors_number: '', fund_source: '', uacs: '' }]);
  };

  const submit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    post('/incoming-dvs', {
      onSuccess: () => {
        setShowSuccess(true);
        setTimeout(() => {
          window.location.href = '/incoming-dvs';
        }, 2000);
      },
      onError: (errors) => {
        setErrors(errors);
      }
    });
  };

  const SuccessMessage = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <div className="text-green-600 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Success!</h3>
        <p className="text-gray-600">Disbursement Voucher has been successfully submitted.</p>
      </div>
    </div>
  );

  const LoadingSpinner = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Submitting your request...</p>
      </div>
    </div>
  );

  return (
    <>
      {processing && <LoadingSpinner />}
      {showSuccess && <SuccessMessage />}
      
      {/* Fixed Header with aurora styling - Completely locked outside of scroll area */}
      <div className="bg-green-700/90 backdrop-blur-sm text-white p-4 shadow-xl header-fixed relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center group">
            <img 
              src="/DALOGO.png" 
              alt="DA Logo" 
              className="w-16 h-16 mr-4 object-contain group-hover:scale-110 transition-transform duration-300"
            />
            <a 
              href="/incoming-dvs" 
              className="text-xl font-medium text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300 cursor-pointer hover:underline" 
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
            >
              Accounting Monitoring and Tracking System
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <a 
              href="/incoming-dvs"
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800 transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:-translate-y-1 group flex items-center"
            >
              <span className="mr-2 transition-transform duration-300 group-hover:scale-125">←</span>
              <span className="group-hover:scale-105 transition-transform duration-200">Back to DVs</span>
            </a>
            <a href="/profile" className="cursor-pointer hover:scale-105 transition-transform duration-300">
              <img 
                src="/default-profile.png" 
                alt="Profile" 
                className="w-10 h-10 rounded-full object-cover border-2 border-yellow-400 hover:border-yellow-300 transition-colors duration-300"
              />
            </a>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area with Animated Background */}
      <div className="min-h-screen relative bg-gradient-to-br from-gray-900 via-gray-800 to-black content-with-header">
        {/* Animated Background */}
        <AnimatedBackground />

        {/* Background pattern overlay */}
        <div className="absolute inset-0 opacity-5 bg-repeat pointer-events-none z-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        {/* Main content area with proper z-index */}
        <div className="relative max-w-7xl mx-auto p-8 z-40">
          {/* Page title with animation */}
          <div className="text-center mb-8 animate-fade-in">
            <h2 className="text-3xl font-bold text-green-800 mb-2 hover:text-green-700 transition-colors duration-300 cursor-default">
              New Disbursement Voucher
            </h2>
          </div>

          {/* Form container with enhanced styling */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1">
            <div className="p-8">
              <form onSubmit={submit} className="space-y-8">
                {/* ALL FORM FIELDS IN ONE UNIFIED SECTION */}
                <div className="space-y-6">
                  {/* First row: Type of Transaction, Implementing Unit, Disbursement Voucher No. */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="group">
                      <label className="text-sm font-medium text-gray-700 block mb-2 group-hover:text-green-600 transition-colors duration-300">
                        Type of Transaction *
                      </label>
                      <ComboBox
                        name="transaction_type"
                        value={data.transaction_type}
                        onChange={(value) => setData('transaction_type', value)}
                        options={typeOptions}
                        placeholder="Select or type transaction type"
                        required
                        className={`transition-all duration-300 hover:shadow-md ${
                          errors.transaction_type ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'
                        }`}
                      />
                      {errors.transaction_type && (
                        <p className="text-red-500 text-xs mt-1 animate-shake">{errors.transaction_type}</p>
                      )}
                    </div>

                    <div className="group">
                      <label className="text-sm font-medium text-gray-700 block mb-2 group-hover:text-green-600 transition-colors duration-300">
                        Implementing Unit
                      </label>
                      <ComboBox
                        name="implementing_unit"
                        value={data.implementing_unit}
                        onChange={(value) => setData('implementing_unit', value)}
                        options={unitOptions}
                        placeholder="Select or type implementing unit"
                        className="transition-all duration-300 hover:shadow-md border-gray-300 focus:border-green-500 hover:border-green-400"
                      />
                    </div>

                    <div className="group">
                      <label className="text-sm font-medium text-gray-700 block mb-2 group-hover:text-green-600 transition-colors duration-300">
                        Disbursement Voucher No. *
                      </label>
                      <input
                        type="text"
                        name="dv_number"
                        value={data.dv_number}
                        onChange={handleChange}
                        onFocus={handleDvNumberFocus}
                        required
                        placeholder="Enter 5-digit serial number (e.g., 04734)"
                        className={`w-full border-2 rounded-lg p-3 focus:outline-none transition-all duration-300 hover:shadow-md ${
                          errors.dv_number ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500 hover:border-green-400'
                        }`}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Format: {new Date().getFullYear()}-{String(new Date().getMonth() + 1).padStart(2, '0')}-NNNNN
                      </p>
                      {errors.dv_number && (
                        <p className="text-red-500 text-xs mt-1 animate-shake">{errors.dv_number}</p>
                      )}
                    </div>
                  </div>

                  {/* Second row: Payee, Account Number */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="text-sm font-medium text-gray-700 block mb-2 group-hover:text-green-600 transition-colors duration-300">
                        Payee *
                      </label>
                      <input
                        type="text"
                        name="payee"
                        value={data.payee}
                        onChange={handleChange}
                        required
                        placeholder="Enter payee name"
                        className={`w-full border-2 rounded-lg p-3 focus:outline-none transition-all duration-300 hover:shadow-md ${
                          errors.payee ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500 hover:border-green-400'
                        }`}
                      />
                      {errors.payee && (
                        <p className="text-red-500 text-xs mt-1 animate-shake">{errors.payee}</p>
                      )}
                    </div>

                    <div className="group">
                      <label className="text-sm font-medium text-gray-700 block mb-2 group-hover:text-green-600 transition-colors duration-300">
                        Account Number
                      </label>
                      <input
                        type="text"
                        name="account_number"
                        value={data.account_number}
                        onChange={handleChange}
                        placeholder="Enter account number"
                        className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-500 focus:outline-none transition-all duration-300 hover:shadow-md hover:border-green-400"
                      />
                    </div>
                  </div>

                  {/* Third row: Amount, Particulars */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <div className="col-span-1 group">
                      <label className="text-sm font-medium text-gray-700 block mb-2 group-hover:text-green-600 transition-colors duration-300">
                        Amount *
                      </label>
                      <input
                        type="text"
                        name="amount"
                        value={data.amount}
                        onChange={handleChange}
                        required
                        placeholder="0.00"
                        className={`w-full border-2 rounded-lg p-3 focus:outline-none transition-all duration-300 hover:shadow-md ${
                          errors.amount ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500 hover:border-green-400'
                        }`}
                      />
                      {errors.amount && (
                        <p className="text-red-500 text-xs mt-1 animate-shake">{errors.amount}</p>
                      )}
                    </div>

                    <div className="col-span-4 group">
                      <label className="text-sm font-medium text-gray-700 block mb-2 group-hover:text-green-600 transition-colors duration-300">
                        Particulars *
                      </label>
                      <input
                        type="text"
                        name="particulars"
                        value={data.particulars}
                        onChange={handleChange}
                        required
                        placeholder="Enter particulars/description"
                        className={`w-full border-2 rounded-lg p-3 focus:outline-none transition-all duration-300 hover:shadow-md ${
                          errors.particulars ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500 hover:border-green-400'
                        }`}
                      />
                      {errors.particulars && (
                        <p className="text-red-500 text-xs mt-1 animate-shake">{errors.particulars}</p>
                      )}
                    </div>
                  </div>

                  {/* ORS entries integrated into main form (no separation) */}
                  {orsList.map((entry, index) => (
                    <div key={index} className="border-l-4 border-green-500 pl-6 ml-2">
                      <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                        <span className="mr-2">📊</span>
                        ORS Entry {index + 1}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="group">
                          <label className="text-sm font-medium text-gray-700 block mb-2 group-hover:text-green-600 transition-colors duration-300">
                            ORS No.
                          </label>
                          <input
                            type="text"
                            placeholder="NN-NNNNNNNN-YYYY-MM-NNNNNN"
                            value={entry.ors_number}
                            onChange={(e) => handleOrsChange(index, 'ors_number', e.target.value)}
                            className={`w-full border-2 rounded-lg p-3 focus:outline-none transition-all duration-300 hover:shadow-md ${
                              errors[`ors_${index}`] ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500 hover:border-green-400'
                            }`}
                          />
                          {errors[`ors_${index}`] && (
                            <p className="text-red-500 text-xs mt-1 animate-shake">{errors[`ors_${index}`]}</p>
                          )}
                        </div>

                        <div className="group">
                          <label className="text-sm font-medium text-gray-700 block mb-2 group-hover:text-green-600 transition-colors duration-300">
                            Fund Source
                          </label>
                          <ComboBox
                            value={entry.fund_source}
                            onChange={(value) => handleOrsChange(index, 'fund_source', value)}
                            options={fundSourceOptions}
                            placeholder="Select or type fund source"
                            className="transition-all duration-300 hover:shadow-md border-gray-300 focus:border-green-500 hover:border-green-400"
                          />
                        </div>

                        <div className="group">
                          <label className="text-sm font-medium text-gray-700 block mb-2 group-hover:text-green-600 transition-colors duration-300">
                            UACS / Object of Expenditure
                          </label>
                          <ComboBox
                            value={entry.uacs}
                            onChange={(value) => handleOrsChange(index, 'uacs', value)}
                            options={uacsOptions}
                            placeholder="NNNNNNNN-NN"
                            className={`transition-all duration-300 hover:shadow-md ${
                              errors[`uacs_${index}`] ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500 hover:border-green-400'
                            }`}
                          />
                          {errors[`uacs_${index}`] && (
                            <p className="text-red-500 text-xs mt-1 animate-shake">{errors[`uacs_${index}`]}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add More button integrated into main form */}
                  <div className="flex justify-start">
                    <button
                      type="button"
                      onClick={addMore}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all duration-300 flex items-center transform hover:scale-105 hover:shadow-lg"
                    >
                      <span className="mr-2 text-lg">+</span> Add More ORS Entry
                    </button>
                  </div>
                </div>

                {/* Submit and Cancel buttons */}
                <div className="flex justify-end gap-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="bg-green-700 text-white px-8 py-3 rounded-lg hover:bg-green-800 transition-all duration-300 disabled:opacity-50 transform hover:scale-105 hover:shadow-lg disabled:transform-none flex items-center"
                  >
                    {processing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">✅</span>
                        Receive File
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </>
  );
}
