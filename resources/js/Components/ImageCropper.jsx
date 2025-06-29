import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop, convertToPixelCrop } from 'react-image-crop';
import { XMarkIcon, CheckIcon, ArrowPathIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon } from '@heroicons/react/24/outline';
import 'react-image-crop/dist/ReactCrop.css';

const ImageCropper = ({ isOpen, onClose, onCropComplete, initialImage }) => {
    const [imageSrc, setImageSrc] = useState(initialImage || null);
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState();
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);
    const imgRef = useRef(null);
    const canvasRef = useRef(null);

    // Function to center aspect crop
    function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
        return centerCrop(
            makeAspectCrop(
                {
                    unit: '%',
                    width: 90,
                },
                aspect,
                mediaWidth,
                mediaHeight,
            ),
            mediaWidth,
            mediaHeight,
        );
    }

    const onSelectFile = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrc(reader.result?.toString() || '');
            });
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const onImageLoad = useCallback((e) => {
        const { width, height } = e.currentTarget;
        setCrop(centerAspectCrop(width, height, 1));
    }, []);

    const getCroppedImg = useCallback(async () => {
        if (!completedCrop || !imgRef.current || !canvasRef.current) {
            return;
        }

        const image = imgRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('No 2d context');
        }

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        const pixelRatio = window.devicePixelRatio;
        canvas.width = Math.floor(completedCrop.width * scaleX * pixelRatio);
        canvas.height = Math.floor(completedCrop.height * scaleY * pixelRatio);

        ctx.scale(pixelRatio, pixelRatio);
        ctx.imageSmoothingQuality = 'high';

        const cropX = completedCrop.x * scaleX;
        const cropY = completedCrop.y * scaleY;

        const centerX = image.naturalWidth / 2;
        const centerY = image.naturalHeight / 2;

        ctx.save();

        ctx.translate(-cropX, -cropY);
        ctx.translate(centerX, centerY);
        ctx.rotate((rotate * Math.PI) / 180);
        ctx.scale(scale, scale);
        ctx.translate(-centerX, -centerY);
        ctx.drawImage(
            image,
            0,
            0,
            image.naturalWidth,
            image.naturalHeight,
            0,
            0,
            image.naturalWidth,
            image.naturalHeight,
        );

        ctx.restore();

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    console.error('Canvas is empty');
                    return;
                }
                resolve(blob);
            }, 'image/jpeg', 0.9);
        });
    }, [completedCrop, scale, rotate]);

    const handleCropComplete = async () => {
        try {
            const croppedImageBlob = await getCroppedImg();
            if (croppedImageBlob) {
                // Create a File object from the blob
                const file = new File([croppedImageBlob], 'cropped-image.jpg', {
                    type: 'image/jpeg',
                });
                onCropComplete(file);
                onClose();
            }
        } catch (error) {
            console.error('Error cropping image:', error);
        }
    };

    const resetCrop = () => {
        if (imgRef.current) {
            const { width, height } = imgRef.current;
            setCrop(centerAspectCrop(width, height, 1));
        }
        setScale(1);
        setRotate(0);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" onClick={onClose} />
                
                <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h3 className="text-2xl font-bold text-gray-900">Crop Profile Image</h3>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {!imageSrc ? (
                            <div className="text-center py-12">
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={onSelectFile}
                                        className="hidden"
                                        id="image-upload"
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className="cursor-pointer flex flex-col items-center"
                                    >
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <p className="text-lg font-semibold text-gray-700 mb-2">
                                            Choose an image to crop
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            PNG, JPG, GIF up to 10MB
                                        </p>
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Image Cropper */}
                                <div className="flex justify-center bg-gray-50 rounded-xl p-4">
                                    <ReactCrop
                                        crop={crop}
                                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                                        onComplete={(c) => setCompletedCrop(c)}
                                        aspect={1}
                                        circularCrop
                                        className="max-w-full max-h-96"
                                    >
                                        <img
                                            ref={imgRef}
                                            alt="Crop me"
                                            src={imageSrc}
                                            style={{
                                                transform: `scale(${scale}) rotate(${rotate}deg)`,
                                                maxHeight: '400px',
                                                maxWidth: '100%',
                                            }}
                                            onLoad={onImageLoad}
                                            className="rounded-lg"
                                        />
                                    </ReactCrop>
                                </div>

                                {/* Controls */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Zoom Controls */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                                            <MagnifyingGlassMinusIcon className="w-4 h-4 mr-2" />
                                            Zoom: {Math.round(scale * 100)}%
                                        </label>
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                                                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                            >
                                                <MagnifyingGlassMinusIcon className="w-4 h-4" />
                                            </button>
                                            <input
                                                type="range"
                                                min="0.5"
                                                max="3"
                                                step="0.1"
                                                value={scale}
                                                onChange={(e) => setScale(Number(e.target.value))}
                                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                            />
                                            <button
                                                onClick={() => setScale(Math.min(3, scale + 0.1))}
                                                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                            >
                                                <MagnifyingGlassPlusIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Rotation Controls */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                                            <ArrowPathIcon className="w-4 h-4 mr-2" />
                                            Rotate: {rotate}°
                                        </label>
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => setRotate(rotate - 90)}
                                                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                            >
                                                <ArrowPathIcon className="w-4 h-4 transform -scale-x-100" />
                                            </button>
                                            <input
                                                type="range"
                                                min="-180"
                                                max="180"
                                                step="1"
                                                value={rotate}
                                                onChange={(e) => setRotate(Number(e.target.value))}
                                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                            />
                                            <button
                                                onClick={() => setRotate(rotate + 90)}
                                                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                            >
                                                <ArrowPathIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Reset Controls */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-gray-700">
                                            Quick Actions
                                        </label>
                                        <div className="space-y-2">
                                            <button
                                                onClick={resetCrop}
                                                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                                            >
                                                Reset All
                                            </button>
                                            <label
                                                htmlFor="image-upload-change"
                                                className="w-full px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-lg transition-colors cursor-pointer text-center block"
                                            >
                                                Change Image
                                            </label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={onSelectFile}
                                                className="hidden"
                                                id="image-upload-change"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Hidden canvas for cropping */}
                                <canvas ref={canvasRef} className="hidden" />
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {imageSrc && (
                        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCropComplete}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center"
                            >
                                <CheckIcon className="w-5 h-5 mr-2" />
                                Apply Crop
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageCropper;
