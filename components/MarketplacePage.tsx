import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Page, MarketplaceBooking, MarketplaceServiceCategory, MarketplaceServiceProvider, MarketplaceIconName } from '../types';
import { ComputerDesktopIcon, SunIcon, DropletIcon, CogIcon, PhoneIcon } from './icons';
import Modal from './Modal';
import MarketplaceBookingForm from './MarketplaceBookingForm';

interface MarketplacePageProps {
  onNavigate: (page: Page) => void;
  onBookingSubmit: (data: Omit<MarketplaceBooking, 'id' | 'requestDate' | 'status'>) => void;
}

const getCategoryIcon = (iconName: MarketplaceIconName, className: string = "w-12 h-12") => {
    switch (iconName) {
        case 'ComputerDesktopIcon': return <ComputerDesktopIcon className={className} />;
        case 'SunIcon': return <SunIcon className={className} />;
        case 'DropletIcon': return <DropletIcon className={className} />;
        default: return <CogIcon className={className} />;
    }
};

const ServiceProviderCard: React.FC<{ provider: MarketplaceServiceProvider; onBook: () => void; }> = ({ provider, onBook }) => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 flex flex-col sm:flex-row items-center gap-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    {provider.logoUrl ? (
      <img src={provider.logoUrl} alt={provider.name} className="w-24 h-24 rounded-full object-contain flex-shrink-0 border-4 border-gray-100" />
    ) : (
      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400">
        <CogIcon className="w-12 h-12" />
      </div>
    )}
    <div className="flex-grow text-center sm:text-right">
      <h3 className="text-xl font-bold text-gray-900">{provider.name}</h3>
      <p className="text-gray-600 my-2">{provider.description}</p>
      <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-500 font-semibold">
        <PhoneIcon className="w-5 h-5 text-gray-400" />
        <span>{provider.phone}</span>
      </div>
    </div>
    <div className="flex-shrink-0 mt-4 sm:mt-0">
      <button onClick={onBook} className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors shadow-md">
        اطلب الخدمة الآن
      </button>
    </div>
  </div>
);

const MarketplacePage: React.FC<MarketplacePageProps> = ({ onBookingSubmit }) => {
  const { db } = useData();
  const { marketplaceCategories, marketplaceServiceProviders } = db;
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceServiceCategory | null>(marketplaceCategories[0] || null);
  const [bookingProvider, setBookingProvider] = useState<MarketplaceServiceProvider | null>(null);

  const filteredProviders = marketplaceServiceProviders.filter(
    provider => provider.categoryId === selectedCategory?.id
  );

  const handleBookingSubmit = (data: Omit<MarketplaceBooking, 'id' | 'requestDate' | 'status'>) => {
    onBookingSubmit(data);
    setBookingProvider(null);
  };

  return (
    <>
      <div className="animate-fade-in bg-gray-50">
        {/* Hero */}
        <div className="relative bg-indigo-700 py-24 sm:py-32">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-10"
            style={{backgroundImage: "url('https://images.unsplash.com/photo-1542884748-2b87b36c6b90?q=80&w=2574&auto=format&fit=crop')"}}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-800 to-transparent"></div>
          <div className="relative container mx-auto px-4 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              سوق الخدمات المجاورة
            </h1>
            <p className="mt-6 text-lg lg:text-xl max-w-3xl mx-auto text-indigo-200">
              كل ما تحتاجه لمنزلك في مكان واحد. تصفح أفضل مزودي الخدمات المحليين واطلب ما يناسبك بسهولة.
            </p>
          </div>
        </div>

        {/* Categories */}
        <div className="container mx-auto px-4 -mt-16 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {marketplaceCategories.map(category => (
              <button 
                key={category.id}
                onClick={() => setSelectedCategory(category)}
                className={`p-6 bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 text-center ${selectedCategory?.id === category.id ? 'border-indigo-500 shadow-indigo-200' : 'border-gray-200 hover:border-indigo-400'}`}
              >
                <div className={`mx-auto mb-3 transition-colors ${selectedCategory?.id === category.id ? 'text-indigo-600' : 'text-gray-500'}`}>
                    {getCategoryIcon(category.icon, "w-12 h-12")}
                </div>
                <h2 className="text-xl font-bold text-gray-800">{category.name}</h2>
                <p className="text-sm text-gray-500 mt-1">{category.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Providers List */}
        <div className="container mx-auto px-4 py-16">
          {selectedCategory && (
            <div className="max-w-5xl mx-auto animate-fade-in">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                مزودي خدمة "{selectedCategory.name}"
              </h2>
              {filteredProviders.length > 0 ? (
                <div className="space-y-6">
                  {filteredProviders.map(provider => (
                    <ServiceProviderCard 
                      key={provider.id} 
                      provider={provider}
                      onBook={() => setBookingProvider(provider)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-10 bg-white rounded-lg border">
                  لا يوجد مزودي خدمة متاحين في هذه الفئة حالياً.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      
      {bookingProvider && (
        <Modal 
          isOpen={!!bookingProvider} 
          onClose={() => setBookingProvider(null)} 
          title={`طلب خدمة من ${bookingProvider.name}`}
        >
          <MarketplaceBookingForm 
            provider={bookingProvider} 
            onSubmit={handleBookingSubmit}
            onCancel={() => setBookingProvider(null)}
          />
        </Modal>
      )}
    </>
  );
};

export default MarketplacePage;