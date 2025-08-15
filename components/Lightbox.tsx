import React, { useEffect } from 'react';
import { XMarkIcon, ArrowLeftIcon, ArrowRightIcon } from './icons';

interface LightboxProps {
    isOpen: boolean;
    onClose: () => void;
    images: string[];
    currentIndex: number;
    onNext: () => void;
    onPrev: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ isOpen, onClose, images, currentIndex, onNext, onPrev }) => {
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') onNext();
            if (e.key === 'ArrowLeft') onPrev();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose, onNext, onPrev]);

    if (!isOpen || images.length === 0) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-90 z-[100] flex justify-center items-center p-4 transition-opacity duration-300 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Image gallery lightbox"
        >
            <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 text-white bg-black/50 rounded-full p-2 hover:bg-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label="Close lightbox"
                >
                    <XMarkIcon className="w-8 h-8" />
                </button>

                {/* Prev Button */}
                {images.length > 1 && (
                    <button
                        onClick={onPrev}
                        className="absolute left-4 z-20 text-white bg-black/50 rounded-full p-3 hover:bg-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Previous image"
                    >
                        <ArrowLeftIcon className="w-7 h-7" />
                    </button>
                )}

                {/* Image container with transition */}
                <div className="relative max-w-full max-h-full flex items-center justify-center">
                    <img
                        key={currentIndex} // Re-trigger animation on change
                        src={images[currentIndex]}
                        alt={`Image ${currentIndex + 1} of ${images.length}`}
                        className="max-w-full max-h-[90vh] object-contain rounded-lg animate-fade-in"
                    />
                </div>

                {/* Next Button */}
                {images.length > 1 && (
                    <button
                        onClick={onNext}
                        className="absolute right-4 z-20 text-white bg-black/50 rounded-full p-3 hover:bg-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Next image"
                    >
                        <ArrowRightIcon className="w-7 h-7" />
                    </button>
                )}

                {/* Counter */}
                {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm font-semibold py-1.5 px-4 rounded-full">
                        {currentIndex + 1} / {images.length}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Lightbox;
