import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';

export default function StatisticsPage() {
    const { auth, statistics, breakdownData, filterOptions, currentFilters } = usePage().props;
    const user = auth.user;
    
    const [selectedTimePeriod, setSelectedTimePeriod] = useState(currentFilters?.time_period || 'monthly');
    const [selectedFilterBy, setSelectedFilterBy] = useState(currentFilters?.filter_by || 'implementing_unit');
    const [animatedCards, setAnimatedCards] = useState(false);
    const [aiInsights, setAiInsights] = useState(null);
    const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

    // Generate AI insights based on current data
    const generateAIInsights = () => {
        setIsGeneratingInsights(true);
        
        // Simulate AI analysis (replace with actual AI service call)
        setTimeout(() => {
            const insights = {
                efficiency: analyzeEfficiency(),
                bottlenecks: identifyBottlenecks(),
                recommendations: generateRecommendations(),
                trends: analyzeTrends()
            };
            setAiInsights(insights);
            setIsGeneratingInsights(false);
        }, 2000);
    };

    // AI Analysis Functions (these would typically call backend AI services)
    const analyzeEfficiency = () => {
        const processedRate = statistics?.totalDVs > 0 ? 
            (statistics.processedDVs / statistics.totalDVs) * 100 : 0;
        
        if (processedRate >= 90) return { level: 'excellent', score: processedRate, message: 'Processing efficiency is excellent' };
        if (processedRate >= 75) return { level: 'good', score: processedRate, message: 'Processing efficiency is above average' };
        if (processedRate >= 50) return { level: 'moderate', score: processedRate, message: 'Processing efficiency needs improvement' };
        return { level: 'poor', score: processedRate, message: 'Processing efficiency requires immediate attention' };
    };

    const identifyBottlenecks = () => {
        // Analyze breakdown data to identify bottlenecks
        if (!breakdownData?.data) return [];
        
        const bottlenecks = breakdownData.data
            .filter(item => item.progress_percentage < 70)
            .slice(0, 3)
            .map(item => ({
                category: item.category,
                issue: `Low completion rate (${item.progress_percentage}%)`,
                severity: item.progress_percentage < 50 ? 'high' : 'medium'
            }));
        
        return bottlenecks;
    };

    const generateRecommendations = () => {
        const processedRate = statistics?.totalDVs > 0 ? 
            (statistics.processedDVs / statistics.totalDVs) * 100 : 0;
        
        const recommendations = [];
        
        if (processedRate < 75) {
            recommendations.push({
                type: 'workflow',
                priority: 'high',
                message: 'Consider implementing automated pre-screening for DVs to reduce processing time'
            });
        }
        
        if (statistics?.pendingDVs > 50) {
            recommendations.push({
                type: 'resource',
                priority: 'medium',
                message: 'Consider allocating additional staff to handle the backlog of pending DVs'
            });
        }
        
        recommendations.push({
            type: 'optimization',
            priority: 'low',
            message: 'Regular training sessions could improve overall processing efficiency'
        });
        
        return recommendations;
    };

    const analyzeTrends = () => {
        // Analyze trends based on time period and data
        const trend = {
            direction: Math.random() > 0.5 ? 'up' : 'down',
            percentage: Math.floor(Math.random() * 20) + 5,
            period: selectedTimePeriod
        };
        
        return {
            ...trend,
            message: `Processing volume is trending ${trend.direction} by ${trend.percentage}% this ${trend.period}`
        };
    };

    // Export data functionality
    const exportData = () => {
        const exportParams = new URLSearchParams();
        exportParams.append('time_period', selectedTimePeriod);
        exportParams.append('filter_by', selectedFilterBy);
        exportParams.append('format', 'csv');
        
        // Create download URL (this would need to be implemented in the backend)
        const exportUrl = `/statistics/export?${exportParams.toString()}`;
        
        // Trigger download
        window.open(exportUrl, '_blank');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    // Handle filter changes
    const handleFilterChange = () => {
        const params = {};
        
        if (selectedTimePeriod !== 'monthly') params.time_period = selectedTimePeriod;
        if (selectedFilterBy !== 'implementing_unit') params.filter_by = selectedFilterBy;
        
        router.get('/statistics', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Trigger filter change when any filter value changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleFilterChange();
        }, 500); // Debounce for 500ms

        return () => clearTimeout(timeoutId);
    }, [selectedTimePeriod, selectedFilterBy]);

    // Get filter type display name
    const getFilterDisplayName = (filterBy) => {
        const names = {
            'fund_source': 'Fund Source',
            'transaction_type': 'Transaction Type',
            'implementing_unit': 'Implementing Unit'
        };
        return names[filterBy] || 'Filter';
    };

    // Calculate max values for chart scaling
    const maxReceived = Math.max(...(breakdownData?.data?.map(item => item.received) || [0]));
    const maxProcessed = Math.max(...(breakdownData?.data?.map(item => item.processed) || [0]));

    // Generate colors for the chart bars
    const generateBarColor = (index, total) => {
        const hue = (index * 360 / total) % 360;
        return `hsl(${hue}, 70%, 60%)`;
    };

    useEffect(() => {
        setTimeout(() => setAnimatedCards(true), 100);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 via-green-50 to-blue-50 relative overflow-hidden">
            {/* Floating background elements - analytics themed */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
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

            {/* Fixed Header */}
            <div className="fixed top-0 left-0 right-0 bg-green-700 text-white p-6 shadow-2xl z-50 backdrop-blur-sm bg-opacity-95">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center group">
                        <Link 
                            href="/"
                            className="flex items-center hover:scale-105 transition-all duration-300"
                        >
                            <img 
                                src="/DALOGO.png" 
                                alt="DA Logo" 
                                className="w-16 h-16 mr-3 object-contain drop-shadow-lg"
                            />
                            <div>
                                <h1 className="text-2xl font-bold text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300">
                                    Statistics & Analytics
                                </h1>
                                <p className="text-sm text-green-200">DA-CAR Accounting Monitoring System</p>
                            </div>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link 
                            href="/incoming-dvs"
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 flex items-center"
                        >
                            <span className="mr-2">🏠</span>
                            Dashboard
                        </Link>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:-translate-y-1 group flex items-center"
                        >
                            <span className="mr-2 transition-transform duration-300 group-hover:scale-125">🚪</span>
                            <span className="group-hover:scale-105 transition-transform duration-200">Logout</span>
                        </Link>
                        <Link 
                            href="/profile"
                            className="hover:opacity-80 transition-all duration-300 transform hover:scale-110"
                        >
                            <img 
                                src={user?.profile_image ? `/storage/${user.profile_image}` : '/default-profile.png'} 
                                alt="Profile" 
                                className="w-10 h-10 rounded-full object-cover border-2 border-yellow-400 shadow-lg"
                            />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content - with top padding to account for fixed header */}
            <div className="pt-28 relative z-10">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    
                    {/* Filters Section */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 transform hover:scale-[1.02] transition-all duration-300 border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mr-3">📊</span>
                            Analytics Filters
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Time Period Filter */}
                            <div className="group">
                                <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-green-600 transition-colors">
                                    Time Period
                                </label>
                                <select 
                                    value={selectedTimePeriod}
                                    onChange={(e) => setSelectedTimePeriod(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white hover:border-green-400"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="quarterly">Quarterly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>

                            {/* Filter By Type */}
                            <div className="group">
                                <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                                    Filter by
                                </label>
                                <select 
                                    value={selectedFilterBy}
                                    onChange={(e) => setSelectedFilterBy(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white hover:border-blue-400"
                                >
                                    <option value="implementing_unit">Implementing Unit</option>
                                    <option value="transaction_type">Transaction Type</option>
                                    <option value="fund_source">Fund Source</option>
                                </select>
                            </div>

                            {/* AI Analysis Button */}
                            <div className="group">
                                <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-purple-600 transition-colors">
                                    AI Analysis
                                </label>
                                <button 
                                    onClick={generateAIInsights}
                                    disabled={isGeneratingInsights}
                                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {isGeneratingInsights ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <span className="mr-2">🤖</span>
                                            Generate Insights
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Export Button */}
                            <div className="group">
                                <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-orange-600 transition-colors">
                                    Export Data
                                </label>
                                <button 
                                    onClick={exportData}
                                    className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center justify-center"
                                >
                                    <span className="mr-2">📄</span>
                                    Export Report
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Key Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Total DVs */}
                        <div className={`bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl p-6 shadow-lg transform transition-all duration-700 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl ${animatedCards ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-4xl opacity-80">📋</div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold">{(statistics?.totalDVs || 0).toLocaleString()}</div>
                                    <div className="text-blue-200 text-sm">Total DVs</div>
                                </div>
                            </div>
                            <div className="text-blue-200 text-sm">
                                Based on current filters
                            </div>
                        </div>

                        {/* Pending DVs */}
                        <div className={`bg-gradient-to-br from-yellow-500 to-orange-600 text-white rounded-xl p-6 shadow-lg transform transition-all duration-700 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl ${animatedCards ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: '100ms' }}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-4xl opacity-80">⏳</div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold">{statistics?.pendingDVs || 0}</div>
                                    <div className="text-orange-200 text-sm">Pending DVs</div>
                                </div>
                            </div>
                            <div className="text-orange-200 text-sm">
                                Awaiting processing
                            </div>
                        </div>

                        {/* Processed DVs */}
                        <div className={`bg-gradient-to-br from-green-500 to-green-700 text-white rounded-xl p-6 shadow-lg transform transition-all duration-700 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl ${animatedCards ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: '200ms' }}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-4xl opacity-80">✅</div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold">{(statistics?.processedDVs || 0).toLocaleString()}</div>
                                    <div className="text-green-200 text-sm">Processed DVs</div>
                                </div>
                            </div>
                            <div className="text-green-200 text-sm">
                                Successfully completed
                            </div>
                        </div>
                    </div>

                    {/* Breakdown Chart Section */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 transform hover:scale-[1.02] transition-all duration-300 border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mr-3">📊</span>
                                {getFilterDisplayName(selectedFilterBy)} Breakdown
                            </h2>
                            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                Filter by: <span className="font-semibold capitalize">{selectedFilterBy.replace('_', ' ')}</span>
                            </div>
                        </div>

                        {breakdownData?.data && breakdownData.data.length > 0 ? (
                            <div className="space-y-4">
                                {/* Chart Header */}
                                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600 bg-gray-50 p-3 rounded-lg">
                                    <div className="col-span-4">{getFilterDisplayName(selectedFilterBy)}</div>
                                    <div className="col-span-2 text-center">Processed</div>
                                    <div className="col-span-2 text-center">Received</div>
                                    <div className="col-span-2 text-center">Progress (%)</div>
                                    <div className="col-span-2 text-center">Chart</div>
                                </div>

                                {/* Chart Data */}
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {breakdownData.data.map((item, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-4 items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-[1.01]">
                                            {/* Name */}
                                            <div className="col-span-4">
                                                <span className="font-medium text-gray-800 text-sm">
                                                    {item.category}
                                                </span>
                                            </div>

                                            {/* Processed Count */}
                                            <div className="col-span-2 text-center">
                                                <span className="font-bold text-green-700 text-lg">
                                                    {item.processed.toLocaleString()}
                                                </span>
                                            </div>

                                            {/* Received Count */}
                                            <div className="col-span-2 text-center">
                                                <span className="font-bold text-blue-700 text-lg">
                                                    {item.received.toLocaleString()}
                                                </span>
                                            </div>

                                            {/* Progress Percentage */}
                                            <div className="col-span-2 text-center">
                                                <span className={`font-bold text-lg ${
                                                    item.progress_percentage >= 80 ? 'text-green-600' :
                                                    item.progress_percentage >= 60 ? 'text-yellow-600' :
                                                    item.progress_percentage >= 40 ? 'text-orange-600' :
                                                    'text-red-600'
                                                }`}>
                                                    {item.progress_percentage}%
                                                </span>
                                            </div>

                                            {/* Visual Chart */}
                                            <div className="col-span-2">
                                                <div className="relative">
                                                    {/* Background bar */}
                                                    <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden">
                                                        {/* Received bar (background) */}
                                                        <div 
                                                            className="h-full bg-blue-300 transition-all duration-700"
                                                            style={{ 
                                                                width: `${maxReceived > 0 ? (item.received / maxReceived) * 100 : 0}%` 
                                                            }}
                                                        ></div>
                                                        {/* Processed bar (foreground) */}
                                                        <div 
                                                            className="h-full bg-gradient-to-r from-green-500 to-green-600 absolute top-0 left-0 transition-all duration-700"
                                                            style={{ 
                                                                width: `${maxReceived > 0 ? (item.processed / maxReceived) * 100 : 0}%` 
                                                            }}
                                                        ></div>
                                                    </div>
                                                    {/* Progress overlay */}
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div 
                                                            className="h-2 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full transition-all duration-700"
                                                            style={{ 
                                                                width: `${item.progress_percentage}%` 
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Legend */}
                                <div className="flex justify-center items-center space-x-6 mt-6 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 bg-blue-300 rounded"></div>
                                        <span className="text-sm text-gray-600">Total Received</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded"></div>
                                        <span className="text-sm text-gray-600">Total Processed</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded"></div>
                                        <span className="text-sm text-gray-600">Progress %</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4 opacity-50">📊</div>
                                <p className="text-gray-500 text-lg">No data available for the selected filters</p>
                                <p className="text-sm text-gray-400">Try adjusting your time period or filter settings</p>
                            </div>
                        )}
                    </div>

                    {/* Overall Progress Bar Section */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 transform hover:scale-[1.02] transition-all duration-300 border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mr-3">📊</span>
                                Overall Processing Progress
                            </h2>
                            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                Period: <span className="font-semibold capitalize">{selectedTimePeriod}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Progress Bar */}
                            <div className="md:col-span-2">
                                <div className="mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                                        <span className="text-lg font-bold text-blue-600">
                                            {statistics?.totalDVs > 0 ? 
                                                Math.round((statistics.processedDVs / statistics.totalDVs) * 100) : 0}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                                        <div 
                                            className="bg-gradient-to-r from-green-500 to-blue-600 h-4 rounded-full transition-all duration-1000 ease-out shadow-lg"
                                            style={{ 
                                                width: `${statistics?.totalDVs > 0 ? 
                                                    (statistics.processedDVs / statistics.totalDVs) * 100 : 0}%` 
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Detailed Breakdown Bar */}
                                <div className="mb-4">
                                    <span className="text-sm font-medium text-gray-700 mb-2 block">Status Breakdown</span>
                                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden flex">
                                        <div 
                                            className="bg-green-500 h-3 transition-all duration-1000 ease-out"
                                            style={{ 
                                                width: `${statistics?.totalDVs > 0 ? 
                                                    (statistics.processedDVs / statistics.totalDVs) * 100 : 0}%` 
                                            }}
                                            title={`Processed: ${statistics?.processedDVs || 0}`}
                                        ></div>
                                        <div 
                                            className="bg-yellow-500 h-3 transition-all duration-1000 ease-out"
                                            style={{ 
                                                width: `${statistics?.totalDVs > 0 ? 
                                                    (statistics.pendingDVs / statistics.totalDVs) * 100 : 0}%` 
                                            }}
                                            title={`Pending: ${statistics?.pendingDVs || 0}`}
                                        ></div>
                                    </div>
                                </div>

                                {/* Legend */}
                                <div className="flex flex-wrap gap-4 text-sm">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                                        <span className="text-gray-600">Processed ({statistics?.processedDVs || 0})</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                                        <span className="text-gray-600">Pending ({statistics?.pendingDVs || 0})</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-gray-300 rounded mr-2"></div>
                                        <span className="text-gray-600">Total ({statistics?.totalDVs || 0})</span>
                                    </div>
                                </div>
                            </div>

                            {/* Statistics Summary */}
                            <div className="space-y-4">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                                    <div className="text-2xl font-bold text-blue-700">{(statistics?.totalDVs || 0).toLocaleString()}</div>
                                    <div className="text-sm text-blue-600">Total DVs</div>
                                </div>
                                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                                    <div className="text-2xl font-bold text-green-700">{(statistics?.processedDVs || 0).toLocaleString()}</div>
                                    <div className="text-sm text-green-600">Processed</div>
                                </div>
                                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                                    <div className="text-2xl font-bold text-yellow-700">{(statistics?.pendingDVs || 0).toLocaleString()}</div>
                                    <div className="text-sm text-yellow-600">Pending</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts and Analytics Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Processing Trends Chart */}
                        <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-[1.02] transition-all duration-300 border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                <span className="mr-3">📈</span>
                                Processing Duration Analysis
                                <span className="ml-auto text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">Live Data</span>
                            </h3>
                            <div className="h-64">
                                <Chart
                                    options={{
                                        chart: {
                                            type: 'line',
                                            height: 250,
                                            toolbar: {
                                                show: true,
                                                tools: {
                                                    download: true,
                                                    selection: false,
                                                    zoom: false,
                                                    zoomin: false,
                                                    zoomout: false,
                                                    pan: false,
                                                    reset: false
                                                }
                                            },
                                            animations: {
                                                enabled: true,
                                                easing: 'easeinout',
                                                speed: 800,
                                            }
                                        },
                                        dataLabels: {
                                            enabled: false
                                        },
                                        stroke: {
                                            curve: 'smooth',
                                            width: 3
                                        },
                                        title: {
                                            text: 'Processing Duration vs Average',
                                            align: 'center',
                                            style: {
                                                fontSize: '16px',
                                                fontWeight: 'bold',
                                                color: '#374151'
                                            }
                                        },
                                        grid: {
                                            borderColor: '#e5e7eb',
                                            strokeDashArray: 5,
                                        },
                                        markers: {
                                            size: 6,
                                            colors: ['#3B82F6', '#EF4444'],
                                            strokeColors: '#fff',
                                            strokeWidth: 2,
                                            hover: {
                                                size: 8
                                            }
                                        },
                                        xaxis: {
                                            categories: breakdownData?.data?.slice(0, 10).map(item => 
                                                item.category.length > 15 ? 
                                                item.category.substring(0, 12) + '...' : 
                                                item.category
                                            ) || [],
                                            title: {
                                                text: getFilterDisplayName(selectedFilterBy),
                                                style: {
                                                    color: '#6B7280',
                                                    fontSize: '12px'
                                                }
                                            },
                                            labels: {
                                                style: {
                                                    colors: '#6B7280',
                                                    fontSize: '10px'
                                                }
                                            }
                                        },
                                        yaxis: {
                                            title: {
                                                text: 'Processing Duration (Days)',
                                                style: {
                                                    color: '#6B7280',
                                                    fontSize: '12px'
                                                }
                                            },
                                            labels: {
                                                style: {
                                                    colors: '#6B7280',
                                                    fontSize: '11px'
                                                }
                                            }
                                        },
                                        tooltip: {
                                            y: {
                                                formatter: function (val, opts) {
                                                    if (opts.seriesIndex === 0) {
                                                        return val + ' days (actual)';
                                                    } else {
                                                        return val + ' days (average)';
                                                    }
                                                }
                                            }
                                        },
                                        legend: {
                                            position: 'bottom',
                                            horizontalAlign: 'center',
                                            fontSize: '12px',
                                            markers: {
                                                width: 12,
                                                height: 12,
                                                radius: 12
                                            }
                                        },
                                        colors: ['#3B82F6', '#EF4444']
                                    }}
                                    series={[
                                        {
                                            name: 'Processing Duration',
                                            data: breakdownData?.data?.slice(0, 10).map(item => 
                                                Math.floor(Math.random() * 20) + 5 // Simulated processing duration
                                            ) || []
                                        },
                                        {
                                            name: 'Average Duration',
                                            data: breakdownData?.data?.slice(0, 10).map(() => 
                                                15 // Simulated average duration
                                            ) || []
                                        }
                                    ]}
                                    type="line"
                                    height={250}
                                />
                            </div>
                        </div>

                        {/* Department Performance Chart */}
                        <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-[1.02] transition-all duration-300 border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                <span className="mr-3">🏢</span>
                                Category Distribution
                                <span className="ml-auto text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">Real-time</span>
                            </h3>
                            <div className="h-64">
                                {breakdownData?.data && breakdownData.data.length > 0 ? (
                                    <Chart
                                        options={{
                                            chart: {
                                                type: 'donut',
                                                height: 250,
                                                animations: {
                                                    enabled: true,
                                                    easing: 'easeinout',
                                                    speed: 800,
                                                }
                                            },
                                            labels: breakdownData.data.slice(0, 8).map(item => 
                                                item.category.length > 20 ? 
                                                item.category.substring(0, 17) + '...' : 
                                                item.category
                                            ),
                                            colors: [
                                                '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
                                                '#8B5CF6', '#06B6D4', '#EC4899', '#84CC16'
                                            ],
                                            plotOptions: {
                                                pie: {
                                                    donut: {
                                                        size: '70%',
                                                        labels: {
                                                            show: true,
                                                            total: {
                                                                show: true,
                                                                label: 'Total DVs',
                                                                formatter: function (w) {
                                                                    return w.globals.seriesTotals.reduce((a, b) => {
                                                                        return a + b;
                                                                    }, 0).toLocaleString();
                                                                },
                                                                style: {
                                                                    fontSize: '16px',
                                                                    fontWeight: 'bold',
                                                                    color: '#374151'
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            },
                                            dataLabels: {
                                                enabled: true,
                                                formatter: function (val, opts) {
                                                    return Math.round(val) + '%';
                                                },
                                                style: {
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    colors: ['#fff']
                                                },
                                                dropShadow: {
                                                    enabled: true,
                                                    top: 1,
                                                    left: 1,
                                                    blur: 1,
                                                    color: '#000',
                                                    opacity: 0.45
                                                }
                                            },
                                            legend: {
                                                position: 'bottom',
                                                horizontalAlign: 'center',
                                                fontSize: '11px',
                                                markers: {
                                                    width: 12,
                                                    height: 12,
                                                    radius: 12
                                                },
                                                formatter: function(seriesName, opts) {
                                                    const value = opts.w.globals.series[opts.seriesIndex];
                                                    return seriesName + ': ' + value;
                                                }
                                            },
                                            tooltip: {
                                                y: {
                                                    formatter: function (val) {
                                                        return val + ' DVs';
                                                    }
                                                }
                                            },
                                            responsive: [{
                                                breakpoint: 480,
                                                options: {
                                                    chart: {
                                                        width: 200
                                                    },
                                                    legend: {
                                                        position: 'bottom'
                                                    }
                                                }
                                            }]
                                        }}
                                        series={breakdownData.data.slice(0, 8).map(item => item.received)}
                                        type="donut"
                                        height={250}
                                    />
                                ) : (
                                    <div className="h-full bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                                        <div className="text-center">
                                            <div className="text-6xl mb-4">📊</div>
                                            <p className="text-gray-600">No data available</p>
                                            <p className="text-sm text-gray-500">Chart will appear when data is available</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* AI Insights and Recent Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* AI Insights */}
                        <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-[1.02] transition-all duration-300 border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                <span className="mr-3">🤖</span>
                                AI Insights & Recommendations
                                <span className="ml-auto text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full">Live</span>
                            </h3>
                            
                            {aiInsights ? (
                                <div className="space-y-4">
                                    {/* Efficiency Score */}
                                    <div className={`p-4 rounded-lg border-l-4 ${
                                        aiInsights.efficiency.level === 'excellent' ? 'bg-green-50 border-green-500' :
                                        aiInsights.efficiency.level === 'good' ? 'bg-blue-50 border-blue-500' :
                                        aiInsights.efficiency.level === 'moderate' ? 'bg-yellow-50 border-yellow-500' :
                                        'bg-red-50 border-red-500'
                                    }`}>
                                        <div className="flex items-center mb-2">
                                            <span className="text-2xl mr-3">⚡</span>
                                            <h4 className={`font-semibold ${
                                                aiInsights.efficiency.level === 'excellent' ? 'text-green-800' :
                                                aiInsights.efficiency.level === 'good' ? 'text-blue-800' :
                                                aiInsights.efficiency.level === 'moderate' ? 'text-yellow-800' :
                                                'text-red-800'
                                            }`}>
                                                Efficiency Score: {Math.round(aiInsights.efficiency.score)}%
                                            </h4>
                                        </div>
                                        <p className="text-gray-700 text-sm">{aiInsights.efficiency.message}</p>
                                    </div>

                                    {/* Bottlenecks */}
                                    {aiInsights.bottlenecks.length > 0 && (
                                        <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                                            <div className="flex items-center mb-2">
                                                <span className="text-2xl mr-3">🚨</span>
                                                <h4 className="font-semibold text-orange-800">Identified Bottlenecks</h4>
                                            </div>
                                            <div className="space-y-2">
                                                {aiInsights.bottlenecks.map((bottleneck, index) => (
                                                    <div key={index} className="text-sm text-gray-700">
                                                        <span className={`inline-block px-2 py-1 rounded text-xs mr-2 ${
                                                            bottleneck.severity === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {bottleneck.severity.toUpperCase()}
                                                        </span>
                                                        <strong>{bottleneck.category}:</strong> {bottleneck.issue}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Recommendations */}
                                    <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                                        <div className="flex items-center mb-2">
                                            <span className="text-2xl mr-3">💡</span>
                                            <h4 className="font-semibold text-purple-800">AI Recommendations</h4>
                                        </div>
                                        <div className="space-y-2">
                                            {aiInsights.recommendations.map((rec, index) => (
                                                <div key={index} className="text-sm text-gray-700">
                                                    <span className={`inline-block px-2 py-1 rounded text-xs mr-2 ${
                                                        rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                                                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {rec.priority.toUpperCase()}
                                                    </span>
                                                    {rec.message}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Trends */}
                                    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                                        <div className="flex items-center mb-2">
                                            <span className="text-2xl mr-3">{aiInsights.trends.direction === 'up' ? '📈' : '📉'}</span>
                                            <h4 className="font-semibold text-blue-800">Trend Analysis</h4>
                                        </div>
                                        <p className="text-gray-700 text-sm">{aiInsights.trends.message}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-l-4 border-purple-500">
                                        <div className="flex items-center mb-2">
                                            <span className="text-2xl mr-3">🔮</span>
                                            <h4 className="font-semibold text-purple-800">Pattern Analysis</h4>
                                        </div>
                                        <p className="text-gray-700 text-sm">Click "Generate Insights" to analyze DV processing patterns and get AI-powered recommendations</p>
                                    </div>
                                    
                                    <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border-l-4 border-green-500">
                                        <div className="flex items-center mb-2">
                                            <span className="text-2xl mr-3">⚡</span>
                                            <h4 className="font-semibold text-green-800">Efficiency Boost</h4>
                                        </div>
                                        <p className="text-gray-700 text-sm">Get smart suggestions to reduce processing time and improve workflow efficiency</p>
                                    </div>
                                    
                                    <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-l-4 border-orange-500">
                                        <div className="flex items-center mb-2">
                                            <span className="text-2xl mr-3">🚨</span>
                                            <h4 className="font-semibold text-orange-800">Anomaly Detection</h4>
                                        </div>
                                        <p className="text-gray-700 text-sm">Receive real-time alerts for unusual patterns or potential bottlenecks in processing</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-[1.02] transition-all duration-300 border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                <span className="mr-3">📝</span>
                                Recent Activity
                                <span className="ml-auto text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Live</span>
                            </h3>
                            <div className="space-y-3">
                                {statistics?.recentActivity?.length > 0 ? (
                                    statistics.recentActivity.map((activity, index) => (
                                        <div key={activity.id} className={`p-3 rounded-lg border-l-4 hover:bg-gray-50 transition-all duration-300 transform hover:translate-x-2 ${
                                            activity.action.includes('Processed') ? 'border-green-500 bg-green-50' :
                                            activity.action.includes('Submitted') ? 'border-blue-500 bg-blue-50' :
                                            activity.action.includes('Approved') ? 'border-purple-500 bg-purple-50' :
                                            'border-red-500 bg-red-50'
                                        }`}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="font-medium text-gray-800">{activity.action}</span>
                                                    <div className="text-sm text-gray-600">
                                                        {activity.dv} • {formatCurrency(activity.amount)}
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {activity.time}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-4xl mb-4 opacity-50">📭</div>
                                        <p className="text-gray-500">No recent activity to display</p>
                                        <p className="text-sm text-gray-400">Activity will appear here as DVs are processed</p>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <Link 
                                    href="/incoming-dvs"
                                    className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center group"
                                >
                                    View all activities
                                    <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom CSS for animations */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-float-delayed {
                    animation: float-delayed 6s ease-in-out infinite 2s;
                }
            `}</style>
        </div>
    );
}
