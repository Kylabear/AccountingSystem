import { Link, usePage } from '@inertiajs/react';

export default function LandingPage() {
    const user = usePage().props.auth.user;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-green-100 relative overflow-hidden">
            {/* Animated Accounting Icons - scattered around the page */}
            <div className="fixed inset-0 pointer-events-none z-10 opacity-10">
                {/* Top-left: Calculator icon */}
                <div className="absolute" style={{
                    left: '12%',
                    top: '18%'
                }}>
                    <svg className="w-8 h-8 text-green-400 animate-float" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 4a1 1 0 011 1v6a1 1 0 11-2 0V9a1 1 0 011-1zM7 8a1 1 0 000 2h2a1 1 0 100-2H7zm0 4a1 1 0 100 2h2a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                </div>

                {/* Top-right: Dollar sign */}
                <div className="absolute" style={{
                    right: '18%',
                    top: '12%'
                }}>
                    <svg className="w-7 h-7 text-yellow-400 animate-float-delayed" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                </div>

                {/* Mid-left: Chart icon */}
                <div className="absolute" style={{
                    left: '5%',
                    top: '35%'
                }}>
                    <svg className="w-9 h-9 text-blue-400 animate-float" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                </div>

                {/* Mid-right: Receipt/Document icon */}
                <div className="absolute" style={{
                    right: '8%',
                    top: '28%'
                }}>
                    <svg className="w-6 h-6 text-purple-400 animate-float-delayed" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                </div>

                {/* Center-left: Coins/Money icon */}
                <div className="absolute" style={{
                    left: '15%',
                    top: '55%'
                }}>
                    <svg className="w-8 h-8 text-amber-400 animate-float" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                    </svg>
                </div>

                {/* Center-right: Ledger/Book icon */}
                <div className="absolute" style={{
                    right: '12%',
                    top: '60%'
                }}>
                    <svg className="w-7 h-7 text-red-400 animate-float-delayed" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                </div>

                {/* Bottom-left: Balance/Scale icon */}
                <div className="absolute animate-float-delayed" style={{
                    left: '20%',
                    bottom: '22%'
                }}>
                    <svg className="w-6 h-6 text-indigo-500 animate-float" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 14a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 7.618V16h2a1 1 0 110 2H7a1 1 0 110-2h2V7.618L6.237 6.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 14a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                </div>

                {/* Bottom-right: Tax/Percentage icon */}
                <div className="absolute animate-float" style={{
                    right: '25%',
                    bottom: '18%'
                }}>
                    <svg className="w-8 h-8 text-teal-500 animate-float-delayed" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                </div>

                {/* Additional scattered icons for better distribution */}
                {/* Top-center-left: Invoice icon */}
                <div className="absolute animate-float-delayed" style={{
                    left: '35%',
                    top: '8%'
                }}>
                    <svg className="w-5 h-5 text-gray-500 animate-float" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd" />
                    </svg>
                </div>

                {/* Mid-center: Briefcase icon */}
                <div className="absolute animate-float" style={{
                    left: '70%',
                    top: '40%'
                }}>
                    <svg className="w-6 h-6 text-emerald-500 animate-float-delayed" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zm4-3a1 1 0 00-1 1v1h2V4a1 1 0 00-1-1zM4 9a1 1 0 000 2v5a1 1 0 001 1h10a1 1 0 001-1v-5a1 1 0 100-2H4z" clipRule="evenodd" />
                    </svg>
                </div>

                {/* Bottom-center-left: Bank icon */}
                <div className="absolute animate-float-delayed" style={{
                    left: '40%',
                    bottom: '12%'
                }}>
                    <svg className="w-7 h-7 text-slate-500 animate-float" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>

            {/* Floating background elements - accounting themed */}
            <div className="absolute inset-0 overflow-hidden opacity-10">
                {/* Calculator icon */}
                <div className="absolute top-10 left-10 text-green-300 opacity-5 animate-float">
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 4a1 1 0 011 1v6a1 1 0 11-2 0V9a1 1 0 011-1zM7 8a1 1 0 000 2h2a1 1 0 100-2H7zm0 4a1 1 0 100 2h2a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                </div>
                
                {/* Dollar sign icon */}
                <div className="absolute top-32 right-20 text-yellow-400 opacity-5 animate-float-delayed">
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                </div>
                
                {/* Chart/Graph icon */}
                <div className="absolute bottom-20 left-32 text-green-400 opacity-5 animate-float">
                    <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                </div>
                
                {/* Document/Receipt icon */}
                <div className="absolute bottom-40 right-16 text-yellow-300 opacity-5 animate-float-delayed">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                </div>
                
                {/* Coins icon */}
                <div className="absolute top-1/2 right-32 text-green-200 opacity-5 animate-float">
                    <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
            {/* Fixed Header - Always visible while scrolling */}
            <div className="bg-green-700 text-white p-4 flex items-center justify-between shadow-xl backdrop-blur-sm bg-opacity-95 header-fixed">
                <div className="flex items-center">
                    <Link 
                        href="/"
                        className="flex items-center hover:scale-105 transition-all duration-300"
                    >
                        <img 
                            src="/DALOGO.png" 
                            alt="DA Logo" 
                            className="w-16 h-16 mr-4 object-contain drop-shadow-lg"
                        />
                        <Link 
                            href="/incoming-dvs"
                            className="text-lg lg:text-2xl font-bold text-yellow-400 hover:text-yellow-300 transition-colors duration-200 cursor-pointer"
                            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
                        >
                            DA-CAR Accounting Section Monitoring System
                        </Link>
                    </Link>
                </div>
                <div className="flex items-center space-x-4">
                    <Link
                        href="/statistics"
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800 transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:-translate-y-1 group flex items-center"
                    >
                        <span className="group-hover:animate-bounce mr-2">📊</span>
                        <span className="group-hover:scale-105 transition-transform duration-200">Statistics</span>
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
                        className="hover:opacity-80 transition-all duration-300 transform hover:scale-110 hover:rotate-3 group"
                    >
                        <img 
                            src={user?.profile_image ? `/storage/${user.profile_image}` : '/default-profile.png'} 
                            alt="Profile" 
                            className="w-12 h-12 rounded-full object-cover border-2 border-yellow-400 group-hover:border-yellow-300 transition-all duration-300 shadow-lg group-hover:shadow-2xl"
                        />
                    </Link>
                </div>
            </div>

            {/* Main content area with aurora background pattern */}
            <div className="relative aurora-background min-h-screen content-with-header bg-gradient-to-br from-blue-200/20 via-purple-200/15 to-green-200/25">
                {/* Aurora overlay effects */}
                <div className="aurora-waves bg-gradient-to-r from-blue-400/30 via-purple-400/20 to-green-400/30"></div>
                <div className="aurora-overlay bg-gradient-to-br from-cyan-300/20 via-indigo-300/15 to-emerald-300/25"></div>
                <div className="aurora-particles"></div>
                
                {/* Background pattern overlay */}
                <div className="absolute inset-0 opacity-10 bg-repeat z-10" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>

                <div className="relative z-20 max-w-6xl mx-auto px-8 py-8">
                    {/* Welcome section with APP logo and greeting */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center mb-2">
                            <img 
                                src="/APPLOGO.png" 
                                alt="DA App Logo" 
                                className="w-58 h-58 object-contain hover:scale-105 transition-transform duration-500 drop-shadow-lg"
                            />
                        </div>
                        
                        <h2 className="text-8xl font-bold mb-3 animate-fade-in text-white drop-shadow-lg">
                            Hello, <span className="text-yellow-400 hover:text-yellow-300 transition-colors duration-300 cursor-default drop-shadow-lg">{user?.first_name || user?.name || 'User'}</span>!
                        </h2>
                        
                        <p className="text-lg text-gray-100 max-w-2xl mx-auto leading-relaxed hover:text-white transition-colors duration-300 cursor-default drop-shadow-md">
                            Welcome to your comprehensive document tracking and monitoring dashboard. 
                            Manage all your accounting documents with ease and efficiency.
                        </p>
                    </div>

                    {/* Navigation cards matching the prototype */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                        {/* Incoming DVs Card */}
                        <Link
                            href={route('incoming-dvs')}
                            className="group bg-white/20 backdrop-blur-6xl rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 p-6 text-center border border-white/30 hover:border-green-400/50 cursor-pointer hover:bg-white/30 relative overflow-hidden"
                        >
                            {/* Glass effect overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
                            <div className="relative z-10">
                                <div className="bg-green-600/80 backdrop-blur-sm rounded-2xl p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center group-hover:bg-green-500/90 transition-all duration-300 group-hover:scale-110 transform group-hover:rotate-3 shadow-lg">
                                    <svg className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-bold text-white group-hover:text-green-300 transition-colors duration-300 drop-shadow-lg">
                                    Incoming DVs
                                </h3>
                                <p className="text-xs text-gray-200 mt-1 group-hover:text-green-200 transition-colors duration-300 drop-shadow-md">
                                    Track and manage disbursement vouchers
                                </p>
                            </div>
                        </Link>

                        {/* POs, JOs, MOAs, Contracts Card */}
                        <div className="group bg-white/10 backdrop-blur-3xl rounded-2xl shadow-lg p-6 text-center border border-white/20 opacity-60 cursor-not-allowed hover:opacity-80 transition-all duration-300 relative overflow-hidden">
                            {/* Glass effect overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
                            <div className="relative z-10">
                                <div className="bg-gray-500/60 backdrop-blur-sm rounded-2xl p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center shadow-lg">
                                    <svg className="w-8 h-8 text-white/80" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-bold text-white/80 drop-shadow-lg">
                                    POs, JOs, MOAs, Contracts
                                </h3>
                                <p className="text-xs text-gray-300/80 mt-1 drop-shadow-md">
                                    Coming soon
                                </p>
                            </div>
                        </div>

                        {/* Other Documents Card */}
                        <div className="group bg-white/10 backdrop-blur-3xl rounded-2xl shadow-lg p-6 text-center border border-white/20 opacity-60 cursor-not-allowed hover:opacity-80 transition-all duration-300 relative overflow-hidden">
                            {/* Glass effect overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
                            <div className="relative z-10">
                                <div className="bg-gray-500/60 backdrop-blur-sm rounded-2xl p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center shadow-lg">
                                    <svg className="w-8 h-8 text-white/80" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-bold text-white/80 drop-shadow-lg">
                                    Other Documents
                                </h3>
                                <p className="text-xs text-gray-300/80 mt-1 drop-shadow-md">
                                    Coming soon
                                </p>
                            </div>
                        </div>

                        {/* Reports Card */}
                        <div className="group bg-white/10 backdrop-blur-3xl rounded-2xl shadow-lg p-6 text-center border border-white/20 opacity-60 cursor-not-allowed hover:opacity-80 transition-all duration-300 relative overflow-hidden">
                            {/* Glass effect overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
                            <div className="relative z-10">
                                <div className="bg-gray-500/60 backdrop-blur-sm rounded-2xl p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center shadow-lg">
                                    <svg className="w-8 h-8 text-white/80" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-bold text-white/80 drop-shadow-lg">
                                    Reports
                                </h3>
                                <p className="text-xs text-gray-300/80 mt-1 drop-shadow-md">
                                    Coming soon
                                </p>
                            </div>
                        </div>
                    </div>


                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    33% { transform: translateY(-10px) rotate(2deg); }
                    66% { transform: translateY(5px) rotate(-1deg); }
                }
                
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    33% { transform: translateY(8px) rotate(-2deg); }
                    66% { transform: translateY(-12px) rotate(1deg); }
                }
                
                @keyframes gentle-pulse {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.05); }
                }
                
                .animate-fade-in {
                    animation: fade-in 1s ease-out;
                }
                
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                
                .animate-float-delayed {
                    animation: float-delayed 8s ease-in-out infinite;
                }
                
                .animate-gentle-pulse {
                    animation: gentle-pulse 3s ease-in-out infinite;
                }
                
                // ...existing code...
            `}</style>
             {/* Modern Glassy Footer - Landing Page Only */}
            <footer className="relative mt-8 bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-md border-t border-white/20 shadow-2xl">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-blue-50/20 to-purple-50/30 animate-gradient"></div>
                
                <div className="relative z-10 max-w-5xl mx-auto px-6 py-6">
                    <div className="flex justify-center">
                        {/* DA-CAR Info and Contact - Centered */}
                        <div className="space-y-4 max-w-lg">
                            {/* DA-CAR Info */}
                            <div className="flex items-center group">
                                <img 
                                    src="/DALOGO.png" 
                                    alt="DA Logo" 
                                    className="w-16 h-16 mr-4 object-contain drop-shadow-lg group-hover:rotate-12 group-hover:scale-110 transition-all duration-500"
                                />
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800 group-hover:text-green-700 transition-colors duration-300">
                                        DA-CAR Accounting Section
                                    </h3>
                                    <p className="text-gray-600 font-medium">Monitoring System</p>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-3">
                                <h4 className="text-base font-semibold text-gray-800 flex items-center">
                                    <span className="mr-2">📞</span>
                                    Contact Information
                                </h4>
                                
                                {/* Emails */}
                                <div className="space-y-2">
                                    <a 
                                        href="mailto:accounting@car.da.gov.ph" 
                                        className="flex items-center text-gray-700 hover:text-green-600 transition-all duration-300 transform hover:scale-105 hover:translate-x-2 group"
                                        title="Send email to accounting@car.da.gov.ph"
                                    >
                                        <span className="mr-3 text-green-600 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">✉️</span>
                                        <span className="font-medium text-sm">accounting@car.da.gov.ph</span>
                                    </a>
                                    <a 
                                        href="mailto:darfocaracctg@gmail.com" 
                                        className="flex items-center text-gray-700 hover:text-green-600 transition-all duration-300 transform hover:scale-105 hover:translate-x-2 group"
                                        title="Send email to darfocaracctg@gmail.com"
                                    >
                                        <span className="mr-3 text-green-600 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">✉️</span>
                                        <span className="font-medium text-sm">darfocaracctg@gmail.com</span>
                                    </a>
                                </div>

                                {/* Location */}
                                <a 
                                    href="https://maps.app.goo.gl/WM4hep4sA7ZALhBE7" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-start text-gray-700 hover:text-blue-600 transition-all duration-300 transform hover:scale-105 hover:translate-x-2 group"
                                    title="View location on Google Maps"
                                >
                                    <span className="mr-3 text-blue-600 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 mt-1">📍</span>
                                    <div>
                                        <div className="font-medium text-sm">CHFQ+989, Easter Rd</div>
                                        <div className="text-xs text-gray-600">Baguio, 2600 Benguet</div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Copyright Section */}
                    <div className="mt-6 pt-4 border-t border-white/20 text-center">
                        <p className="text-gray-600 text-xs font-medium">
                            © 2025 DA-CAR Accounting Section. All rights reserved.
                        </p>
                    </div>
                </div>  
            </footer>
        </div>
    );
}
