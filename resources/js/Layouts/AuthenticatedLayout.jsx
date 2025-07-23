import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import AnimatedBackground from '@/Components/AnimatedBackground';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen relative bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            {/* Animated Background */}
            <AnimatedBackground />
            
            <nav className="border-b border-gray-100 bg-white/90 backdrop-blur-sm relative z-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    Dashboard
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                            >
                                                {user.first_name || user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.show')}
                                        >
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Dashboard
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800">
                                {user.first_name || user.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.show')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>

            {/* Footer */}
            <footer className="bg-green-800 text-white py-8 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Department Info */}
                        <div className="text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start mb-4">
                                <img 
                                    src="/DALOGO.png" 
                                    alt="DA Logo" 
                                    className="w-12 h-12 mr-3 object-contain"
                                />
                                <h3 className="text-lg font-bold text-yellow-400">DA-CAR</h3>
                            </div>
                            <p className="text-green-200 text-sm leading-relaxed">
                                Department of Agriculture - Cordillera Administrative Region
                            </p>
                            <p className="text-green-200 text-sm mt-2">
                                Accounting Section Monitoring System
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div className="text-center">
                            <h4 className="text-lg font-semibold text-yellow-400 mb-4">Quick Links</h4>
                            <div className="space-y-2">
                                <Link 
                                    href={route('dashboard')}
                                    className="block text-green-200 hover:text-white transition-colors duration-300 text-sm"
                                >
                                    Dashboard
                                </Link>
                                <Link 
                                    href="/statistics"
                                    className="block text-green-200 hover:text-white transition-colors duration-300 text-sm"
                                >
                                    Statistics
                                </Link>
                                <Link 
                                    href={route('profile.show')}
                                    className="block text-green-200 hover:text-white transition-colors duration-300 text-sm"
                                >
                                    Profile
                                </Link>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="text-center md:text-right">
                            <h4 className="text-lg font-semibold text-yellow-400 mb-4">Contact Information</h4>
                            <div className="space-y-2 text-green-200 text-sm">
                                <p>📧 accounting@da-car.gov.ph</p>
                                <p>📞 (074) 444-4444</p>
                                <p>📍 DA-CAR Regional Office</p>
                                <p>Benguet State University Compound</p>
                                <p>La Trinidad, Benguet</p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Footer */}
                    <div className="border-t border-green-700 mt-8 pt-6 text-center">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <p className="text-green-200 text-sm">
                                © {new Date().getFullYear()} Department of Agriculture - CAR. All rights reserved.
                            </p>
                            <p className="text-green-200 text-sm mt-2 md:mt-0">
                                Developed with ❤️ for efficient financial monitoring
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
