
import React, { useState } from 'react';
import { Property, ViewingRequest, Review, MaintenanceCategory, Page, ViewingConfirmationSettings } from '../types';
import { MapPinIcon, ArrowsPointingOutIcon, BedIcon, ShowerIcon, DocumentTextIcon, ArrowLeftIcon, HomeModernIcon, BuildingOffice2Icon, StarIcon, TagIcon } from './icons';
import Modal from './Modal';
import ViewingRequestForm from './ViewingRequestForm';
import Lightbox from './Lightbox';
import ReviewForm from './ReviewForm';
import ReviewsList from './ReviewsList';

interface PropertyDetailsPageProps {
  property: Property;
  onBack: () => void;
  onViewingRequestSubmit: (data: Omit<ViewingRequest, 'id' | 'requestDate' | 'status'>) => void;
  reviews: Review[];
  onReviewSubmit: (data: Omit<Review, 'id' | 'createdAt'>) => void;
  maintenanceCategories: MaintenanceCategory[];
  onNavigate: (page: Page) => void;
  viewingConfirmationSettings: ViewingConfirmationSettings;
}

const Stat: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
    <div className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-xl text-center border border-gray-200">
        <div className="text-indigo-600 mb-2">{icon}</div>
        <span className="text-2xl font-bold text-gray-800">{value}</span>
        <span className="text-sm text-gray-500">{label}</span>
    </div>
);

const PropertyDetailsPage: React.FC<PropertyDetailsPageProps> = ({ property, onBack, onViewingRequestSubmit, reviews, onReviewSubmit, maintenanceCategories, onNavigate, viewingConfirmationSettings }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const propertyReviews = reviews.filter(r => r.type === 'property' && r.targetId === property.id);
  const averageRating = propertyReviews.length > 0
    ? propertyReviews.reduce((sum, review) => sum + review.rating, 0) / propertyReviews.length
    : 0;

  const handleRequestSubmit = (data: Omit<ViewingRequest, 'id' | 'requestDate' | 'status'>) => {
    onViewingRequestSubmit(data);
    // The form now shows a success message, so we don't close the modal immediately.
    // The user can close it via the form's button or the modal's close button.
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


  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-8 md:py-16 animate-fade-in">
          <div className="max-w-7xl mx-auto">
              <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-semibold mb-8 transition-colors">
                  <ArrowLeftIcon className="w-5 h-5" />
                  <span>العودة إلى قائمة العقارات</span>
              </button>

              {/* Page Header */}
              <div className="mb-8">
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
                        <div className="bg-gray-50 rounded-lg p-6 flex flex-col sm:flex-row justify-between items-center">
                            <div className="flex items-baseline text-indigo-600 mb-4 sm:mb-0">
                                <span className="text-4xl font-extrabold">{property.price.toLocaleString()}</span>
                                <span className="text-lg font-normal text-gray-500 mr-2">ريال/شهريًا</span>
                            </div>
                            {property.status === 'متاح' ? (
                                <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-indigo-600 text-white font-bold py-4 px-10 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all text-lg shadow-lg hover:shadow-xl">
                                  احجز معاينة الآن
                                </button>
                            ) : (
                                <div className="w-full sm:w-auto text-center bg-yellow-200 text-yellow-800 font-bold py-4 px-10 rounded-lg text-lg shadow-md">
                                    هذا العقار مؤجر حالياً
                                </div>
                            )}
                        </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-8 bg-gray-50/70 border-t border-gray-200">
        <div className="container mx-auto px-4 py-16 sm:py-24">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">تقييمات العقار</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-16 items-start">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">هل أعجبك هذا العقار؟ شاركنا رأيك!</h3>
                        <ReviewForm
                            reviewType="property"
                            targetId={property.id}
                            targetName={property.title}
                            onSubmit={onReviewSubmit}
                        />
                    </div>
                    <div className="max-h-[550px] overflow-y-auto pr-2">
                        <ReviewsList reviews={propertyReviews} />
                    </div>
                </div>
            </div>
        </div>
      </div>


       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`طلب معاينة لـ "${property.title}"`}>
            <ViewingRequestForm
                propertyId={property.id}
                propertyName={property.title}
                onSubmit={handleRequestSubmit}
                onCancel={() => setIsModalOpen(false)}
                maintenanceCategories={maintenanceCategories}
                onNavigate={onNavigate}
                viewingConfirmationSettings={viewingConfirmationSettings}
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
    </div>
  );
};

export default PropertyDetailsPage;