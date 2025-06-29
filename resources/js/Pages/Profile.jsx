import { useState } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import ImageCropper from '@/Components/ImageCropper';

export default function Profile() {
    const { auth } = usePage().props;
    const [isEditing, setIsEditing] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [showImageCropper, setShowImageCropper] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    console.log('Profile page loaded, auth:', auth); // Debug line

    // Safety check
    if (!auth || !auth.user) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
                    <p className="text-gray-600 mb-4">You must be logged in to view this page.</p>
                    <Link href="/login" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                        Login
                    </Link>
                </div>
            </div>
        );
    }

    const { data, setData, post, processing, errors } = useForm({
        name: auth.user.name || '',
        profile_image: null,
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Create preview URL for the cropper
            const reader = new FileReader();
            reader.onload = (e) => {
                setSelectedImage(e.target.result);
                setShowImageCropper(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = (croppedFile) => {
        setData('profile_image', croppedFile);
        
        // Create preview from the cropped file
        const reader = new FileReader();
        reader.onload = (e) => setPreviewImage(e.target.result);
        reader.readAsDataURL(croppedFile);
        
        setShowImageCropper(false);
        setSelectedImage(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        post('/profile/update', {
            forceFormData: true,
            onSuccess: () => {
                setIsEditing(false);
                setPreviewImage(null);
            }
        });
    };

    return (
            <div className="min-h-screen bg-gray-100">
                {/* Fixed Header - Always visible while scrolling */}
                <div className="bg-green-700 text-white p-4 flex items-center justify-between shadow-xl backdrop-blur-sm bg-opacity-95 header-fixed">
                    <div className="flex items-center">
                        <img 
                            src="/DALOGO.png" 
                            alt="DA Logo" 
                            className="w-16 h-16 mr-4 object-contain"
                        />
                        <Link 
                            href="/"
                            className="text-xl font-bold text-yellow-400 hover:text-yellow-300 transition-colors duration-200 cursor-pointer"
                            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
                        >
                            DA-CAR Accounting Section Monitoring System
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link 
                            href="/incoming-dvs"
                            className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-800 transition-colors"
                        >
                            Back to Dashboard
                        </Link>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:-translate-y-1 group flex items-center"
                        >
                            <span className="mr-2 transition-transform duration-300 group-hover:scale-125">🚪</span>
                            <span className="group-hover:animate-pulse">Logout</span>
                        </Link>
                    </div>
                </div>

                {/* Content with proper header spacing */}
                <div className="content-with-header max-w-4xl mx-auto py-8 px-4">
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        {/* Profile Header */}
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-3xl font-bold text-gray-800">User Profile</h1>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            /* Edit Form */
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Profile Image Upload */}
                                <div className="flex flex-col items-center mb-8">
                                    <div className="relative mb-4">
                                        <img 
                                            src={previewImage || (auth.user.profile_image ? `/storage/${auth.user.profile_image}` : '/default-profile.png')} 
                                            alt="Profile" 
                                            className="w-32 h-32 rounded-full object-cover border-4 border-green-500 shadow-lg"
                                        />
                                        <label className="absolute bottom-0 right-0 bg-green-600 text-white p-3 rounded-full cursor-pointer hover:bg-green-700 transition-all duration-300 transform hover:scale-110 shadow-lg">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                        </label>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600 mb-2">Click the camera icon to upload a new profile picture</p>
                                        <p className="text-xs text-gray-500">You'll be able to crop and adjust your image before saving</p>
                                    </div>
                                    {errors.profile_image && (
                                        <p className="text-red-500 text-sm mt-2">{errors.profile_image}</p>
                                    )}
                                </div>

                                {/* Name Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Enter your full name"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                    )}
                                </div>

                                {/* Email Field (Read-only) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={auth.user.email}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 cursor-not-allowed"
                                        disabled
                                    />
                                    <p className="text-sm text-gray-500 mt-1">Email address cannot be changed</p>
                                </div>

                                {/* Role Field (Read-only) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Role
                                    </label>
                                    <input
                                        type="text"
                                        value={auth.user.role || 'User'}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 cursor-not-allowed"
                                        disabled
                                    />
                                    <p className="text-sm text-gray-500 mt-1">Role cannot be changed</p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-4 pt-6">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                    >
                                        {processing ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setPreviewImage(null);
                                            setData('name', auth.user.name);
                                            setData('profile_image', null);
                                        }}
                                        className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            /* Display Mode */
                            <div className="space-y-6">
                                {/* Profile Image Display */}
                                <div className="flex flex-col items-center mb-8">
                                    <img 
                                        src={auth.user.profile_image ? `/storage/${auth.user.profile_image}` : '/default-profile.png'} 
                                        alt="Profile" 
                                        className="w-32 h-32 rounded-full object-cover border-4 border-green-500 mb-4"
                                    />
                                </div>

                                {/* Profile Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name
                                        </label>
                                        <div className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
                                            {auth.user.name || 'Not specified'}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <div className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
                                            {auth.user.email}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Role
                                        </label>
                                        <div className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
                                            {auth.user.role || 'User'}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Member Since
                                        </label>
                                        <div className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
                                            {new Date(auth.user.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Last Updated
                                        </label>
                                        <div className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
                                            {new Date(auth.user.updated_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Image Cropper Modal */}
                <ImageCropper
                    isOpen={showImageCropper}
                    onClose={() => {
                        setShowImageCropper(false);
                        setSelectedImage(null);
                    }}
                    onCropComplete={handleCropComplete}
                    initialImage={selectedImage}
                />
            </div>
    );
}
