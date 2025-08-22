
import React from 'react';
import { RentalAgreement, Property, SiteSettings, RentalAgreementSettings } from '../types';
import { PrinterIcon, ArrowLeftIcon } from './icons';

interface RentalAgreementViewProps {
    agreement: RentalAgreement;
    property: Property;
    siteSettings: SiteSettings;
    rentalAgreementSettings: RentalAgreementSettings;
    onClose: () => void;
}

const RentalAgreementView: React.FC<RentalAgreementViewProps> = ({ agreement, property, siteSettings, rentalAgreementSettings, onClose }) => {
    
    const handlePrint = () => {
        window.print();
    };
    
    const rentalDate = new Date(agreement.rentalDate);
    const contractEndDate = new Date(rentalDate);
    contractEndDate.setFullYear(rentalDate.getFullYear() + 1);

    return (
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200">
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Ms+Madi&display=swap');
                @media print {
                    .no-print {
                        display: none !important;
                    }
                }
                `}
            </style>
            <div id="contract-printable">
                <div className="p-8 bg-white font-['Cairo']">
                    {/* Header */}
                    <div className="text-center pb-6 border-b-2 border-gray-200 mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">عقد إيجار إلكتروني</h1>
                        <p className="text-gray-500 mt-1">عقد موحد لقطاع الإيجار العقاري</p>
                    </div>

                    {/* Parties */}
                    <p className="mb-4">
                        تم إبرام هذا العقد بتاريخ {rentalDate.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })} بين كل من:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="p-4 border rounded-lg bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800 mb-2">الطرف الأول (المؤجر)</h3>
                            <p><span className="font-semibold">الاسم:</span> {siteSettings.siteName}</p>
                            <p><span className="font-semibold">الصفة:</span> وكيل المؤجر</p>
                        </div>
                        <div className="p-4 border rounded-lg bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800 mb-2">الطرف الثاني (المستأجر)</h3>
                            <p><span className="font-semibold">الاسم:</span> {agreement.tenantName}</p>
                            <p><span className="font-semibold">رقم الهاتف:</span> {agreement.tenantPhone}</p>
                        </div>
                    </div>

                    {/* Property Details */}
                    <div className="mb-6">
                        <h3 className="font-bold text-xl text-gray-800 mb-3 border-b pb-2">تفاصيل الوحدة العقارية</h3>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-md">
                            <p><span className="font-semibold">العقار:</span> {property.title}</p>
                            <p><span className="font-semibold">الموقع:</span> {property.location}</p>
                            <p><span className="font-semibold">نوع العقار:</span> {property.type}</p>
                            <p><span className="font-semibold">المساحة:</span> {property.area} متر مربع</p>
                        </div>
                    </div>

                    {/* Financial & Duration Details */}
                    <div className="mb-6">
                        <h3 className="font-bold text-xl text-gray-800 mb-3 border-b pb-2">البيانات المالية ومدة العقد</h3>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-md">
                            <p><span className="font-semibold">قيمة الإيجار الشهري:</span> {property.price.toLocaleString()} ريال سعودي</p>
                            <p><span className="font-semibold">عمولة المكتب (تدفع مرة واحدة):</span> {property.commission.toLocaleString()} ريال سعودي</p>
                             <p><span className="font-semibold">المبلغ الإجمالي المدفوع عند التوقيع:</span> {agreement.amountPaid.toLocaleString()} ريال سعودي</p>
                             <p><span className="font-semibold">طريقة الدفع:</span> {agreement.paymentMethod}</p>
                            <p><span className="font-semibold">تاريخ بدء العقد:</span> {rentalDate.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            <p><span className="font-semibold">تاريخ انتهاء العقد:</span> {contractEndDate.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            <p className="col-span-2"><span className="font-semibold">مدة العقد:</span> سنة ميلادية واحدة.</p>
                        </div>
                    </div>
                    
                    {/* Terms */}
                    <div className="mb-6">
                        <h3 className="font-bold text-xl text-gray-800 mb-3 border-b pb-2">أحكام العقد</h3>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                             {rentalAgreementSettings.contractTerms.map((term, index) => (
                                <li key={index}>{term}</li>
                             ))}
                        </ol>
                    </div>

                    {/* Signatures */}
                    <div className="grid grid-cols-2 gap-8 pt-10">
                        <div className="text-center">
                            <p className="font-bold text-lg">الطرف الأول</p>
                             <div className="mt-4 h-20 flex flex-col items-center justify-center">
                                {siteSettings.logoUrl && <img src={siteSettings.logoUrl} alt="Logo" className="max-h-12 w-auto object-contain mb-2 opacity-70" />}
                                <p className="text-3xl" style={{ fontFamily: "'Ms Madi', cursive" }}>{rentalAgreementSettings.companySignatoryName}</p>
                            </div>
                            <div className="mt-1 h-px bg-gray-400 w-full"></div>
                            <p className="mt-1 text-sm text-gray-500">{rentalAgreementSettings.companySignatoryTitle}</p>
                        </div>
                         <div className="text-center">
                            <p className="font-bold text-lg">الطرف الثاني</p>
                            <p>{agreement.tenantName}</p>
                            <div className="mt-4 h-20 border-b-2 border-dotted"></div>
                            <p className="mt-1 text-sm text-gray-500">التوقيع</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="pt-6 pb-6 px-8 flex flex-col sm:flex-row justify-between items-center gap-4 no-print bg-gray-50 rounded-b-lg border-t">
                 <button 
                    onClick={onClose} 
                    className="bg-gray-500 text-white font-bold py-2 px-5 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                    العودة
                </button>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                     <p className="text-sm text-gray-500 text-center sm:text-right">
                        نصيحة: لحفظ العقد كملف PDF، اختر "Save as PDF" من خيارات الطباعة.
                     </p>
                    <button 
                        onClick={handlePrint} 
                        className="bg-indigo-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                        <PrinterIcon className="w-5 h-5" />
                        طباعة أو حفظ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RentalAgreementView;
