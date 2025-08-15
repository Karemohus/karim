import React from 'react';
import { Review } from '../types';
import { StarIcon, ChatBubbleBottomCenterTextIcon } from './icons';

interface ReviewsListProps {
    reviews: Review[];
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, index) => {
            const starValue = index + 1;
            return (
                <StarIcon
                    key={index}
                    className={`w-5 h-5 ${starValue <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                />
            );
        })}
    </div>
);

const ReviewsList: React.FC<ReviewsListProps> = ({ reviews }) => {
    
    if (reviews.length === 0) {
        return (
            <div className="text-center py-12 px-6 bg-gray-50 rounded-2xl border border-gray-200">
                <ChatBubbleBottomCenterTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-xl font-bold text-gray-800">لا توجد تقييمات بعد</h3>
                <p className="mt-1 text-gray-600">كن أول من يشاركنا رأيه!</p>
            </div>
        );
    }
    
    // Sort reviews by most recent
    const sortedReviews = [...reviews].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="space-y-6">
            {sortedReviews.map(review => (
                <div key={review.id} className="bg-white p-5 rounded-xl shadow-md border border-gray-200 animate-fade-in">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                                {review.userName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800">{review.userName}</h4>
                                <p className="text-xs text-gray-500">
                                    {new Date(review.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                        <StarRating rating={review.rating} />
                    </div>
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                        {review.comment}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default ReviewsList;