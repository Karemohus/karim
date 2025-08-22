import React, { useState } from 'react';
import { MaintenanceCategory, MaintenanceJobPost, Page } from '../types';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { PhotoIcon, TrashIcon, CheckCircleIcon, SparklesIcon } from './icons';

interface MaintenanceJobPostFormProps {
    onSubmit: (data: Omit<MaintenanceJobPost, 'id' | 'requestDate' | 'status' | 'userId'>) => MaintenanceJobPost;
    onNavigate: (page: Page) => void;
}

const MaintenanceJobPostForm: React.FC<MaintenanceJobPostFormProps> = ({ onSubmit, onNavigate }) => {
    const { db } = useData();
    const { maintenanceCategories } = db;
    const { isAuthenticated } = useAuth();
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState(maintenanceCategories[0]?.id || '');
    const [address, setAddress] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [submittedJob, setSubmittedJob] = useState<MaintenanceJobPost | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files)]);
        }
        e.target.value = '';
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };
    
    const fileToDataUrl = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!isAuthenticated) {
            localStorage.setItem('loginRedirect', JSON.stringify({ page: 'maintenance' }));
            onNavigate('login');
            return;
        }

        if (!title.trim() || !categoryId || !description.trim() || !address.trim()) {
            setError('الرجاء تعبئة جميع الحقول المطلوبة.');
            return;
        }
        
        const imageUrls = await Promise.all(files.map(fileToDataUrl));
        const category = maintenanceCategories.find(c => c.id === categoryId);

        const newJob = onSubmit({
            title,
            description,
            categoryId,
            categoryName: category?.name || '',
            imageUrls,
            address,
        });
        setSubmittedJob(newJob);
    };

    if (submittedJob) {
        return (
            <div className="text-center p-6 sm:p-8 animate-fade-in">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800">تم نشر طلبك بنجاح!</h3>
                <p className="text-gray-600 mt-2 max-w-md mx-auto">
                    سيقوم الفنيون الآن بمراجعة طلبك وتقديم عروض أسعار. يمكنك متابعة العروض المستلمة من خلال صفحة ملفك الشخصي.
                </p>
                <div className="mt-8 space-y-3">
                    <button 
                        onClick={() => onNavigate('profile')} 
                        className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        الذهاب إلى ملفي الشخصي
                    </button>
                    <button 
                        onClick={() => setSubmittedJob(null)} 
                        className="w-full text-sm text-gray-500 hover:text-gray-700 hover:underline py-2"
                    >
                        نشر طلب آخر
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-sm text-center text-gray-600 bg-gray-100 p-3 rounded-lg">
                انشر تفاصيل مشكلة الصيانة لديك، واستقبل عروض أسعار تنافسية من أفضل الفنيين لدينا، واختر العرض الأنسب لك.
            </p>
            <div>
                <label htmlFor="title" className="block text-base font-medium text-gray-700 mb-2">
                    عنوان الطلب
                </label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="مثال: إصلاح تسريب في صنبور المطبخ"
                    required
                />
            </div>
             <div>
                <label htmlFor="category" className="block text-base font-medium text-gray-700 mb-2">
                    قسم الصيانة
                </label>
                <select
                    id="category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                    required
                >
                    {maintenanceCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="description" className="block text-base font-medium text-gray-700 mb-2">
                    وصف المشكلة
                </label>
                <textarea
                    id="description"
                    rows={5}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="يرجى تقديم أكبر قدر ممكن من التفاصيل لمساعدة الفنيين على تقديم عرض دقيق."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </div>
             <div>
                <label htmlFor="address" className="block text-base font-medium text-gray-700 mb-2">
                    العنوان
                </label>
                <input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="مثال: الرياض، حي العليا، شارع الأمير محمد"
                    required
                />
            </div>
            <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                    إرفاق صور (اختياري)
                </label>
                <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 justify-center">
                    <label htmlFor="job-file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                        <span>اختر ملفات</span>
                        <input id="job-file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleFileChange} />
                    </label>
                    </div>
                    <p className="text-xs text-gray-500">صور بصيغة PNG, JPG</p>
                </div>
                </div>
            </div>

            {files.length > 0 && (
                <div className="mt-4">
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {files.map((file, index) => (
                            <div key={index} className="relative group">
                                <img src={URL.createObjectURL(file)} alt={`preview ${index}`} className="h-28 w-full object-cover rounded-md border" />
                                <button 
                                    type="button"
                                    onClick={() => removeFile(index)} 
                                    aria-label="Remove file"
                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {error && (
                <div className="mt-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
                    <p>{error}</p>
                </div>
            )}

            <button
                type="submit"
                className="mt-8 w-full flex items-center justify-center gap-3 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
            >
                نشر الطلب واستقبال العروض
            </button>
        </form>
    )
};

export default MaintenanceJobPostForm;