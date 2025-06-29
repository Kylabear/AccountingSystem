import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout backgroundImage="RES_BG.webp">
            <Head title="Forgot Password" />

            <div className="space-y-6">
                {/* Page Title */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-green-800 mb-2">
                        Forgot Password
                    </h2>
                    <p className="text-gray-600 text-sm">
                        ENTER YOUR EMAIL TO RECEIVE RESET LINK
                    </p>
                </div>

                {status && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium text-green-800">{status}</span>
                        </div>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <InputLabel htmlFor="email" value="EMAIL ADDRESS" className="text-gray-600 font-medium text-sm mb-2 block" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 focus:ring-2 transition-all duration-300 hover:border-green-400 hover:shadow-lg transform hover:scale-[1.02] focus:scale-[1.02]"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="Enter your email address"
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div>
                        <PrimaryButton 
                            className="w-full bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500 py-3 px-4 text-white font-bold rounded-lg shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center text-sm" 
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    UPDATING PASSWORD...
                                </>
                            ) : (
                                "SEND RESET LINK"
                            )}
                        </PrimaryButton>
                    </div>

                    {/* Back to Login Link */}
                    <div className="text-center">
                        <Link
                            href={route('login')}
                            className="inline-flex items-center text-sm text-gray-600 hover:text-green-600 font-medium transition-colors duration-300 hover:underline"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}
