import React from 'react';
import { MaintenanceRequest, SiteSettings } from '../types';
import { PrinterIcon, WrenchScrewdriverIcon } from './icons';

interface InvoiceViewProps {
    request: MaintenanceRequest;
    siteSettings: SiteSettings;
}

const InvoiceView: React.FC<InvoiceViewProps> = ({ request, siteSettings }) => {
    
    const handlePrint = () => {
        window.print();
    };

    return (
        <div>
            <style>
                {`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #invoice-printable, #invoice-printable * {
                        visibility: visible;
                    }
                    #invoice-printable {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        padding: 20px;
                    }
                    .no-print {
                        display: none;
                    }
                }
                `}
            </style>
            <div id="invoice-printable">
                <div className="p-8 bg-white border border-gray-300 rounded-lg">
                    {/* Header */}
                    <div className="flex justify-between items-start pb-6 border-b-2 border-gray-200 mb-6">
                        <div className="flex items-center gap-4">
                            {siteSettings.logoUrl ? (
                                <img src={siteSettings.logoUrl} alt="Logo" className="h-14 w-auto object-contain" />
                            ) : (
                                <div className="p-3 rounded-lg bg-indigo-600">
                                    <WrenchScrewdriverIcon className="h-8 w-8 text-white"/>
                                </div>
                            )}
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{siteSettings.siteName}</h1>
                                <p className="text-gray-500">فاتورة خدمات صيانة</p>
                            </div>
                        </div>
                        <div className="text-left">
                            <h2 className="text-3xl font-extrabold text-indigo-600">فاتورة</h2>
                            <p className="text-gray-500 font-mono"># {request.id.slice(-8)}</p>
                        </div>
                    </div>

                    {/* Customer and Date Info */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">فاتورة إلى</h3>
                            <p className="text-lg font-bold text-gray-800">{request.userName}</p>
                            <p className="text-gray-600">{request.address}</p>
                            <p className="text-gray-600">{request.userPhone}</p>
                        </div>
                        <div className="text-left">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">تاريخ الإصدار</h3>
                            <p className="text-lg font-bold text-gray-800">{new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase mt-4 mb-2">تاريخ الطلب</h3>
                            <p className="text-lg font-bold text-gray-800">{new Date(request.requestDate).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                    
                    {/* Invoice Table */}
                    <div className="w-full overflow-hidden rounded-lg border border-gray-200">
                        <table className="w-full text-right">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-4 font-bold text-gray-700">الوصف</th>
                                    <th className="p-4 font-bold text-gray-700 text-left">المبلغ</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="p-4">
                                        <p className="font-semibold text-gray-800">خدمة صيانة لفئة: {request.analysis.category}</p>
                                        <p className="text-sm text-gray-500 mt-1 pl-4">
                                            - المشكلة: {request.problemCause} <br/>
                                            - الحل: {request.solution}
                                        </p>
                                    </td>
                                    <td className="p-4 text-left font-mono">{request.amountPaid?.toLocaleString()} ريال</td>
                                </tr>
                            </tbody>
                            <tfoot className="bg-gray-50">
                                <tr>
                                    <td className="p-4 text-left font-bold text-gray-800 text-xl" colSpan={1}>الإجمالي</td>
                                    <td className="p-4 text-left font-extrabold text-indigo-600 text-xl font-mono">{request.amountPaid?.toLocaleString()} ريال</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                        <p className="text-gray-600">شكراً لتعاملكم معنا!</p>
                        <p className="text-sm text-gray-500">إذا كان لديكم أي استفسار بخصوص هذه الفاتورة، يرجى التواصل معنا.</p>
                    </div>
                </div>
            </div>
            
            <div className="pt-6 flex justify-end no-print">
                <button 
                    onClick={handlePrint} 
                    className="bg-indigo-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                    <PrinterIcon className="w-5 h-5" />
                    طباعة الفاتورة
                </button>
            </div>
        </div>
    );
};

export default InvoiceView;