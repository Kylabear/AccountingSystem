import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children, backgroundImage = null }) {
    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Dark Green with DA Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-800 to-green-900 relative overflow-hidden group">
                {/* Background Image with Green Overlay */}
                {backgroundImage && (
                    <div 
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 group-hover:opacity-30 transition-all duration-1000"
                        style={{
                            backgroundImage: `url('/${backgroundImage}')`,
                            filter: 'hue-rotate(120deg) saturate(0.8) brightness(0.7)'
                        }}
                    ></div>
                )}
                
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Accounting-related floating icons in better positions */}
                    <div className="absolute top-20 right-16 text-white opacity-10 animate-float">
                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                        </svg>
                    </div>
                    <div className="absolute bottom-24 left-12 text-white opacity-8 animate-float-delayed">
                        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="absolute top-2/3 right-8 text-white opacity-6 animate-float-slow">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
                
                {/* Background Pattern/Texture */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-black/20"></div>
                    {/* Decorative accounting elements */}
                    <div className="absolute top-20 left-10 text-white opacity-30 transform hover:scale-110 hover:rotate-12 transition-all duration-500 animate-float-slow">
                        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                        </svg>
                    </div>
                    <div className="absolute bottom-32 right-16 text-white opacity-20 transform hover:scale-110 hover:-rotate-12 transition-all duration-500 animate-float-delayed">
                        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 4a1 1 0 011 1v6a1 1 0 11-2 0V9a1 1 0 011-1zM7 8a1 1 0 000 2h2a1 1 0 100-2H7zm0 4a1 1 0 100 2h2a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                    </div>
                    
                    {/* Additional floating elements */}
                    <div className="absolute top-1/2 left-20 text-white opacity-15 animate-bounce-slow">
                        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
                
                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-white transform group-hover:scale-105 transition-all duration-700">
                    {/* DA Logo */}
                    <div className="mb-8 transform hover:rotate-6 hover:scale-110 transition-all duration-500 animate-glow">
                        <img 
                            src="/DALOGO.png" 
                            alt="DA Logo" 
                            className="w-32 h-32 object-contain drop-shadow-xl filter hover:brightness-110 transition-all duration-300"
                        />
                    </div>
                    
                    {/* Department Title */}
                    <div className="text-center mb-8 animate-slide-in-left">
                        <h1 className="text-4xl font-bold mb-4 tracking-wide transform hover:scale-105 transition-all duration-300 animate-text-shimmer">
                            ACCOUNTING DEPARTMENT
                        </h1>
                        <div className="w-24 h-1 bg-white/60 mx-auto mb-6 transform hover:w-32 transition-all duration-500"></div>
                    </div>
                    
                    {/* Encoded Text Pattern (mimicking the design) */}
                    <div className="text-xs font-mono opacity-30 text-center leading-tight tracking-wider animate-fade-in-up hover:opacity-50 transition-opacity duration-500">
                        JHVMGJRJVSKDJNHCSJDVMVSIHHHIJHIHIJHHECDJVHSDJKDNV<br/>
                        NJKJFQADJKYFBSDSHNFHFNVIMTGBBBDJKFGFPQMSGJDNGVNG<br/>
                        NJMVVKSLDKWDJGNCJK.SDJVPDIJHGXYVMCYVOGJXRNG<br/>
                        VNMKFGMVVAHGDVEKSDNPGDGYNKCIMFMJNJKGYGV
                    </div>
                </div>
            </div>

            {/* Right Panel - White Form Area */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-white relative overflow-hidden group">
                {/* Subtle animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-green-50 opacity-50 group-hover:opacity-70 transition-opacity duration-1000"></div>
                
                {/* Mobile Logo (shown only on small screens) */}
                <div className="lg:hidden absolute top-8 left-1/2 transform -translate-x-1/2 animate-bounce-gentle">
                    <img 
                        src="/DALOGO.png" 
                        alt="DA Logo" 
                        className="w-16 h-16 object-contain"
                    />
                </div>
                
                {/* Form Container */}
                <div className="w-full max-w-md px-8 py-12 lg:py-8 relative z-10">
                    {/* System Branding Header */}
                    <div className="text-center mb-8 animate-slide-in-right">
                        <div className="flex items-center justify-center mb-4">
                            {/* Accounting Tracker Logo */}
                            <img 
                                src="/APPLOGO.png" 
                                alt="Accounting Tracker" 
                                className="h-16 object-contain transform hover:scale-110 hover:rotate-3 transition-all duration-500"
                            />
                        </div>
                        <h2 className="text-3xl font-bold text-green-800 mb-2 transform hover:scale-105 transition-all duration-300">
                            WELCOME TO DA-CAR
                        </h2>
                        <h3 className="text-lg font-semibold text-green-700 mb-1 animate-slide-in-right-delayed">
                            ACCOUNTING SECTION
                        </h3>
                        <h4 className="text-lg font-semibold text-green-700 animate-slide-in-right-delayed">
                            MONITORING SYSTEM
                        </h4>
                    </div>

                    {/* Form Content */}
                    <div className="animate-slideInUp transform hover:scale-[1.02] transition-all duration-300">
                        {children}
                    </div>
                </div>
            </div>

            {/* Custom animations */}
            <style jsx>{`
                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                
                @keyframes slideInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    33% { transform: translateY(-10px) rotate(2deg); }
                    66% { transform: translateY(5px) rotate(-1deg); }
                }
                
                @keyframes floatDelayed {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    33% { transform: translateY(8px) rotate(-2deg); }
                    66% { transform: translateY(-12px) rotate(1deg); }
                }
                
                @keyframes floatSlow {
                    0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
                    50% { transform: translateY(-15px) rotate(3deg) scale(1.05); }
                }
                
                @keyframes bounceGentle {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-5px); }
                }
                
                @keyframes bounceSlow {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    50% { transform: translateY(-8px) scale(1.02); }
                }
                
                @keyframes pulseSlow {
                    0%, 100% { opacity: 0.1; transform: scale(1); }
                    50% { opacity: 0.2; transform: scale(1.05); }
                }
                
                @keyframes pulseSlower {
                    0%, 100% { opacity: 0.15; transform: scale(1); }
                    50% { opacity: 0.25; transform: scale(1.02); }
                }
                
                @keyframes glow {
                    0%, 100% { filter: drop-shadow(0 0 5px rgba(255,255,255,0.3)); }
                    50% { filter: drop-shadow(0 0 20px rgba(255,255,255,0.6)) drop-shadow(0 0 30px rgba(255,255,255,0.4)); }
                }
                
                @keyframes textShimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                
                .animate-slideInUp {
                    animation: slideInUp 0.8s ease-out;
                }
                
                .animate-slide-in-left {
                    animation: slideInLeft 1s ease-out;
                }
                
                .animate-slide-in-left-delayed {
                    animation: slideInLeft 1.2s ease-out 0.3s both;
                }
                
                .animate-slide-in-right {
                    animation: slideInRight 1s ease-out;
                }
                
                .animate-slide-in-right-delayed {
                    animation: slideInRight 1.2s ease-out 0.2s both;
                }
                
                .animate-fade-in-up {
                    animation: fadeInUp 1.5s ease-out 0.5s both;
                }
                
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                
                .animate-float-delayed {
                    animation: floatDelayed 8s ease-in-out infinite;
                }
                
                .animate-float-slow {
                    animation: floatSlow 10s ease-in-out infinite;
                }
                
                .animate-bounce-gentle {
                    animation: bounceGentle 2s ease-in-out infinite;
                }
                
                .animate-bounce-slow {
                    animation: bounceSlow 4s ease-in-out infinite;
                }
                
                .animate-pulse-slow {
                    animation: pulseSlow 4s ease-in-out infinite;
                }
                
                .animate-pulse-slower {
                    animation: pulseSlower 6s ease-in-out infinite;
                }
                
                .animate-glow {
                    animation: glow 3s ease-in-out infinite;
                }
                
                .animate-text-shimmer {
                    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%);
                    background-size: 200% 100%;
                    animation: textShimmer 3s ease-in-out infinite;
                    -webkit-background-clip: text;
                    background-clip: text;
                }
            `}</style>
        </div>
    );
}
