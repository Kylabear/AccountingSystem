import React from 'react';
import { Link } from '@inertiajs/react';

// Global header for all main pages
export default function AppHeader({ title = 'Statistics & Analytics', user }) {
    // Fallback for user prop to prevent blank header
    const safeUser = user || {};
    return (
        <div className="bg-green-700/90 backdrop-blur-sm text-white p-4 flex items-center justify-between header-fixed shadow-lg relative z-50">
            <div className="flex items-center">
                <Link 
                    href="/"
                    className="flex items-center hover:scale-105 transition-all duration-300"
                >
                    <img 
                        src="/DALOGO.png" 
                        alt="DA Logo" 
                        className="w-12 h-12 lg:w-16 lg:h-16 mr-6 object-contain drop-shadow-lg group-hover:rotate-12 transition-all duration-300"
                    />
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300">
                            {title}
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
                            src={safeUser.profile_image ? `/storage/${safeUser.profile_image}` : '/default-profile.png'} 
                            alt="Profile" 
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-yellow-400 shadow-lg"
                        />
                    </Link>
                </div>
            </div>
        </div>
    );
}
