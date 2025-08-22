import React, { useState, useEffect } from 'react';
import { Property, PropertyType, PropertyStatus } from '../types';
import { PhotoIcon, TrashIcon, SparklesIcon, CogIcon } from './icons';
import { generatePropertyDescription } from '../services/geminiService';

interface PropertyFormProps {
    initialData?: Property | null;
    onSubmit: (propertyData: Property) => void;
    onCancel: () => void;
}

const DEFAULT_PROPERTY: Omit<Property, 'id' | 'createdAt'> = {
    title: '',
    type: 'سكني',
    price: 0,
    location: '',
    latitude: 0,
    longitude: 0,
    imageUrls: [],
    videoUrl: '',
    description: '',
    area: 0,
    bedrooms: 0,
    bathrooms: 0,
    commission: 0,
    status: 'متاح',
};

const PropertyForm: React.FC<PropertyFormProps> = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<Omit<Property, 'id' | 'createdAt'>>(DEFAULT_PROPERTY);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({ ...DEFAULT_PROPERTY, ...initialData });
        } else {
            setFormData(DEFAULT_PROPERTY);
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newType = e.target.value as PropertyType;
        setFormData(prev => ({
            ...prev,
            type: newType,
            bedrooms: newType === 'تجاري' ? undefined : (prev.bedrooms || 0),
            bathrooms: newType === 'تجاري' ? undefined : (prev.bathrooms || 0),
        }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (reader.result) {
                        setFormData(prev => ({
                            ...prev,
                            imageUrls: [...prev.imageUrls, reader.result as string],
                        }));
                    }
                };
                reader.readAsDataURL(file);
            });
        }
        e.target.value = ''; // Allow re-uploading the same file
    };

    const handleRemoveImage = (e: React.MouseEvent, indexToRemove: number) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm('هل أنت متأكد من رغبتك في حذف هذه الصورة؟')) {
            setFormData(prev => ({
                ...prev,
                imageUrls: prev.imageUrls.filter((_, index) => index !== indexToRemove),
            }));
        }
    };

     const handleGenerateDescription = async () => {
        setIsGenerating(true);
        try {
            const description = await generatePropertyDescription(formData);
            setFormData(prev => ({...prev, description: description}));
        } catch (error) {
            console.error(error);
            alert("حدث خطأ أثناء إنشاء الوصف. الرجاء المحاولة مرة أخرى.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const finalProperty: Property = {
            ...formData,
            id: initialData?.id || `prop-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            createdAt: initialData?.createdAt || new Date().toISOString(),
            price: Number(formData.price) || 0,
            area: Number(formData.area) || 0,
            latitude: Number(formData.latitude) || 0,
            longitude: Number(formData.longitude) || 0,
            bedrooms: formData.type === 'سكني' ? (Number(formData.bedrooms) || 0) : undefined,
            bathrooms: formData.type === 'سكني' ? (Number(formData.bathrooms) || 0) : undefined,
            commission: Number(formData.commission) || 0,
            status: formData.status as PropertyStatus,
        };
        onSubmit(finalProperty);
    };

    const inputClass = "w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="title" className={labelClass}>عنوان العقار</label>
                <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} className={inputClass} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <span className={labelClass}>نوع العقار</span>
                    <div className="flex gap-4 mt-2">
                        <label className="flex items-center gap-2">
                            <input type="radio" name="type" value="سكني" checked={formData.type === 'سكني'} onChange={handleTypeChange} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" />
                            سكني
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="radio" name="type" value="تجاري" checked={formData.type === 'تجاري'} onChange={handleTypeChange} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" />
                            تجاري
                        </label>
                    </div>
                </div>
                 <div>
                    <label htmlFor="location" className={labelClass}>الموقع</label>
                    <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} className={inputClass} required />
                </div>
            </div>

            <div>
                <label htmlFor="videoUrl" className={labelClass}>رابط الفيديو (يوتيوب)</label>
                <input type="url" id="videoUrl" name="videoUrl" value={formData.videoUrl || ''} onChange={handleChange} className={inputClass} placeholder="https://www.youtube.com/watch?v=..." />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="latitude" className={labelClass}>خط العرض (Latitude)</label>
                    <input type="number" step="any" id="latitude" name="latitude" value={formData.latitude} onChange={handleChange} className={inputClass} required />
                </div>
                 <div>
                    <label htmlFor="longitude" className={labelClass}>خط الطول (Longitude)</label>
                    <input type="number" step="any" id="longitude" name="longitude" value={formData.longitude} onChange={handleChange} className={inputClass} required />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <label htmlFor="price" className={labelClass}>السعر (شهريًا)</label>
                    <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                    <label htmlFor="commission" className={labelClass}>العمولة (ريال)</label>
                    <input type="number" id="commission" name="commission" value={formData.commission || ''} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                    <label htmlFor="area" className={labelClass}>المساحة (م²)</label>
                    <input type="number" id="area" name="area" value={formData.area} onChange={handleChange} className={inputClass} required />
                </div>
                 <div>
                    <label htmlFor="status" className={labelClass}>حالة العقار</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className={inputClass} required>
                        <option value="متاح">متاح</option>
                        <option value="مؤجر">مؤجر</option>
                    </select>
                </div>
            </div>

            {formData.type === 'سكني' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="bedrooms" className={labelClass}>عدد غرف النوم</label>
                        <input type="number" id="bedrooms" name="bedrooms" value={formData.bedrooms || ''} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="bathrooms" className={labelClass}>عدد الحمامات</label>
                        <input type="number" id="bathrooms" name="bathrooms" value={formData.bathrooms || ''} onChange={handleChange} className={inputClass} />
                    </div>
                </div>
            )}
            
            <div>
                 <div className="flex justify-between items-center mb-1">
                    <label htmlFor="description" className={labelClass}>الوصف</label>
                    <button 
                      type="button"
                      onClick={handleGenerateDescription}
                      disabled={isGenerating || !formData.title || !formData.location || !formData.area}
                      className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isGenerating ? <CogIcon className="w-5 h-5 animate-spin"/> : <SparklesIcon className="w-5 h-5"/>}
                      <span>{isGenerating ? 'جاري الإنشاء...' : 'إنشاء وصف بالذكاء الاصطناعي'}</span>
                    </button>
                </div>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={6} className={inputClass} required />
            </div>

            <div>
                <label className={labelClass}>صور العقار</label>
                <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 justify-center">
                            <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 px-1">
                                <span>ارفع الملفات</span>
                                <input id="image-upload" name="image-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleImageUpload} />
                            </label>
                        </div>
                        <p className="text-xs text-gray-500">
                            PNG, JPG, GIF
                        </p>
                    </div>
                </div>

                {formData.imageUrls.length > 0 && (
                  <div className="mt-4">
                      <p className="font-medium text-gray-700">الصور المحددة:</p>
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {formData.imageUrls.map((url, index) => (
                              <div key={index} className="relative group">
                                  <img src={url} alt={`preview ${index}`} className="h-28 w-full object-cover rounded-md border border-gray-200" />
                                  <button 
                                      type="button"
                                      onClick={(e) => handleRemoveImage(e, index)} 
                                      aria-label="Remove image"
                                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 transform hover:scale-110"
                                  >
                                      <TrashIcon className="w-5 h-5" />
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>
                )}
            </div>
            
            <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                    إلغاء
                </button>
                <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                    {initialData ? 'حفظ التعديلات' : 'إضافة العقار'}
                </button>
            </div>
        </form>
    );
};

export default PropertyForm;