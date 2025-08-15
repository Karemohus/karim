import React, { useState } from 'react';
import { MaintenanceAnalysis, Technician } from '../types';
import { CheckCircleIcon, UserGroupIcon, WrenchIcon, BoltIcon, CogIcon, DocumentTextIcon, InformationCircleIcon, SparklesIcon, StarIcon, PhotoIcon, BugIcon, TruckIcon, BanknotesIcon, WrenchScrewdriverIcon, ExclamationTriangleIcon } from './icons';
import Modal from './Modal';
import MaintenanceRequestForm from './MaintenanceRequestForm';

interface AnalysisDisplayProps {
    analysis: MaintenanceAnalysis;
    suggestedTechnician: Technician | null;
    inspectionFee: number;
    onConfirmRequest: (userData: { userName: string; userPhone: string; userEmail?: string; address: string; latitude?: number; longitude?: number; }) => void;
}

const AnalysisCard: React.FC<{ title: string; children: React.ReactNode; icon: React.ReactNode }> = ({ title, children, icon }) => (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">{icon}</div>
        <div className="w-full">
            <h4 className="font-bold text-gray-600 mb-1">{title}</h4>
            {children}
        </div>
    </div>
);

const getCategoryIcon = (category: string) => {
  if (category.includes('سباكة')) return <WrenchIcon className="w-7 h-7 text-blue-500" />;
  if (category.includes('كهرباء')) return <BoltIcon className="w-7 h-7 text-yellow-500" />;
  if (category.includes('تنظيف')) return <SparklesIcon className="w-7 h-7 text-cyan-500" />;
  if (category.includes('مكافحة حشرات')) return <BugIcon className="w-7 h-7 text-red-500" />;
  if (category.includes('نقل أثاث')) return <TruckIcon className="w-7 h-7 text-orange-500" />;
  return <CogIcon className="w-7 h-7 text-gray-500" />;
};

const getUrgencyClass = (urgency: MaintenanceAnalysis['urgency']): string => {
    switch (urgency) {
        case 'طارئة': return 'bg-red-100 text-red-800 border-red-500';
        case 'عالية': return 'bg-orange-100 text-orange-800 border-orange-500';
        case 'متوسطة': return 'bg-yellow-100 text-yellow-800 border-yellow-500';
        case 'منخفضة': return 'bg-green-100 text-green-800 border-green-500';
        default: return 'bg-gray-100 text-gray-800 border-gray-500';
    }
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, index) => {
            const starValue = index + 1;
            return (
                <StarIcon
                    key={index}
                    className={`w-5 h-5 ${starValue <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                />
            );
        })}
        <span className="text-sm font-bold text-gray-600 mr-2">{rating.toFixed(1)}</span>
    </div>
);


const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, suggestedTechnician, inspectionFee, onConfirmRequest }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleFormSubmit = (userData: { userName: string; userPhone: string; userEmail?: string, address: string; latitude?: number; longitude?: number; }) => {
        onConfirmRequest(userData);
    };

    return (
        <>
            <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg border border-gray-200 animate-fade-in">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                <CheckCircleIcon className="w-8 h-8 text-green-500" />
                <h3 className="text-2xl font-bold text-gray-900">تم تحليل طلبك بنجاح!</h3>
              </div>
              
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border-l-4 ${getUrgencyClass(analysis.urgency)}`}>
                    <p className="font-bold">مستوى الأهمية: {analysis.urgency}</p>
                </div>
                
                {analysis.photo_recommendation && (
                    <div className="p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-800 rounded-lg">
                        <div className="flex items-start gap-3">
                            <InformationCircleIcon className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold">توصية من الذكاء الاصطناعي</h4>
                                <p className="text-sm">{analysis.photo_recommendation}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <AnalysisCard title="ملخص المشكلة" icon={<DocumentTextIcon className="w-7 h-7 text-gray-500"/>}>
                     <p className="text-gray-800 text-lg">{analysis.summary}</p>
                   </AnalysisCard>
                   <AnalysisCard title="تصنيف الطلب" icon={getCategoryIcon(analysis.category)}>
                     <p className="text-gray-800 text-lg">{analysis.category}</p>
                   </AnalysisCard>
                </div>
                
                 {/* Enhanced Technician Card */}
                 <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                     <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1"><UserGroupIcon className="w-7 h-7 text-gray-500"/></div>
                        <div className="w-full">
                            <h4 className="font-bold text-gray-600 mb-2">الفني المقترح</h4>
                            {suggestedTechnician ? (
                                <div className="flex items-center gap-4 bg-white p-3 rounded-lg border">
                                    {suggestedTechnician.imageUrl ? (
                                        <img src={suggestedTechnician.imageUrl} alt={suggestedTechnician.name} className="w-16 h-16 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                                            <UserGroupIcon className="w-8 h-8 text-gray-500" />
                                        </div>
                                    )}
                                    <div className="flex-grow">
                                        <p className="text-lg font-bold text-gray-900">{suggestedTechnician.name}</p>
                                        <p className="text-sm text-gray-600 font-medium">{suggestedTechnician.specialization}</p>
                                        <StarRating rating={suggestedTechnician.rating} />
                                    </div>
                                </div>
                            ) : (
                                 <p className="text-gray-800 text-lg font-bold">{analysis.suggested_technician}</p>
                            )}

                            {analysis.suggestion_reason && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                    <div className="flex items-start gap-2.5 text-indigo-800">
                                        <SparklesIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-indigo-500" />
                                        <div>
                                            <h5 className="font-bold text-sm text-indigo-600">سبب الاقتراح بالذكاء الاصطناعي</h5>
                                            <p className="text-sm text-gray-700">{analysis.suggestion_reason}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* New AI Analysis Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.estimated_cost_range && (
                        <AnalysisCard title="تقدير التكلفة المبدئي" icon={<BanknotesIcon className="w-7 h-7 text-green-500"/>}>
                           <p className="text-green-800 text-2xl font-bold">{analysis.estimated_cost_range}</p>
                           <p className="text-xs text-gray-500 mt-1">هذا تقدير مبدئي والتكلفة النهائية يحددها الفني بعد المعاينة.</p>
                        </AnalysisCard>
                    )}
                    {analysis.potential_parts && analysis.potential_parts.length > 0 && (
                        <AnalysisCard title="قطع غيار محتملة" icon={<WrenchScrewdriverIcon className="w-7 h-7 text-gray-500"/>}>
                             <ul className="list-disc list-inside text-gray-700">
                                {analysis.potential_parts.map((part, index) => <li key={index}>{part}</li>)}
                            </ul>
                        </AnalysisCard>
                    )}
                </div>

                {analysis.safety_warnings && analysis.safety_warnings.length > 0 && (
                     <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-lg">
                        <div className="flex items-start gap-3">
                            <ExclamationTriangleIcon className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold">تحذيرات هامة للسلامة</h4>
                                <ul className="list-disc list-inside text-sm mt-1">
                                    {analysis.safety_warnings.map((warning, index) => <li key={index}>{warning}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
                
                {inspectionFee > 0 && (
                    <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-800 rounded-lg">
                        <div className="flex items-start gap-3">
                            <InformationCircleIcon className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold">رسوم الكشف المبدئي</h4>
                                <p className="text-sm">
                                    سيتم تطبيق رسوم كشف بقيمة <span className="font-bold">{inspectionFee} ريال</span>. 
                                    هذا المبلغ سيتم خصمه من تكلفة الإصلاح الإجمالية عند إتمام العمل.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="pt-6 text-center">
                     <button onClick={() => setIsModalOpen(true)} className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors">
                        تأكيد وإرسال طلب الصيانة
                     </button>
                </div>
              </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="تأكيد طلب الصيانة">
                <MaintenanceRequestForm onSubmit={handleFormSubmit} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </>
    );
};

export default AnalysisDisplay;