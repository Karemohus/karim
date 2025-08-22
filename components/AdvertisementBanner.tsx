import React, { useState } from 'react';
import { XMarkIcon } from './icons';

interface AdvertisementBannerProps {
    imageUrl: string;
    linkUrl: string;
}

const AdvertisementBanner: React.FC<AdvertisementBannerProps> = ({ imageUrl, linkUrl }) => {
    const [isDismissed, setIsDismissed] = useState(false);

    if (isDismissed || !imageUrl) {
        return null;
    }

    let href = linkUrl;
    if (href && !href.startsWith('http') && !href.startsWith('/')) {
         href = `https://${href}`;
    }

    const content = (
        <img src={imageUrl} alt="Advertisement" className="block w-full h-auto object-cover rounded-xl" />
    );

    return (
        <div className="relative animate-fade-in">
            <button
                onClick={() => setIsDismissed(true)}
                className="absolute top-3 right-3 z-10 bg-white/70 text-gray-800 rounded-full p-1.5 shadow-md hover:bg-white"
                aria-label="إغلاق الإعلان"
            >
                <XMarkIcon className="w-5 h-5" />
            </button>
            {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="block rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
                    {content}
                </a>
            ) : (
                <div className="rounded-xl overflow-hidden shadow-lg">
                    {content}
                </div>
            )}
        </div>
    );
};

export default AdvertisementBanner;
