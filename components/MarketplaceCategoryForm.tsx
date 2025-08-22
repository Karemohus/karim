import React, { useState, useEffect } from 'react';
import { MarketplaceServiceCategory, MarketplaceIconName, MarketplaceIconNames } from '../types';
import { ComputerDesktopIcon, SunIcon, DropletIcon, CogIcon } from './icons';

interface MarketplaceCategoryFormProps {
    initialData?: MarketplaceServiceCategory | null;
    onSubmit: (data: MarketplaceServiceCategory) => void;
    onCancel: () => void;
}

const DEFAULT_CATEGORY: Omit<MarketplaceServiceCategory, 'id'> = {
    name: '',
    description: '',
    icon: 'CogIcon' as MarketplaceIconName,
};

const IconPreview: React.FC<{ icon: MarketplaceIconName }> = ({ icon }) => {
    switch(icon) {
        case 'ComputerDesktopIcon': return <ComputerDesktopIcon className="w-8 h-8 text-indigo-600" />;
        case 'SunIcon': return <SunIcon className="w-8 h-8 text-indigo-600" />;
        case 'DropletIcon': return <DropletIcon className="w-8 h-8 text-indigo-600" />;
        default: return <CogIcon className="w-8 h-8 text-indigo-600" />;
    }
};

const MarketplaceCategoryForm: React.FC<MarketplaceCategoryFormProps> = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState(DEFAULT_CATEGORY);

    useEffect(() => {
        if (initialData) {
            setFormData({ ...DEFAULT_CATEGORY, ...initialData });
        } else {
            setFormData(DEFAULT_CATEGORY);
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalData: MarketplaceServiceCategory = {
            ...formData,
            id: initialData?.id || `mp-cat-${Date.now()}`,
        };
        onSubmit(finalData);
    };
    
    const inputClass = "w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className={labelClass}>اسم الفئة</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
                <label htmlFor="description" className={labelClass}>وصف قصير</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className={inputClass} />
            </div>
             <div>
                <label htmlFor="icon" className={labelClass}>أيقونة الفئة</label>
                <div className="flex items-center gap-4">
                    <select id="icon" name="icon" value={formData.icon} onChange={handleChange} className={`${inputClass} flex-grow`}>
                        {MarketplaceIconNames.map(iconName => (
                            <option key={iconName} value={iconName}>{iconName}</option>
                        ))}
                    </select>
                    <div className="p-3 bg-gray-100 rounded-lg border">
                        <IconPreview icon={formData.icon} />
                    </div>
                </div>
            </div>
            <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">
                    إلغاء
                </button>
                <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700">
                    {initialData ? 'حفظ التعديلات' : 'إضافة فئة'}
                </button>
            </div>
        </form>
    );
};

export default MarketplaceCategoryForm;