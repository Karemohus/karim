import React, { useState } from 'react';
import { Review, Technician } from '../types';
import { StarIcon, CheckCircleIcon, UserGroupIcon } from './icons';

interface ReviewFormProps {
    onSubmit: (data: Omit<Review, 'id' | 'createdAt'>) => void;
    reviewType: 'technician' | 'property';
    targetId?: string;
    targetName?: string;
    technicians?: Technician[];
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit, reviewType, targetId, targetName, technicians = [] }) => {
    const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
    const [userName, setUserName] = useState('');
    const [userPhone, setUserPhone] = useState('');
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        let currentTargetId = targetId;
        let currentTargetName = targetName;
        
        if (reviewType === 'technician') {
            if (!selectedTechnicianId) {
                setError('الرجاء اختيار فني لتقييمه.');
                return;
            }
            const selectedTechnician = technicians.find(t => t.id === selectedTechnicianId);
            if (!selectedTechnician) {
                 setError('الفني المختار غير صحيح.');
                 return;
            }
            currentTargetId = selectedTechnician.id;
            currentTargetName = selectedTechnician.name;
        }

        if (!currentTargetId || !currentTargetName) {
            setError('هدف التقييم غير محدد.');
            return;
        }
        if (!userName.trim()) {
            setError('الرجاء إدخال اسمك.');
            return;
        }
        if (rating === 0) {
            setError('الرجاء اختيار تقييم بالنجوم.');
            return;
        }
        if (!comment.trim()) {
            setError('الرجاء كتابة تعليقك.');
            return;
        }

        onSubmit({
            type: reviewType,
            targetId: currentTargetId,
            targetName: currentTargetName,
            userName,
            userPhone,
            rating,
            comment,
        });

        setIsSubmitted(true);
        // Reset form fields
        setUserName('');
        setUserPhone('');
        setRating(0);
        setComment('');
        setSelectedTechnicianId('');

    };

    if (isSubmitted) {
        return (
            <div className="text-center p-4 animate-fade-in bg-white rounded-lg">
                <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-gray-800">شكرًا لتقييمك!</h3>
                <p className="text-gray-600 mt-2">نقدر رأيك ومساهمتك في تحسين خدماتنا.</p>
                 <button onClick={() => setIsSubmitted(false)} className="mt-4 text-sm text-indigo-600 hover:underline font-semibold">إضافة تقييم آخر</button>
            </div>
        );
    }
    
    const inputClass = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-shadow bg-white";
    const labelClass = "block text-sm font-medium text-gray-700 mb-2";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {reviewType === 'technician' && (
                 <div>
                    <label htmlFor={`technician-select`} className={labelClass}>اختر الفني لتقييمه</label>
                    <div className="relative">
                        <select
                            id={`technician-select`}
                            value={selectedTechnicianId}
                            onChange={e => setSelectedTechnicianId(e.target.value)}
                            className={`${inputClass} appearance-none pr-10`}
                            required
                        >
                            <option value="" disabled>-- اختر اسم الموظف --</option>
                            {technicians.map(tech => (
                                <option key={tech.id} value={tech.id}>{tech.name} - ({tech.specialization})</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <UserGroupIcon className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            )}
            
            <div>
                <label htmlFor={`userName-review-${reviewType}`} className={labelClass}>اسمك</label>
                <input 
                    type="text" 
                    id={`userName-review-${reviewType}`}
                    value={userName} 
                    onChange={e => setUserName(e.target.value)}
                    className={inputClass} 
                    required 
                    placeholder="اسمك الكريم"
                />
            </div>

            <div>
                <label htmlFor={`userPhone-review-${reviewType}`} className={labelClass}>رقم الهاتف (اختياري)</label>
                <input 
                    type="tel" 
                    id={`userPhone-review-${reviewType}`}
                    value={userPhone} 
                    onChange={e => setUserPhone(e.target.value)}
                    className={inputClass} 
                    placeholder="سيتم تسجيله لدينا لسهولة التواصل"
                />
            </div>

            <div>
                 <label className={labelClass}>التقييم</label>
                 <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                    {[1, 2, 3, 4, 5].map(star => (
                        <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            className="focus:outline-none"
                            aria-label={`Rate ${star} stars`}
                        >
                            <StarIcon 
                                className={`w-8 h-8 cursor-pointer transition-colors ${
                                    (hoverRating || rating) >= star 
                                    ? 'text-yellow-400' 
                                    : 'text-gray-300 hover:text-yellow-300'
                                }`}
                            />
                        </button>
                    ))}
                 </div>
            </div>

            <div>
                <label htmlFor={`comment-review-${reviewType}`} className={labelClass}>تعليقك</label>
                <textarea 
                    id={`comment-review-${reviewType}`}
                    rows={4}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    className={inputClass}
                    required
                    placeholder={reviewType === 'technician' ? "اكتب رأيك في أداء الفني وخبرته..." : "اكتب رأيك في العقار ومميزاته..."}
                />
            </div>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md text-sm" role="alert">
                    <p>{error}</p>
                </div>
            )}

            <div className="pt-2">
                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                    إرسال التقييم
                </button>
            </div>
        </form>
    );
};

export default ReviewForm;