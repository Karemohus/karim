
import React from 'react';
import { SparklesIcon, XMarkIcon, DocumentTextIcon, ChatBubbleLeftEllipsisIcon, UserGroupIcon, CogIcon } from './icons';

interface AIMaintenanceGuideProps {
    onDismiss: () => void;
}

const AIMaintenanceGuide: React.FC<AIMaintenanceGuideProps> = ({ onDismiss }) => {
    return (
        <div className="relative bg-indigo-50 border-2 border-dashed border-indigo-200 p-6 rounded-2xl mb-8 animate-fade-in">
            <button
                onClick={onDismiss}
                className="absolute top-4 left-4 text-gray-500 hover:text-gray-800 p-1 bg-white/50 hover:bg-gray-200 rounded-full transition-colors"
                aria-label="إغلاق الدليل"
            >
                <XMarkIcon className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-indigo-800">كيف يساعدك الذكاء الاصطناعي في الصيانة؟</h2>
                <p className="text-indigo-600 mt-1">احصل على تشخيص أولي دقيق وفوري لمشكلتك.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                    <div className="mx-auto flex-shrink-0 bg-blue-100 text-blue-600 p-3 rounded-full w-fit mb-3">
                        <CogIcon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-gray-900">1. التحليل الفوري</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        يقوم النظام بتحليل وصفك للمشكلة وأي صور مرفقة لفهم طبيعة العطل.
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                     <div className="mx-auto flex-shrink-0 bg-purple-100 text-purple-600 p-3 rounded-full w-fit mb-3">
                        <ChatBubbleLeftEllipsisIcon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-gray-900">2. مساعدك الشخصي</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        لديك استفسار سريع؟ تحدث مع مساعدنا (الأيقونة العائمة) للحصول على نصائح عامة قبل تقديم طلبك.
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                     <div className="mx-auto flex-shrink-0 bg-green-100 text-green-600 p-3 rounded-full w-fit mb-3">
                        <DocumentTextIcon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-gray-900">3. التقرير المفصل</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        ستحصل على تقرير فوري يتضمن ملخص المشكلة، تقدير التكلفة، وقطع الغيار المحتملة.
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                     <div className="mx-auto flex-shrink-0 bg-yellow-100 text-yellow-600 p-3 rounded-full w-fit mb-3">
                        <UserGroupIcon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-gray-900">4. ترشيح الفني الأنسب</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        بناءً على التحليل، يقترح النظام أفضل فني متاح ومناسب للقيام بالمهمة.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AIMaintenanceGuide;