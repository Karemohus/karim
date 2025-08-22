
import React, { useState } from 'react';
import { generateInteriorDesign } from '../services/geminiService';
import { Part } from '@google/ai';
import { SparklesIcon, PhotoIcon, CogIcon } from './icons';

// Helper function to convert a file to a GenerativePart
const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};


const InteriorDesignAssistant: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setGeneratedImage(null);
            setError(null);
        }
    };

    const handleGenerate = async () => {
        if (!imageFile || !prompt.trim()) {
            setError('الرجاء رفع صورة وكتابة وصف للتصميم المطلوب.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            const imagePart = await fileToGenerativePart(imageFile);
            const generatedImageBase64 = await generateInteriorDesign(imagePart, prompt);
            setGeneratedImage(`data:image/jpeg;base64,${generatedImageBase64}`);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع أثناء توليد التصميم.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleReset = () => {
        setImageFile(null);
        setImagePreview(null);
        setPrompt('');
        setGeneratedImage(null);
        setError(null);
        setIsLoading(false);
    }

    return (
        <div>
            <h3 className="text-xl font-bold mb-4">مساعد التصميم الداخلي الافتراضي</h3>
            <p className="text-gray-600 mb-6">ارفع صورة لغرفتك، صف التصميم الذي تحلم به، ودع الذكاء الاصطناعي يبدعه لك.</p>

            {!generatedImage && !isLoading && (
                 <div className="space-y-4 animate-fade-in">
                     <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">1. ارفع صورة الغرفة</label>
                         <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                             <div className="space-y-1 text-center">
                                 {imagePreview ? (
                                     <img src={imagePreview} alt="Preview" className="mx-auto h-32 w-auto object-contain rounded" />
                                 ) : (
                                     <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                 )}
                                 <div className="flex text-sm text-gray-600 justify-center">
                                     <label htmlFor="design-file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                                         <span>{imagePreview ? 'تغيير الصورة' : 'اختر صورة'}</span>
                                         <input id="design-file-upload" name="design-file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                                     </label>
                                 </div>
                                 <p className="text-xs text-gray-500">PNG, JPG, WEBP</p>
                             </div>
                         </div>
                     </div>
                     <div>
                         <label htmlFor="design-prompt" className="block text-sm font-medium text-gray-700 mb-2">2. صف التصميم المطلوب</label>
                         <textarea
                             id="design-prompt"
                             rows={3}
                             className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                             placeholder="مثال: حول هذه الغرفة إلى طراز بوهيمي مع نباتات كثيرة وألوان ترابية."
                             value={prompt}
                             onChange={(e) => setPrompt(e.target.value)}
                         />
                     </div>
                     {error && <p className="text-red-500 text-sm">{error}</p>}
                     <div className="flex justify-end">
                         <button
                             onClick={handleGenerate}
                             disabled={!imageFile || !prompt.trim()}
                             className="flex items-center gap-2 bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300"
                         >
                             <SparklesIcon className="w-5 h-5" />
                             <span>توليد التصميم</span>
                         </button>
                     </div>
                 </div>
            )}
            
            {isLoading && (
                <div className="text-center p-8 h-64 flex flex-col justify-center items-center">
                    <CogIcon className="animate-spin h-10 w-10 text-indigo-500" />
                    <p className="mt-4 font-semibold text-gray-700">يقوم الذكاء الاصطناعي بإعداد تصميمك...</p>
                    <p className="text-sm text-gray-500">قد يستغرق هذا الأمر دقيقة أو دقيقتين.</p>
                </div>
            )}

            {generatedImage && (
                <div className="animate-fade-in">
                    <h4 className="text-lg font-bold mb-4">النتائج</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="font-semibold text-center mb-2">الصورة الأصلية</p>
                            <img src={imagePreview!} alt="Original" className="w-full h-auto object-contain rounded-lg border"/>
                        </div>
                         <div>
                            <p className="font-semibold text-center mb-2">التصميم المقترح</p>
                            <img src={generatedImage} alt="Generated Design" className="w-full h-auto object-contain rounded-lg border"/>
                        </div>
                    </div>
                     {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 bg-gray-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-700"
                        >
                            <span>البدء من جديد</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InteriorDesignAssistant;
