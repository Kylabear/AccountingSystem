import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AnimatedBackground from '../Components/AnimatedBackground';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function StatisticsPage() {
    const { auth, statistics, breakdownData, filterOptions, currentFilters, dvs } = usePage().props;
    const user = auth.user;
    const [selectedPeriod, setSelectedPeriod] = useState('monthly');
    const [selectedCategory, setSelectedCategory] = useState('implementing-unit');
    const [animatedCards, setAnimatedCards] = useState(false);
    const [showExportDropdown, setShowExportDropdown] = useState(false);

    // Calculate dashboard statistics from DVs data
    const getDashboardStats = () => {
        if (!dvs || !Array.isArray(dvs)) {
            return {
                totalReceived: 0,
                totalProcessed: 0,
                processing: 0,
                outsideAccounting: 0
            };
        }

        const totalReceived = dvs.length;
        const totalProcessed = dvs.filter(dv => ['approved', 'completed', 'processed'].includes(dv.status)).length;
        const processing = dvs.filter(dv => !['approved', 'completed', 'processed'].includes(dv.status)).length;
        const outsideAccounting = dvs.filter(dv => ['out_to_cashiering', 'for_lddap'].includes(dv.status)).length;

        return {
            totalReceived,
            totalProcessed,
            processing,
            outsideAccounting
        };
    };

    // New states for enhanced filtering
    const [selectedChartCategory, setSelectedChartCategory] = useState('all'); // For chart category filtering
    const [selectedDrillPeriod, setSelectedDrillPeriod] = useState(''); // For hierarchical time filtering

    // Enhanced mock data for intelligent filtering
    // Use real backend data for breakdowns
    const getCategoryData = (category) => {
    // Always show all predefined categories for selected breakdown, fallback to zeroes if backend data is missing or mismatched
    const filterTypeMap = {
        'implementing-unit': 'implementing_unit',
        'type-disbursement': 'type_disbursement',
        'fund-source': 'fund_source'
    };
    const normalizedCategory = filterTypeMap[category] || category;
    let predefinedList = [];
    if (category === 'implementing-unit') {
        predefinedList = [
            'RAED', 'SAAD', 'REGULATORY', 'RESEARCH', 'ILD', 'AFD', 'RICE', 'CORN', 'LIVESTOCK',
            'OAP', 'HVCDP', '4K', 'F2C2', 'AMAD', 'PMED', 'BP2'
        ];
    } else if (category === 'type-disbursement') {
        predefinedList = [
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
            'TEV inc. toll fees',
            'Fuel'
        ];
    } else if (category === 'fund-source') {
        // Add your predefined fund source list here if needed
        predefinedList = [];
    }

    // Map backend data if available and filter_type matches
    let dataMap = {};
    if (breakdownData && Array.isArray(breakdownData.data) && breakdownData.filter_type === normalizedCategory) {
        breakdownData.data.forEach(item => {
            dataMap[item.category] = {
                name: item.category,
                received: item.received,
                processed: item.processed
            };
        });
    }

    // Always return the full predefined list, filling missing with zeroes
    return predefinedList.map(cat => (
        dataMap[cat] || { name: cat, received: 0, processed: 0 }
    ));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    // Intelligent filtering functions
    const getAvailableDrillPeriods = () => {
        const drillOptions = {
            daily: [],
            weekly: [
                { value: 'monthly', label: 'Monthly Summary' }
            ],
            monthly: [
                { value: 'quarterly', label: 'Quarterly Summary' },
                { value: 'yearly', label: 'Yearly Summary' }
            ],
            quarterly: [
                { value: 'monthly', label: 'Monthly Breakdown' },
                { value: 'yearly', label: 'Yearly Summary' }
            ],
            yearly: []
        };
        return drillOptions[selectedPeriod] || [];
    };

    // Get filtered processing time data based on current selections
    // There is no real processing time data from backend yet, so return empty array
    const getFilteredProcessingData = () => {
        return [];
    };

    // Get drill-down data if drill period is selected
    const getDrillDownData = () => {
        return null;
    };

    // Calculate average processing time for filtered data
    const filteredData = getFilteredProcessingData();
    const drillDownData = getDrillDownData();
    const averageProcessingTime = 0;
    const drillDownAverageTime = null;

    // Calculate progress percentage
    // Use real dashboard stats for progress percentage
    const dashboardStats = getDashboardStats();
    const progressPercentage = dashboardStats.totalReceived > 0
        ? ((dashboardStats.totalProcessed / dashboardStats.totalReceived) * 100).toFixed(2)
        : '0.00';

    // Get current category data and calculate max received value for proportional scaling
    const currentCategoryData = getCategoryData(selectedCategory);
    const maxReceived = currentCategoryData.length > 0 ? Math.max(...currentCategoryData.map(item => item.received)) : 1;

    // Enhanced Chart.js configuration for processing time scatter plot
    const chartData = {
        datasets: [
            {
                label: `${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Processing Time`,
                data: filteredData,
                backgroundColor: 'rgba(34, 197, 94, 0.6)',
                borderColor: 'rgba(34, 197, 94, 1)',
                pointRadius: 6,
                pointHoverRadius: 8,
            },
            {
                label: `Average (${averageProcessingTime.toFixed(1)} days)`,
                data: filteredData.map(point => ({ x: point.x, y: averageProcessingTime })),
                backgroundColor: 'rgba(239, 68, 68, 0.6)',
                borderColor: 'rgba(239, 68, 68, 1)',
                pointRadius: 0,
                showLine: true,
                borderDash: [5, 5],
                borderWidth: 2,
            },
            // Add drill-down data if available
            ...(drillDownData ? [{
                label: `${selectedDrillPeriod.charAt(0).toUpperCase() + selectedDrillPeriod.slice(1)} Comparison`,
                data: drillDownData,
                backgroundColor: 'rgba(147, 51, 234, 0.6)',
                borderColor: 'rgba(147, 51, 234, 1)',
                pointRadius: 4,
                pointHoverRadius: 6,
            }, {
                label: `${selectedDrillPeriod} Average (${drillDownAverageTime.toFixed(1)} days)`,
                data: drillDownData.map(point => ({ x: point.x, y: drillDownAverageTime })),
                backgroundColor: 'rgba(147, 51, 234, 0.4)',
                borderColor: 'rgba(147, 51, 234, 1)',
                pointRadius: 0,
                showLine: true,
                borderDash: [10, 5],
                borderWidth: 2,
            }] : [])
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: `Transaction Processing Time Analysis - ${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} View${selectedChartCategory !== 'all' ? ` (${selectedChartCategory.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())})` : ''}`
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const point = context.parsed;
                        const dataPoint = filteredData[context.dataIndex] || drillDownData?.[context.dataIndex];
                        
                        if (context.datasetIndex === 0 || context.datasetIndex === 2) {
                            const period = dataPoint?.period || dataPoint?.date || `Transaction ${point.x}`;
                            const category = dataPoint?.subCategory ? ` - ${dataPoint.subCategory}` : '';
                            return `${period}${category}: ${point.y} days`;
                        } else {
                            const avgType = context.datasetIndex === 1 ? 'Average' : `${selectedDrillPeriod} Average`;
                            return `${avgType}: ${point.y.toFixed(1)} days`;
                        }
                    }
                }
            }
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: `${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Periods`
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Processing Time (Days)'
                },
                min: 0
            }
        }
    };

    useEffect(() => {
        setTimeout(() => setAnimatedCards(true), 100);
    }, []);

    // Function to handle export
    const handleExport = (format) => {
        // Use Inertia's router to navigate to the export route
        const params = new URLSearchParams({
            filter_by: selectedCategory.replace('-', '_'),
            time_period: selectedPeriod,
            format: format
        });
        
        // Open in new window to trigger download
        window.open(`/statistics/export?${params.toString()}`, '_blank');
        
        // Close dropdown after export
        setShowExportDropdown(false);
    };

    return (
        <div className="min-h-screen relative bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
            {/* Animated Background */}
            <AnimatedBackground />
            
            {/* Floating background elements - analytics themed */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
                {/* Chart icons */}
                <div className="absolute top-20 left-10 text-green-300 opacity-10 animate-float">
                    <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                </div>
                
                <div className="absolute top-40 right-20 text-blue-300 opacity-10 animate-float-delayed">
                    <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                </div>

                <div className="absolute bottom-32 left-1/4 text-purple-300 opacity-10 animate-float">
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>

            {/* Enhanced Fixed Header - Responsive and always visible */}
            <div className="bg-green-700 text-white p-4 sm:p-6 shadow-2xl backdrop-blur-sm bg-opacity-95 header-fixed">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center group mb-4 sm:mb-0">
                        <Link 
                            href="/"
                            className="flex items-center hover:scale-105 transition-all duration-300"
                        >
                            <img 
                                src="/DALOGO.png" 
                                alt="DA Logo" 
                                className="w-10 h-10 sm:w-12 sm:h-12 mr-3 object-contain drop-shadow-lg group-hover:rotate-12 transition-all duration-300"
                            />
                            <div>
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300">
                                    Statistics & Analytics
                                </h1>
                            </div>
                        </Link>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <Link 
                            href="/incoming-dvs"
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center text-sm sm:text-base"
                        >
                            <span className="mr-2">🏠</span>
                            Home
                        </Link>
                        <div className="flex space-x-2 sm:space-x-4">
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="flex-1 sm:flex-none bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:-translate-y-1 group flex items-center justify-center"
                            >
                                <span className="mr-2 transition-transform duration-300 group-hover:scale-125">🚪</span>
                                <span className="group-hover:scale-105 transition-transform duration-200">Logout</span>
                            </Link>
                            <Link 
                                href="/profile"
                                className="hover:opacity-80 transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
                            >
                                <img 
                                    src={user?.profile_image ? `/storage/${user.profile_image}` : '/default-profile.png'} 
                                    alt="Profile" 
                                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-yellow-400 shadow-lg"
                                />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - with top padding to account for fixed header */}
            <div className="content-with-header relative z-10">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    
                    {/* Enhanced Export Button Section with Dropdown */}
                    <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-end relative">
                        <div className="relative">
                            <button 
                                onClick={() => setShowExportDropdown(!showExportDropdown)}
                                className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-orange-500 via-red-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:via-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 shadow-lg hover:shadow-2xl hover:shadow-red-300/50 flex items-center justify-center group font-semibold text-base sm:text-lg"
                            >
                                <span className="mr-3 text-xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">📄</span>
                                <span>Export Report</span>
                                <span className={`ml-3 transition-all duration-300 ${showExportDropdown ? 'rotate-180' : 'group-hover:translate-x-1'}`}>
                                    {showExportDropdown ? '▲' : '▼'}
                                </span>
                            </button>
                            
                            {/* Export Format Dropdown */}
                            {showExportDropdown && (
                                <div className="absolute top-full mt-2 right-0 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-300">
                                    <div className="p-2">
                                        <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold px-3 py-2">
                                            Choose Format
                                        </div>
                                        
                                        <button
                                            onClick={() => handleExport('pdf')}
                                            className="w-full text-left px-3 py-3 hover:bg-red-50 rounded-lg transition-all duration-200 flex items-center group"
                                        >
                                            <span className="mr-3 text-lg group-hover:scale-110 transition-transform duration-200">📄</span>
                                            <div>
                                                <div className="font-medium text-gray-800">PDF Document</div>
                                                <div className="text-xs text-gray-500">Portable format for viewing</div>
                                            </div>
                                        </button>
                                        
                                        <button
                                            onClick={() => handleExport('excel')}
                                            className="w-full text-left px-3 py-3 hover:bg-green-50 rounded-lg transition-all duration-200 flex items-center group"
                                        >
                                            <span className="mr-3 text-lg group-hover:scale-110 transition-transform duration-200">📊</span>
                                            <div>
                                                <div className="font-medium text-gray-800">Excel Spreadsheet</div>
                                                <div className="text-xs text-gray-500">Data analysis and calculations</div>
                                            </div>
                                        </button>
                                        
                                        <button
                                            onClick={() => handleExport('docx')}
                                            className="w-full text-left px-3 py-3 hover:bg-blue-50 rounded-lg transition-all duration-200 flex items-center group"
                                        >
                                            <span className="mr-3 text-lg group-hover:scale-110 transition-transform duration-200">📝</span>
                                            <div>
                                                <div className="font-medium text-gray-800">Word Document</div>
                                                <div className="text-xs text-gray-500">Editable report format</div>
                                            </div>
                                        </button>
                                        
                                        
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Close dropdown when clicking outside */}
                        {showExportDropdown && (
                            <div 
                                className="fixed inset-0 z-40" 
                                onClick={() => setShowExportDropdown(false)}
                            ></div>
                        )}
                    </div>

                    {/* Dashboard Statistics Cards - Always Visible */}
                    <div className="space-y-6 mb-8">
                        {/* Dashboard Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {/* Total DV Received */}
                            <div className="bg-gradient-to-br from-blue-500/80 to-blue-600/80 backdrop-blur-lg text-white p-6 rounded-xl shadow-lg border border-white/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-100 text-sm font-medium">Total DV Received</p>
                                        <p className="text-3xl font-bold">{getDashboardStats().totalReceived.toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 bg-white/20 rounded-full">
                                        <span className="text-2xl">📥</span>
                                    </div>
                                </div>
                            </div>

                            {/* Total Processed */}
                            <div className="bg-gradient-to-br from-green-500/80 to-green-600/80 backdrop-blur-lg text-white p-6 rounded-xl shadow-lg border border-white/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100 text-sm font-medium">Total Processed</p>
                                        <p className="text-3xl font-bold">{getDashboardStats().totalProcessed.toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 bg-white/20 rounded-full">
                                        <span className="text-2xl">✅</span>
                                    </div>
                                </div>
                            </div>

                            {/* Processing */}
                            <div className="bg-gradient-to-br from-orange-500/80 to-orange-600/80 backdrop-blur-lg text-white p-6 rounded-xl shadow-lg border border-white/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-orange-100 text-sm font-medium">Currently Processing</p>
                                        <p className="text-3xl font-bold">{getDashboardStats().processing.toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 bg-white/20 rounded-full">
                                        <span className="text-2xl">⚙️</span>
                                    </div>
                                </div>
                            </div>

                            {/* Outside Accounting */}
                            <div className="bg-gradient-to-br from-purple-500/80 to-purple-600/80 backdrop-blur-lg text-white p-6 rounded-xl shadow-lg border border-white/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-100 text-sm font-medium">Outside Accounting</p>
                                        <p className="text-3xl font-bold">{getDashboardStats().outsideAccounting.toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 bg-white/20 rounded-full">
                                        <span className="text-2xl">🏢</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Processing Time Analysis Chart with Enhanced Filters */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200 hover:border-green-300 hover:shadow-xl transition-all duration-300">
                        {/* Header Section */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                            <div className="mb-4 lg:mb-0">
                                <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 flex items-center">
                                    <span className="mr-3 text-2xl">📈</span>
                                    <span className="bg-gradient-to-r from-gray-800 to-green-700 bg-clip-text text-transparent">Processing Time Analysis</span>
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">Live data analysis and trends</p>
                            </div>
                            
                            {/* Filter Controls */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Base Time Period Filter */}
                                <div className="min-w-0 sm:min-w-[200px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Time Period
                                    </label>
                                    <select 
                                        value={selectedPeriod}
                                        onChange={(e) => {
                                            setSelectedPeriod(e.target.value);
                                            setSelectedDrillPeriod('');
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
                                    >
                                        <option value="daily">📅 Daily</option>
                                        <option value="weekly">📊 Weekly</option>
                                        <option value="monthly">📆 Monthly</option>
                                        <option value="quarterly">📈 Quarterly</option>
                                        <option value="yearly">🗓️ Yearly</option>
                                    </select>
                                </div>

                                {/* Category Filter */}
                                <div className="min-w-0 sm:min-w-[200px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category Filter
                                    </label>
                                    <select 
                                        value={selectedChartCategory}
                                        onChange={(e) => setSelectedChartCategory(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
                                    >
                                        <option value="all">🌐 All Categories</option>
                                        <option value="implementing-unit">🏢 Implementing Unit</option>
                                        <option value="fund-source">💰 Fund Source</option>
                                        <option value="type-disbursement">📋 Disbursement Type</option>
                                    </select>
                                </div>

                                {/* Drill-down Filter */}
                                {getAvailableDrillPeriods().length > 0 && (
                                    <div className="min-w-0 sm:min-w-[200px]">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Compare With
                                        </label>
                                        <select 
                                            value={selectedDrillPeriod}
                                            onChange={(e) => setSelectedDrillPeriod(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
                                        >
                                            <option value="">❌ No Comparison</option>
                                            {getAvailableDrillPeriods().map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    🔄 {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Reset Button */}
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => {
                                    setSelectedPeriod('monthly');
                                    setSelectedDrillPeriod('');
                                    setSelectedChartCategory('all');
                                }}
                                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center"
                            >
                                <span className="mr-2">🔄</span>
                                Reset Filters
                            </button>
                        </div>
                        
                        {/* Active Filters Summary */}
                        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-l-4 border-blue-500">
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                <span className="font-semibold text-gray-800 flex items-center">
                                    <span className="mr-2">🎯</span>
                                    Active Filters:
                                </span>
                                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                                    📊 {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}
                                </span>
                                {selectedDrillPeriod && (
                                    <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                                        🔄 vs {selectedDrillPeriod.charAt(0).toUpperCase() + selectedDrillPeriod.slice(1)}
                                    </span>
                                )}
                                {selectedChartCategory !== 'all' && (
                                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                                        🏷️ {selectedChartCategory.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        {/* Chart Container */}
                        <div className="h-96 lg:h-[500px] bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="h-full">
                                <Scatter data={chartData} options={chartOptions} />
                            </div>
                        </div>
                        
                        {/* Statistics Summary */}
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:shadow-md transition-shadow duration-200">
                                <div className="text-sm text-gray-600 mb-1 flex items-center">
                                    <span className="mr-2">⏱️</span>
                                    Current Period Average
                                </div>
                                <div className="text-xl font-bold text-green-700">{averageProcessingTime.toFixed(1)} days</div>
                                <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                                </div>
                            </div>
                            
                            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 hover:shadow-md transition-shadow duration-200">
                                <div className="text-sm text-gray-600 mb-1 flex items-center">
                                    <span className="mr-2">📊</span>
                                    Total Data Points
                                </div>
                                <div className="text-xl font-bold text-blue-700">{filteredData.length}</div>
                                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                                </div>
                            </div>
                            
                            {drillDownData && (
                                <>
                                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 hover:shadow-md transition-shadow duration-200">
                                        <div className="text-sm text-gray-600 mb-1 flex items-center">
                                            <span className="mr-2">🔄</span>
                                            {selectedDrillPeriod} Average
                                        </div>
                                        <div className="text-xl font-bold text-purple-700">{drillDownAverageTime.toFixed(1)} days</div>
                                        <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg border border-pink-200 hover:shadow-md transition-shadow duration-200">
                                        <div className="text-sm text-gray-600 mb-1 flex items-center">
                                            <span className="mr-2">📈</span>
                                            Comparison
                                        </div>
                                        <div className={`text-xl font-bold flex items-center ${averageProcessingTime < drillDownAverageTime ? 'text-green-700' : 'text-red-700'}`}>
                                            <span className="mr-2 text-xl">
                                                {averageProcessingTime < drillDownAverageTime ? '🔻' : '🔺'}
                                            </span>
                                            {Math.abs(averageProcessingTime - drillDownAverageTime).toFixed(1)} days
                                        </div>
                                        <div className={`w-full rounded-full h-2 mt-2 ${averageProcessingTime < drillDownAverageTime ? 'bg-green-200' : 'bg-red-200'}`}>
                                            <div className={`h-2 rounded-full ${averageProcessingTime < drillDownAverageTime ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: '70%' }}></div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Overall Progress Bar */}
                    <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 mb-8 transform hover:scale-[1.01] transition-all duration-500 border border-gray-200 hover:border-blue-300 hover:shadow-blue-100 group overflow-hidden relative">
                        {/* Animated background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-green-50/20 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                        
                        <div className="relative z-10">
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-6 flex flex-col sm:flex-row sm:items-center">
                                <div className="flex items-center mb-2 sm:mb-0">
                                    <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mr-3 text-3xl sm:text-4xl animate-pulse">📊</span>
                                    <span className="bg-gradient-to-r from-gray-800 via-blue-700 to-green-700 bg-clip-text text-transparent">Overall Transaction Progress</span>
                                </div>
                            </h2>
                            
                            <div className="mb-6">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                                    <span className="text-base sm:text-lg font-semibold text-gray-700 flex items-center mb-2 sm:mb-0">
                                        <span className="mr-2">🚀</span>
                                        System Throughput
                                    </span>
                                    <span className="text-lg sm:text-xl text-gray-600 font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                                        {progressPercentage}% Complete
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-8 sm:h-10 relative overflow-hidden shadow-inner">
                                    <div 
                                        className="h-8 sm:h-10 bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: '100%' }}
                                    ></div>
                                    <div 
                                        className="absolute top-0 left-0 h-8 sm:h-10 bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-full transition-all duration-1500 ease-out shadow-lg"
                                        style={{ width: `${progressPercentage}%` }}
                                    ></div>
                                    
                                    {/* Animated shimmer effect */}
                                    <div className="absolute top-0 left-0 h-8 sm:h-10 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full animate-shimmer"></div>
                                </div>
                                
                                {/* Progress labels */}
                                <div className="flex justify-between text-xs sm:text-sm text-gray-500 mt-2">
                                    <span>🟦 Received</span>
                                    <span>🟩 Processed ({progressPercentage}%)</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
                                <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border border-blue-200">
                                    <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-700 mb-2 flex items-center justify-center">
                                        <span className="mr-2">✅</span>
                                        {dashboardStats.totalProcessed.toLocaleString()}
                                    </div>
                                    <div className="text-sm sm:text-base text-blue-600 font-medium">Processed Transactions</div>
                                    <div className="mt-2 w-full bg-blue-300 rounded-full h-2">
                                        <div className="bg-gradient-to-r from-blue-500 to-blue-700 h-2 rounded-full animate-pulse" style={{ width: dashboardStats.totalReceived > 0 ? `${(dashboardStats.totalProcessed / dashboardStats.totalReceived) * 100}%` : '0%' }}></div>
                                    </div>
                                </div>
                                <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200">
                                    <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-700 mb-2 flex items-center justify-center">
                                        <span className="mr-2">📥</span>
                                        {dashboardStats.totalReceived.toLocaleString()}
                                    </div>
                                    <div className="text-sm sm:text-base text-gray-600 font-medium">Received Transactions</div>
                                    <div className="mt-2 w-full bg-gray-300 rounded-full h-2">
                                        <div className="bg-gradient-to-r from-gray-500 to-gray-700 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                                    </div>
                                </div>
                                <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-green-50 via-green-100 to-green-200 rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border border-green-200">
                                    <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-700 mb-2 flex items-center justify-center">
                                        <span className="mr-2">📈</span>
                                        {progressPercentage}%
                                    </div>
                                    <div className="text-sm sm:text-base text-green-600 font-medium">Progress Rate</div>
                                    <div className="mt-2 w-full bg-green-300 rounded-full h-2">
                                        <div className="bg-gradient-to-r from-green-500 to-green-700 h-2 rounded-full animate-pulse" style={{ width: `${progressPercentage}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Category-specific Breakdown with Filter */}
                    <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 mb-8 transform hover:scale-[1.01] transition-all duration-500 border border-gray-200 hover:border-purple-300 hover:shadow-purple-100 group overflow-hidden relative">
                        {/* Animated background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-blue-50/20 to-green-50/30 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                        
                        <div className="relative z-10">
                            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between mb-6">
                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 flex flex-col sm:flex-row sm:items-center mb-4 xl:mb-0">
                                    <div className="flex items-center mb-2 sm:mb-0">
                                        <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mr-3 text-3xl sm:text-4xl animate-pulse">📋</span>
                                        <span className="bg-gradient-to-r from-gray-800 via-purple-700 to-blue-700 bg-clip-text text-transparent">
                                            {selectedCategory === 'implementing-unit' ? 'Implementing Unit Breakdown' :
                                             selectedCategory === 'fund-source' ? 'Fund Source Breakdown' :
                                             'Type of Disbursement Voucher Breakdown'}
                                        </span>
                                    </div>
                                </h2>
                                
                                {/* Category Filter */}
                                <div className="group transform hover:scale-105 transition-all duration-300 w-full xl:w-auto">
                                    <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-purple-600 transition-colors">
                                        🏷️ Category Filter
                                    </label>
                                    <select 
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white hover:border-purple-400 hover:shadow-lg text-sm sm:text-base"
                                    >
                                        <option value="implementing-unit">🏢 Implementing Unit</option>
                                        <option value="fund-source">💰 Fund Source</option>
                                        <option value="type-disbursement">📋 Type of Disbursement Voucher</option>
                                    </select>
                                </div>
                            </div>                            
                            <div className="space-y-6">
                                {currentCategoryData.map((item, index) => {
                                    const receivedWidthPercent = (item.received / maxReceived) * 100;
                                    const processedWidthPercent = (item.processed / maxReceived) * 100;
                                    const completionRate = item.received > 0 ? ((item.processed / item.received) * 100).toFixed(1) : '0.0';
                                    const isEmpty = item.received === 0 && item.processed === 0;
                                    return (
                                        <div key={index} className="group transform hover:scale-[1.02] transition-all duration-300">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3">
                                                <h3 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors text-base sm:text-lg mb-1 sm:mb-0">
                                                    <span className="mr-2">🏷️</span>
                                                    {item.name}
                                                </h3>
                                                <div className="text-sm text-gray-600 flex items-center">
                                                    <span className="font-medium text-green-600 text-lg">{item.processed}</span>
                                                    <span className="mx-2">/</span>
                                                    <span className="font-medium text-blue-600 text-lg">{item.received}</span>
                                                    <span className="ml-3 text-gray-500 bg-gray-100 px-2 py-1 rounded-full text-xs">
                                                        ({completionRate}%)
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Enhanced Dual Progress Bars */}
                                            <div className="relative">
                                                {/* If both received and processed are zero, show grey bar */}
                                                {isEmpty ? (
                                                    <div className="w-full bg-gray-400 rounded-full h-6 mb-1 shadow-inner opacity-50"></div>
                                                ) : (
                                                    <>
                                                        {/* Received transactions bar (light) */}
                                                        <div className="w-full bg-gray-200 rounded-full h-6 mb-1 shadow-inner">
                                                            <div 
                                                                className="h-6 bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500 rounded-full transition-all duration-1000 ease-out"
                                                                style={{ width: `${receivedWidthPercent}%` }}
                                                            ></div>
                                                        </div>
                                                        {/* Processed transactions bar (dark overlay) */}
                                                        <div className="w-full bg-transparent rounded-full h-6 -mt-7 relative">
                                                            <div 
                                                                className="h-6 bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-full transition-all duration-1200 ease-out opacity-90 shadow-lg"
                                                                style={{ width: `${processedWidthPercent}%` }}
                                                            ></div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            {/* Enhanced Legend */}
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-3 text-xs text-gray-500">
                                                <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                                                    <div className="flex items-center">
                                                        <div className="w-4 h-4 bg-gradient-to-r from-blue-300 to-blue-500 rounded-full mr-2"></div>
                                                        <span className="font-medium">📥 Received</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-700 rounded-full mr-2"></div>
                                                        <span className="font-medium">✅ Processed</span>
                                                    </div>
                                                </div>
                                                <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                                                    Scale: {item.received === maxReceived ? '100%' : `${((item.received / maxReceived) * 100).toFixed(1)}%`} of max
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {/* Enhanced Category Summary */}
                            <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 via-blue-50 to-purple-50 rounded-2xl border-l-4 border-blue-500 shadow-lg hover:shadow-xl transition-all duration-300">
                                <h4 className="font-bold text-gray-800 mb-4 text-lg flex items-center">
                                    <span className="mr-2">📊</span>
                                    Category Summary
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                    <div className="bg-white/70 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                                        <span className="text-gray-600 block mb-1">📥 Total Received:</span>
                                        <span className="text-xl font-bold text-blue-600">
                                            {currentCategoryData.reduce((sum, item) => sum + item.received, 0).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="bg-white/70 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                                        <span className="text-gray-600 block mb-1">✅ Total Processed:</span>
                                        <span className="text-xl font-bold text-green-600">
                                            {currentCategoryData.reduce((sum, item) => sum + item.processed, 0).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="bg-white/70 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                                        <span className="text-gray-600 block mb-1">📈 Average Rate:</span>
                                        <span className="text-xl font-bold text-purple-600">
                                            {(() => {
                                                const totalReceived = currentCategoryData.reduce((sum, item) => sum + item.received, 0);
                                                const totalProcessed = currentCategoryData.reduce((sum, item) => sum + item.processed, 0);
                                                if (totalReceived === 0) return '0.0%';
                                                const overallRate = (totalProcessed / totalReceived) * 100;
                                                return overallRate.toFixed(1) + '%';
                                            })()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Custom CSS for animations */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes bounce-gentle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                @keyframes glow {
                    0%, 100% { box-shadow: 0 0 5px rgba(34, 197, 94, 0.2); }
                    50% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.4); }
                }
                @keyframes gradient-shift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-float-delayed {
                    animation: float-delayed 6s ease-in-out infinite 2s;
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
                .animate-bounce-gentle {
                    animation: bounce-gentle 2s ease-in-out infinite;
                }
                .animate-glow {
                    animation: glow 2s ease-in-out infinite;
                }
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient-shift 3s ease infinite;
                }
                
                /* Responsive enhancements */
                @media (max-width: 640px) {
                    .header-fixed {
                        position: sticky;
                        top: 0;
                        z-index: 50;
                    }
                    .content-with-header {
                        padding-top: 0;
                    }
                }
                
                @media (min-width: 641px) {
                    .header-fixed {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        z-index: 50;
                    }
                    .content-with-header {
                        padding-top: 120px;
                    }
                }
                
                /* Enhanced hover effects */
                .group:hover .group-hover\\:rotate-180 {
                    transform: rotate(180deg);
                }
                .group:hover .group-hover\\:scale-125 {
                    transform: scale(1.25);
                }
                .group:hover .group-hover\\:rotate-12 {
                    transform: rotate(12deg) scale(1.1);
                }
            `}</style>
            
        </div>
    );
};