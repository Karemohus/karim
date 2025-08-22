

import React, { useState } from 'react';
import { CheckCircleIcon, CursorArrowRaysIcon, CogIcon, SparklesIcon } from './icons';
import PaymentForm from './PaymentForm';
import { useAuth } from '../context/AuthContext';
import { PointsSettings } from '../types';

interface MaintenanceRequestFormProps {
    onSubmit: (data: { userName: string; userPhone: string; userEmail?: string; address: string; latitude?: number; longitude?: number; }, paymentDetails?: { amount: number }, pointsToUse?: number) => void;
    onCancel: () => void;
    inspectionFee: number;
    pointsSettings: PointsSettings;
}

type FormStep = 'details' | 'payment' | 'success';

const MaintenanceRequestForm: React.FC<MaintenanceRequestFormProps> = ({ onSubmit, onCancel, inspectionFee, pointsSettings }) => {
    const { currentUser } = useAuth();
    const [step, setStep] = useState<FormStep>('details');
    const [formData, setFormData] = useState({
        userName: currentUser?.name || '',
        userPhone: currentUser?.phone || '',
        userEmail: '',
        address: '',
    });
    
    const [location, setLocation] = useState<{ latitude?: number, longitude?: number }>({});
    const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [locationError, setLocationError] = useState('');
    const [pointsToUse, setPointsToUse] = useState(0);

    const availablePoints = currentUser?.points || 0;
    const maxPointsToUseForDiscount = pointsSettings.pointValueInSAR > 0 ? Math.floor(inspectionFee / pointsSettings.pointValueInSAR) : 0;
    const maxApplicablePoints = Math.min(availablePoints, maxPointsToUseForDiscount);
    const discountAmount = pointsToUse * pointsSettings.pointValueInSAR;
    const finalInspectionFee = Math.max(0, inspectionFee - discountAmount);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = Number(e.target.value);
        if (value < 0) value = 0;
        if (value > maxApplicablePoints) value = maxApplicablePoints;
        setPointsToUse(Math.floor(value));
    };

    const handleLocationClick = () => {
        if (!navigator.geolocation) {
            setLocationStatus('error');
            setLocationError('المتصفح لا يدعم تحديد الموقع.');
            return;
        }

        setLocationStatus('loading');
        setLocationError('');
        setLocation({});

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setLocationStatus('success');
            },
            (error) => {
                setLocationStatus('error');
                let message = 'حدث خطأ أثناء تحديد الموقع.';
                if (error.code === error.PERMISSION_DENIED) {
                    message = 'تم رفض إذن الوصول إلى الموقع. يرجى السماح بالوصول والمحاولة مرة أخرى.';
                }
                setLocationError(message);
            }
        );
    };

    const handleDetailsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.address.trim() && !location.latitude) {
            alert('الرجاء إدخال العنوان التفصيلي أو تحديد الموقع الحالي.');
            return;
        }
        if (finalInspectionFee > 0) {
            setStep('payment');
        } else {
            onSubmit({ ...formData, ...location }, undefined, pointsToUse);
            setStep('success');
        }
    };

    const handlePaymentSuccess = () => {
        onSubmit({ ...formData, ...location }, { amount: finalInspectionFee }, pointsToUse);
        setStep('success');
    };

    const renderDetailsForm = () => {
        const inputClass = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-shadow";
        const labelClass = "block text-sm font-medium text-gray-700 mb-1";
        
        return (
             <form onSubmit={handleDetailsSubmit} className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                    الرجاء إدخال بيانات التواصل الخاصة بك وتحديد موقعك لتأكيد الطلب.
                </p>
                <div>
                    <label htmlFor="userNameMaint" className={labelClass}>الاسم الكامل</label>
                    <input type="text" id="userNameMaint" name="userName" value={formData.userName} onChange={handleChange} className={inputClass} required autoComplete="name" />
                </div>
                <div>
                    <label htmlFor="userPhoneMaint" className={labelClass}>رقم الهاتف</label>
                    <input type="tel" id="userPhoneMaint" name="userPhone" value={formData.userPhone} onChange={handleChange} className={inputClass} required autoComplete="tel" />
                </div>
                <div>
                    <label htmlFor="address" className={labelClass}>العنوان التفصيلي (اختياري مع تحديد الموقع)</label>
                    <textarea id="address" name="address" value={formData.address} onChange={handleChange} rows={3} className={inputClass} placeholder="مثال: الرياض، حي العليا، شارع الأمير محمد بن عبدالعزيز، مبنى 123..." />
                </div>

                <div className="border-t pt-4">
                    <label className={labelClass}>أو حدد موقعك الحالي (أكثر دقة)</label>
                    <button 
                        type="button" 
                        onClick={handleLocationClick} 
                        disabled={locationStatus === 'loading'} 
                        className="w-full flex items-center justify-center gap-2 bg-blue-100 text-blue-700 font-bold py-3 px-4 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-70 disabled:cursor-wait"
                    >
                        {locationStatus === 'loading' ? (
                            <CogIcon className="w-5 h-5 animate-spin" />
                        ) : (
                            <CursorArrowRaysIcon className="w-5 h-5" />
                        )}
                        <span>{locationStatus === 'loading' ? 'جاري التحديد...' : 'تحديد الموقع الحالي'}</span>
                    </button>
                    {locationStatus === 'success' && (
                        <div className="mt-2 text-green-700 bg-green-100 p-2 rounded-md text-sm flex items-center gap-2">
                            <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
                            <span>تم تحديد الموقع بنجاح. يمكنك المتابعة لإرسال الطلب.</span>
                        </div>
                    )}
                    {locationStatus === 'error' && (
                        <div className="mt-2 text-red-700 bg-red-100 p-2 rounded-md text-sm">
                            {locationError}
                        </div>
                    )}
                </div>

                {pointsSettings.isEnabled && availablePoints > 0 && inspectionFee > 0 && (
                    <div className="border-t pt-4">
                        <label className={`${labelClass} flex items-center gap-2`}>
                            <SparklesIcon className="w-5 h-5 text-yellow-500" />
                            <span>استخدام النقاط (رصيدك: {availablePoints} نقطة)</span>
                        </label>
                         <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mt-1">
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="0"
                                    max={maxApplicablePoints}
                                    value={pointsToUse}
                                    onChange={handlePointsChange}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <input
                                    type="number"
                                    value={pointsToUse}
                                    onChange={handlePointsChange}
                                    min="0"
                                    max={maxApplicablePoints}
                                    className="w-24 p-2 border border-gray-300 rounded-lg text-center"
                                />
                            </div>
                            <div className="mt-2 text-center text-sm">
                                <p>
                                    سيتم خصم <span className="font-bold text-green-700">{discountAmount.toFixed(2)} ريال</span>.
                                    المبلغ الجديد لرسوم الكشف: <span className="font-bold text-indigo-700">{finalInspectionFee.toFixed(2)} ريال</span>.
                                </p>
                            </div>
                        </div>
                    </div>
                )}


                <div>
                    <label htmlFor="userEmailMaint" className={labelClass}>البريد الإلكتروني (اختياري)</label>
                    <input type="email" id="userEmailMaint" name="userEmail" value={formData.userEmail} onChange={handleChange} className={inputClass} autoComplete="email" />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                    <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                        إلغاء
                    </button>
                    <button type="submit" className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                        {finalInspectionFee > 0 ? 'التالي للدفع' : 'تأكيد الطلب'}
                    </button>
                </div>
            </form>
        );
    };
    
    const renderPaymentForm = () => (
        <PaymentForm
            amount={finalInspectionFee}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setStep('details')}
            submitButtonText={`ادفع ${finalInspectionFee.toFixed(2)} ريال وأكد الطلب`}
        />
    );

    const renderSuccessMessage = () => (
        <div className="text-center p-8 animate-fade-in">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800">تم تأكيد طلب الصيانة!</h3>
            <p className="text-gray-600 mt-2">لقد تم إرسال طلبك إلى الفريق المختص، وسيتم التواصل معك قريباً. يمكنك إغلاق هذه النافذة.</p>
            <button onClick={onCancel} className="mt-6 bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors">
                حسنًا
            </button>
        </div>
    );
    
    switch (step) {
        case 'details':
            return renderDetailsForm();
        case 'payment':
            return renderPaymentForm();
        case 'success':
            return renderSuccessMessage();
        default:
            return null;
    }
};

export default MaintenanceRequestForm;