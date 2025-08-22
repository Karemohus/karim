import React, { useState } from 'react';
import { MarketplaceServiceProvider, MarketplaceBooking } from '../types';
import { useAuth } from '../context/AuthContext';
import { CheckCircleIcon } from './icons';

interface MarketplaceBookingFormProps {
    provider: MarketplaceServiceProvider;
    onSubmit: (data: Omit<MarketplaceBooking, 'id' | 'requestDate' | 'status'>) => void;
    onCancel: () => void;
}

const MarketplaceBookingForm: React.FC<MarketplaceBookingFormProps> = ({ provider, onSubmit, onCancel }) => {
    const { currentUser } = useAuth();
    const [formData, setFormData] = useState({
        userName: currentUser?.name || '',
        userPhone: currentUser?.phone || '',
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            serviceProviderId: provider.id,
            serviceProviderName: provider.name,
            userId: currentUser?.id,
        });
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="text-center p-6 sm:p-8 animate-fade-in">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800">تم إرسال طلبك بنجاح!</h3>
                <p className="text-gray-600 mt-2 max-w-md mx-auto">سيقوم مزود الخدمة بالتواصل معك قريبًا على الرقم الذي أدخلته لتأكيد التفاصيل.</p>
                <button onClick={onCancel} className="mt-8 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors">
                    إغلاق
                </button>
            </div>
        );
    }
    
    const inputClass = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-shadow";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-600">
                يرجى تأكيد بيانات التواصل الخاصة بك لإرسال طلب الخدمة إلى <strong>{provider.name}</strong>.
            </p>
            <div>
                <label htmlFor="userNameBooking" className={labelClass}>الاسم الكامل</label>
                <input type="text" id="userNameBooking" name="userName" value={formData.userName} onChange={handleChange} className={inputClass} required autoComplete="name" />
            </div>
            <div>
                <label htmlFor="userPhoneBooking" className={labelClass}>رقم الهاتف</label>
                <input type="tel" id="userPhoneBooking" name="userPhone" value={formData.userPhone} onChange={handleChange} className={inputClass} required autoComplete="tel" />
            </div>
            <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                    إلغاء
                </button>
                <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                    تأكيد وإرسال الطلب
                </button>
            </div>
        </form>
    );
};

export default MarketplaceBookingForm;