
import React from 'react';
import { HomeModernIcon, WrenchScrewdriverIcon, ArrowLeftIcon } from './icons';
import { Page, SiteSettings, AdvertisementSettings } from '../types';
import AdvertisementBanner from './AdvertisementBanner';

interface HomePageProps {
  onNavigate: (page: Page) => void;
  siteSettings: SiteSettings;
  adSettings: AdvertisementSettings;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate, siteSettings, adSettings }) => {
  return (
    <div className="animate-fade-in">
      <div className="relative isolate overflow-hidden bg-gray-900">
        <div 
          className="absolute inset-0 -z-10 h-full w-full object-cover"
          style={{
            backgroundImage: `url('${siteSettings.heroImageUrl}')`,
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent -z-10"></div>
        <div className="container mx-auto px-4 py-24 sm:py-32 lg:py-40 text-center text-white">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight">
                {siteSettings.heroTitle}
            </h1>
            <p className="mt-6 text-lg lg:text-xl max-w-3xl mx-auto text-gray-300">
                {siteSettings.heroSubtitle}
            </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-16 relative z-20 pb-12">
        {adSettings.isEnabled && adSettings.displayPages.includes('home') && adSettings.imageUrl && (
            <AdvertisementBanner imageUrl={adSettings.imageUrl} linkUrl={adSettings.linkUrl} />
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-8">
          
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center border border-gray-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <div className="bg-blue-100 text-blue-600 p-4 rounded-full mb-5 ring-4 ring-blue-50">
              <HomeModernIcon className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">تصفح العقارات</h2>
            <p className="text-gray-600 mb-8 flex-grow text-center">ابحث عن شقق سكنية ومساحات تجارية تناسب احتياجاتك وميزانيتك.</p>
            <button 
              onClick={() => onNavigate('rentals')}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>ابدأ البحث</span>
              <ArrowLeftIcon className="w-5 h-5"/>
            </button>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center border border-gray-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <div className="bg-green-100 text-green-600 p-4 rounded-full mb-5 ring-4 ring-green-50">
              <WrenchScrewdriverIcon className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">اطلب خدمة صيانة</h2>
            <p className="text-gray-600 mb-8 flex-grow text-center">استخدم مساعدنا الذكي لتحليل أي مشكلة صيانة واحصل على تقييم فوري.</p>
            <button 
              onClick={() => onNavigate('maintenance')}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              <span>اطلب الآن</span>
              <ArrowLeftIcon className="w-5 h-5"/>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HomePage;
