import { Link, usePage } from '@inertiajs/react';

export default function LandingPage() {
    const user = usePage().props.auth.user;

    return (
        <div className="min-h-screen bg-gray-200 relative overflow-hidden">
            {/* Custom cursor effect */}
            <div className="fixed inset-0 pointer-events-none z-50">
                <div className="absolute w-6 h-6 bg-green-400 rounded-full opacity-20 animate-pulse" style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    animation: 'pulse 2s infinite'
                }}></div>
            </div>

            {/* Floating background elements - accounting themed */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Calculator icon */}
                <div className="absolute top-10 left-10 text-green-300 opacity-20 animate-float">
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 4a1 1 0 011 1v6a1 1 0 11-2 0V9a1 1 0 011-1zM7 8a1 1 0 000 2h2a1 1 0 100-2H7zm0 4a1 1 0 100 2h2a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                </div>
                
                {/* Dollar sign icon */}
                <div className="absolute top-32 right-20 text-yellow-400 opacity-20 animate-float-delayed">
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                </div>
                
                {/* Chart/Graph icon */}
                <div className="absolute bottom-20 left-32 text-green-400 opacity-20 animate-float">
                    <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                </div>
                
                {/* Document/Receipt icon */}
                <div className="absolute bottom-40 right-16 text-yellow-300 opacity-20 animate-float-delayed">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                </div>
                
                {/* Coins icon */}
                <div className="absolute top-1/2 right-32 text-green-200 opacity-15 animate-float">
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
                            className="text-xl font-bold text-yellow-400 hover:text-yellow-300 transition-colors duration-200 cursor-pointer"
                            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
                        >
                            Accounting Monitoring and Tracking System
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

            {/* Main content area with background pattern */}
            <div className="relative bg-gradient-to-br from-gray-100 to-gray-300 min-h-screen cursor-magic content-with-header">
                {/* Background pattern overlay */}
                <div className="absolute inset-0 opacity-10 bg-repeat" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>

                <div className="relative z-10 max-w-6xl mx-auto px-8 py-16">
                    {/* Welcome section with APP logo and greeting */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center justify-center mb-3">
                            <img 
                                src="/APPLOGO.png" 
                                alt="DA App Logo" 
                                className="w-72 h-72 object-contain hover:scale-105 transition-transform duration-500 drop-shadow-lg"
                            />
                        </div>
                        
                        <h2 className="text-4xl font-bold text-green-800 mb-4 animate-fade-in">
                            Hello, <span className="text-green-600 hover:text-green-700 transition-colors duration-300 cursor-default">{user?.first_name || user?.name || 'User'}</span>!
                        </h2>
                        
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed hover:text-gray-700 transition-colors duration-300 cursor-default">
                            Welcome to your comprehensive document tracking and monitoring dashboard. 
                            Manage all your accounting documents with ease and efficiency.
                        </p>
                    </div>

                    {/* Navigation cards matching the prototype */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
                        {/* Incoming DVs Card */}
                        <Link
                            href={route('incoming-dvs')}
                            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 text-center border border-gray-200 hover:border-green-300 cursor-pointer hover:bg-green-50"
                        >
                            <div className="bg-green-600 rounded-2xl p-6 mx-auto mb-6 w-20 h-20 flex items-center justify-center group-hover:bg-green-700 transition-all duration-300 group-hover:scale-110 transform group-hover:rotate-3">
                                <svg className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-green-600 transition-colors duration-300">
                                Incoming DVs
                            </h3>
                            <p className="text-sm text-gray-500 mt-2 group-hover:text-green-600 transition-colors duration-300">
                                Track and manage disbursement vouchers
                            </p>
                        </Link>

                        {/* POs, JOs, MOAs, Contracts Card */}
                        <div className="group bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-200 opacity-60 cursor-not-allowed hover:opacity-70 transition-opacity duration-300">
                            <div className="bg-gray-400 rounded-2xl p-6 mx-auto mb-6 w-20 h-20 flex items-center justify-center">
                                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-600">
                                POs, JOs, MOAs, Contracts
                            </h3>
                            <p className="text-sm text-gray-400 mt-2">
                                Coming soon
                            </p>
                        </div>

                        {/* Other Documents Card */}
                        <div className="group bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-200 opacity-60 cursor-not-allowed hover:opacity-70 transition-opacity duration-300">
                            <div className="bg-gray-400 rounded-2xl p-6 mx-auto mb-6 w-20 h-20 flex items-center justify-center">
                                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-600">
                                Other Documents
                            </h3>
                            <p className="text-sm text-gray-400 mt-2">
                                Coming soon
                            </p>
                        </div>

                        {/* Reports Card */}
                        <div className="group bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-200 opacity-60 cursor-not-allowed hover:opacity-70 transition-opacity duration-300">
                            <div className="bg-gray-400 rounded-2xl p-6 mx-auto mb-6 w-20 h-20 flex items-center justify-center">
                                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-600">
                                Reports
                            </h3>
                            <p className="text-sm text-gray-400 mt-2">
                                Coming soon
                            </p>
                        </div>
                    </div>

                    {/* Additional info section */}
                    <div className="text-center mt-16">
                        <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto border border-gray-200 hover:shadow-2xl transition-all duration-500 hover:scale-105">
                            <div className="flex items-center justify-center mb-4">
                                <div className="bg-green-100 rounded-full p-3 animate-gentle-pulse">
                                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-2 hover:text-green-600 transition-colors duration-300">
                                Streamlined Document Management
                            </h4>
                            <p className="text-gray-600 hover:text-gray-700 transition-colors duration-300">
                                Track your documents through every stage of the approval process with real-time updates and comprehensive audit trails.
                            </p>
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
                
                /* Custom cursor styles */
                .cursor-magic {
                    cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%23059669"><circle cx="12" cy="12" r="6" opacity="0.5"/><circle cx="12" cy="12" r="2"/></svg>'), auto;
                }
            `}</style>
        </div>
    );
}
