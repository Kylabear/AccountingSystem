import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { CheckCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout backgroundImage="/images/LOG_BG.webp">
            <Head title="Email Verification" />

            <div className="w-full max-w-md mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <EnvelopeIcon className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Verify Your Email
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Check your inbox to get started
                    </p>
                </div>

                {/* Main Content */}
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <div className="text-center mb-6">
                        <p className="text-gray-700 leading-relaxed">
                            Thanks for signing up for <span className="font-semibold text-green-600">DA-CAR Accounting System</span>! 
                            Before getting started, please verify your email address by clicking on the link we just sent to your inbox.
                        </p>
                    </div>

                    {status === 'verification-link-sent' && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                            <div className="flex items-center">
                                <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                                <p className="text-sm font-medium text-green-800">
                                    A new verification link has been sent to your email address.
                                </p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-4">
                                Didn't receive the email? Check your spam folder or click below to resend.
                            </p>
                            
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {processing ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </span>
                                ) : (
                                    'Resend Verification Email'
                                )}
                            </button>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <div className="text-center">
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200 underline decoration-2 underline-offset-4 hover:decoration-green-600"
                                >
                                    ← Back to Login
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer Info */}
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-500">
                        Having trouble? Contact your system administrator.
                    </p>
                </div>
            </div>
        </GuestLayout>
    );
}
