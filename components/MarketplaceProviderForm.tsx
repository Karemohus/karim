import React, { useState, useEffect } from 'react';
import { MarketplaceServiceProvider, MarketplaceServiceCategory } from '../types';
import { CogIcon } from './icons';

interface MarketplaceProviderFormProps {
    initialData?: MarketplaceServiceProvider | null;
    categories: MarketplaceServiceCategory[];
    onSubmit: (data: MarketplaceServiceProvider) => void;
    onCancel: () => void;
}

const DEFAULT_PROVIDER: Omit<MarketplaceServiceProvider, 'id'> = {
    name: '',
    categoryId: '',
    description: '',
    phone: '',
    logoUrl: '',
};

const MarketplaceProviderForm: React.FC<MarketplaceProviderFormProps> = ({ initialData, categories, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState(DEFAULT_PROVIDER);

    useEffect(() => {
        if (initialData) {
            setFormData({ ...DEFAULT_PROVIDER, ...initialData });
        } else {
            setFormData({ ...DEFAULT_PROVIDER, categoryId: categories[0]?.id || '' });
        }
    }, [initialData, categories]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalData: MarketplaceServiceProvider = {
            ...formData,
            id: initialData?.id || `mp-prov-${Date.now()}`,
        };
        onSubmit(finalData);
    };
    
    const inputClass = "w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label className={labelClass}>شعار مزود الخدمة</label>
                <div className="mt-2 flex items-center gap-4">
                    {formData.logoUrl ? (
                        <img src={formData.logoUrl} alt="Logo" className="h-20 w-20 rounded-full object-contain bg-gray-100 p-1 border" />
                    ) : (
                        <div className="h-20 w-20 flex items-center justify-center bg-gray-100 rounded-full border">
                            <CogIcon className="h-10 w-10 text-gray-400" />
                        </div>
                    )}
                     <label htmlFor="logo-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                        <span>تغيير الشعار</span>
                        <input id="logo-upload" name="logo-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
                    </label>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="name" className={labelClass}>اسم مزود الخدمة</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={inputClass} required />
                </div>
                 <div>
                    <label htmlFor="categoryId" className={labelClass}>فئة الخدمة</label>
                    <select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange} className={inputClass} required>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                </div>
            </div>
             <div>
                <label htmlFor="phone" className={labelClass}>رقم الهاتف</label>
                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
                <label htmlFor="description" className={labelClass}>وصف قصير</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className={inputClass} />
            </div>
            <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">
                    إلغاء
                </button>
                <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700">
                    {initialData ? 'حفظ التعديلات' : 'إضافة مزود خدمة'}
                </button>
            </div>
        </form>
    );
};

export default MarketplaceProviderForm;