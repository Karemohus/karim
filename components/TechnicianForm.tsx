import React, { useState, useEffect } from 'react';
import { Technician, MaintenanceCategory } from '../types';
import { PhotoIcon, UserGroupIcon } from './icons';

interface TechnicianFormProps {
    initialData?: Technician | null;
    maintenanceCategories: MaintenanceCategory[];
    onSubmit: (data: Technician) => void;
    onCancel: () => void;
}

const DEFAULT_TECHNICIAN: Omit<Technician, 'id'> = {
    name: '',
    specialization: '',
    phone: '',
    isAvailable: true,
    experienceYears: 0,
    rating: 3,
    skills: [],
    bio: '',
    imageUrl: '',
    region: '',
};

const TechnicianForm: React.FC<TechnicianFormProps> = ({ initialData, maintenanceCategories, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState(DEFAULT_TECHNICIAN);
    const [skillsInput, setSkillsInput] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData({ ...DEFAULT_TECHNICIAN, ...initialData });
            setSkillsInput(initialData.skills.join(', '));
        } else {
            const defaultSpecialization = maintenanceCategories.length > 0 ? maintenanceCategories[0].name : '';
            setFormData({...DEFAULT_TECHNICIAN, specialization: defaultSpecialization });
            setSkillsInput('');
        }
    }, [initialData, maintenanceCategories]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        if (name === 'skills') {
            setSkillsInput(value);
        } else {
            setFormData(prev => ({ 
                ...prev, 
                [name]: type === 'checkbox' ? checked : value 
            }));
        }
    };
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.specialization.trim()) {
            alert("اسم الفني والتخصص حقول مطلوبة.");
            return;
        }
        
        const finalData: Technician = {
            ...formData,
            id: initialData?.id || `tech-${Date.now()}`,
            experienceYears: Number(formData.experienceYears) || 0,
            rating: Number(formData.rating) || 0,
            skills: skillsInput.split(',').map(skill => skill.trim()).filter(Boolean),
        };
        onSubmit(finalData);
    };

    const inputClass = "w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className={labelClass}>الصورة الشخصية</label>
                <div className="mt-2 flex items-center gap-4">
                    {formData.imageUrl ? (
                        <img src={formData.imageUrl} alt="الصورة الشخصية" className="h-20 w-20 rounded-full object-cover" />
                    ) : (
                        <div className="h-20 w-20 flex items-center justify-center bg-gray-100 rounded-full border">
                            <UserGroupIcon className="h-10 w-10 text-gray-400" />
                        </div>
                    )}
                     <label htmlFor="tech-image-upload" className="relative cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                        <span>تغيير الصورة</span>
                        <input id="tech-image-upload" name="tech-image-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
                    </label>
                </div>
            </div>

            <div>
                <label htmlFor="name" className={labelClass}>اسم الفني</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={inputClass} required />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="specialization" className={labelClass}>التخصص</label>
                    <select id="specialization" name="specialization" value={formData.specialization} onChange={handleChange} className={inputClass} required>
                        <option value="" disabled>-- اختر تخصص --</option>
                        {maintenanceCategories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                 <div>
                    <label htmlFor="phone" className={labelClass}>رقم الهاتف</label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} required />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="region" className={labelClass}>المنطقة</label>
                    <input type="text" id="region" name="region" value={formData.region} onChange={handleChange} className={inputClass} required placeholder="مثال: شمال الرياض"/>
                </div>
                 <div>
                    <label htmlFor="experienceYears" className={labelClass}>سنوات الخبرة</label>
                    <input type="number" id="experienceYears" name="experienceYears" min="0" value={formData.experienceYears} onChange={handleChange} className={inputClass} />
                </div>
            </div>

            <div>
                <label htmlFor="rating" className={labelClass}>التقييم (من 1 إلى 5)</label>
                <input type="number" id="rating" name="rating" min="1" max="5" step="0.1" value={formData.rating} onChange={handleChange} className={inputClass} />
            </div>

            <div>
                <label htmlFor="skills" className={labelClass}>المهارات (افصل بينها بفاصلة)</label>
                <input type="text" id="skills" name="skills" value={skillsInput} onChange={handleChange} className={inputClass} placeholder="مثال: كشف تسريبات, تركيب سخانات, ..."/>
            </div>

            <div>
                <label htmlFor="bio" className={labelClass}>نبذة تعريفية</label>
                <textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} rows={3} className={inputClass} placeholder="اكتب نبذة مختصرة عن خبرات ومهارات الفني..."></textarea>
            </div>


            <div>
                 <label htmlFor="isAvailable" className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" id="isAvailable" name="isAvailable" checked={formData.isAvailable} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-gray-700">متاح للعمل حاليًا</span>
                </label>
            </div>
            
            <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                    إلغاء
                </button>
                <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                    {initialData ? 'حفظ التعديلات' : 'إضافة فني'}
                </button>
            </div>
        </form>
    );
};

export default TechnicianForm;