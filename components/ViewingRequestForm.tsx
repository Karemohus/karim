import React, { useState } from 'react';
import { ViewingRequest, MaintenanceCategory, Page, ViewingConfirmationSettings } from '../types';
import { CheckCircleIcon, WrenchIcon, BoltIcon, SparklesIcon, BugIcon, TruckIcon, CogIcon } from './icons';

interface ViewingRequestFormProps {
    propertyId: string;
    propertyName: string;
    onSubmit: (data: Omit<ViewingRequest, 'id' | 'requestDate' | 'status'>) => void;
    onCancel: () => void;
    maintenanceCategories: MaintenanceCategory[];
    onNavigate: (page: Page) => void;
    viewingConfirmationSettings: ViewingConfirmationSettings;
}

const getCategoryIcon = (category: string) => {
    const iconClass = "w-5 h-5";
    if (category.includes('سباكة')) return <WrenchIcon className={`${iconClass} text-blue-500`} />;
    if (category.includes('كهرباء')) return <BoltIcon className={`${iconClass} text-yellow-500`} />;
    if (category.includes('تكييف')) return <CogIcon className={`${iconClass} text-sky-500`} />;
    if (category.includes('تنظيف')) return <SparklesIcon className={`${iconClass} text-cyan-500`} />;
    if (category.includes('مكافحة حشرات')) return <BugIcon className={`${iconClass} text-red-500`} />;
    if (category.includes('نقل أثاث')) return <TruckIcon className={`${iconClass} text-orange-500`} />;
    return <CogIcon className={`${iconClass} text-gray-500`} />;
};

const ViewingRequestForm: React.FC<ViewingRequestFormProps> = ({ propertyId, propertyName, onSubmit, onCancel, maintenanceCategories, onNavigate, viewingConfirmationSettings }) => {
    const [formData, setFormData] = useState({
        userName: '',
        userPhone: '',
        userEmail: '',
        preferredTime: '',
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ ...formData, propertyId, propertyName });
        setIsSubmitted(true);
    };

    const handlePrimaryAction = () => {
        onCancel(); // Close the modal
        const link = viewingConfirmationSettings.primaryButtonLink;
        if (!link) return;

        const pages: Page[] = ['home', 'rentals', 'maintenance', 'admin', 'login', 'about'];
        if (pages.includes(link as Page)) {
            onNavigate(link as Page);
        } else if (link.startsWith('http')) {
            window.open(link, '_blank', 'noopener,noreferrer');
        } else {
            // Assume it's a relative path on the same site
            window.location.href = link.startsWith('/') ? link : `/${link}`;
        }
    };
    
    if (isSubmitted) {
        // Use the old simple success message if the new feature is disabled
        if (!viewingConfirmationSettings.isEnabled) {
             return (
                <div className="text-center p-6 sm:p-8 animate-fade-in">
                    <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-800">تم إرسال طلبك بنجاح!</h3>
                    <p className="text-gray-600 mt-2 max-w-md mx-auto">سنتواصل معك قريبًا لترتيب موعد المعاينة.</p>
                    <button onClick={onCancel} className="mt-8 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors">
                        إغلاق
                    </button>
                </div>
             );
        }

        const settings = viewingConfirmationSettings;
        const featuredCategories = settings.featuredCategoryIds
            .map(id => maintenanceCategories.find(cat => cat.id === id))
            .filter((cat): cat is MaintenanceCategory => cat !== undefined);

        return (
            <div className="text-center p-6 sm:p-8 animate-fade-in">
                {settings.imageUrl ? (
                    <img src={settings.imageUrl} alt="Offer" className="max-h-40 w-auto mx-auto mb-6 rounded-lg object-contain" />
                ) : (
                    <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                )}

                <h3 className="text-2xl font-bold text-gray-800">{settings.title}</h3>
                <p className="text-gray-600 mt-2 max-w-md mx-auto">{settings.subtitle}</p>
                
                {settings.showMaintenanceServices && featuredCategories.length > 0 && (
                    <div className="my-8 pt-8 border-t-2 border-dashed border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">بعض خدماتنا التي قد تهمك:</h4>
                        <div className="flex flex-wrap justify-center gap-3 mb-6">
                            {featuredCategories.map(cat => (
                                <div key={cat.id} className="flex items-center gap-2 bg-gray-100 text-gray-700 font-semibold px-4 py-2 rounded-full border border-gray-200">
                                    {getCategoryIcon(cat.name)}
                                    <span>{cat.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
    
                <div className="mt-8 space-y-4">
                    {settings.primaryButtonText && settings.primaryButtonLink && (
                         <button 
                            onClick={handlePrimaryAction}
                            className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-indigo-500/30"
                        >
                            {settings.primaryButtonText}
                        </button>
                    )}
                    <button onClick={onCancel} className="w-full text-sm text-gray-500 hover:text-gray-700 hover:underline py-2">
                        أو أغلق هذه النافذة
                    </button>
                </div>
            </div>
        );
    }
    
    const inputClass = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-shadow";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="userName" className={labelClass}>الاسم الكامل</label>
                <input type="text" id="userName" name="userName" value={formData.userName} onChange={handleChange} className={inputClass} required autoComplete="name" />
            </div>
            <div>
                <label htmlFor="userPhone" className={labelClass}>رقم الهاتف</label>
                <input type="tel" id="userPhone" name="userPhone" value={formData.userPhone} onChange={handleChange} className={inputClass} required autoComplete="tel" />
            </div>
            <div>
                <label htmlFor="userEmail" className={labelClass}>البريد الإلكتروني (اختياري)</label>
                <input type="email" id="userEmail" name="userEmail" value={formData.userEmail} onChange={handleChange} className={inputClass} autoComplete="email" />
            </div>
            <div>
                <label htmlFor="preferredTime" className={labelClass}>الوقت المفضل للمعاينة (اختياري)</label>
                <textarea id="preferredTime" name="preferredTime" value={formData.preferredTime} onChange={handleChange} rows={3} className={inputClass} placeholder="مثال: أيام الأسبوع بعد الساعة 5 مساءً" />
            </div>
            <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                    إلغاء
                </button>
                <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                    إرسال الطلب
                </button>
            </div>
        </form>
    );
};

export default ViewingRequestForm;