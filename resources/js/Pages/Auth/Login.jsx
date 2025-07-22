import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import AnimatedBackground from '@/Components/AnimatedBackground';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout backgroundImage="LOG_BG.webp">
            <Head title="Log in" />

            <div className="space-y-4">
                {/* Page Title */}
                <div className="text-center">
                    <h2 className="text-xl font-bold text-green-800 mb-1">
                        Login
                    </h2>
                    <p className="text-gray-600 text-sm">
                        LOGIN TO YOUR ACCOUNT
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

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <InputLabel htmlFor="email" value="E-MAIL ADDRESS" className="text-gray-600 font-medium text-sm mb-2 block" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 focus:ring-2 transition-all duration-300 hover:border-green-400 hover:shadow-lg transform hover:scale-[1.02] focus:scale-[1.02]"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder=""
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="password" value="PASSWORD" className="text-gray-600 font-medium text-sm mb-2 block" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 focus:ring-2 transition-all duration-300 hover:border-green-400 hover:shadow-lg transform hover:scale-[1.02] focus:scale-[1.02]"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder=""
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center group cursor-pointer">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="rounded border-gray-300 text-green-600 shadow-sm focus:ring-green-500"
                            />
                            <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                                REMEMBER ME
                            </span>
                        </label>

                        {/* Always show reset password link */}
                        <Link
                            href={route('password.request')}
                            className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors duration-300 hover:underline"
                        >
                            RESET PASSWORD?
                        </Link>
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
                                    SIGNING IN YOUR HONOR...
                                </>
                            ) : (
                                "SIGN IN"
                            )}
                        </PrimaryButton>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            DON'T HAVE AN ACCOUNT YET?{' '}
                            <Link
                                href={route('register')}
                                className="font-medium text-green-600 hover:text-green-700 transition-colors duration-300 hover:underline"
                            >
                                REGISTER
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}
