import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function StatisticsPage() {
    const user = usePage().props.auth.user;
    const [selectedPeriod, setSelectedPeriod] = useState('monthly');
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [animatedCards, setAnimatedCards] = useState(false);

    // Mock data for demonstration
    const mockStats = {
        totalDVs: 1247,
        pendingDVs: 89,
        processedDVs: 1158,
        totalAmount: 15420000.50,
        averageProcessingTime: 3.2,
        departments: ['All Departments', 'Finance', 'HR', 'Operations', 'IT', 'Procurement'],
        recentActivity: [
            { id: 1, action: 'DV Processed', dv: 'DV-2024-001', amount: 45000, time: '2 minutes ago' },
            { id: 2, action: 'DV Submitted', dv: 'DV-2024-002', amount: 32000, time: '15 minutes ago' },
            { id: 3, action: 'DV Approved', dv: 'DV-2024-003', amount: 78000, time: '1 hour ago' },
            { id: 4, action: 'DV Rejected', dv: 'DV-2024-004', amount: 12000, time: '2 hours ago' },
        ]
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
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

            {/* Fixed Header - Always visible while scrolling */}
            <div className="bg-green-700 text-white p-6 shadow-2xl backdrop-blur-sm bg-opacity-95 header-fixed">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center group">
                        <Link 
                            href="/"
                            className="flex items-center hover:scale-105 transition-all duration-300"
                        >
                            <img 
                                src="/DALOGO.png" 
                                alt="DA Logo" 
                                className="w-12 h-12 mr-3 object-contain drop-shadow-lg"
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
                            <span className="group-hover:animate-pulse">Logout</span>
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
            <div className="content-with-header relative z-10">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    
                    {/* Filters Section */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 transform hover:scale-[1.02] transition-all duration-300 border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mr-3">📊</span>
                            Analytics Filters
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {/* Period Filter */}
                            <div className="group">
                                <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-green-600 transition-colors">
                                    Time Period
                                </label>
                                <select 
                                    value={selectedPeriod}
                                    onChange={(e) => setSelectedPeriod(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white hover:border-green-400"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="quarterly">Quarterly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>

                            {/* Department Filter */}
                            <div className="group">
                                <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-green-600 transition-colors">
                                    Department
                                </label>
                                <select 
                                    value={selectedDepartment}
                                    onChange={(e) => setSelectedDepartment(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white hover:border-green-400"
                                >
                                    {mockStats.departments.map((dept, index) => (
                                        <option key={index} value={dept.toLowerCase().replace(' ', '-')}>
                                            {dept}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* AI Analysis Button */}
                            <div className="group">
                                <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-purple-600 transition-colors">
                                    AI Analysis
                                </label>
                                <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center justify-center">
                                    <span className="mr-2">🤖</span>
                                    Generate Insights
                                </button>
                            </div>

                            {/* Export Button */}
                            <div className="group">
                                <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-orange-600 transition-colors">
                                    Export Data
                                </label>
                                <button className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center justify-center">
                                    <span className="mr-2">📄</span>
                                    Export Report
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Key Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Total DVs */}
                        <div className={`bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl p-6 shadow-lg transform transition-all duration-700 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl ${animatedCards ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-4xl opacity-80">📋</div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold">{mockStats.totalDVs.toLocaleString()}</div>
                                    <div className="text-blue-200 text-sm">Total DVs</div>
                                </div>
                            </div>
                            <div className="text-blue-200 text-sm">
                                <span className="text-green-300">↗ +12.5%</span> from last month
                            </div>
                        </div>

                        {/* Pending DVs */}
                        <div className={`bg-gradient-to-br from-yellow-500 to-orange-600 text-white rounded-xl p-6 shadow-lg transform transition-all duration-700 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl ${animatedCards ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: '100ms' }}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-4xl opacity-80">⏳</div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold">{mockStats.pendingDVs}</div>
                                    <div className="text-orange-200 text-sm">Pending DVs</div>
                                </div>
                            </div>
                            <div className="text-orange-200 text-sm">
                                <span className="text-red-300">↗ +5.2%</span> from last week
                            </div>
                        </div>

                        {/* Processed DVs */}
                        <div className={`bg-gradient-to-br from-green-500 to-green-700 text-white rounded-xl p-6 shadow-lg transform transition-all duration-700 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl ${animatedCards ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: '200ms' }}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-4xl opacity-80">✅</div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold">{mockStats.processedDVs.toLocaleString()}</div>
                                    <div className="text-green-200 text-sm">Processed DVs</div>
                                </div>
                            </div>
                            <div className="text-green-200 text-sm">
                                <span className="text-lime-300">↗ +8.1%</span> from last month
                            </div>
                        </div>

                        {/* Total Amount */}
                        <div className={`bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-xl p-6 shadow-lg transform transition-all duration-700 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl ${animatedCards ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: '300ms' }}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-4xl opacity-80">💰</div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold">{formatCurrency(mockStats.totalAmount)}</div>
                                    <div className="text-purple-200 text-sm">Total Amount</div>
                                </div>
                            </div>
                            <div className="text-purple-200 text-sm">
                                <span className="text-green-300">↗ +15.3%</span> from last month
                            </div>
                        </div>
                    </div>

                    {/* Charts and Analytics Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Processing Trends Chart Placeholder */}
                        <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-[1.02] transition-all duration-300 border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                <span className="mr-3">📈</span>
                                Processing Trends
                                <span className="ml-auto text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">AI Ready</span>
                            </h3>
                            <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                                <div className="text-center">
                                    <div className="text-6xl mb-4 animate-pulse">📊</div>
                                    <p className="text-gray-600">Interactive Chart Coming Soon</p>
                                    <p className="text-sm text-gray-500">AI-powered trend analysis will appear here</p>
                                </div>
                            </div>
                        </div>

                        {/* Department Performance Placeholder */}
                        <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-[1.02] transition-all duration-300 border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                <span className="mr-3">🏢</span>
                                Department Performance
                                <span className="ml-auto text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">Real-time</span>
                            </h3>
                            <div className="h-64 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                                <div className="text-center">
                                    <div className="text-6xl mb-4 animate-bounce">🎯</div>
                                    <p className="text-gray-600">Performance Metrics Loading...</p>
                                    <p className="text-sm text-gray-500">Department comparison and insights</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Insights and Recent Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* AI Insights Placeholder */}
                        <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-[1.02] transition-all duration-300 border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                <span className="mr-3">🤖</span>
                                AI Insights & Recommendations
                                <span className="ml-auto text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full">Beta</span>
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-l-4 border-purple-500">
                                    <div className="flex items-center mb-2">
                                        <span className="text-2xl mr-3 animate-pulse">🔮</span>
                                        <h4 className="font-semibold text-purple-800">Pattern Analysis</h4>
                                    </div>
                                    <p className="text-gray-700 text-sm">AI will analyze DV processing patterns and suggest optimizations</p>
                                </div>
                                
                                <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border-l-4 border-green-500">
                                    <div className="flex items-center mb-2">
                                        <span className="text-2xl mr-3 animate-pulse">⚡</span>
                                        <h4 className="font-semibold text-green-800">Efficiency Boost</h4>
                                    </div>
                                    <p className="text-gray-700 text-sm">Smart suggestions to reduce processing time and improve workflow</p>
                                </div>
                                
                                <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-l-4 border-orange-500">
                                    <div className="flex items-center mb-2">
                                        <span className="text-2xl mr-3 animate-pulse">🚨</span>
                                        <h4 className="font-semibold text-orange-800">Anomaly Detection</h4>
                                    </div>
                                    <p className="text-gray-700 text-sm">Real-time alerts for unusual patterns or potential issues</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-[1.02] transition-all duration-300 border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                <span className="mr-3">📝</span>
                                Recent Activity
                                <span className="ml-auto text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Live</span>
                            </h3>
                            <div className="space-y-3">
                                {mockStats.recentActivity.map((activity, index) => (
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
                                ))}
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
