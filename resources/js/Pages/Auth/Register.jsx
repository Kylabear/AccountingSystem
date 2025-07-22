import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        role: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    // Helper function to format names (capitalize first letter of each word)
    const formatName = (name) => {
        return name.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Format first_name and last_name as user types
        if (name === 'first_name' || name === 'last_name') {
            const formattedValue = formatName(value);
            setData(name, formattedValue);
        } else {
            setData(name, value);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onError: (errors) => {
                console.log("Validation errors:", errors);
            },
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const roles = [
        'Accountant I',
        'Accountant II',
        'Accountant III',
        'Administrative Assistant I',
        'Administrative Assistant II',
        'Administrative Assistant III',
        'Administrative Assistant III (COS)',
        'Financial Analyst (COS)',
        'Financial Analyst (PRDP)',
    ];

    return (
        <GuestLayout backgroundImage="REG_BG.webp">
            <Head title="Register" />

            <div className="space-y-6">
                {/* Page Title */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-green-800 mb-2">
                        Register your Account
                    </h2>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="first_name" value="FIRST NAME" className="text-gray-600 font-medium text-sm mb-2 block" />
                            <TextInput
                                id="first_name"
                                name="first_name"
                                value={data.first_name}
                                className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 focus:ring-2 transition-all duration-300 hover:border-green-400 hover:shadow-lg transform hover:scale-[1.02] focus:scale-[1.02]"
                                onChange={handleChange}
                                placeholder=""
                                required
                            />
                            <InputError message={errors.first_name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="last_name" value="LAST NAME" className="text-gray-600 font-medium text-sm mb-2 block" />
                            <TextInput
                                id="last_name"
                                name="last_name"
                                value={data.last_name}
                                className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 focus:ring-2 transition-all duration-300 hover:border-green-400 hover:shadow-lg transform hover:scale-[1.02] focus:scale-[1.02]"
                                onChange={handleChange}
                                placeholder=""
                                required
                            />
                            <InputError message={errors.last_name} className="mt-2" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Email Field */}
                        <div>
                            <InputLabel htmlFor="email" value="EMAIL ADDRESS" className="text-gray-600 font-medium text-sm mb-2 block" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 focus:ring-2 transition-all duration-300 hover:border-green-400"
                                autoComplete="username"
                                onChange={handleChange}
                                placeholder=""
                                required
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        {/* Role Field */}
                        <div>
                            <InputLabel htmlFor="role" value="ROLE" className="text-gray-600 font-medium text-sm mb-2 block" />
                            <select
                                id="role"
                                name="role"
                                value={data.role}
                                onChange={handleChange}
                                required
                                className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 focus:ring-2 transition-all duration-300 hover:border-green-400 bg-white"
                            >
                                <option value="">-- Select Your Role --</option>
                                {roles.map((role, index) => (
                                    <option key={index} value={role}>{role}</option>
                                ))}
                            </select>
                            <InputError message={errors.role} className="mt-2" />
                        </div>
                    </div>

                    {/* Password Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="password" value="PASSWORD" className="text-gray-600 font-medium text-sm mb-2 block" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 focus:ring-2 transition-all duration-300 hover:border-green-400"
                                autoComplete="new-password"
                                onChange={handleChange}
                                placeholder=""
                                required
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password_confirmation" value="CONFIRM PASSWORD" className="text-gray-600 font-medium text-sm mb-2 block" />
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 focus:ring-2 transition-all duration-300 hover:border-green-400"
                                autoComplete="new-password"
                                onChange={handleChange}
                                placeholder=""
                                required
                            />
                            <InputError message={errors.password_confirmation} className="mt-2" />
                        </div>
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
                                    CREATING ACCOUNT...
                                </>
                            ) : (
                                "CREATE ACCOUNT"
                            )}
                        </PrimaryButton>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            ALREADY HAVE AN ACCOUNT?{' '}
                            <Link
                                href={route('login')}
                                className="font-medium text-green-600 hover:text-green-700 transition-colors duration-300 hover:underline"
                            >
                                LOG IN
                            </Link>
                        </p>
                    </div>
                </form>

                {/* Debug info (can be removed in production) */}
                {Object.keys(errors).length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-red-800 mb-2 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Please fix the following errors:
                        </h4>
                        <ul className="text-sm text-red-700 space-y-1">
                            {Object.entries(errors).map(([field, message], i) => (
                                <li key={i} className="flex items-start">
                                    <span className="font-medium mr-1">{field.replace(/_/g, ' ')}:</span>
                                    <span>{message}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </GuestLayout>
    );
}
