

import React, { useState, useMemo, useCallback } from 'react';
import { Property, PropertyType, AdvertisementSettings, SiteSettings, AIPropertySearchResult } from '../types';
import PropertyCard from './PropertyCard';
import { BuildingOffice2Icon, HomeModernIcon, MagnifyingGlassIcon, SparklesIcon, CogIcon, XMarkIcon } from './icons';
import AdvertisementBanner from './AdvertisementBanner';
import { searchPropertiesWithAI } from '../services/geminiService';

type FilterType = 'all' | PropertyType;

interface RentalsPageProps {
  properties: Property[];
  onSelectProperty: (id: string) => void;
  adSettings: AdvertisementSettings;
  siteSettings: SiteSettings;
}

const RentalsPage: React.FC<RentalsPageProps> = ({ properties, onSelectProperty, adSettings, siteSettings }) => {
  // Standard filters state
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // AI search state
  const [aiSearchTerm, setAiSearchTerm] = useState('');
  const [aiSearchResults, setAiSearchResults] = useState<AIPropertySearchResult[] | null>(null);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiSearchError, setAiSearchError] = useState<string | null>(null);

  const handleAiSearch = useCallback(async () => {
    if (!aiSearchTerm.trim()) return;

    setIsAiSearching(true);
    setAiSearchError(null);
    setAiSearchResults(null);

    try {
      const availableProperties = properties.filter(p => p.status === 'متاح');
      const results = await searchPropertiesWithAI(aiSearchTerm, availableProperties);
      setAiSearchResults(results);
    } catch (err) {
      console.error("AI Search Error:", err);
      setAiSearchError('عذرًا، حدث خطأ أثناء البحث. الرجاء المحاولة مرة أخرى.');
    } finally {
      setIsAiSearching(false);
    }
  }, [aiSearchTerm, properties]);

  const clearAiSearch = useCallback(() => {
    setAiSearchTerm('');
    setAiSearchResults(null);
    setAiSearchError(null);
  }, []);

  const handleResetFilters = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في إعادة تعيين الفلاتر؟')) {
        setFilter('all');
        setSearchTerm('');
        setMinPrice('');
        setMaxPrice('');
        clearAiSearch(); // Also clear AI search
    }
  };

  const filteredProperties = useMemo(() => {
    // If AI search has results, it takes precedence
    if (aiSearchResults) {
      return aiSearchResults.map(result => {
        const property = properties.find(p => p.id === result.propertyId);
        // Attach the AI reason to the property object to be passed to the card
        return property ? { ...property, aiReason: result.reason } : null;
      }).filter((p): p is Property & { aiReason: string } => p !== null);
    }

    // Otherwise, use standard filters
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);

    return properties
      .filter(p => {
        if (p.status !== 'متاح') return false; // Only show available properties
        if (filter !== 'all' && p.type !== filter) return false;
        if (searchTerm.trim() !== '' && 
            !p.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
            !p.location.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (!isNaN(min) && p.price < min) return false;
        if (!isNaN(max) && p.price > max) return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [filter, properties, searchTerm, minPrice, maxPrice, aiSearchResults]);

  const FilterButton: React.FC<{ type: FilterType; label: string; icon?: React.ReactNode }> = ({ type, label, icon }) => (
    <button
      onClick={() => setFilter(type)}
      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold transition-all duration-300 text-sm md:text-base ${
        filter === type 
        ? 'bg-indigo-600 text-white shadow-lg' 
        : 'bg-white text-gray-700 hover:bg-indigo-50 shadow-sm border border-gray-200'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
          {siteSettings.rentalsPageTitle}
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          تصفح مجموعتنا المختارة أو استخدم مساعدنا الذكي للعثور على ما تبحث عنه بالضبط.
        </p>
      </div>

      {/* AI Search Panel */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 rounded-2xl shadow-2xl mb-12 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-3">
          <SparklesIcon className="w-8 h-8 text-white" />
          <h2 className="text-2xl font-bold text-white">البحث الذكي</h2>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); handleAiSearch(); }} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="md:col-span-3">
                <input
                    type="text"
                    value={aiSearchTerm}
                    onChange={(e) => setAiSearchTerm(e.target.value)}
                    className="w-full p-4 border-2 border-transparent rounded-lg focus:ring-4 focus:ring-white/50 transition-shadow text-lg"
                    placeholder="مثال: شقة بثلاث غرف نوم في شمال الرياض بأقل من 6000 ريال شهرياً"
                    disabled={isAiSearching}
                />
            </div>
            <div>
                 <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-white text-indigo-600 font-bold p-4 rounded-lg hover:bg-indigo-100 transition-colors text-lg shadow-md disabled:bg-gray-200 disabled:cursor-wait"
                    disabled={isAiSearching || !aiSearchTerm.trim()}
                >
                    {isAiSearching ? (
                        <>
                            <CogIcon className="w-6 h-6 animate-spin" />
                            <span>جاري البحث...</span>
                        </>
                    ) : (
                        <span>ابحث</span>
                    )}
                </button>
            </div>
        </form>
         {aiSearchError && (
            <div className="mt-4 text-red-100 bg-red-900/50 p-3 rounded-lg text-sm font-semibold">
                {aiSearchError}
            </div>
        )}
      </div>

      {aiSearchResults !== null ? (
        <div className="flex justify-between items-center mb-8 bg-indigo-50 p-4 rounded-xl border border-indigo-200">
            <div>
                <h3 className="text-xl font-bold text-indigo-800">نتائج البحث الذكي</h3>
                <p className="text-indigo-600">تم العثور على <span className="font-bold">{filteredProperties.length}</span> عقار مطابق لطلبك.</p>
            </div>
            <button
                onClick={clearAiSearch}
                className="flex items-center gap-2 bg-red-100 text-red-700 font-bold py-2 px-4 rounded-lg hover:bg-red-200 transition-colors"
            >
                <XMarkIcon className="w-5 h-5"/>
                <span>مسح النتائج</span>
            </button>
        </div>
      ) : (
          <>
            {/* Search and Filter Panel */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-12">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label htmlFor="search" className="block text-sm font-bold text-gray-700 mb-2">ابحث بالاسم أو المنطقة</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><MagnifyingGlassIcon className="h-5 w-5 text-gray-400" /></div>
                            <input type="text" id="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-shadow" placeholder="مثال: شقة في العليا..." />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="minPrice" className="block text-sm font-bold text-gray-700 mb-2">أقل سعر</label>
                        <input type="number" id="minPrice" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-shadow" placeholder="0" />
                    </div>
                    <div>
                        <label htmlFor="maxPrice" className="block text-sm font-bold text-gray-700 mb-2">أعلى سعر</label>
                        <input type="number" id="maxPrice" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-shadow" placeholder="50000" />
                    </div>
                    <div>
                         <button onClick={handleResetFilters} className="w-full bg-gray-600 text-white font-bold p-3 rounded-lg hover:bg-gray-700 transition-colors">إعادة تعيين الفلاتر</button>
                    </div>
                </div>
            </div>
            
            <div className="flex justify-center flex-wrap gap-3 mb-12">
              <FilterButton type="all" label="الكل" />
              <FilterButton type="سكني" label="سكني" icon={<HomeModernIcon className="w-5 h-5"/>} />
              <FilterButton type="تجاري" label="تجاري" icon={<BuildingOffice2Icon className="w-5 h-5"/>} />
            </div>
          </>
      )}

      {adSettings.isEnabled && adSettings.displayPages.includes('rentals') && adSettings.imageUrl && (
          <AdvertisementBanner imageUrl={adSettings.imageUrl} linkUrl={adSettings.linkUrl} />
      )}

      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {filteredProperties.map(property => (
            <PropertyCard key={property.id} property={property} onSelect={onSelectProperty} aiReason={(property as any).aiReason} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-lg border border-gray-200 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800">لا توجد عقارات مطابقة</h3>
            <p className="mt-2 text-gray-600">
              {aiSearchResults ? 'لم يتم العثور على عقارات تطابق بحثك الذكي. حاول استخدام كلمات مختلفة.' : 'لم يتم العثور على عقارات متاحة تطابق بحثك. جرب تعديل الفلاتر أو إعادة تعيينها.'}
            </p>
        </div>
      )}
    </div>
  );
};

export default RentalsPage;