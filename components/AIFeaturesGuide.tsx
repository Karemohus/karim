import React from 'react';
import { SparklesIcon, ScaleIcon, XMarkIcon, ChatBubbleLeftEllipsisIcon } from './icons';

interface AIFeaturesGuideProps {
    onDismiss: () => void;
}

const AIFeaturesGuide: React.FC<AIFeaturesGuideProps> = ({ onDismiss }) => {
    return (
        <div className="relative bg-indigo-50 border-2 border-dashed border-indigo-200 p-6 rounded-2xl mb-12 animate-fade-in">
            <button
                onClick={onDismiss}
                className="absolute top-4 left-4 text-gray-500 hover:text-gray-800 p-1 bg-white/50 hover:bg-gray-200 rounded-full transition-colors"
                aria-label="إغلاق الدليل"
            >
                <XMarkIcon className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-indigo-800">اكتشف أدواتنا العقارية الذكية!</h2>
                <p className="text-indigo-600 mt-1">استخدم الذكاء الاصطناعي لتسهيل بحثك واتخاذ قرارات أفضل.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-start gap-4">
                    <div className="flex-shrink-0 bg-blue-100 text-blue-600 p-3 rounded-full mt-1">
                        <SparklesIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">البحث الذكي</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            اكتب ما تبحث عنه بلغة طبيعية في شريط "البحث الذكي"، وسيقوم الذكاء الاصطناعي بتحليل طلبك وعرض أفضل النتائج لك.
                        </p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-start gap-4">
                     <div className="flex-shrink-0 bg-green-100 text-green-600 p-3 rounded-full mt-1">
                        <ScaleIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">المقارنة الذكية</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            أضف ما يصل إلى 3 عقارات للمقارنة بالضغط على أيقونة الميزان، ثم اطلب من الذكاء الاصطناعي مقارنتها بناءً على معاييرك الخاصة.
                        </p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-start gap-4">
                     <div className="flex-shrink-0 bg-purple-100 text-purple-600 p-3 rounded-full mt-1">
                        <ChatBubbleLeftEllipsisIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">مساعدك الشخصي</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            هل لديك سؤال؟ استخدم أيقونة المحادثة العائمة للتحدث مع مساعدنا الذكي الذي يمكنه مساعدتك في البحث عن العقارات والإجابة على استفساراتك.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIFeaturesGuide;
