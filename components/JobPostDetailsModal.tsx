import React from 'react';
import { MaintenanceJobPost, MaintenanceOffer, Technician } from '../types';
import { useData } from '../context/DataContext';
import Modal from './Modal';
import { StarIcon, CheckCircleIcon, UserGroupIcon, GlobeAltIcon, WrenchIcon } from './icons';

interface OfferCardProps {
    offer: MaintenanceOffer;
    isAccepted: boolean;
    isActionable: boolean;
    onAccept: (offerId: string) => void;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
            <StarIcon key={index} className={`w-5 h-5 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`} />
        ))}
        <span className="text-sm font-bold text-gray-600 mr-2">{rating.toFixed(1)}</span>
    </div>
);

const OfferCard: React.FC<OfferCardProps> = ({ offer, isAccepted, isActionable, onAccept }) => {
    const cardBorder = isAccepted 
        ? 'border-green-500 bg-green-50' 
        : (isActionable ? 'border-gray-200 bg-white hover:border-indigo-400' : 'border-gray-200 bg-gray-100 opacity-70');

    return (
        <div className={`p-4 rounded-lg border-2 transition-all duration-300 ${cardBorder}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {offer.technicianImageUrl ? (
                    <img src={offer.technicianImageUrl} alt={offer.technicianName} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
                ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <UserGroupIcon className="w-8 h-8 text-gray-500" />
                    </div>
                )}
                <div className="flex-grow">
                    <p className="font-bold text-gray-900 text-lg">{offer.technicianName}</p>
                    <StarRating rating={offer.technicianRating} />
                </div>
                <div className="text-center sm:text-left">
                    <p className="text-2xl font-extrabold text-indigo-600">{offer.price.toLocaleString()} <span className="text-base font-medium text-gray-500">ريال</span></p>
                    <p className="text-xs text-gray-500">تقدير مبدئي</p>
                </div>
                <div className="flex-shrink-0 w-full sm:w-auto">
                    {isAccepted ? (
                         <div className="w-full text-center flex items-center justify-center gap-2 font-bold py-2 px-5 rounded-lg bg-green-200 text-green-800">
                             <CheckCircleIcon className="w-5 h-5"/>
                             <span>تم القبول</span>
                         </div>
                    ) : (
                         <button 
                            onClick={() => onAccept(offer.id)} 
                            disabled={!isActionable}
                            className="w-full font-bold py-2 px-5 rounded-lg transition-colors bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                           قبول العرض
                        </button>
                    )}
                </div>
            </div>
            {offer.notes && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600 italic">"{offer.notes}"</p>
                </div>
            )}
        </div>
    );
};

interface JobPostDetailsModalProps {
    jobPost: MaintenanceJobPost;
    onClose: () => void;
}

const JobPostDetailsModal: React.FC<JobPostDetailsModalProps> = ({ jobPost, onClose }) => {
    const { db, setMaintenanceJobPosts, setMaintenanceOffers } = useData();
    const { maintenanceOffers } = db;

    const offers = maintenanceOffers.filter(o => o.jobPostId === jobPost.id)
        .sort((a, b) => a.price - b.price);

    const handleAcceptOffer = (offerId: string) => {
        // 1. Update the job post
        setMaintenanceJobPosts(prev => prev.map(jp => 
            jp.id === jobPost.id ? { ...jp, status: 'assigned', acceptedOfferId: offerId } : jp
        ));

        // 2. Update all offers for this job
        setMaintenanceOffers(prev => prev.map(offer => {
            if (offer.jobPostId === jobPost.id) {
                return { ...offer, status: offer.id === offerId ? 'accepted' : 'rejected' };
            }
            return offer;
        }));
        
        onClose();
    };

    return (
        <Modal isOpen={!!jobPost} onClose={onClose} title="تفاصيل الطلب وعروض الأسعار" size="lg">
            <div className="p-2 space-y-6">
                {/* Job Details */}
                <div className="p-4 bg-gray-50 rounded-lg border">
                    <h3 className="text-lg font-bold text-gray-800">{jobPost.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{jobPost.categoryName} - {jobPost.address}</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{jobPost.description}</p>
                    {jobPost.imageUrls.length > 0 && (
                        <div className="mt-3 flex gap-2 flex-wrap">
                            {jobPost.imageUrls.map((url, index) => (
                                <img key={index} src={url} alt={`Job image ${index+1}`} className="w-20 h-20 object-cover rounded-md border" />
                            ))}
                        </div>
                    )}
                </div>

                {/* Offers List */}
                <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3">العروض المستلمة ({offers.length})</h3>
                    {offers.length > 0 ? (
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                            {offers.map(offer => (
                                <OfferCard 
                                    key={offer.id}
                                    offer={offer}
                                    isAccepted={offer.id === jobPost.acceptedOfferId}
                                    isActionable={jobPost.status === 'open'}
                                    onAccept={handleAcceptOffer}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-8 bg-gray-100 rounded-lg border">
                            <p className="text-gray-600">لم يتم استلام أي عروض بعد. يرجى التحقق مرة أخرى قريبًا.</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default JobPostDetailsModal;
