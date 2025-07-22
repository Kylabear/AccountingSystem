import { Head, usePage, Link } from '@inertiajs/react';

export default function Dashboard() {
    const { props } = usePage();
    const user = props.auth.user;

    return (
        <>
            <Head title="Dashboard" />
            
            {/* Fixed Header - Completely locked outside of scroll area */}
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
                        href="/incoming-dvs/new"
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:-translate-y-1 group flex items-center"
                    >
                        <span className="mr-2 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-180">+</span>
                        <span className="group-hover:scale-105 transition-transform duration-200">Add Incoming DV</span>
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

            {/* Scrollable Content Area - Positioned below fixed header with aurora background */}
            <div className="min-h-screen aurora-background content-with-header">
                {/* Aurora overlay effects */}
                <div className="aurora-waves"></div>
                <div className="aurora-overlay"></div>
                <div className="aurora-particles"></div>
                
                <div className="py-12 relative z-10">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-6 text-gray-900">
                                <h1 className="text-lg font-bold">
                                    Hello, {user.first_name} {user.last_name}! Welcome to the DA-CAR Accounting Section Monitoring and Tracking System.
                                    <p>Role: {user.role}</p>
                                </h1>
                            </div>
                        </div>
                        
                        {/* Additional content to test scrolling */}
                        <div className="mt-8 space-y-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
                                <div key={item} className="bg-white shadow-sm sm:rounded-lg p-6">
                                    <h2 className="text-xl font-bold text-gray-800 mb-4">Section {item}</h2>
                                    <p className="text-gray-600 mb-4">
                                        This is test content to demonstrate that the header remains fixed while scrolling. 
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                                        incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis 
                                        nostrud exercitation ullamco laboris.
                                    </p>
                                    <p className="text-gray-600">
                                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore 
                                        eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, 
                                        sunt in culpa qui officia deserunt mollit anim id est laborum.
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Enhanced CSS animations */}
                    <style jsx>{`
                        @keyframes float {
                            0%, 100% { transform: translateY(0px) rotate(0deg); }
                            33% { transform: translateY(-20px) rotate(1deg); }
                            66% { transform: translateY(10px) rotate(-1deg); }
                        }
                        
                        @keyframes float-delayed {
                            0%, 100% { transform: translateY(0px) rotate(0deg); }
                            33% { transform: translateY(15px) rotate(-1deg); }
                            66% { transform: translateY(-25px) rotate(1deg); }
                        }
                        
                        .animate-float {
                            animation: float 8s ease-in-out infinite;
                        }
                        
                        .animate-float-delayed {
                            animation: float-delayed 10s ease-in-out infinite;
                        }
                    `}</style>
                </div>
            </div>
        </>
    );
}
