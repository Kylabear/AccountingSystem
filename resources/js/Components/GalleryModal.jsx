import React, { useState } from 'react';

// Placeholder images data - will be replaced with actual ACC gallery images
const galleryImages = [
    {
        id: 1,
        title: "Innovation",
        description: "Pioneering sustainable farming practices in the Cordillera region",
        category: "Innovation",
        placeholder: "🌾",
        color: "from-green-400 to-green-600"
    },
    {
        id: 2,
        title: "Regional Headquarters",
        description: "Our modern facilities serving the agricultural community",
        category: "Infrastructure",
        placeholder: "🏢",
        color: "from-blue-400 to-blue-600"
    },
    {
        id: 3,
        title: "Community Engagement",
        description: "Working closely with local farmers and agricultural communities",
        category: "Community",
        placeholder: "👥",
        color: "from-purple-400 to-purple-600"
    },
    {
        id: 4,
        title: "Excellence in Service",
        description: "Recognition for outstanding agricultural development programs",
        category: "Achievement",
        placeholder: "🏆",
        color: "from-yellow-400 to-yellow-600"
    },
    {
        id: 5,
        title: "Research & Development",
        description: "Advanced agricultural research facilities and programs",
        category: "Research",
        placeholder: "🔬",
        color: "from-indigo-400 to-indigo-600"
    },
    {
        id: 6,
        title: "Training Programs",
        description: "Educational initiatives for farmers and agricultural workers",
        category: "Education",
        placeholder: "📚",
        color: "from-red-400 to-red-600"
    },
    {
        id: 7,
        title: "Technology Integration",
        description: "Modern technology solutions for agricultural development",
        category: "Technology",
        placeholder: "💻",
        color: "from-cyan-400 to-cyan-600"
    },
    {
        id: 8,
        title: "Sustainable Practices",
        description: "Environmental conservation and sustainable agriculture",
        category: "Environment",
        placeholder: "🌱",
        color: "from-emerald-400 to-emerald-600"
    }
];

export default function GalleryModal({ isOpen, onClose }) {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedImage, setSelectedImage] = useState(null);

    const categories = ['All', ...new Set(galleryImages.map(img => img.category))];

    const filteredImages = selectedCategory === 'All' 
        ? galleryImages 
        : galleryImages.filter(img => img.category === selectedCategory);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">ACC Gallery</h2>
                            <p className="text-green-100">Accounting Section Milestones</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 transition-colors duration-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20"
                        >
                            ×
                        </button>
                    </div>

                    {/* Category Filters */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                                    selectedCategory === category
                                        ? 'bg-white text-green-600 shadow-lg'
                                        : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Gallery Grid */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredImages.map((image) => (
                            <div
                                key={image.id}
                                className="group cursor-pointer"
                                onClick={() => setSelectedImage(image)}
                            >
                                <div className={`aspect-square bg-gradient-to-br ${image.color} rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden`}>
                                    {/* Placeholder content */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-white text-4xl group-hover:scale-110 transition-transform duration-300">
                                            {image.placeholder}
                                        </span>
                                    </div>
                                    
                                    {/* Overlay with hover effect */}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-end">
                                        <div className="text-white p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                            <h3 className="font-bold text-lg">{image.title}</h3>
                                            <p className="text-sm opacity-90">{image.category}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Selected Image Detail Modal */}
                {selectedImage && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60 p-4">
                        <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedImage.title}</h3>
                                        <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
                                            {selectedImage.category}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setSelectedImage(null)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200 text-2xl font-bold"
                                    >
                                        ×
                                    </button>
                                </div>
                                
                                {/* Image placeholder */}
                                <div className={`aspect-video bg-gradient-to-br ${selectedImage.color} rounded-xl mb-4 flex items-center justify-center`}>
                                    <span className="text-white text-6xl">{selectedImage.placeholder}</span>
                                </div>
                                
                                <p className="text-gray-600 leading-relaxed">{selectedImage.description}</p>
                                
                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={() => setSelectedImage(null)}
                                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
