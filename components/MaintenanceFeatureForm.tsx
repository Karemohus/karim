import React, { useState, useEffect } from 'react';
import { MaintenanceFeature, MaintenanceFeatureIconName, MaintenanceFeatureIconNames } from '../types';

interface MaintenanceFeatureFormProps {
    initialData?: MaintenanceFeature | null;
    onSubmit: (data: MaintenanceFeature) => void;
    onCancel: () => void;
}

const iconOptions: { value: MaintenanceFeatureIconName; label: string }[] = [
    { value: 'ShieldCheckIcon', label: 'أيقونة الدرع' },
    { value: 'LockClosedIcon', label: 'أيقونة القفل' },
    { value: 'ChatBubbleLeftEllipsisIcon', label: 'أيقونة المحادثة' },
    { value: 'TagIcon', label: 'أيقونة الخصم' },
    { value: 'ReceiptPercentIcon', label: 'أيقونة الفاتورة' },
    { value: 'ArrowUturnLeftIcon', label: 'أيقونة الإلغاء' },
    { value: 'WrenchScrewdriverIcon', label: 'أيقونة الصيانة' },
    { value: 'StarIcon', label: 'أيقونة النجمة' },
    { value: 'CheckCircleIcon', label: 'أيقونة الصح' },
];

const DEFAULT_FEATURE: Omit<MaintenanceFeature, 'id'> = {
    title: '',
    description: '',
    icon: 'ShieldCheckIcon',
};

const MaintenanceFeatureForm: React.FC<MaintenanceFeatureFormProps> = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState(DEFAULT_FEATURE);

    useEffect(() => {
        if (initialData) {
            setFormData({ ...DEFAULT_FEATURE, ...initialData });
        } else {
            setFormData(DEFAULT_FEATURE);
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            alert("عنوان الميزة مطلوب.");
            return;
        }
        
        const finalData: MaintenanceFeature = {
            ...formData,
            id: initialData?.id || `mf-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        };
        onSubmit(finalData);
    };

    const inputClass = "w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="title" className={labelClass}>عنوان الميزة</label>
                <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} className={inputClass} required />
            </div>
            
            <div>
                <label htmlFor="icon" className={labelClass}>الأيقونة</label>
                <select id="icon" name="icon" value={formData.icon} onChange={handleChange} className={inputClass} required>
                    {iconOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
            
            <div>
                <label htmlFor="description" className={labelClass}>وصف الميزة</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className={inputClass} required />
            </div>

            <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                    إلغاء
                </button>
                <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                    {initialData ? 'حفظ التعديلات' : 'إضافة الميزة'}
                </button>
            </div>
        </form>
    );
};

export default MaintenanceFeatureForm;
