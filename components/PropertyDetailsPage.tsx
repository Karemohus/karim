import React, { useState, useEffect } from 'react';
import { Property, ViewingRequest, Review, Page, NeighborhoodInfo, ReviewSummary, RentalAgreement, MaintenanceLog } from '../types';
import { MapPinIcon, ArrowsPointingOutIcon, BedIcon, ShowerIcon, DocumentTextIcon, ArrowLeftIcon, HomeModernIcon, BuildingOffice2Icon, StarIcon, TagIcon, HeartIcon, CogIcon, BuildingLibraryIcon, TruckIcon, LifebuoyIcon, SparklesIcon, PlayCircleIcon, BanknotesIcon, WrenchScrewdriverIcon } from './icons';
import Modal from './Modal';
import ViewingRequestForm from './ViewingRequestForm';
import Lightbox from './Lightbox';
import ReviewForm from './ReviewForm';
import ReviewsList from './ReviewsList';
import { useFavorites } from '../hooks/useFavorites';
import { getNeighborhoodInfo, summarizeReviewsWithAI, suggestSimilarProperties } from '../services/geminiService';
import RentalCheckoutForm from './RentalCheckoutForm';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import PropertyCard from './PropertyCard';

interface PropertyDetailsPageProps {
  property: Property;
  onBack: () => void;
  onSelectProperty: (id: string) => void;
  onNavigate: (page: Page) => void;
  onShowAgreement: (agreement: RentalAgreement, property: Property) => void;
}

const Stat: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
    <div className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-xl text-center border border-gray-200">
        <div className="text-indigo-600 mb-2">{icon}</div>
        <span className="text-2xl font-bold text-gray-800">{value}</span>
        <span className="text-sm text-gray-500">{label}</span>
    </div>
);

const NeighborhoodInfoCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; }> = ({ icon, title, children }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
            {icon}
            <h4 className="text-lg font-bold text-gray-800">{title}</h4>
        </div>
        <div className="text-gray-600">{children}</div>
    </div>
);

const getYouTubeEmbedUrl = (url: string | undefined): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0` : null;
};

const PropertyDetailsPage: React.FC<PropertyDetailsPageProps> = ({ property, onBack, onSelectProperty, onNavigate, onShowAgreement }) => {
  const { db, setViewingRequests, setRentalAgreements, setProperties, setReviews } = useData();
  const { properties: allProperties, reviews, maintenanceCategories, viewingConfirmationSettings, siteSettings, rentalAgreementSettings, maintenanceLogs } = db;
  const { isAuthenticated, currentUser } = useAuth();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isViewingModalOpen, setIsViewingModalOpen] = useState(false);
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [favoriteIds, toggleFavorite] = useFavorites();
  const [neighborhoodInfo, setNeighborhoodInfo] = useState<NeighborhoodInfo | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(true);
  const [infoError, setInfoError] = useState<string | null>(null);

  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [similarProperties, setSimilarProperties] = useState<(Property & { aiReason: string })[]>([]);
  const [isSimilarLoading, setIsSimilarLoading] = useState(true);

  const isFavorite = favoriteIds.includes(property.id);

  useEffect(() => {
    const fetchNeighborhoodInfo = async () => {
      try {
        setIsLoadingInfo(true);
        setInfoError(null);
        const info = await getNeighborhoodInfo(property.location);
        setNeighborhoodInfo(info);
      } catch (error) {
        console.error("Failed to fetch neighborhood info:", error);
        setInfoError("عذراً، لم نتمكن من جلب معلومات الحي حالياً.");
      } finally {
        setIsLoadingInfo(false);
      }
    };

    fetchNeighborhoodInfo();
  }, [property.location]);
  
  useEffect(() => {
    const fetchSimilarProperties = async () => {
        setIsSimilarLoading(true);
        setSimilarProperties([]);
        try {
            const suggestions = await suggestSimilarProperties(property, allProperties);
            const enrichedSuggestions = suggestions
                .map(suggestion => {
                    const prop = allProperties.find(p => p.id === suggestion.propertyId);
                    return prop ? { ...prop, aiReason: suggestion.reason } : null;
                })
                .filter((p): p is Property & { aiReason: string } => p !== null);
            
            setSimilarProperties(enrichedSuggestions);
        } catch (error) {
            console.error("Failed to fetch similar properties:", error);
        } finally {
            setIsSimilarLoading(false);
        }
    };

    fetchSimilarProperties();
  }, [property.id, allProperties]);


  const propertyReviews = reviews.filter(r => r.type === 'property' && r.targetId === property.id);
  const averageRating = propertyReviews.length > 0
    ? propertyReviews.reduce((sum, review) => sum + review.rating, 0) / propertyReviews.length
    : 0;

  const propertyLogs = maintenanceLogs
    .filter(log => log.propertyId === property.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
  const handleProtectedAction = (action: () => void) => {
    if (isAuthenticated) {
        action();
    } else {
        localStorage.setItem('loginRedirect', JSON.stringify({ page: 'property', id: property.id }));
        onNavigate('login');
    }
  };

  const handleViewingRequestSubmit = (data: Omit<ViewingRequest, 'id' | 'requestDate' | 'status'>) => {
    const newRequest: ViewingRequest = {
        ...data,
        id: `req-${Date.now()}`,
        requestDate: new Date().toISOString(),
        status: 'جديد',
        userId: currentUser?.id,
    };
    setViewingRequests(prev => [newRequest, ...prev]);
  };

  const handleRentalSubmit = (tenantData: { userName: string, userPhone: string }, paymentData: { paymentMethod: string }) => {
    const newAgreement: RentalAgreement = {
        id: `rent-${Date.now()}`,
        propertyId: property.id,
        propertyName: property.title,
        tenantName: tenantData.userName,
        tenantPhone: tenantData.userPhone,
        amountPaid: property.price + property.commission,
        paymentMethod: paymentData.paymentMethod,
        rentalDate: new Date().toISOString(),
        userId: currentUser?.id,
        pointsAwarded: false,
    };
    setRentalAgreements(prev => [newAgreement, ...prev]);
    setProperties(prev => prev.map(p => p.id === property.id ? { ...p, status: 'مؤجر' } : p));
    setIsRentalModalOpen(false);
    onShowAgreement(newAgreement, property);
  };
  
  const handleReviewSubmit = (data: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
        ...data,
        id: `rev-${Date.now()}`,
        createdAt: new Date().toISOString(),
        userId: currentUser?.id,
        pointsAwarded: false,
    };
    setReviews(prev => [newReview, ...prev]);
  };

  const openLightbox = () => {
    if (property.imageUrls && property.imageUrls.length > 0) {
      setIsLightboxOpen(true);
    }
  };

  const closeLightbox = () => setIsLightboxOpen(false);

  const handleNextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % property.imageUrls.length);
  };
  
  const handlePrevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + property.imageUrls.length) % property.imageUrls.length);
  };

  const handleSummarizeReviews = async () => {
    setIsSummaryLoading(true);
    setReviewSummary(null);
    setSummaryError(null);
    setIsSummaryModalOpen(true);
    try {
        const summary = await summarizeReviewsWithAI(propertyReviews);
        setReviewSummary(summary);
    } catch (e) {
        setSummaryError("عذراً، حدث خطأ أثناء تلخيص التقييمات. الرجاء المحاولة مرة أخرى.");
        console.error(e);
    } finally {
        setIsSummaryLoading(false);
    }
  };
  
  const ReviewSummaryDisplay: React.FC<{ summary: ReviewSummary }> = ({ summary }) => (
    <div className="space-y-6 text-right">
        <div>
            <h4 className="text-lg font-bold text-gray-800 mb-3">الخلاصة العامة</h4>
            <p className="text-gray-600 bg-gray-50 p-3 rounded-lg border">{summary.overall_summary}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h4 className="text-lg font-bold text-green-700 mb-3">النقاط الإيجابية</h4>
                <ul className="space-y-2 list-disc list-inside text-green-800 bg-green-50/50 p-3 rounded-md">
                    {summary.positive_points.map((point, i) => <li key={i}>{point}</li>)}
                </ul>
            </div>
            <div>
                <h4 className="text-lg font-bold text-red-700 mb-3">النقاط السلبية</h4>
                <ul className="space-y-2 list-disc list-inside text-red-800 bg-red-50/50 p-3 rounded-md">
                    {summary.negative_points.map((point, i) => <li key={i}>{point}</li>)}
                </ul>
            </div>
        </div>
    </div>
  );

  const embedUrl = getYouTubeEmbedUrl(property.videoUrl);

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-8 md:py-16 animate-fade-in">
          <div className="max-w-7xl mx-auto">
              <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-semibold mb-8 transition-colors">
                  <ArrowLeftIcon className="w-5 h-5" />
                  <span>العودة إلى قائمة العقارات</span>
              </button>

              <div className="lg:flex justify-between items-start mb-8">
                  <div>
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <div className={`p-2 rounded-full text-white ${property.type === 'سكني' ? 'bg-blue-500' : 'bg-green-500'}`}>
                          {property.type === 'سكني' ? <HomeModernIcon className="w-5 h-5" /> : <BuildingOffice2Icon className="w-5 h-5" />}
                        </div>
                        <span className={`text-lg font-bold ${property.type === 'سكني' ? 'text-blue-600' : 'text-green-600'}`}>
                          {property.type}
                        </span>
                        {property.status === 'مؤجر' && (
                            <span className="px-3 py-1 text-sm font-bold rounded-full bg-yellow-100 text-yellow-800">
                               مؤجر
                            </span>
                        )}
                        {averageRating > 0 && (
                            <div className="flex items-center gap-1.5 px-3 py-1 text-sm font-bold rounded-full bg-yellow-100 text-yellow-800">
                              <StarIcon className="w-4 h-4 text-yellow-500"/>
                              <span>{averageRating.toFixed(1)}</span>
                              <span className="font-normal">({propertyReviews.length} تقييمات)</span>
                            </div>
                        )}
                      </div>
                      
                      <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 break-words">{property.title}</h1>
                      
                      <div className="flex items-center text-gray-500 text-lg">
                          <MapPinIcon className="w-5 h-5 ml-2" />
                          <span>{property.location}</span>
                      </div>
                  </div>
                  <div className="mt-6 lg:mt-0 flex-shrink-0 flex items-center gap-4 flex-wrap">
                      {property.videoUrl && (
                        <button 
                            onClick={() => setIsVideoModalOpen(true)}
                            className="flex items-center gap-3 text-lg font-bold py-3 px-6 rounded-lg border-2 transition-all bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300"
                        >
                            <PlayCircleIcon className="w-6 h-6" />
                            <span>جولة بالفيديو</span>
                        </button>
                      )}
                      <button 
                        onClick={() => toggleFavorite(property.id)}
                        className={`flex items-center gap-3 text-lg font-bold py-3 px-6 rounded-lg border-2 transition-all ${isFavorite ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-100 border-gray-200 text-gray-700 hover:border-red-300'}`}
                      >
                         <HeartIcon className={`w-6 h-6 transition-all ${isFavorite ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-current'}`} />
                         <span>{isFavorite ? 'في المفضلة' : 'إضافة للمفضلة'}</span>
                      </button>
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                  {/* Image Gallery */}
                  <div className="md:grid md:grid-cols-5 md:gap-4">
                      {/* Main Image */}
                      <div className="md:col-span-4 mb-4 md:mb-0">
                          <div className="aspect-w-16 aspect-h-10 relative group">
                              <img 
                                  src={property.imageUrls[currentImageIndex] || 'https://via.placeholder.com/800x500.png?text=No+Image'}
                                  alt={`${property.title} - view ${currentImageIndex + 1}`} 
                                  className="w-full h-full object-cover rounded-xl shadow-lg cursor-pointer"
                                  onClick={openLightbox}
                              />
                               <div
                                  onClick={openLightbox}
                                  className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center items-center cursor-pointer rounded-xl"
                               >
                                  <div className="text-white bg-black/50 p-4 rounded-full">
                                    <ArrowsPointingOutIcon className="w-8 h-8" />
                                  </div>
                               </div>
                          </div>
                      </div>
                      {/* Thumbnails */}
                      <div className="md:col-span-1 grid grid-cols-5 md:grid-cols-1 gap-3">
                          {property.imageUrls.map((url, index) => (
                              <button key={index} onClick={() => setCurrentImageIndex(index)} className="aspect-w-1 aspect-h-1">
                                  <img 
                                      src={url} 
                                      alt={`Thumbnail ${index + 1}`} 
                                      className={`w-full h-full object-cover rounded-lg cursor-pointer border-4 transition-all duration-200 ${currentImageIndex === index ? 'border-indigo-500' : 'border-transparent hover:border-indigo-300'}`} 
                                  />
                              </button>
                          ))}
                      </div>
                  </div>

                  {/* Details */}
                  <div className="flex flex-col py-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                          <Stat icon={<ArrowsPointingOutIcon className="w-8 h-8"/>} label="المساحة" value={`${property.area} م²`} />
                          {property.commission > 0 && (
                            <Stat icon={<TagIcon className="w-8 h-8"/>} label="العمولة" value={`${property.commission.toLocaleString()} ريال`} />
                          )}
                          {property.bedrooms != null && <Stat icon={<BedIcon className="w-8 h-8"/>} label="غرف نوم" value={property.bedrooms} />}
                          {property.bathrooms != null && <Stat icon={<ShowerIcon className="w-8 h-8"/>} label="حمامات" value={property.bathrooms} />}
                      </div>

                      <div className="mb-8">
                          <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                              <DocumentTextIcon className="w-6 h-6 text-gray-400" />
                              <span>الوصف</span>
                          </h3>
                          <p className="text-gray-600 leading-relaxed whitespace-pre-line">{property.description}</p>
                      </div>
                      
                      <div className="mt-auto pt-8 border-t border-gray-200">
                        <div className="bg-gray-50 rounded-lg p-6">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-lg font-normal text-gray-500">الإيجار الشهري</span>
                                <span className="text-4xl font-extrabold text-indigo-600">{property.price.toLocaleString()} ريال</span>
                            </div>
                            {property.status === 'متاح' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                     <button onClick={() => handleProtectedAction(() => setIsViewingModalOpen(true))} className="w-full bg-indigo-100 text-indigo-700 font-bold py-4 px-6 rounded-lg hover:bg-indigo-200 transition-all text-lg shadow-sm">
                                      احجز معاينة
                                    </button>
                                    <button onClick={() => handleProtectedAction(() => setIsRentalModalOpen(true))} className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-indigo-700 transition-all text-lg shadow-lg hover:shadow-xl">
                                        <BanknotesIcon className="w-6 h-6"/>
                                        <span>استأجر الآن وادفع</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full text-center bg-yellow-200 text-yellow-800 font-bold py-4 px-10 rounded-lg text-lg shadow-md">
                                    هذا العقار مؤجر حالياً
                                </div>
                            )}
                        </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      
      {/* Neighborhood Info Section */}
      <div className="bg-indigo-50/50 border-y border-indigo-100">
        <div className="container mx-auto px-4 py-16 sm:py-24">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">اكتشف الحي</h2>
                    <p className="mt-4 text-lg text-gray-600">نظرة سريعة على ما يحيط بعقارك المستقبلي، مقدمة من مساعدنا الذكي.</p>
                </div>
                {isLoadingInfo && (
                    <div className="text-center p-8 bg-white rounded-lg shadow-md border border-gray-200">
                        <CogIcon className="animate-spin h-10 w-10 mx-auto text-indigo-500" />
                        <p className="mt-4 font-semibold text-gray-700">جاري تحليل معلومات الحي...</p>
                    </div>
                )}
                {infoError && (
                    <div className="p-4 text-center rounded-lg border-l-4 bg-red-50 border-red-500 text-red-800" role="alert">
                       <p className="font-semibold">{infoError}</p>
                    </div>
                )}
                {neighborhoodInfo && (
                    <div className="space-y-6 animate-fade-in">
                        <p className="text-center text-xl text-gray-800 leading-relaxed bg-white p-6 rounded-xl border border-gray-200 shadow-sm">{neighborhoodInfo.summary}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <NeighborhoodInfoCard icon={<LifebuoyIcon className="w-7 h-7 text-indigo-500" />} title="أسلوب الحياة">
                                <p>{neighborhoodInfo.lifestyle}</p>
                            </NeighborhoodInfoCard>
                            <NeighborhoodInfoCard icon={<BuildingLibraryIcon className="w-7 h-7 text-green-500" />} title="الخدمات والمرافق">
                                <ul className="space-y-2 list-inside list-disc">
                                    {neighborhoodInfo.services.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </NeighborhoodInfoCard>
                            <NeighborhoodInfoCard icon={<TruckIcon className="w-7 h-7 text-blue-500" />} title="المواصلات والطرق">
                                <ul className="space-y-2 list-inside list-disc">
                                    {neighborhoodInfo.transportation.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </NeighborhoodInfoCard>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Maintenance History Section */}
      {propertyLogs.length > 0 && (
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-16 sm:py-24">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">سجل الصيانة</h2>
                <p className="mt-4 text-lg text-gray-600">نظرة على آخر أعمال الصيانة التي تمت في العقار لضمان الجودة والشفافية.</p>
              </div>
              <div className="flow-root">
                <ul className="-mb-8">
                  {propertyLogs.map((log, logIdx) => (
                    <li key={log.id}>
                      <div className="relative pb-8">
                        {logIdx !== propertyLogs.length - 1 ? (
                          <span className="absolute top-4 right-4 -mr-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3 space-x-reverse">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center ring-8 ring-white">
                              <WrenchScrewdriverIcon className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-md font-semibold text-gray-800">{log.description}</p>
                              {log.technicianName && (
                                <p className="text-sm text-gray-500">
                                  بواسطة الفني: <span className="font-medium">{log.technicianName}</span>
                                </p>
                              )}
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500 flex-shrink-0">
                              <time dateTime={log.date}>
                                {new Date(log.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Similar Properties Section */}
      {(isSimilarLoading || similarProperties.length > 0) && (
          <div className="bg-gray-50">
              <div className="container mx-auto px-4 py-16 sm:py-24">
                  <div className="max-w-7xl mx-auto">
                      <div className="text-center mb-12">
                          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">عقارات مشابهة قد تعجبك</h2>
                          <p className="mt-4 text-lg text-gray-600">اقتراحات ذكية بناءً على اهتماماتك.</p>
                      </div>
                      {isSimilarLoading ? (
                            <div className="text-center p-8">
                              <CogIcon className="animate-spin h-10 w-10 mx-auto text-indigo-500" />
                              <p className="mt-4 font-semibold text-gray-700">جاري البحث عن عقارات مشابهة...</p>
                          </div>
                      ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                              {similarProperties.map(prop => (
                                  <PropertyCard
                                      key={prop.id}
                                      property={prop}
                                      onSelect={onSelectProperty}
                                      aiReason={prop.aiReason}
                                      isFavorite={favoriteIds.includes(prop.id)}
                                      onToggleFavorite={toggleFavorite}
                                      isBeingCompared={false} 
                                      onToggleCompare={() => {}}
                                      showCompareButton={false}
                                  />
                              ))}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Reviews Section */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-16 sm:py-24">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">تقييمات العقار</h2>
                {propertyReviews.length > 3 && (
                    <div className="text-center mb-10">
                        <button 
                            onClick={handleSummarizeReviews} 
                            disabled={isSummaryLoading} 
                            className="flex items-center gap-2 mx-auto bg-indigo-100 text-indigo-700 font-bold py-3 px-6 rounded-lg hover:bg-indigo-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSummaryLoading ? <CogIcon className="w-5 h-5 animate-spin"/> : <SparklesIcon className="w-5 h-5" />}
                            <span>{isSummaryLoading ? 'جاري التلخيص...' : 'تلخيص التقييمات بالذكاء الاصطناعي'}</span>
                        </button>
                    </div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-16 items-start">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">هل أعجبك هذا العقار؟ شاركنا رأيك!</h3>
                        <ReviewForm
                            reviewType="property"
                            targetId={property.id}
                            targetName={property.title}
                            onSubmit={handleReviewSubmit}
                        />
                    </div>
                    <div className="max-h-[550px] overflow-y-auto pr-2">
                        <ReviewsList reviews={propertyReviews} />
                    </div>
                </div>
            </div>
        </div>
      </div>


       <Modal isOpen={isViewingModalOpen} onClose={() => setIsViewingModalOpen(false)} title={`طلب معاينة لـ "${property.title}"`}>
            <ViewingRequestForm
                propertyId={property.id}
                propertyName={property.title}
                onSubmit={handleViewingRequestSubmit}
                onCancel={() => setIsViewingModalOpen(false)}
                maintenanceCategories={maintenanceCategories}
                onNavigate={onNavigate}
                viewingConfirmationSettings={viewingConfirmationSettings}
            />
        </Modal>

        <Modal isOpen={isRentalModalOpen} onClose={() => setIsRentalModalOpen(false)} title={`استئجار ودفع لـ "${property.title}"`} size="lg">
            <RentalCheckoutForm
                property={property}
                onSuccess={handleRentalSubmit}
                onCancel={() => setIsRentalModalOpen(false)}
            />
        </Modal>

        <Lightbox
            isOpen={isLightboxOpen}
            onClose={closeLightbox}
            images={property.imageUrls}
            currentIndex={currentImageIndex}
            onNext={handleNextImage}
            onPrev={handlePrevImage}
       />

        <Modal isOpen={isSummaryModalOpen} onClose={() => setIsSummaryModalOpen(false)} title="ملخص تقييمات العقار">
            <div className="p-2">
                {isSummaryLoading && (
                    <div className="text-center p-8">
                        <CogIcon className="animate-spin h-10 w-10 mx-auto text-indigo-500" />
                        <p className="mt-4 font-semibold text-gray-700">جاري تلخيص التقييمات...</p>
                    </div>
                )}
                {summaryError && <p className="text-red-600 text-center p-4">{summaryError}</p>}
                {reviewSummary && <ReviewSummaryDisplay summary={reviewSummary} />}
            </div>
        </Modal>

        <Modal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} title="جولة بالفيديو للعقار" size="lg">
            <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden">
                {embedUrl ? (
                    <iframe
                        src={embedUrl}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                    ></iframe>
                ) : (
                    <div className="flex items-center justify-center h-full text-white bg-gray-800">
                        رابط الفيديو غير صالح أو غير متوفر.
                    </div>
                )}
            </div>
        </Modal>
    </div>
  );
};

export default PropertyDetailsPage;