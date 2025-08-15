import React, { useState, useEffect, MouseEvent } from 'react';
import { XMarkIcon } from './icons';

interface AdvertisementBannerProps {
    imageUrl: string;
    linkUrl: string;
}

const AdvertisementBanner: React.FC<AdvertisementBannerProps> = ({ imageUrl, linkUrl }) => {
    const [isShown, setIsShown] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        // Animate in after a short delay
        const timer = setTimeout(() => setIsShown(true), 500);
        return () => clearTimeout(timer);
    }, []);

    const handleDismiss = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsShown(false); // Animate out
        setTimeout(() => setIsDismissed(true), 300); // Remove from DOM after transition
    };

    if (isDismissed || !imageUrl) {
        return null;
    }

    let correctedLink = linkUrl;
    if (correctedLink && !correctedLink.startsWith('http://') && !correctedLink.startsWith('https://')) {
        correctedLink = `https://${correctedLink}`;
    }
    
    const bannerContent = (
        <img 
            src={imageUrl} 
            alt="Advertisement" 
            className="block w-full h-auto object-contain"
        />
    );

    // Positioned in the center of the screen. Animates with a fade and scale effect.
    const containerClasses = `
        fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 
        w-[95%] max-w-lg 
        rounded-2xl overflow-hidden 
        shadow-2xl border border-gray-200 bg-white
        transition-all duration-300 ease-in-out
        group focus:outline-none focus:ring-4 focus:ring-indigo-300
        ${isShown ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
    `;

    const closeButton = (
        <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 z-10 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="إغلاق الإعلان"
        >
            <XMarkIcon className="w-6 h-6" />
        </button>
    );

    return correctedLink ? (
        <a 
            href={correctedLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className={containerClasses}
            aria-label="Advertisement"
        >
            {closeButton}
            {bannerContent}
        </a>
    ) : (
        <div className={containerClasses}>
            {closeButton}
            {bannerContent}
        </div>
    );
};

export default AdvertisementBanner;