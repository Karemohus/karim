import React, { useState, useMemo, useCallback } from 'react';
import { Property, PropertyType, AIPropertySearchResult } from '../types';
import PropertyCard from './PropertyCard';
import { BuildingOffice2Icon, HomeModernIcon, MagnifyingGlassIcon, SparklesIcon, CogIcon, XMarkIcon, MapIcon, QueueListIcon, HeartIcon, ScaleIcon } from './icons';
import AdvertisementBanner from './AdvertisementBanner';
import { searchPropertiesWithAI } from '../services/geminiService';
import PropertiesMap from './PropertiesMap';
import { useFavorites } from '../hooks/useFavorites';
import ComparisonModal from './ComparisonModal';
import AIFeaturesGuide from './AIFeaturesGuide';
import { useData } from '../context/DataContext';

type FilterType = 'all' | PropertyType | 'favorites';
type ViewMode = 'list' | 'map';

interface RentalsPageProps {
  onSelectProperty: (id: string) => void;
}

const RentalsPage: React.FC<RentalsPageProps> = ({ onSelectProperty }) => {
  const { db } = useData();
  const { properties, adSettings, siteSettings } = db;
  
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState('date_desc');
  const [bedrooms, setBedrooms] = useState('any');
  const [bathrooms, setBathrooms] = useState('any');

  const [aiSearchTerm, setAiSearchTerm] = useState('');
  const [aiSearchResults, setAiSearchResults] = useState<AIPropertySearchResult[] | null>(null);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiSearchError, setAiSearchError] = useState<string | null>(null);

  const [favoriteIds, toggleFavorite] = useFavorites();

  const [comparisonList, setComparisonList] = useState<string[]>([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  const [isGuideVisible, setIsGuideVisible] = useState(true);


  const handleToggleCompare = (propertyId: string) => {
      setComparisonList(prev => {
          if (prev.includes(propertyId)) {
              return prev.filter(id => id !== propertyId);
          }
          if (prev.length < 3) {
              return [...prev, propertyId];
          }
          return prev;
      });
  };

  const propertiesToCompare = useMemo(() => 
    properties.filter(p => comparisonList.includes(p.id)), 
    [comparisonList, properties]
  );

  const handleAiSearch = useCallback(async () => {
    if (!aiSearchTerm.trim()) return;

    setIsAiSearching(true);
    setAiSearchError(null);
    setAiSearchResults(null);
    setFilter('all');

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
    setFilter('all');
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('date_desc');
    setBedrooms('any');
    setBathrooms('any');
    clearAiSearch();
  };

  const filteredProperties = useMemo(() => {
    let props = properties.filter(p => p.status === 'متاح');

    if (aiSearchResults) {
      const propertyMap = new Map(props.map(p => [p.id, p]));
      return aiSearchResults.map(result => {
        const property = propertyMap.get(result.propertyId);
        return property ? { ...property, aiReason: result.reason } : null;
      }).filter((p): p is Property & { aiReason: string } => p !== null);
    }

    if (filter === 'favorites') {
        props = props.filter(p => favoriteIds.includes(p.id));
    } else if (filter !== 'all') {
        props = props.filter(p => p.type === filter);
    }
    
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);

    const processedProps = props.filter(p => {
        if (searchTerm.trim() !== '' && 
            !p.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
            !p.location.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (!isNaN(min) && p.price < min) return false;
        if (!isNaN(max) && p.price > max) return false;

        if (filter === 'سكني') {
            if (bedrooms !== 'any') {
                const numBedrooms = parseInt(bedrooms);
                if (bedrooms === '4+') {
                    if ((p.bedrooms ?? 0) < 4) return false;
                } else {
                    if (p.bedrooms !== numBedrooms) return false;
                }
            }
            if (bathrooms !== 'any') {
                const numBathrooms = parseInt(bathrooms);
                if (bathrooms === '3+') {
                    if ((p.bathrooms ?? 0) < 3) return false;
                } else {
                    if (p.bathrooms !== numBathrooms) return false;
                }
            }
        }
        
        return true;
      });
      
      const sortedProps = [...processedProps];

      switch (sortBy) {
        case 'price_asc':
            sortedProps.sort((a, b) => a.price - b.price);
            break;
        case 'price_desc':
            sortedProps.sort((a, b) => b.price - a.price);
            break;
        case 'date_desc':
        default:
            sortedProps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
    }

    return sortedProps;

  }, [filter, properties, searchTerm, minPrice, maxPrice, aiSearchResults, favoriteIds, bedrooms, bathrooms, sortBy]);

  const FilterButton: React.FC<{ type: FilterType; label: string; icon?: React.ReactNode }> = ({ type, label, icon }) => (
    <button
      onClick={() => {
        setFilter(type);
        clearAiSearch();
      }}
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
    <>
      <div className="container mx-auto px-4 py-8 md:py-16 animate-fade-in">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            {siteSettings.rentalsPageTitle}
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            تصفح مجموعتنا المختارة أو استخدم مساعدنا الذكي للعثور على ما تبحث عنه بالضبط.
          </p>
        </div>
        
        {isGuideVisible && <AIFeaturesGuide onDismiss={() => setIsGuideVisible(false)} />}

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

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div className="md:col-span-2">
                    <label htmlFor="search" className="block text-sm font-bold text-gray-700 mb-2">ابحث بالاسم أو المنطقة</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><MagnifyingGlassIcon className="h-5 w-5 text-gray-400" /></div>
                        <input type="text" id="search" value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); clearAiSearch();} } className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-shadow" placeholder="مثال: شقة في العليا..." />
                    </div>
                </div>
                <div>
                    <label htmlFor="minPrice" className="block text-sm font-bold text-gray-700 mb-2">أقل سعر</label>
                    <input type="number" id="minPrice" value={minPrice} onChange={(e) => { setMinPrice(e.target.value); clearAiSearch(); }} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-shadow" placeholder="0" />
                </div>
                <div>
                    <label htmlFor="maxPrice" className="block text-sm font-bold text-gray-700 mb-2">أعلى سعر</label>
                    <input type="number" id="maxPrice" value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); clearAiSearch(); }} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-shadow" placeholder="50000" />
                </div>
                <div>
                     <button onClick={handleResetFilters} className="w-full bg-gray-600 text-white font-bold p-3 rounded-lg hover:bg-gray-700 transition-colors">إعادة تعيين</button>
                </div>
            </div>

            {filter === 'سكني' && (
                <div className="border-t border-gray-200 mt-4 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                    <div>
                        <label htmlFor="bedrooms" className="block text-sm font-bold text-gray-700 mb-2">غرف النوم</label>
                        <select id="bedrooms" value={bedrooms} onChange={(e) => { setBedrooms(e.target.value); clearAiSearch(); }} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-shadow bg-white">
                            <option value="any">الكل</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4+">4+</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="bathrooms" className="block text-sm font-bold text-gray-700 mb-2">الحمامات</label>
                        <select id="bathrooms" value={bathrooms} onChange={(e) => { setBathrooms(e.target.value); clearAiSearch(); }} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-shadow bg-white">
                            <option value="any">الكل</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3+">3+</option>
                        </select>
                    </div>
                </div>
            )}
            
            <div className="border-t border-gray-200 mt-6 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex justify-center flex-wrap gap-3">
                  <FilterButton type="all" label="الكل" />
                  <FilterButton type="سكني" label="سكني" icon={<HomeModernIcon className="w-5 h-5"/>} />
                  <FilterButton type="تجاري" label="تجاري" icon={<BuildingOffice2Icon className="w-5 h-5"/>} />
                  <FilterButton type="favorites" label={`المفضلة (${favoriteIds.length})`} icon={<HeartIcon className="w-5 h-5"/>} />
                </div>
                <div className="flex items-center gap-4">
                    <div className='flex items-center gap-2'>
                        <label htmlFor="sortBy" className="text-sm font-bold text-gray-700">ترتيب حسب:</label>
                        <select id="sortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-shadow bg-white text-sm font-bold text-gray-600">
                            <option value="date_desc">الأحدث</option>
                            <option value="price_asc">السعر: من الأقل للأعلى</option>
                            <option value="price_desc">السعر: من الأعلى للأقل</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2 p-1 bg-gray-200 rounded-full">
                        <button onClick={() => setViewMode('list')} className={`px-4 py-2 text-sm font-bold rounded-full transition-colors ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow' : 'text-gray-600'}`}>
                            <QueueListIcon className="w-5 h-5 inline-block ml-1"/> القائمة
                        </button>
                        <button onClick={() => setViewMode('map')} className={`px-4 py-2 text-sm font-bold rounded-full transition-colors ${viewMode === 'map' ? 'bg-white text-indigo-600 shadow' : 'text-gray-600'}`}>
                            <MapIcon className="w-5 h-5 inline-block ml-1"/> الخريطة
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        {aiSearchResults !== null && (
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
        )}

        {adSettings.isEnabled && adSettings.displayPages.includes('rentals') && adSettings.imageUrl && (
            <div className="my-8">
              <AdvertisementBanner imageUrl={adSettings.imageUrl} linkUrl={adSettings.linkUrl} />
            </div>
        )}

        <div className="mt-12 pb-24">
          {filteredProperties.length > 0 ? (
            viewMode === 'list' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProperties.map(property => (
                  <PropertyCard 
                      key={property.id} 
                      property={property} 
                      onSelect={onSelectProperty} 
                      aiReason={(property as any).aiReason}
                      isFavorite={favoriteIds.includes(property.id)}
                      onToggleFavorite={toggleFavorite}
                      isBeingCompared={comparisonList.includes(property.id)}
                      onToggleCompare={handleToggleCompare}
                  />
                ))}
              </div>
            ) : (
              <div className="h-[600px] w-full rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                 <PropertiesMap properties={filteredProperties} onSelectProperty={onSelectProperty} />
              </div>
            )
          ) : (
            <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-lg border border-gray-200 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-800">لا توجد عقارات مطابقة</h3>
                <p className="mt-2 text-gray-600">
                  {aiSearchResults ? 'لم يتم العثور على عقارات تطابق بحثك الذكي. حاول استخدام كلمات مختلفة.' : 'لم يتم العثور على عقارات متاحة تطابق بحثك. جرب تعديل الفلاتر أو إعادة تعيينها.'}
                </p>
            </div>
          )}
        </div>
      </div>
      
      {comparisonList.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] animate-fade-in">
              <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex-grow">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                          <ScaleIcon className="w-5 h-5 text-indigo-600" />
                          <span>قائمة المقارنة ({comparisonList.length}/3)</span>
                      </h3>
                      <div className="flex items-center gap-3">
                          {propertiesToCompare.map(prop => (
                              <div key={prop.id} className="relative">
                                  <img src={prop.imageUrls[0]} alt={prop.title} className="w-16 h-12 object-cover rounded-md border" />
                                  <button onClick={() => handleToggleCompare(prop.id)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5">
                                      <XMarkIcon className="w-3 h-3"/>
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button onClick={() => setComparisonList([])} className="bg-gray-200 text-gray-700 font-bold py-3 px-5 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                          مسح الكل
                      </button>
                       <button 
                          onClick={() => setIsComparisonModalOpen(true)}
                          disabled={comparisonList.length < 2}
                          className="flex-1 bg-indigo-600 text-white font-bold py-3 px-5 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed text-sm"
                        >
                          قارن الآن
                      </button>
                  </div>
              </div>
          </div>
      )}

      <ComparisonModal 
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        propertiesToCompare={propertiesToCompare}
      />
    </>
  );
};

export default RentalsPage;