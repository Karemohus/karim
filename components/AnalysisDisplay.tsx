
import React, { useState } from 'react';
import { MaintenanceAnalysis, Technician, MaintenanceAdvice, PointsSettings } from '../types';
import { CheckCircleIcon, UserGroupIcon, WrenchIcon, BoltIcon, CogIcon, DocumentTextIcon, InformationCircleIcon, SparklesIcon, StarIcon, PhotoIcon, BugIcon, TruckIcon, BanknotesIcon, WrenchScrewdriverIcon, ExclamationTriangleIcon, GlobeAltIcon, CheckIcon, LightBulbIcon } from './icons';
import Modal from './Modal';
import MaintenanceRequestForm from './MaintenanceRequestForm';

interface AnalysisDisplayProps {
    analysis: MaintenanceAnalysis;
    maintenanceAdvice: MaintenanceAdvice | null;
    suggestedTechnician: Technician | null;
    alternativeTechnicians: Technician[];
    selectedTechnician: Technician | null;
    onTechnicianSelect: (technician: Technician) => void;
    inspectionFee: number;
    onConfirmRequest: (userData: { userName: string; userPhone: string; userEmail?: string; address: string; latitude?: number; longitude?: number; }, paymentDetails?: { amount: number }, pointsToUse?: number) => void;
    pointsSettings: PointsSettings;
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

const TechnicianChoiceCard: React.FC<{technician: Technician, isSelected: boolean, onSelect: () => void; isSuggested?: boolean}> = ({ technician, isSelected, onSelect, isSuggested = false }) => {
    return (
         <div className={`p-4 rounded-lg border-2 transition-all duration-300 ${isSelected ? 'bg-indigo-50 border-indigo-500 shadow-lg' : 'bg-white border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'}`}>
            <div className="flex items-start sm:items-center gap-4">
                {technician.imageUrl ? (
                    <img src={technician.imageUrl} alt={technician.name} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
                ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <UserGroupIcon className="w-8 h-8 text-gray-500" />
                    </div>
                )}
                <div className="flex-grow">
                    <p className="font-bold text-gray-900 text-lg">{technician.name}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-1.5">
                            <GlobeAltIcon className="w-4 h-4 text-gray-400"/>
                            <span>{technician.nationality}</span>
                        </div>
                         <div className="flex items-center gap-1.5">
                           <WrenchIcon className="w-4 h-4 text-gray-400"/>
                           <span>{technician.specialization}</span>
                        </div>
                    </div>
                    <StarRating rating={technician.rating} />
                </div>
                <div className="flex-shrink-0">
                     <button 
                        onClick={onSelect} 
                        disabled={isSelected}
                        className={`font-bold py-2 px-5 rounded-lg transition-colors text-sm ${isSelected ? 'bg-indigo-600 text-white cursor-default' : 'bg-white text-indigo-700 hover:bg-indigo-200 border border-indigo-300'}`}
                    >
                       {isSelected ? (
                           <span className="flex items-center gap-2"><CheckIcon className="w-5 h-5"/> تم الاختيار</span>
                       ) : 'اختر الفني'}
                    </button>
                </div>
            </div>
            {isSuggested && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-start gap-2.5 text-indigo-800">
                        <SparklesIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-indigo-500" />
                        <div>
                            <h5 className="font-bold text-sm text-indigo-600">مقترح بواسطة الذكاء الاصطناعي</h5>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, maintenanceAdvice, suggestedTechnician, alternativeTechnicians, selectedTechnician, onTechnicianSelect, inspectionFee, onConfirmRequest, pointsSettings }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleFormSubmit = (userData: { userName: string; userPhone: string; userEmail?: string, address: string; latitude?: number; longitude?: number; }, paymentDetails?: { amount: number }, pointsToUse?: number) => {
        onConfirmRequest(userData, paymentDetails, pointsToUse);
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg border border-gray-200 animate-fade-in">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                <CheckCircleIcon className="w-8 h-8 text-green-500" />
                <h3 className="text-2xl font-bold text-gray-900">تم تحليل طلبك بنجاح!</h3>
              </div>
              
                {maintenanceAdvice && (
                    <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                        <div className="flex items-start gap-3">
                            <LightBulbIcon className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-yellow-800">نصائح مجانية من مساعدنا الذكي</h4>
                                <p className="text-sm text-yellow-700 mb-3">قد تساعدك هذه الإجراءات الأولية قبل وصول الفني.</p>
                                <div className="space-y-2 text-sm">
                                    {maintenanceAdvice.simple_checks && maintenanceAdvice.simple_checks.length > 0 && (
                                        <div>
                                            <h5 className="font-semibold text-gray-700">✅ فحوصات بسيطة يمكنك القيام بها:</h5>
                                            <ul className="list-disc list-inside text-gray-600 pl-2">
                                                {maintenanceAdvice.simple_checks.map((tip, i) => <li key={`check-${i}`}>{tip}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                    {maintenanceAdvice.safety_tips && maintenanceAdvice.safety_tips.length > 0 && (
                                        <div className="mt-2">
                                            <h5 className="font-semibold text-blue-700">🛡️ من أجل سلامتك:</h5>
                                            <ul className="list-disc list-inside text-blue-600 pl-2">
                                                {maintenanceAdvice.safety_tips.map((tip, i) => <li key={`safety-${i}`}>{tip}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                    {maintenanceAdvice.things_to_avoid && maintenanceAdvice.things_to_avoid.length > 0 && (
                                        <div className="mt-2">
                                            <h5 className="font-semibold text-red-700">❌ أشياء يجب تجنبها:</h5>
                                            <ul className="list-disc list-inside text-red-600 pl-2">
                                                {maintenanceAdvice.things_to_avoid.map((tip, i) => <li key={`avoid-${i}`}>{tip}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

              <div className="space-y-4">
                {analysis.urgency && (
                    <div className={`p-4 rounded-lg border-l-4 ${getUrgencyClass(analysis.urgency)}`}>
                        <p className="font-bold">مستوى الأهمية: {analysis.urgency}</p>
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
                
                 {/* Technician Selection Section */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="font-bold text-gray-600 mb-4 text-lg">اختر الفني المناسب</h4>
                    <div className="space-y-3">
                       {suggestedTechnician ? (
                            <TechnicianChoiceCard 
                                technician={suggestedTechnician}
                                isSelected={selectedTechnician?.id === suggestedTechnician.id}
                                onSelect={() => onTechnicianSelect(suggestedTechnician)}
                                isSuggested={true}
                            />
                       ) : (
                           <div className="p-4 rounded-lg bg-white border">
                               <p className="font-bold text-gray-800">{analysis.suggested_technician}</p>
                               <p className="text-sm text-gray-600">لم يتم العثور على فني مطابق في النظام، ولكن يمكنك المتابعة وسيتم تعيين فني مناسب من قبل الإدارة.</p>
                           </div>
                       )}

                       {alternativeTechnicians.length > 0 && (
                           <>
                                <div className="text-center py-2">
                                    <span className="text-sm font-semibold text-gray-500 bg-gray-200 px-3 py-1 rounded-full">أو اختر من الفنيين الآخرين المتاحين</span>
                                </div>
                               {alternativeTechnicians.map(tech => (
                                   <TechnicianChoiceCard
                                       key={tech.id}
                                       technician={tech}
                                       isSelected={selectedTechnician?.id === tech.id}
                                       onSelect={() => onTechnicianSelect(tech)}
                                   />
                               ))}
                           </>
                       )}
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
                     <button 
                        onClick={() => setIsModalOpen(true)} 
                        className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300 disabled:cursor-not-allowed"
                        disabled={!selectedTechnician && alternativeTechnicians.length > 0}
                     >
                        تأكيد وإرسال طلب الصيانة
                     </button>
                </div>
              </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="تأكيد طلب الصيانة" size="lg">
                <MaintenanceRequestForm 
                    onSubmit={handleFormSubmit} 
                    onCancel={() => setIsModalOpen(false)}
                    inspectionFee={inspectionFee}
                    pointsSettings={pointsSettings}
                />
            </Modal>
        </>
    );
};

export default AnalysisDisplay;
