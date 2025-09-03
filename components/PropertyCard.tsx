

import React from 'react';
import { Property } from '../types';
import { MapPinIcon, ArrowsPointingOutIcon, BedIcon, ShowerIcon, SparklesIcon, HeartIcon, ScaleIcon } from './icons';

interface PropertyCardProps {
  property: Property;
  onSelect: (id: string) => void;
  aiReason?: string;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  isBeingCompared: boolean;
  onToggleCompare: (id: string) => void;
  showCompareButton?: boolean;
}

const InfoPill: React.FC<{ icon: React.ReactNode; text: string | number }> = ({ icon, text }) => (
  <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-sm text-gray-700">
    {icon}
    <span className="font-semibold">{text}</span>
  </div>
);

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onSelect, aiReason, isFavorite, onToggleFavorite, isBeingCompared, onToggleCompare, showCompareButton = true }) => {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when favoriting
    onToggleFavorite(property.id);
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when comparing
    onToggleCompare(property.id);
  };
  
  return (
    <div 
      onClick={() => onSelect(property.id)}
      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 cursor-pointer"
    >
      <div className="relative">
        <img className="w-full h-56 object-cover" src={property.imageUrls[0] || 'https://via.placeholder.com/400x225.png?text=No+Image'} alt={property.title} />
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-bold text-white ${property.type === 'سكني' ? 'bg-blue-500' : 'bg-green-500'}`}>
          {property.type}
        </div>
        <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button
              onClick={handleFavoriteClick}
              className="bg-black/40 p-2 rounded-full text-white hover:bg-black/60 transition-colors"
              aria-label={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            >
              <HeartIcon className={`w-6 h-6 transition-all ${isFavorite ? 'fill-red-500 stroke-red-500' : 'fill-transparent'}`} />
            </button>
            {showCompareButton && (
                <button
                onClick={handleCompareClick}
                className={`p-2 rounded-full transition-colors ${isBeingCompared ? 'bg-indigo-600 text-white' : 'bg-black/40 text-white hover:bg-black/60'}`}
                aria-label={isBeingCompared ? 'إزالة من المقارنة' : 'إضافة للمقارنة'}
                >
                <ScaleIcon className="w-6 h-6" />
                </button>
            )}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{property.title}</h3>
        <div className="flex items-center text-gray-500 mb-4 text-sm">
          <MapPinIcon className="w-4 h-4 ml-1.5 flex-shrink-0" />
          <span>{property.location}</span>
        </div>
        
        <div className="my-4 flex flex-wrap gap-2">
            <InfoPill icon={<ArrowsPointingOutIcon className="w-4 h-4"/>} text={`${property.area} م²`}/>
            {property.bedrooms !== undefined && <InfoPill icon={<BedIcon className="w-4 h-4"/>} text={property.bedrooms}/>}
            {property.bathrooms !== undefined && <InfoPill icon={<ShowerIcon className="w-4 h-4"/>} text={property.bathrooms}/>}
        </div>
        
        {aiReason && (
          <div className="my-4 p-3 bg-indigo-50 border-r-4 border-indigo-400 rounded-r-md">
            <div className="flex items-start gap-2.5 text-indigo-800">
                <SparklesIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-indigo-500" />
                <div>
                    <h5 className="font-bold text-sm text-indigo-600">لماذا هذا العقار؟</h5>
                    <p className="text-sm text-gray-700">{aiReason}</p>
                </div>
            </div>
          </div>
        )}
        
        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
           <div className="flex items-baseline font-bold text-indigo-600">
              <span className="text-2xl">{property.price.toLocaleString()}</span>
              <span className="text-sm font-medium text-gray-500 mr-1">ريال/شهريًا</span>
           </div>
           <span
              className="bg-indigo-100 text-indigo-700 font-bold py-2 px-4 rounded-lg hover:bg-indigo-200 hover:text-indigo-800 transition-colors"
            >
              عرض التفاصيل
           </span>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;