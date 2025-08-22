
import React, { useState } from 'react';
import { CreditCardIcon, DevicePhoneMobileIcon, CogIcon, CheckCircleIcon } from './icons';

interface PaymentFormProps {
    amount: number;
    onSuccess: (details: { paymentMethod: string }) => void;
    onCancel: () => void;
    submitButtonText: string;
}

type PaymentTab = 'card' | 'stcpay';

const PaymentForm: React.FC<PaymentFormProps> = ({ amount, onSuccess, onCancel, submitButtonText }) => {
    const [activeTab, setActiveTab] = useState<PaymentTab>('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);
            setTimeout(() => {
                onSuccess({ paymentMethod: activeTab === 'card' ? 'بطاقة بنكية' : 'STC Pay' });
            }, 1500); // Show success message for 1.5s
        }, 2500); // Simulate 2.5s processing time
    };

    if (isSuccess) {
        return (
            <div className="text-center p-8 animate-fade-in">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800">تم الدفع بنجاح!</h3>
                <p className="text-gray-600 mt-2">جاري تأكيد طلبك الآن...</p>
            </div>
        );
    }
    
    if (isProcessing) {
        return (
            <div className="text-center p-8 animate-fade-in">
                <CogIcon className="w-16 h-16 text-indigo-500 mx-auto mb-4 animate-spin" />
                <h3 className="text-2xl font-bold text-gray-800">جاري معالجة الدفع...</h3>
                <p className="text-gray-600 mt-2">يرجى الانتظار، لا تقم بإغلاق النافذة.</p>
            </div>
        );
    }

    const TabButton: React.FC<{ tab: PaymentTab, children: React.ReactNode }> = ({ tab, children }) => (
        <button
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex items-center justify-center gap-2 p-3 font-bold border-b-4 transition-colors ${
                activeTab === tab 
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-indigo-600'
            }`}
        >
            {children}
        </button>
    );

    return (
        <form onSubmit={handlePayment}>
            <div className="bg-gray-100 p-4 rounded-lg text-center mb-6 border">
                <p className="text-gray-600">المبلغ الإجمالي للدفع</p>
                <p className="text-4xl font-extrabold text-indigo-600">{amount.toLocaleString()} <span className="text-2xl font-semibold">ريال</span></p>
            </div>
            
            <div className="flex border-b mb-6">
                <TabButton tab="card">
                    <CreditCardIcon className="w-5 h-5"/>
                    <span>بطاقة بنكية</span>
                </TabButton>
                <TabButton tab="stcpay">
                    <DevicePhoneMobileIcon className="w-5 h-5"/>
                    <span>STC Pay</span>
                </TabButton>
            </div>

            <div className="space-y-4">
                {activeTab === 'card' ? (
                    <div className="space-y-4 animate-fade-in">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">رقم البطاقة</label>
                            <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="**** **** **** 1234" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الانتهاء</label>
                                <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="MM/YY" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                                <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="123" required />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-6 bg-gray-50 rounded-lg border animate-fade-in">
                        <h4 className="font-bold text-lg text-gray-800">الدفع عبر STC Pay</h4>
                        <p className="text-gray-600 mt-2">عند الضغط على زر الدفع، سيتم تحويلك إلى تطبيق STC Pay لإكمال العملية.</p>
                    </div>
                )}
            </div>

            <div className="pt-6 flex justify-end gap-3">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">
                    إلغاء
                </button>
                <button type="submit" className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700">
                    {submitButtonText}
                </button>
            </div>
        </form>
    );
};

export default PaymentForm;
