import React, { useState } from 'react';
import { Link } from '@inertiajs/react';

// Placeholder images data - will be replaced with actual ACC gallery images
const galleryImages = [
    {
        id: 1,
        title: "Agricultural Innovation",
        description: "Pioneering sustainable farming practices in the Cordillera region through cutting-edge technology and research initiatives.",
        category: "Innovation",
        placeholder: "🌾",
        color: "from-green-400 to-green-600",
        year: "2024"
    },
    {
        id: 2,
        title: "Regional Headquarters",
        description: "Our modern facilities serving the agricultural community with state-of-the-art equipment and services.",
        category: "Infrastructure",
        placeholder: "🏢",
        color: "from-blue-400 to-blue-600",
        year: "2023"
    },
    {
        id: 3,
        title: "Community Engagement",
        description: "Working closely with local farmers and agricultural communities to promote sustainable development.",
        category: "Community",
        placeholder: "👥",
        color: "from-purple-400 to-purple-600",
        year: "2024"
    },
    {
        id: 4,
        title: "Excellence in Service",
        description: "Recognition for outstanding agricultural development programs and community service initiatives.",
        category: "Achievement",
        placeholder: "🏆",
        color: "from-yellow-400 to-yellow-600",
        year: "2023"
    },
    {
        id: 5,
        title: "Research & Development",
        description: "Advanced agricultural research facilities and programs driving innovation in the region.",
        category: "Research",
        placeholder: "🔬",
        color: "from-indigo-400 to-indigo-600",
        year: "2024"
    },
    {
        id: 6,
        title: "Training Programs",
        description: "Educational initiatives for farmers and agricultural workers to enhance skills and knowledge.",
        category: "Education",
        placeholder: "📚",
        color: "from-red-400 to-red-600",
        year: "2023"
    },
    {
        id: 7,
        title: "Technology Integration",
        description: "Modern technology solutions for agricultural development and digital transformation.",
        category: "Technology",
        placeholder: "💻",
        color: "from-cyan-400 to-cyan-600",
        year: "2024"
    },
    {
        id: 8,
        title: "Sustainable Practices",
        description: "Environmental conservation and sustainable agriculture practices for future generations.",
        category: "Environment",
        placeholder: "🌱",
        color: "from-emerald-400 to-emerald-600",
        year: "2024"
    }
];

export default function Gallery() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedImage, setSelectedImage] = useState(null);

    const categories = ['All', ...new Set(galleryImages.map(img => img.category))];

    const filteredImages = selectedCategory === 'All' 
        ? galleryImages 
        : galleryImages.filter(img => img.category === selectedCategory);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-4">ACC Gallery</h1>
                            <p className="text-xl text-green-100 mb-6">
                                Celebrating our agricultural development milestones and community impact
                            </p>
                        </div>
                        <Link 
                            href="/dashboard"
                            className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                        >
                            ← Back to Dashboard
                        </Link>
                    </div>

                    {/* Category Filters */}
                    <div className="flex flex-wrap gap-3">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                                    selectedCategory === category
                                        ? 'bg-white text-green-600 shadow-lg transform scale-105'
                                        : 'bg-white/20 text-white hover:bg-white/30 hover:scale-105'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredImages.map((image) => (
                        <div
                            key={image.id}
                            className="group cursor-pointer"
                            onClick={() => setSelectedImage(image)}
                        >
                            <div className={`aspect-square bg-gradient-to-br ${image.color} rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 relative overflow-hidden`}>
                                {/* Placeholder content */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-white text-5xl group-hover:scale-110 transition-transform duration-300">
                                        {image.placeholder}
                                    </span>
                                </div>
                                
                                {/* Overlay with hover effect */}
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-end">
                                    <div className="text-white p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        <h3 className="font-bold text-xl mb-2">{image.title}</h3>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm opacity-90">{image.category}</span>
                                            <span className="text-sm opacity-90">{image.year}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Selected Image Detail Modal */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-8">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h3 className="text-3xl font-bold text-gray-800 mb-3">{selectedImage.title}</h3>
                                    <div className="flex items-center space-x-4 mb-4">
                                        <span className="bg-green-100 text-green-600 px-4 py-2 rounded-full font-medium">
                                            {selectedImage.category}
                                        </span>
                                        <span className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full font-medium">
                                            {selectedImage.year}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200 text-3xl font-bold"
                                >
                                    ×
                                </button>
                            </div>
                            
                            {/* Image placeholder */}
                            <div className={`aspect-video bg-gradient-to-br ${selectedImage.color} rounded-2xl mb-6 flex items-center justify-center`}>
                                <span className="text-white text-8xl">{selectedImage.placeholder}</span>
                            </div>
                            
                            <p className="text-gray-600 text-lg leading-relaxed mb-8">{selectedImage.description}</p>
                            
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                                >
                                    Close
                                </button>
                                <button className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200">
                                    View Full Size
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
