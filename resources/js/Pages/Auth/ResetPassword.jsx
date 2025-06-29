import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout backgroundImage="RES_BG.webp">
            <Head title="Reset Password" />

            <div className="space-y-6">
                {/* Page Title */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-green-800 mb-2">
                        Reset Password
                    </h2>
                    <p className="text-gray-600 text-sm">
                        ENTER YOUR NEW PASSWORD
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <InputLabel htmlFor="email" value="EMAIL ADDRESS" className="text-gray-600 font-medium text-sm mb-2 block" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 focus:ring-2 transition-all duration-300 hover:border-green-400 hover:shadow-lg transform hover:scale-[1.02] focus:scale-[1.02]"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder=""
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="password" value="NEW PASSWORD" className="text-gray-600 font-medium text-sm mb-2 block" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 focus:ring-2 transition-all duration-300 hover:border-green-400 hover:shadow-lg transform hover:scale-[1.02] focus:scale-[1.02]"
                            autoComplete="new-password"
                            isFocused={true}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder=""
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="password_confirmation" value="CONFIRM PASSWORD" className="text-gray-600 font-medium text-sm mb-2 block" />
                        <TextInput
                            type="password"
                            id="password_confirmation"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 focus:ring-2 transition-all duration-300 hover:border-green-400 hover:shadow-lg transform hover:scale-[1.02] focus:scale-[1.02]"
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder=""
                        />
                        <InputError message={errors.password_confirmation} className="mt-2" />
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
                                "RESET PASSWORD"
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
