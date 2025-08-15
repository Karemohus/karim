import React, { useState } from 'react';
import { CheckCircleIcon, CursorArrowRaysIcon, CogIcon } from './icons';

interface MaintenanceRequestFormProps {
    onSubmit: (data: { userName: string; userPhone: string; userEmail?: string; address: string; latitude?: number; longitude?: number; }) => void;
    onCancel: () => void;
}

const MaintenanceRequestForm: React.FC<MaintenanceRequestFormProps> = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        userName: '',
        userPhone: '',
        userEmail: '',
        address: '',
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    const [location, setLocation] = useState<{ latitude?: number, longitude?: number }>({});
    const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [locationError, setLocationError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLocationClick = () => {
        if (!navigator.geolocation) {
            setLocationStatus('error');
            setLocationError('المتصفح لا يدعم تحديد الموقع.');
            return;
        }

        setLocationStatus('loading');
        setLocationError('');
        setLocation({});

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setLocationStatus('success');
            },
            (error) => {
                setLocationStatus('error');
                let message = 'حدث خطأ أثناء تحديد الموقع.';
                if (error.code === error.PERMISSION_DENIED) {
                    message = 'تم رفض إذن الوصول إلى الموقع. يرجى السماح بالوصول والمحاولة مرة أخرى.';
                }
                setLocationError(message);
            }
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.address.trim() && !location.latitude) {
            alert('الرجاء إدخال العنوان التفصيلي أو تحديد الموقع الحالي.');
            return;
        }
        onSubmit({ ...formData, ...location });
        setIsSubmitted(true);
    };
    
    if (isSubmitted) {
        return (
            <div className="text-center p-8 animate-fade-in">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800">تم تأكيد طلب الصيانة!</h3>
                <p className="text-gray-600 mt-2">لقد تم إرسال طلبك إلى الفريق المختص، وسيتم التواصل معك قريباً. يمكنك إغلاق هذه النافذة.</p>
                 <button onClick={onCancel} className="mt-6 bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors">
                    حسنًا
                </button>
            </div>
        );
    }
    
    const inputClass = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-shadow";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
                الرجاء إدخال بيانات التواصل الخاصة بك وتحديد موقعك لتأكيد الطلب.
            </p>
            <div>
                <label htmlFor="userNameMaint" className={labelClass}>الاسم الكامل</label>
                <input type="text" id="userNameMaint" name="userName" value={formData.userName} onChange={handleChange} className={inputClass} required autoComplete="name" />
            </div>
             <div>
                <label htmlFor="userPhoneMaint" className={labelClass}>رقم الهاتف</label>
                <input type="tel" id="userPhoneMaint" name="userPhone" value={formData.userPhone} onChange={handleChange} className={inputClass} required autoComplete="tel" />
            </div>
             <div>
                <label htmlFor="address" className={labelClass}>العنوان التفصيلي (اختياري مع تحديد الموقع)</label>
                <textarea id="address" name="address" value={formData.address} onChange={handleChange} rows={3} className={inputClass} placeholder="مثال: الرياض، حي العليا، شارع الأمير محمد بن عبدالعزيز، مبنى 123..." />
            </div>

            <div className="border-t pt-4">
                 <label className={labelClass}>أو حدد موقعك الحالي (أكثر دقة)</label>
                <button 
                    type="button" 
                    onClick={handleLocationClick} 
                    disabled={locationStatus === 'loading'} 
                    className="w-full flex items-center justify-center gap-2 bg-blue-100 text-blue-700 font-bold py-3 px-4 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-70 disabled:cursor-wait"
                >
                    {locationStatus === 'loading' ? (
                        <CogIcon className="w-5 h-5 animate-spin" />
                    ) : (
                        <CursorArrowRaysIcon className="w-5 h-5" />
                    )}
                    <span>{locationStatus === 'loading' ? 'جاري التحديد...' : 'تحديد الموقع الحالي'}</span>
                </button>
                 {locationStatus === 'success' && (
                    <div className="mt-2 text-green-700 bg-green-100 p-2 rounded-md text-sm flex items-center gap-2">
                        <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
                        <span>تم تحديد الموقع بنجاح. يمكنك المتابعة لإرسال الطلب.</span>
                    </div>
                )}
                {locationStatus === 'error' && (
                    <div className="mt-2 text-red-700 bg-red-100 p-2 rounded-md text-sm">
                        {locationError}
                    </div>
                )}
            </div>

            <div>
                <label htmlFor="userEmailMaint" className={labelClass}>البريد الإلكتروني (اختياري)</label>
                <input type="email" id="userEmailMaint" name="userEmail" value={formData.userEmail} onChange={handleChange} className={inputClass} autoComplete="email" />
            </div>
            <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                    إلغاء
                </button>
                <button type="submit" className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                    تأكيد الطلب
                </button>
            </div>
        </form>
    );
};

export default MaintenanceRequestForm;