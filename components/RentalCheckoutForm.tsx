
import React, { useState } from 'react';
import { Property } from '../types';
import PaymentForm from './PaymentForm';
import { CheckCircleIcon } from './icons';

interface RentalCheckoutFormProps {
    property: Property;
    onSuccess: (tenantData: { userName: string, userPhone: string }, paymentData: { paymentMethod: string }) => void;
    onCancel: () => void;
}

type CheckoutStep = 'details' | 'payment' | 'success';

const RentalCheckoutForm: React.FC<RentalCheckoutFormProps> = ({ property, onSuccess, onCancel }) => {
    const [step, setStep] = useState<CheckoutStep>('details');
    const [tenantData, setTenantData] = useState({ userName: '', userPhone: '' });

    const totalAmount = property.price + property.commission;

    const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTenantData(prev => ({ ...prev, [name]: value }));
    };

    const handleDetailsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep('payment');
    };

    const handlePaymentSuccess = (paymentData: { paymentMethod: string }) => {
        onSuccess(tenantData, paymentData);
        setStep('success');
    };

    if (step === 'success') {
         return (
            <div className="text-center p-8 animate-fade-in">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800">تهانينا! تم استئجار العقار بنجاح.</h3>
                <p className="text-gray-600 mt-2">لقد تم إرسال تفاصيل العقد إليك. سيقوم فريقنا بالتواصل معك قريبًا لترتيب تسليم المفاتيح.</p>
                <button onClick={onCancel} className="mt-8 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors">
                    إغلاق
                </button>
            </div>
        );
    }
    
    const inputClass = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-shadow";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";
    
    return (
        <div>
            {step === 'details' && (
                <form onSubmit={handleDetailsSubmit} className="space-y-4 animate-fade-in">
                    <div className="bg-gray-100 p-4 rounded-lg border">
                        <h4 className="font-bold text-lg text-gray-800">{property.title}</h4>
                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div className="text-gray-600">الإيجار الشهري:</div>
                            <div className="font-bold text-gray-800 text-left">{property.price.toLocaleString()} ريال</div>
                            <div className="text-gray-600">العمولة (مرة واحدة):</div>
                            <div className="font-bold text-gray-800 text-left">{property.commission.toLocaleString()} ريال</div>
                            <div className="text-gray-600 font-bold border-t pt-2 mt-1">الإجمالي المطلوب للدفع:</div>
                            <div className="font-extrabold text-indigo-600 border-t pt-2 mt-1 text-left">{totalAmount.toLocaleString()} ريال</div>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="userNameRental" className={labelClass}>الاسم الكامل للمستأجر</label>
                        <input type="text" id="userNameRental" name="userName" value={tenantData.userName} onChange={handleDetailsChange} className={inputClass} required autoComplete="name" />
                    </div>
                    <div>
                        <label htmlFor="userPhoneRental" className={labelClass}>رقم هاتف المستأجر</label>
                        <input type="tel" id="userPhoneRental" name="userPhone" value={tenantData.userPhone} onChange={handleDetailsChange} className={inputClass} required autoComplete="tel" />
                    </div>
                     <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                            إلغاء
                        </button>
                        <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                            التالي إلى الدفع
                        </button>
                    </div>
                </form>
            )}

            {step === 'payment' && (
                <div className="animate-fade-in">
                    <PaymentForm 
                        amount={totalAmount}
                        onSuccess={handlePaymentSuccess}
                        onCancel={() => setStep('details')}
                        submitButtonText={`ادفع ${totalAmount.toLocaleString()} ريال وأكمل الاستئجار`}
                    />
                </div>
            )}
        </div>
    );
};

export default RentalCheckoutForm;
