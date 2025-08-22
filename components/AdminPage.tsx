import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Property, SiteSettings, AdvertisementSettings, Page, ViewingRequest, MaintenanceCategory, AboutUsSettings, MaintenanceRequest, Technician, PropertyStatus, MaintenanceFeature, MaintenanceFeatureIconName, Review, ViewingConfirmationSettings, MaintenanceConfirmationSettings, AdminTab, CommonIssue, ChatbotSettings, EmergencyMaintenanceRequest, RentalAgreement, RentalAgreementSettings, User, PointsSettings, MarketplaceServiceCategory, MarketplaceServiceProvider, MarketplaceBooking, MaintenanceLog } from '../types';
import { PlusIcon, TrashIcon, PencilIcon, PhotoIcon, ExclamationTriangleIcon, QueueListIcon, WrenchScrewdriverIcon, CogIcon, StarIcon, UserGroupIcon, DocumentTextIcon, PrinterIcon, MagnifyingGlassIcon, MapIcon, ShieldCheckIcon, LockClosedIcon, ChatBubbleLeftEllipsisIcon, TagIcon, ReceiptPercentIcon, ArrowUturnLeftIcon, CheckCircleIcon, HomeModernIcon, BuildingOffice2Icon, PhoneIcon, MapPinIcon, TableCellsIcon, BanknotesIcon, SparklesIcon, UserIcon, ShoppingBagIcon } from './icons';
import Modal from './Modal';
import PropertyForm from './PropertyForm';
import MaintenanceCategoryForm from './MaintenanceCategoryForm';
import TechnicianForm from './TechnicianForm';
import CompleteRequestForm from './CompleteRequestForm';
import InvoiceView from './InvoiceView';
import MaintenanceFeatureForm from './MaintenanceFeatureForm';
import TechnicianSchedule from './TechnicianSchedule';
import RentalAgreementView from './RentalAgreementView';
import MarketplaceCategoryForm from './MarketplaceCategoryForm';
import MarketplaceProviderForm from './MarketplaceProviderForm';
import { useData } from '../context/DataContext';

const MaintenanceLogModal: React.FC<{
    property: Property;
    onClose: () => void;
}> = ({ property, onClose }) => {
    const { db, setMaintenanceLogs } = useData();
    const { maintenanceLogs } = db;
    const propertyLogs = maintenanceLogs.filter(log => log.propertyId === property.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const [editingLog, setEditingLog] = useState<MaintenanceLog | null>(null);
    const [logFormData, setLogFormData] = useState({ date: '', description: '', technicianName: '' });

    useEffect(() => {
        if (editingLog) {
            setLogFormData({
                date: editingLog.date.split('T')[0], // For date input format YYYY-MM-DD
                description: editingLog.description,
                technicianName: editingLog.technicianName || '',
            });
        } else {
            setLogFormData({ date: '', description: '', technicianName: '' });
        }
    }, [editingLog]);
    
    const handleLogChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLogFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!logFormData.date || !logFormData.description) {
            alert('التاريخ والوصف مطلوبان.');
            return;
        }

        const logEntry = {
            ...logFormData,
            date: new Date(logFormData.date).toISOString(),
            propertyId: property.id,
        };

        if (editingLog) {
            setMaintenanceLogs(prev => prev.map(log => log.id === editingLog.id ? { ...log, ...logEntry, id: editingLog.id } : log));
        } else {
            setMaintenanceLogs(prev => [{ ...logEntry, id: `log-${Date.now()}` }, ...prev]);
        }
        
        setEditingLog(null);
        setLogFormData({ date: '', description: '', technicianName: '' });
    };

    const handleDeleteLog = (logId: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذا السجل؟')) {
            setMaintenanceLogs(prev => prev.filter(log => log.id !== logId));
        }
    };
    
    return (
        <div className="p-2">
            <form onSubmit={handleLogSubmit} className="p-4 bg-gray-100 rounded-lg border space-y-3 mb-6">
                <h4 className="font-bold text-lg">{editingLog ? 'تعديل سجل الصيانة' : 'إضافة سجل صيانة جديد'}</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الصيانة</label>
                        <input type="date" name="date" value={logFormData.date} onChange={handleLogChange} className="w-full p-2 border rounded-md" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">اسم الفني (اختياري)</label>
                        <input type="text" name="technicianName" value={logFormData.technicianName} onChange={handleLogChange} className="w-full p-2 border rounded-md" placeholder="مثال: أحمد المصري"/>
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">وصف العمل</label>
                    <textarea name="description" value={logFormData.description} onChange={handleLogChange} rows={3} className="w-full p-2 border rounded-md" required placeholder="مثال: صيانة دورية للمكيفات وتنظيف الفلاتر"></textarea>
                </div>
                <div className="flex justify-end gap-2">
                    {editingLog && <button type="button" onClick={() => setEditingLog(null)} className="bg-gray-200 px-4 py-2 rounded-md font-semibold">إلغاء التعديل</button>}
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-indigo-700">{editingLog ? 'حفظ التعديلات' : 'إضافة السجل'}</button>
                </div>
            </form>

            <h4 className="font-bold text-lg mb-2">السجلات الحالية</h4>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {propertyLogs.length > 0 ? propertyLogs.map(log => (
                    <div key={log.id} className="bg-white p-3 rounded-lg border flex justify-between items-start">
                        <div>
                            <p className="font-semibold text-gray-800">{log.description}</p>
                            <p className="text-sm text-gray-500">
                                {new Date(log.date).toLocaleDateString('ar-EG-u-nu-latn')}
                                {log.technicianName && ` - بواسطة: ${log.technicianName}`}
                            </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={() => setEditingLog(log)} className="p-2 text-gray-500 hover:text-indigo-600"><PencilIcon className="w-5 h-5"/></button>
                            <button onClick={() => handleDeleteLog(log.id)} className="p-2 text-gray-500 hover:text-red-600"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    </div>
                )) : <p className="text-center text-gray-500 py-4">لا توجد سجلات صيانة لهذا العقار.</p>}
            </div>
        </div>
    );
};


const StarRating: React.FC<{ rating: number, size?: 'sm' | 'md' }> = ({ rating, size = 'md' }) => {
    const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                return (
                    <StarIcon
                        key={index}
                        className={`${starSize} ${starValue <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    />
                );
            })}
            <span className="text-xs font-bold text-gray-600 mr-1.5">{rating.toFixed(1)}</span>
        </div>
    );
}


const TechnicianAdminCard: React.FC<{ tech: Technician; onEdit: () => void; onDelete: () => void; }> = ({ tech, onEdit, onDelete }) => (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {tech.imageUrl ? (
            <img src={tech.imageUrl} alt={tech.name} className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md" />
        ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow-md">
                <UserGroupIcon className="w-10 h-10 text-gray-500" />
            </div>
        )}
        <div className="flex-grow">
            <div className="flex items-center gap-3">
                <h4 className="font-bold text-lg text-gray-900">{tech.name} <span className="text-base font-medium text-gray-500">({tech.nationality})</span></h4>
                 <span className={`px-3 py-1 text-xs font-bold rounded-full ${tech.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {tech.isAvailable ? 'متاح' : 'غير متاح'}
                </span>
            </div>
            <p className="text-sm font-semibold text-indigo-600">{tech.specialization}</p>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                <MapPinIcon className="w-4 h-4 text-gray-400"/>
                <span>{tech.region}</span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <StarRating rating={tech.rating} size="sm" />
                <div className="h-4 w-px bg-gray-300"></div>
                <span>{tech.experienceYears} سنوات خبرة</span>
            </div>
        </div>
        <div className="flex items-center gap-2 mt-3 sm:mt-0 flex-shrink-0">
            <button onClick={onEdit} className="text-gray-500 hover:text-indigo-600 p-2 hover:bg-gray-200 rounded-full transition-colors" aria-label="Edit Technician">
                <PencilIcon className="w-5 h-5" />
            </button>
            <button onClick={onDelete} className="text-gray-500 hover:text-red-600 p-2 hover:bg-red-100 rounded-full transition-colors" aria-label="Delete Technician">
                <TrashIcon className="w-5 h-5" />
            </button>
        </div>
    </div>
);


const AdminPage: React.FC = () => {
    const { db, ...setters } = useData();
    const { 
        properties, maintenanceCategories, technicians, siteSettings, adSettings, 
        viewingRequests, maintenanceRequests, aboutUsSettings, reviews, 
        viewingConfirmationSettings, maintenanceConfirmationSettings, chatbotSettings,
        emergencyMaintenanceRequests, rentalAgreements, rentalAgreementSettings, 
        users, pointsSettings, marketplaceCategories, marketplaceServiceProviders, marketplaceBookings
    } = db;
    const { 
        setProperties, setMaintenanceCategories, setTechnicians, setSiteSettings, 
        setAdSettings, setViewingRequests, setMaintenanceRequests, setAboutUsSettings, 
        setReviews, setViewingConfirmationSettings, setMaintenanceConfirmationSettings,
        setChatbotSettings, setEmergencyMaintenanceRequests, setRentalAgreements,
        setRentalAgreementSettings, setUsers, setPointsSettings,
        setMarketplaceCategories, setMarketplaceServiceProviders, setMarketplaceBookings
    } = setters;

    const [activeTab, setActiveTab] = useState<AdminTab>('requests');
    const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);

    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<MaintenanceCategory | null>(null);

    const [isTechnicianModalOpen, setIsTechnicianModalOpen] = useState(false);
    const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);

    const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
    const [editingFeature, setEditingFeature] = useState<MaintenanceFeature | null>(null);

    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [selectedPropertyForLogs, setSelectedPropertyForLogs] = useState<Property | null>(null);

    const [formSettings, setFormSettings] = useState<SiteSettings>(siteSettings);
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    const [formAdSettings, setFormAdSettings] = useState<AdvertisementSettings>(adSettings);
    const [isSavingAd, setIsSavingAd] = useState(false);
    const availablePages: Page[] = ['home', 'rentals', 'maintenance', 'about'];

    const [formAboutUsSettings, setFormAboutUsSettings] = useState<AboutUsSettings>(aboutUsSettings);
    const [isSavingAbout, setIsSavingAbout] = useState(false);
    
    const [formChatbotSettings, setFormChatbotSettings] = useState<ChatbotSettings>(chatbotSettings);
    const [isSavingChatbot, setIsSavingChatbot] = useState(false);

    const [formViewingConfirmation, setFormViewingConfirmation] = useState<ViewingConfirmationSettings>(viewingConfirmationSettings);
    const [isSavingViewingConfirmation, setIsSavingViewingConfirmation] = useState(false);

    const [formMaintenanceConfirmation, setFormMaintenanceConfirmation] = useState<MaintenanceConfirmationSettings>(maintenanceConfirmationSettings);
    const [isSavingMaintenanceConfirmation, setIsSavingMaintenanceConfirmation] = useState(false);

    const [formRentalAgreementSettings, setFormRentalAgreementSettings] = useState<RentalAgreementSettings>(rentalAgreementSettings);
    const [isSavingRentalAgreementSettings, setIsSavingRentalAgreementSettings] = useState(false);

    const [formPointsSettings, setFormPointsSettings] = useState<PointsSettings>(pointsSettings);
    const [isSavingPoints, setIsSavingPoints] = useState(false);

    const [reportStartDate, setReportStartDate] = useState('');
    const [reportEndDate, setReportEndDate] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    } | null>(null);
    
    const [completingRequest, setCompletingRequest] = useState<MaintenanceRequest | null>(null);
    const [viewingInvoice, setViewingInvoice] = useState<MaintenanceRequest | null>(null);
    const [viewingContract, setViewingContract] = useState<{agreement: RentalAgreement, property: Property} | null>(null);
    const [maintenanceSearchTerm, setMaintenanceSearchTerm] = useState('');
    const [employeeView, setEmployeeView] = useState<'list' | 'schedule'>('list');

    const [isMarketplaceCategoryModalOpen, setIsMarketplaceCategoryModalOpen] = useState(false);
    const [editingMarketplaceCategory, setEditingMarketplaceCategory] = useState<MarketplaceServiceCategory | null>(null);
    const [isMarketplaceProviderModalOpen, setIsMarketplaceProviderModalOpen] = useState(false);
    const [editingMarketplaceProvider, setEditingMarketplaceProvider] = useState<MarketplaceServiceProvider | null>(null);

    const openLogModal = (property: Property) => {
        setSelectedPropertyForLogs(property);
        setIsLogModalOpen(true);
    };

    const closeLogModal = () => {
        setSelectedPropertyForLogs(null);
        setIsLogModalOpen(false);
    };

    const filteredMaintenanceRequests = maintenanceRequests.filter(req => {
        const term = maintenanceSearchTerm.toLowerCase().trim();
        if (!term) return true;
        const invoiceNum = req.id.slice(-8).toLowerCase();

        return (
            req.userName.toLowerCase().includes(term) ||
            req.userPhone.includes(term) ||
            invoiceNum.includes(term)
        );
    });

    const openAddMarketplaceCategoryModal = () => {
        setEditingMarketplaceCategory(null);
        setIsMarketplaceCategoryModalOpen(true);
    };
    const openEditMarketplaceCategoryModal = (category: MarketplaceServiceCategory) => {
        setEditingMarketplaceCategory(category);
        setIsMarketplaceCategoryModalOpen(true);
    };
    const closeMarketplaceCategoryModal = () => {
        setIsMarketplaceCategoryModalOpen(false);
        setEditingMarketplaceCategory(null);
    };
    const handleMarketplaceCategorySubmit = (categoryData: MarketplaceServiceCategory) => {
        if (editingMarketplaceCategory) {
            setMarketplaceCategories(prev => prev.map(c => c.id === editingMarketplaceCategory.id ? categoryData : c));
        } else {
            setMarketplaceCategories(prev => [categoryData, ...prev]);
        }
        closeMarketplaceCategoryModal();
    };
    const handleDeleteMarketplaceCategory = (id: string) => {
        requestConfirmation(
            'حذف فئة الخدمة',
            'هل أنت متأكد من حذف هذه الفئة؟ سيتم حذف جميع مزودي الخدمة المرتبطين بها.',
            () => {
                setMarketplaceCategories(prev => prev.filter(c => c.id !== id));
                setMarketplaceServiceProviders(prev => prev.filter(p => p.categoryId !== id));
            }
        );
    };
    const openAddMarketplaceProviderModal = () => {
        setEditingMarketplaceProvider(null);
        setIsMarketplaceProviderModalOpen(true);
    };
    const openEditMarketplaceProviderModal = (provider: MarketplaceServiceProvider) => {
        setEditingMarketplaceProvider(provider);
        setIsMarketplaceProviderModalOpen(true);
    };
    const closeMarketplaceProviderModal = () => {
        setIsMarketplaceProviderModalOpen(false);
        setEditingMarketplaceProvider(null);
    };
    const handleMarketplaceProviderSubmit = (providerData: MarketplaceServiceProvider) => {
        if (editingMarketplaceProvider) {
            setMarketplaceServiceProviders(prev => prev.map(p => p.id === editingMarketplaceProvider.id ? providerData : p));
        } else {
            setMarketplaceServiceProviders(prev => [providerData, ...prev]);
        }
        closeMarketplaceProviderModal();
    };
    const handleDeleteMarketplaceProvider = (id: string) => {
        requestConfirmation(
            'حذف مزود الخدمة',
            'هل أنت متأكد من حذف مزود الخدمة هذا؟',
            () => setMarketplaceServiceProviders(prev => prev.filter(p => p.id !== id))
        );
    };
    const handleMarketplaceBookingStatusChange = (id: string, status: MarketplaceBooking['status']) => {
        setMarketplaceBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    };
    const handleDeleteMarketplaceBooking = (id: string) => {
        requestConfirmation(
            'حذف طلب الخدمة',
            'هل أنت متأكد من حذف هذا الطلب؟',
            () => setMarketplaceBookings(prev => prev.filter(b => b.id !== id))
        );
    };

    const handleAwardPoints = (userId: string, pointsToAdd: number, onSuccess: () => void) => {
        const user = users.find(u => u.id === userId);
        if (!user) {
            alert('المستخدم غير موجود.');
            return;
        }

        const updatedUser = { ...user, points: (user.points || 0) + pointsToAdd };
        setUsers(prevUsers => prevUsers.map(u => u.id === userId ? updatedUser : u));
        
        onSuccess();
    };

    const handleAwardMaintenancePoints = (requestId: string) => {
        const request = maintenanceRequests.find(r => r.id === requestId);
        if (!request || !request.userId) return;

        handleAwardPoints(request.userId, pointsSettings.pointsPerMaintenanceRequest, () => {
            setMaintenanceRequests(prev => 
                prev.map(r => r.id === requestId ? { ...r, pointsAwarded: true } : r)
            );
        });
    };

    const handleAwardReviewPoints = (reviewId: string) => {
        const review = reviews.find(r => r.id === reviewId);
        if (!review || !review.userId) return;

        handleAwardPoints(review.userId, pointsSettings.pointsPerReview, () => {
            setReviews(prev =>
                prev.map(r => r.id === reviewId ? { ...r, pointsAwarded: true } : r)
            );
        });
    };

    const handleAwardRentalPoints = (agreementId: string) => {
        const agreement = rentalAgreements.find(a => a.id === agreementId);
        if (!agreement || !agreement.userId) return;
        
        handleAwardPoints(agreement.userId, pointsSettings.pointsPerRental, () => {
            setRentalAgreements(prev =>
                prev.map(a => a.id === agreementId ? { ...a, pointsAwarded: true } : a)
            );
        });
    };

    const filterByDateRange = (items: any[], dateKey: string, startDateStr: string, endDateStr: string) => {
        if (!startDateStr && !endDateStr) return items;
    
        const start = startDateStr ? new Date(startDateStr) : null;
        if (start) start.setHours(0, 0, 0, 0);
    
        const end = endDateStr ? new Date(endDateStr) : null;
        if (end) end.setHours(23, 59, 59, 999);
    
        return items.filter(item => {
            const itemDate = new Date(item[dateKey]);
            if (start && itemDate < start) return false;
            if (end && itemDate > end) return false;
            return true;
        });
    };

    const handleGenerateReport = async (generator: () => void) => {
        setIsGenerating(true);
        await new Promise(resolve => setTimeout(resolve, 50));
        try {
            generator();
        } catch(e) {
            console.error("Error generating report:", e);
            alert("حدث خطأ أثناء إنشاء التقرير.");
        } finally {
            setIsGenerating(false);
        }
    }

    const generateViewingRequestsReport = () => {
        const filteredData = filterByDateRange(viewingRequests, 'requestDate', reportStartDate, reportEndDate);
        const dataForSheet = filteredData.map(req => ({
            'رقم الطلب': req.id,
            'اسم العقار': req.propertyName,
            'اسم العميل': req.userName,
            'هاتف العميل': req.userPhone,
            'البريد الإلكتروني': req.userEmail || '-',
            'الوقت المفضل': req.preferredTime || '-',
            'تاريخ الطلب': new Date(req.requestDate).toLocaleDateString('ar-EG-u-nu-latn'),
            'الحالة': req.status
        }));
        
        const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'طلبات المعاينة');
        XLSX.writeFile(workbook, `AqarLink_Viewing_Requests_${new Date().toISOString().split('T')[0]}.xlsx`);
    };
    
    const generateMaintenanceRequestsReport = () => {
        const filteredData = filterByDateRange(maintenanceRequests, 'requestDate', reportStartDate, reportEndDate);
        const dataForSheet = filteredData.map(req => ({
            'رقم الطلب': req.id,
            'ملخص المشكلة': req.analysis.summary,
            'العطل المحدد': req.analysis.identified_issue || '-',
            'اسم العميل': req.userName,
            'هاتف العميل': req.userPhone,
            'العنوان': req.address,
            'تاريخ الطلب': new Date(req.requestDate).toLocaleDateString('ar-EG-u-nu-latn'),
            'الحالة': req.status,
            'سبب المشكلة (مكتمل)': req.problemCause || '-',
            'ما تم إصلاحه (مكتمل)': req.solution || '-',
            'المبلغ المدفوع (مكتمل)': req.amountPaid || 0,
            'تاريخ الإكمال (مكتمل)': req.completedAt ? new Date(req.completedAt).toLocaleDateString('ar-EG-u-nu-latn') : '-'
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'طلبات الصيانة');
        XLSX.writeFile(workbook, `AqarLink_Maintenance_Requests_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const generateFinancialSummaryReport = () => {
        const completedMaintenance = filterByDateRange(maintenanceRequests, 'requestDate', reportStartDate, reportEndDate)
            .filter(r => r.status === 'مكتمل' && r.amountPaid && r.amountPaid > 0);
        const maintenanceRevenue = completedMaintenance.reduce((sum, req) => sum + (req.amountPaid || 0), 0);

        const maintenanceDetails = completedMaintenance.map(req => ({
            'رقم الطلب': req.id,
            'الخدمة': req.analysis.summary,
            'العميل': req.userName,
            'تاريخ الإكمال': req.completedAt ? new Date(req.completedAt).toLocaleDateString('ar-EG-u-nu-latn') : '-',
            'المبلغ': req.amountPaid || 0
        }));

        const completedViewings = filterByDateRange(viewingRequests, 'requestDate', reportStartDate, reportEndDate)
            .filter(r => r.status === 'مكتمل');
        
        const commissionsDetails = completedViewings.map(req => {
            const property = properties.find(p => p.id === req.propertyId);
            return {
                'رقم طلب المعاينة': req.id,
                'العقار': req.propertyName,
                'العميل': req.userName,
                'تاريخ الطلب': new Date(req.requestDate).toLocaleDateString('ar-EG-u-nu-latn'),
                'العمولة': property?.commission || 0
            };
        }).filter(item => item.العمولة > 0);

        const commissionsRevenue = commissionsDetails.reduce((sum, item) => sum + item.العمولة, 0);

        const summaryData = [
            { 'البند': 'إجمالي إيرادات الصيانة', 'المبلغ': maintenanceRevenue },
            { 'البند': 'إجمالي عمولات العقارات', 'المبلغ': commissionsRevenue },
            { 'البند': 'الإجمالي الكلي', 'المبلغ': maintenanceRevenue + commissionsRevenue }
        ];

        const summarySheet = XLSX.utils.json_to_sheet(summaryData);
        const maintenanceSheet = XLSX.utils.json_to_sheet(maintenanceDetails);
        const commissionsSheet = XLSX.utils.json_to_sheet(commissionsDetails);
        
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص الإيرادات');
        XLSX.utils.book_append_sheet(workbook, maintenanceSheet, 'تفاصيل إيرادات الصيانة');
        XLSX.utils.book_append_sheet(workbook, commissionsSheet, 'تفاصيل العمولات');

        XLSX.writeFile(workbook, `AqarLink_Financial_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const requestConfirmation = (title: string, message: string, onConfirm: () => void) => {
        setConfirmation({ isOpen: true, title, message, onConfirm });
    };

    const handleConfirm = () => {
        if (confirmation?.onConfirm) {
            confirmation.onConfirm();
        }
        setConfirmation(null);
    };

    const handleCancelConfirmation = () => {
        setConfirmation(null);
    };

    const openAddPropertyModal = () => {
        setEditingProperty(null);
        setIsPropertyModalOpen(true);
    };

    const openEditPropertyModal = (property: Property) => {
        setEditingProperty(property);
        setIsPropertyModalOpen(true);
    };
    
    const closePropertyModal = () => {
        setIsPropertyModalOpen(false);
        setEditingProperty(null);
    };

    const handlePropertyFormSubmit = (propertyData: Property) => {
        if (editingProperty) {
            setProperties(prev => prev.map(p => p.id === editingProperty.id ? propertyData : p));
        } else {
            setProperties(prev => [propertyData, ...prev]);
        }
        closePropertyModal();
    };

    const handleDeleteProperty = (id: string) => {
        requestConfirmation(
            'حذف العقار',
            'هل أنت متأكد من حذف هذا العقار؟ لا يمكن التراجع عن هذا الإجراء.',
            () => setProperties(prev => prev.filter(p => p.id !== id))
        );
    };

    const handlePropertyStatusChange = (id: string, currentStatus: PropertyStatus) => {
        const newStatus = currentStatus === 'متاح' ? 'مؤجر' : 'متاح';
        setProperties(prev => 
            prev.map(p => p.id === id ? { ...p, status: newStatus } : p)
        );
    };
    
    const openAddCategoryModal = () => {
        setEditingCategory(null);
        setIsCategoryModalOpen(true);
    };

    const openEditCategoryModal = (category: MaintenanceCategory) => {
        setEditingCategory(category);
        setIsCategoryModalOpen(true);
    };

    const closeCategoryModal = () => {
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
    };

    const handleCategoryFormSubmit = (categoryData: MaintenanceCategory) => {
        if (editingCategory) {
            setMaintenanceCategories(prev => prev.map(c => c.id === editingCategory.id ? categoryData : c));
        } else {
            setMaintenanceCategories(prev => [categoryData, ...prev]);
        }
        closeCategoryModal();
    };

    const handleDeleteCategory = (id: string) => {
        requestConfirmation(
            'حذف فئة الصيانة',
            'هل أنت متأكد من حذف هذه الفئة؟ سيتم إزالتها من قائمة الاختيارات في صفحة الصيانة.',
            () => setMaintenanceCategories(prev => prev.filter(c => c.id !== id))
        );
    };

    const openAddTechnicianModal = () => {
        setEditingTechnician(null);
        setIsTechnicianModalOpen(true);
    };

    const openEditTechnicianModal = (technician: Technician) => {
        setEditingTechnician(technician);
        setIsTechnicianModalOpen(true);
    };

    const closeTechnicianModal = () => {
        setIsTechnicianModalOpen(false);
        setEditingTechnician(null);
    };

    const handleTechnicianFormSubmit = (technicianData: Technician) => {
        if (editingTechnician) {
            setTechnicians(prev => prev.map(t => t.id === editingTechnician.id ? technicianData : t));
        } else {
            setTechnicians(prev => [technicianData, ...prev]);
        }
        closeTechnicianModal();
    };

    const handleDeleteTechnician = (id: string) => {
        requestConfirmation(
            'حذف الفني',
            'هل أنت متأكد من حذف هذا الفني؟',
            () => setTechnicians(prev => prev.filter(t => t.id !== id))
        );
    };

    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'heroImageUrl' | 'maintenancePageImageUrl') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormSettings(prev => ({ ...prev, [field]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSettingsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingSettings(true);
        setSiteSettings(formSettings);
        setTimeout(() => {
            setIsSavingSettings(false);
        }, 1000);
    };

    const openAddFeatureModal = () => {
        setEditingFeature(null);
        setIsFeatureModalOpen(true);
    };

    const openEditFeatureModal = (feature: MaintenanceFeature) => {
        setEditingFeature(feature);
        setIsFeatureModalOpen(true);
    };

    const closeFeatureModal = () => {
        setIsFeatureModalOpen(false);
        setEditingFeature(null);
    };

    const handleFeatureFormSubmit = (featureData: MaintenanceFeature) => {
        setFormSettings(prev => {
            const newFeatures = [...prev.maintenanceFeatures];
            if (editingFeature) {
                const index = newFeatures.findIndex(f => f.id === editingFeature.id);
                if (index !== -1) {
                    newFeatures[index] = featureData;
                }
            } else {
                newFeatures.push(featureData);
            }
            return { ...prev, maintenanceFeatures: newFeatures };
        });
        closeFeatureModal();
    };

    const handleDeleteFeature = (id: string) => {
        requestConfirmation(
            'حذف الميزة',
            'هل أنت متأكد من حذف هذه الميزة؟',
            () => {
                setFormSettings(prev => ({
                    ...prev,
                    maintenanceFeatures: prev.maintenanceFeatures.filter(f => f.id !== id)
                }));
            }
        );
    };

    const handleAboutUsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormAboutUsSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleAboutUsImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormAboutUsSettings(prev => ({ ...prev, imageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleAboutUsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingAbout(true);
        setAboutUsSettings(formAboutUsSettings);
        setTimeout(() => {
            setIsSavingAbout(false);
        }, 1000);
    };
    
    const handleChatbotSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormChatbotSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    
    const handleChatbotSettingsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingChatbot(true);
        setChatbotSettings(formChatbotSettings);
        setTimeout(() => {
            setIsSavingChatbot(false);
        }, 1000);
    };

    const handleAdSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked } = e.target;
        if (name === 'isEnabled') {
            setFormAdSettings(prev => ({ ...prev, isEnabled: checked }));
        } else {
            setFormAdSettings(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleAdPageToggle = (page: Page) => {
        setFormAdSettings(prev => {
            const newPages = prev.displayPages.includes(page)
                ? prev.displayPages.filter(p => p !== page)
                : [...prev.displayPages, page];
            return { ...prev, displayPages: newPages };
        });
    };

    const handleAdImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormAdSettings(prev => ({ ...prev, imageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleAdSettingsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingAd(true);
        setAdSettings(formAdSettings);
        setTimeout(() => {
            setIsSavingAd(false);
        }, 1000);
    };

    const handleDeleteAd = () => {
        requestConfirmation(
            'حذف الإعلان',
            'هل أنت متأكد من حذف الإعلان وبياناته؟ سيتم تعطيله وإزالة الصورة والرابط.',
            () => {
                const initialAdSettings: AdvertisementSettings = { imageUrl: '', linkUrl: '', displayPages: [], isEnabled: false };
                setAdSettings(initialAdSettings);
                setFormAdSettings(initialAdSettings);
            }
        );
    };

    const handleViewingConfirmationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormViewingConfirmation(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFeaturedCategoryToggle = (categoryId: string) => {
        setFormViewingConfirmation(prev => {
            const newIds = [...prev.featuredCategoryIds];
            const index = newIds.indexOf(categoryId);
    
            if (index > -1) {
                newIds.splice(index, 1);
            } else {
                if (newIds.length < 4) { 
                    newIds.push(categoryId);
                }
            }
            return { ...prev, featuredCategoryIds: newIds };
        });
    };

    const handleViewingConfirmationImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormViewingConfirmation(prev => ({ ...prev, imageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleViewingConfirmationSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingViewingConfirmation(true);
        setViewingConfirmationSettings(formViewingConfirmation);
        setTimeout(() => setIsSavingViewingConfirmation(false), 1000);
    };

    const handleMaintenanceConfirmationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormMaintenanceConfirmation(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleMaintenanceConfirmationImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormMaintenanceConfirmation(prev => ({ ...prev, imageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleMaintenanceConfirmationSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingMaintenanceConfirmation(true);
        setMaintenanceConfirmationSettings(formMaintenanceConfirmation);
        setTimeout(() => setIsSavingMaintenanceConfirmation(false), 1000);
    };

    const handleRentalAgreementSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormRentalAgreementSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleTermChange = (index: number, value: string) => {
        const newTerms = [...formRentalAgreementSettings.contractTerms];
        newTerms[index] = value;
        setFormRentalAgreementSettings(prev => ({ ...prev, contractTerms: newTerms }));
    };

    const handleAddTerm = () => {
        setFormRentalAgreementSettings(prev => ({ ...prev, contractTerms: [...prev.contractTerms, ''] }));
    };

    const handleRemoveTerm = (index: number) => {
        setFormRentalAgreementSettings(prev => ({
            ...prev,
            contractTerms: prev.contractTerms.filter((_, i) => i !== index),
        }));
    };

    const handleRentalAgreementSettingsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingRentalAgreementSettings(true);
        setRentalAgreementSettings(formRentalAgreementSettings);
        setTimeout(() => setIsSavingRentalAgreementSettings(false), 1000);
    };

    const handlePointsSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setFormPointsSettings(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormPointsSettings(prev => ({ ...prev, [name]: Number(value) }));
        }
    };
    
    const handlePointsSettingsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingPoints(true);
        setPointsSettings(formPointsSettings);
        setTimeout(() => {
            setIsSavingPoints(false);
        }, 1000);
    };

    const handleRequestStatusChange = (id: string, status: ViewingRequest['status']) => {
        setViewingRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
    };

    const handleDeleteRequest = (id: string) => {
        requestConfirmation(
            'حذف طلب المعاينة',
            'هل أنت متأكد من حذف طلب المعاينة هذا؟',
            () => setViewingRequests(prev => prev.filter(req => req.id !== id))
        );
    };
    
    const handleEmergencyRequestStatusChange = (id: string, status: EmergencyMaintenanceRequest['status']) => {
        setEmergencyMaintenanceRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
    };

    const handleDeleteEmergencyRequest = (id: string) => {
        requestConfirmation(
            'حذف طلب الطوارئ',
            'هل أنت متأكد من حذف طلب الطوارئ هذا؟',
            () => setEmergencyMaintenanceRequests(prev => prev.filter(req => req.id !== id))
        );
    };

    const getStatusBadge = (status: ViewingRequest['status'] | EmergencyMaintenanceRequest['status'] | MarketplaceBooking['status']) => {
        switch(status) {
            case 'جديد': return 'bg-blue-100 text-blue-800';
            case 'تم التواصل': return 'bg-yellow-100 text-yellow-800';
            case 'مكتمل': return 'bg-green-100 text-green-800';
            case 'ملغي': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    const handleMaintReqStatusChange = (req: MaintenanceRequest, newStatus: MaintenanceRequest['status']) => {
        if (newStatus === 'مكتمل' && req.status !== 'مكتمل') {
            setCompletingRequest(req);
        } else {
            setMaintenanceRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: newStatus } : r));
        }
    };

    const handleCompletionSubmit = (details: { problemCause: string; solution: string; amountPaid: number }) => {
        if (!completingRequest) return;
        
        setMaintenanceRequests(prev => prev.map(req => 
            req.id === completingRequest.id 
            ? { ...req, ...details, status: 'مكتمل', completedAt: new Date().toISOString() } 
            : req
        ));

        setCompletingRequest(null);
    };

    const handleDeleteMaintReq = (id: string) => {
        requestConfirmation(
            'حذف طلب الصيانة',
            'هل أنت متأكد من حذف طلب الصيانة هذا؟',
            () => setMaintenanceRequests(prev => prev.filter(req => req.id !== id))
        );
    };
    
    const getMaintStatusBadge = (status: MaintenanceRequest['status']) => {
        switch(status) {
            case 'جديد': return 'bg-blue-100 text-blue-800';
            case 'قيد التنفيذ': return 'bg-yellow-100 text-yellow-800';
            case 'مكتمل': return 'bg-green-100 text-green-800';
            case 'ملغي': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }
    
    const handleDeleteReview = (id: string) => {
        requestConfirmation(
            'حذف التقييم',
            'هل أنت متأكد من حذف هذا التقييم؟ لا يمكن التراجع عن هذا الإجراء.',
            () => setReviews(prev => prev.filter(r => r.id !== id))
        );
    };
    
    const handleViewContract = (agreement: RentalAgreement) => {
        const property = properties.find(p => p.id === agreement.propertyId);
        if (property) {
            setViewingContract({ agreement, property });
        } else {
            alert('لم يتم العثور على العقار المرتبط بهذا العقد.');
        }
    };


    const labelClass = "block text-sm font-medium text-gray-700 mb-1";
    const inputClass = "w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500";
    
    const ImageInput: React.FC<{
        label: string;
        field: 'logoUrl' | 'heroImageUrl' | 'maintenancePageImageUrl';
        currentUrl: string;
    }> = ({ label, field, currentUrl }) => (
        <div>
            <label className={labelClass}>{label}</label>
            <div className="mt-2 flex items-center gap-4">
                {currentUrl ? (
                    <img src={currentUrl} alt={label} className="h-16 w-auto max-w-[200px] object-contain bg-gray-100 p-1 rounded-md border" />
                ) : (
                    <div className="h-16 w-16 flex items-center justify-center bg-gray-100 rounded-md border">
                        <PhotoIcon className="h-8 w-8 text-gray-400" />
                    </div>
                )}
                 <label htmlFor={field} className="relative cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <span>تغيير</span>
                    <input id={field} name={field} type="file" className="sr-only" accept="image/*" onChange={(e) => handleImageUpload(e, field)} />
                </label>
            </div>
        </div>
    );
    
    const AdminIcon: React.FC<{ icon: MaintenanceFeatureIconName }> = ({ icon }) => {
        const iconClass = "w-7 h-7 text-indigo-600";
        switch (icon) {
            case 'ShieldCheckIcon': return <ShieldCheckIcon className={iconClass} />;
            case 'LockClosedIcon': return <LockClosedIcon className={iconClass} />;
            case 'ChatBubbleLeftEllipsisIcon': return <ChatBubbleLeftEllipsisIcon className={iconClass} />;
            case 'TagIcon': return <TagIcon className={iconClass} />;
            case 'ReceiptPercentIcon': return <ReceiptPercentIcon className={iconClass} />;
            case 'ArrowUturnLeftIcon': return <ArrowUturnLeftIcon className={iconClass} />;
            case 'WrenchScrewdriverIcon': return <WrenchScrewdriverIcon className={iconClass} />;
            case 'StarIcon': return <StarIcon className={iconClass} />;
            case 'CheckCircleIcon': return <CheckCircleIcon className={iconClass} />;
            default: return <CogIcon className={iconClass} />;
        }
    };

    const TabButton: React.FC<{
        tab: AdminTab,
        label: string,
        icon: React.ReactNode
    }> = ({ tab, label, icon }) => {
        const isActive = activeTab === tab;
        return (
            <button
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-4 py-3 font-bold border-b-4 transition-colors duration-200 text-base rounded-t-lg ${
                    isActive
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                    : 'border-transparent text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/50'
                }`}
            >
                {icon}
                <span>{label}</span>
            </button>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8 md:py-12 animate-fade-in">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">لوحة التحكم</h1>
            <p className="text-gray-600 mb-10">إدارة جميع جوانب الموقع من هنا.</p>

            <div className="mb-10 border-b border-gray-200">
                <nav className="-mb-px flex space-x-4 space-x-reverse flex-wrap" aria-label="Tabs">
                    <TabButton tab="requests" label="الطلبات" icon={<QueueListIcon className="w-5 h-5" />} />
                    <TabButton tab="reviews" label="التقييمات" icon={<StarIcon className="w-5 h-5" />} />
                    <TabButton tab="employees" label="الموظفين" icon={<UserGroupIcon className="w-5 h-5" />} />
                    <TabButton tab="users" label="المستخدمين" icon={<UserIcon className="w-5 h-5" />} />
                    <TabButton tab="content" label="إدارة المحتوى" icon={<PencilIcon className="w-5 h-5" />} />
                    <TabButton tab="chatbot" label="المساعد الآلي" icon={<ChatBubbleLeftEllipsisIcon className="w-5 h-5" />} />
                    <TabButton tab="reports" label="التقارير" icon={<TableCellsIcon className="w-5 h-5" />} />
                    <TabButton tab="financials" label="الأمور المالية" icon={<BanknotesIcon className="w-5 h-5" />} />
                    <TabButton tab="marketplace" label="سوق الخدمات" icon={<ShoppingBagIcon className="w-5 h-5" />} />
                    <TabButton tab="settings" label="الإعدادات العامة" icon={<CogIcon className="w-5 h-5" />} />
                </nav>
            </div>

            <div className="animate-fade-in">
                {activeTab === 'requests' && (
                    <div className="space-y-12">
                         <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border-2 border-red-300">
                             <div className="flex items-center gap-3 mb-6 pb-4 border-b border-red-200">
                                <div className="p-2 bg-red-100 rounded-full">
                                   <ExclamationTriangleIcon className="w-7 h-7 text-red-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-red-800">طلبات الطوارئ العاجلة</h2>
                            </div>
                             <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                                {emergencyMaintenanceRequests.length > 0 ? [...emergencyMaintenanceRequests].sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()).map(req => (
                                    <div key={req.id} className="bg-red-50 p-4 rounded-lg border border-red-200">
                                        <div className="flex justify-between items-start flex-wrap gap-2">
                                            <div>
                                                <p className="font-bold text-red-700">{req.serviceName}</p>
                                                <p className="text-sm text-red-600">
                                                    بتاريخ: {new Date(req.requestDate).toLocaleString('ar-EG')}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(req.status)}`}>
                                                {req.status}
                                            </span>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-red-200 space-y-2 text-sm">
                                            <p><span className="font-semibold">رقم الهاتف:</span> <span className="font-mono">{req.userPhone}</span></p>
                                        </div>
                                         <div className="mt-4 pt-3 border-t border-red-200 flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">تغيير الحالة:</span>
                                                <select 
                                                    value={req.status}
                                                    onChange={(e) => handleEmergencyRequestStatusChange(req.id, e.target.value as EmergencyMaintenanceRequest['status'])}
                                                    className="text-sm p-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 bg-white"
                                                >
                                                    <option value="جديد">جديد</option>
                                                    <option value="تم التواصل">تم التواصل</option>
                                                    <option value="مكتمل">مكتمل</option>
                                                </select>
                                            </div>
                                            <button onClick={() => handleDeleteEmergencyRequest(req.id)} className="text-red-600 hover:text-red-500 hover:bg-red-100 rounded-full p-2 transition-colors" aria-label="Delete Request">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                )) : <p className="text-center text-gray-500 py-8">لا توجد طلبات طوارئ حالياً.</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <WrenchScrewdriverIcon className="w-7 h-7 text-gray-500" />
                                    <h2 className="text-2xl font-bold text-gray-800">طلبات الصيانة</h2>
                                </div>
                                <div className="relative mb-4">
                                    <input
                                        type="text"
                                        placeholder="ابحث برقم الفاتورة، اسم العميل، أو الهاتف..."
                                        value={maintenanceSearchTerm}
                                        onChange={(e) => setMaintenanceSearchTerm(e.target.value)}
                                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                </div>
                                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                                    {filteredMaintenanceRequests.length > 0 ? filteredMaintenanceRequests.map(req => (
                                        <div key={req.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <div className="flex justify-between items-start flex-wrap gap-2">
                                                <div>
                                                    <p className="font-bold text-indigo-700">{req.analysis.summary}</p>
                                                    <p className="text-sm text-gray-500">
                                                        بتاريخ: {new Date(req.requestDate).toLocaleDateString('ar-EG')} - 
                                                        <span className="font-mono text-gray-600"> #{req.id.slice(-8)}</span>
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getMaintStatusBadge(req.status)}`}>
                                                    {req.status}
                                                </span>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm">
                                                <p><span className="font-semibold">الاسم:</span> {req.userName}</p>
                                                <p><span className="font-semibold">الهاتف:</span> {req.userPhone}</p>
                                                <p><span className="font-semibold">العنوان:</span> {req.address || 'لم يتم توفيره'}</p>
                                                {req.latitude && req.longitude && (
                                                    <a 
                                                        href={`https://www.google.com/maps/search/?api=1&query=${req.latitude},${req.longitude}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold"
                                                    >
                                                        <MapIcon className="w-4 h-4" />
                                                        <span>عرض الموقع على الخريطة</span>
                                                    </a>
                                                )}
                                                <p><span className="font-semibold">الفئة:</span> {req.analysis.category}</p>
                                                <p><span className="font-semibold">الأهمية:</span> <span className={`font-bold ${getMaintStatusBadge(req.analysis.urgency as any)} px-2 py-0.5 rounded`}>{req.analysis.urgency}</span></p>
                                                <p><span className="font-semibold">الفني المقترح:</span> {req.analysis.suggested_technician}</p>

                                                {req.status === 'مكتمل' && (
                                                    <div className="mt-3 pt-3 border-t border-gray-200 bg-green-50 p-3 rounded-md">
                                                        <p><span className="font-semibold text-green-800">سبب المشكلة:</span> {req.problemCause}</p>
                                                        <p><span className="font-semibold text-green-800">ما تم إصلاحه:</span> {req.solution}</p>
                                                        <p><span className="font-semibold text-green-800">المبلغ المدفوع:</span> <span className="font-bold">{req.amountPaid?.toLocaleString()} ريال</span></p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center flex-wrap gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium">الحالة:</span>
                                                    <select 
                                                        value={req.status}
                                                        onChange={(e) => handleMaintReqStatusChange(req, e.target.value as MaintenanceRequest['status'])}
                                                        className="text-sm p-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 bg-white"
                                                    >
                                                        <option value="جديد">جديد</option>
                                                        <option value="قيد التنفيذ">قيد التنفيذ</option>
                                                        <option value="مكتمل">مكتمل</option>
                                                        <option value="ملغي">ملغي</option>
                                                    </select>
                                                    {req.status === 'مكتمل' && (
                                                        <button onClick={() => setViewingInvoice(req)} className="flex items-center gap-1.5 bg-blue-100 text-blue-700 font-bold py-1 px-3 rounded-md hover:bg-blue-200 transition-colors text-sm">
                                                            <DocumentTextIcon className="w-4 h-4" />
                                                            <span>الفاتورة</span>
                                                        </button>
                                                    )}
                                                </div>
                                                
                                                <div className="flex items-center gap-2">
                                                    {req.userId && !req.pointsAwarded && pointsSettings.isEnabled && (
                                                        <button 
                                                            onClick={() => handleAwardMaintenancePoints(req.id)}
                                                            className="flex items-center gap-1.5 bg-yellow-100 text-yellow-800 font-bold py-1 px-3 rounded-md hover:bg-yellow-200 transition-colors text-sm"
                                                        >
                                                            <SparklesIcon className="w-4 h-4" />
                                                            <span>مكافأة (+{pointsSettings.pointsPerMaintenanceRequest})</span>
                                                        </button>
                                                    )}
                                                    {req.pointsAwarded && pointsSettings.isEnabled && (
                                                        <div className="flex items-center gap-1.5 bg-green-100 text-green-800 font-bold py-1 px-3 rounded-md text-sm">
                                                            <CheckCircleIcon className="w-4 h-4" />
                                                            <span>تمت المكافأة</span>
                                                        </div>
                                                    )}
                                                    <button onClick={() => handleDeleteMaintReq(req.id)} className="text-red-600 hover:text-red-500 hover:bg-red-100 rounded-full p-2 transition-colors" aria-label="Delete Request">
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )) : <p className="text-center text-gray-500 py-8">لا توجد طلبات صيانة تطابق بحثك.</p>}
                                </div>
                            </div>
                        
                            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200">
                                <div className="flex items-center gap-3 mb-6">
                                    <QueueListIcon className="w-7 h-7 text-gray-500" />
                                    <h2 className="text-2xl font-bold text-gray-800">طلبات معاينة العقارات</h2>
                                </div>
                                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                                    {viewingRequests.length > 0 ? viewingRequests.map(req => (
                                        <div key={req.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <div className="flex justify-between items-start flex-wrap gap-2">
                                                <div>
                                                    <p className="font-bold text-indigo-700">{req.propertyName}</p>
                                                    <p className="text-sm text-gray-500">بتاريخ: {new Date(req.requestDate).toLocaleDateString('ar-EG')}</p>
                                                </div>
                                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(req.status)}`}>
                                                    {req.status}
                                                </span>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm">
                                                <p><span className="font-semibold">الاسم:</span> {req.userName}</p>
                                                <p><span className="font-semibold">الهاتف:</span> {req.userPhone}</p>
                                                {req.userEmail && <p><span className="font-semibold">البريد الإلكتروني:</span> {req.userEmail}</p>}
                                                {req.preferredTime && <p><span className="font-semibold">الوقت المفضل:</span> {req.preferredTime}</p>}
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium">تغيير الحالة:</span>
                                                    <select 
                                                        value={req.status}
                                                        onChange={(e) => handleRequestStatusChange(req.id, e.target.value as ViewingRequest['status'])}
                                                        className="text-sm p-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 bg-white"
                                                    >
                                                        <option value="جديد">جديد</option>
                                                        <option value="تم التواصل">تم التواصل</option>
                                                        <option value="مكتمل">مكتمل</option>
                                                    </select>
                                                </div>
                                                <button onClick={() => handleDeleteRequest(req.id)} className="text-red-600 hover:text-red-500 hover:bg-red-100 rounded-full p-2 transition-colors" aria-label="Delete Request">
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    )) : <p className="text-center text-gray-500 py-8">لا توجد طلبات معاينة حالياً.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'reviews' && (
                     <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200">
                        <div className="flex items-center gap-3 mb-6">
                            <StarIcon className="w-7 h-7 text-gray-500" />
                            <h2 className="text-2xl font-bold text-gray-800">تقييمات العملاء</h2>
                        </div>
                        <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                            {reviews.length > 0 ? [...reviews].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(review => (
                                <div key={review.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-4 mb-2 flex-wrap">
                                                <StarRating rating={review.rating} />
                                                <p className="font-bold text-gray-800 text-lg">{review.userName}</p>
                                                {review.userPhone && (
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                        <PhoneIcon className="w-4 h-4 text-gray-400" />
                                                        <span className="font-mono">{review.userPhone}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                                {review.type === 'technician' ? <UserGroupIcon className="w-4 h-4 text-gray-500" /> : <HomeModernIcon className="w-4 h-4 text-gray-500" />}
                                                <span>تقييم لـ<span className="font-semibold text-indigo-700">{review.type === 'technician' ? 'فني' : 'عقار'}</span>: <span className="font-semibold text-gray-700">{review.targetName}</span></span>
                                                <span className="text-gray-300">|</span>
                                                <span>{new Date(review.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric'})}</span>
                                            </div>
                                            <p className="text-gray-700 bg-white p-3 rounded-md border">{review.comment}</p>
                                        </div>
                                        <div className="flex-shrink-0 flex items-center gap-2">
                                            {review.userId && !review.pointsAwarded && pointsSettings.isEnabled && (
                                                <button 
                                                    onClick={() => handleAwardReviewPoints(review.id)}
                                                    className="flex items-center gap-1.5 bg-yellow-100 text-yellow-800 font-bold py-1 px-3 rounded-md hover:bg-yellow-200 transition-colors text-sm"
                                                >
                                                    <SparklesIcon className="w-4 h-4" />
                                                    <span>مكافأة (+{pointsSettings.pointsPerReview})</span>
                                                </button>
                                            )}
                                            {review.pointsAwarded && pointsSettings.isEnabled && (
                                                <div className="flex items-center gap-1.5 bg-green-100 text-green-800 font-bold py-1 px-3 rounded-md text-sm">
                                                    <CheckCircleIcon className="w-4 h-4" />
                                                    <span>تمت المكافأة</span>
                                                </div>
                                            )}
                                            <button onClick={() => handleDeleteReview(review.id)} className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-100 rounded-full transition-colors" aria-label="حذف التقييم">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )) : <p className="text-center text-gray-500 py-12">لا توجد تقييمات حالياً.</p>}
                        </div>
                    </div>
                )}

                {activeTab === 'employees' && (
                     <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                            <div className="flex items-center gap-2 p-1 bg-gray-200 rounded-full">
                                <button onClick={() => setEmployeeView('list')} className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full transition-colors ${employeeView === 'list' ? 'bg-white text-indigo-600 shadow' : 'text-gray-600'}`}>
                                    <UserGroupIcon className="w-5 h-5" />
                                    <span>قائمة الفنيين</span>
                                </button>
                                <button onClick={() => setEmployeeView('schedule')} className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full transition-colors ${employeeView === 'schedule' ? 'bg-white text-indigo-600 shadow' : 'text-gray-600'}`}>
                                    <TableCellsIcon className="w-5 h-5" />
                                    <span>جدول المواعيد</span>
                                </button>
                            </div>
                            {employeeView === 'list' && (
                                <button onClick={openAddTechnicianModal} className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                                    <PlusIcon className="w-5 h-5" />
                                    <span>إضافة موظف</span>
                                </button>
                            )}
                        </div>
                        {employeeView === 'list' ? (
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                {technicians.length > 0 ? technicians.map(tech => (
                                    <TechnicianAdminCard 
                                        key={tech.id} 
                                        tech={tech} 
                                        onEdit={() => openEditTechnicianModal(tech)} 
                                        onDelete={() => handleDeleteTechnician(tech.id)} 
                                    />
                                )) : <p className="text-center text-gray-500 py-8">لا يوجد موظفين حالياً.</p>}
                            </div>
                        ) : (
                           <TechnicianSchedule 
                                technicians={technicians}
                                requests={maintenanceRequests}
                                setRequests={setMaintenanceRequests}
                            />
                        )}
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200">
                        <div className="flex items-center gap-3 mb-6">
                            <UserIcon className="w-7 h-7 text-gray-500" />
                            <h2 className="text-2xl font-bold text-gray-800">إدارة المستخدمين</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-right text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">الاسم</th>
                                        <th scope="col" className="px-6 py-3">رقم الهاتف</th>
                                        <th scope="col" className="px-6 py-3">النقاط</th>
                                        <th scope="col" className="px-6 py-3">كود الدعوة</th>
                                        <th scope="col" className="px-6 py-3">تمت دعوته بواسطة</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => {
                                        const referrer = user.referredByCode ? users.find(u => u.referralCode === user.referredByCode) : null;
                                        return (
                                            <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                                                <td className="px-6 py-4 font-mono">{user.phone}</td>
                                                <td className="px-6 py-4 font-semibold text-indigo-600">{user.points}</td>
                                                <td className="px-6 py-4 font-mono text-blue-600">{user.referralCode}</td>
                                                <td className="px-6 py-4">
                                                    {referrer ? (
                                                        <span title={`Code: ${user.referredByCode}`}>{referrer.name}</span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                
                {activeTab === 'reports' && (
                     <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200 animate-fade-in">
                        <div className="flex items-center gap-3 mb-4">
                            <TableCellsIcon className="w-7 h-7 text-gray-500" />
                            <h2 className="text-2xl font-bold text-gray-800">استخراج التقارير</h2>
                        </div>
                        <p className="text-gray-600 mb-6">اختر نطاق التاريخ ثم قم بتنزيل التقرير المطلوب بصيغة Excel. إذا لم تختر تاريخًا، سيتم تصدير جميع البيانات.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                             <div>
                                <label htmlFor="startDate" className={labelClass}>من تاريخ</label>
                                <input type="date" id="startDate" value={reportStartDate} onChange={(e) => setReportStartDate(e.target.value)} className={inputClass} />
                             </div>
                             <div>
                                <label htmlFor="endDate" className={labelClass}>إلى تاريخ</label>
                                <input type="date" id="endDate" value={reportEndDate} onChange={(e) => setReportEndDate(e.target.value)} className={inputClass} />
                             </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <button onClick={() => handleGenerateReport(generateViewingRequestsReport)} disabled={isGenerating} className="flex items-center justify-center gap-3 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:bg-blue-400 disabled:cursor-wait">
                                {isGenerating ? <CogIcon className="animate-spin w-5 h-5"/> : <QueueListIcon className="w-5 h-5" />}
                                <span>تقرير طلبات المعاينة</span>
                            </button>
                            <button onClick={() => handleGenerateReport(generateMaintenanceRequestsReport)} disabled={isGenerating} className="flex items-center justify-center gap-3 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors shadow-md disabled:bg-green-400 disabled:cursor-wait">
                                {isGenerating ? <CogIcon className="animate-spin w-5 h-5"/> : <WrenchScrewdriverIcon className="w-5 h-5" />}
                                <span>تقرير طلبات الصيانة</span>
                            </button>
                            <button onClick={() => handleGenerateReport(generateFinancialSummaryReport)} disabled={isGenerating} className="flex items-center justify-center gap-3 bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors shadow-md disabled:bg-purple-400 disabled:cursor-wait">
                                {isGenerating ? <CogIcon className="animate-spin w-5 h-5"/> : <DocumentTextIcon className="w-5 h-5" />}
                                <span>تقرير مالي ملخص</span>
                            </button>
                        </div>
                    </div>
                )}
                 
                {activeTab === 'financials' && (
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200">
                        <div className="flex items-center gap-3 mb-6">
                            <BanknotesIcon className="w-7 h-7 text-gray-500" />
                            <h2 className="text-2xl font-bold text-gray-800">العقود المالية (الإيجارات)</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-right text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">رقم العقد</th>
                                        <th scope="col" className="px-6 py-3">اسم العقار</th>
                                        <th scope="col" className="px-6 py-3">اسم المستأجر</th>
                                        <th scope="col" className="px-6 py-3">المبلغ المدفوع</th>
                                        <th scope="col" className="px-6 py-3">تاريخ الإيجار</th>
                                        <th scope="col" className="px-6 py-3">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rentalAgreements.length > 0 ? rentalAgreements.map(agreement => (
                                        <tr key={agreement.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-mono text-gray-700">#{agreement.id.slice(-8)}</td>
                                            <td className="px-6 py-4 font-medium text-gray-900">{agreement.propertyName}</td>
                                            <td className="px-6 py-4">{agreement.tenantName}</td>
                                            <td className="px-6 py-4 font-semibold text-green-700">{agreement.amountPaid.toLocaleString()} ريال</td>
                                            <td className="px-6 py-4">{new Date(agreement.rentalDate).toLocaleDateString('ar-EG')}</td>
                                            <td className="px-6 py-4 flex items-center gap-4">
                                                 <button onClick={() => handleViewContract(agreement)} className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1.5" aria-label="عرض العقد">
                                                    <DocumentTextIcon className="w-5 h-5" />
                                                    <span>عرض</span>
                                                </button>
                                                {agreement.userId && !agreement.pointsAwarded && pointsSettings.isEnabled && (
                                                    <button 
                                                        onClick={() => handleAwardRentalPoints(agreement.id)}
                                                        className="flex items-center gap-1.5 bg-yellow-100 text-yellow-800 font-bold py-1 px-3 rounded-md hover:bg-yellow-200 transition-colors text-xs"
                                                    >
                                                        <SparklesIcon className="w-4 h-4" />
                                                        <span>مكافأة (+{pointsSettings.pointsPerRental})</span>
                                                    </button>
                                                )}
                                                {agreement.pointsAwarded && pointsSettings.isEnabled && (
                                                    <div className="flex items-center gap-1.5 bg-green-100 text-green-800 font-bold py-1 px-3 rounded-md text-xs">
                                                        <CheckCircleIcon className="w-4 h-4" />
                                                        <span>تمت</span>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500">لا توجد عقود إيجار مسجلة.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'content' && (
                    <div className="space-y-12">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">إدارة العقارات</h2>
                                    <button onClick={openAddPropertyModal} className="flex items-center gap-2 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                                        <PlusIcon className="w-5 h-5" />
                                        <span>إضافة عقار</span>
                                    </button>
                                </div>
                                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                    {properties.length > 0 ? properties.map(prop => (
                                        <div key={prop.id} className="bg-gray-50 p-3 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-3 border border-gray-200">
                                            <div className="flex-grow">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white ${prop.type === 'سكني' ? 'bg-blue-500' : 'bg-green-500'}`}>
                                                        {prop.type}
                                                    </span>
                                                    <p className="font-bold text-gray-800">{prop.title}</p>
                                                </div>
                                                <p className="text-sm text-gray-500">{prop.location} - {prop.price.toLocaleString()} ريال - عمولة: {prop.commission.toLocaleString()} ريال</p>
                                            </div>
                                            <div className="flex items-center gap-4 flex-shrink-0">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-semibold text-sm ${prop.status === 'متاح' ? 'text-green-700' : 'text-yellow-700'}`}>
                                                        {prop.status}
                                                    </span>
                                                    <label htmlFor={`status-toggle-${prop.id}`} className="flex items-center cursor-pointer" title={`تغيير الحالة إلى ${prop.status === 'متاح' ? 'مؤجر' : 'متاح'}`}>
                                                        <div className="relative">
                                                            <input 
                                                                type="checkbox" 
                                                                id={`status-toggle-${prop.id}`} 
                                                                className="sr-only" 
                                                                checked={prop.status === 'مؤجر'} 
                                                                onChange={() => handlePropertyStatusChange(prop.id, prop.status)}
                                                            />
                                                            <div className={`block w-12 h-7 rounded-full transition-all ${prop.status === 'مؤجر' ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
                                                            <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${prop.status === 'مؤجر' ? 'transform translate-x-5' : ''}`}></div>
                                                        </div>
                                                    </label>
                                                </div>
                                                <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => openLogModal(prop)} className="text-gray-500 hover:text-green-600 p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="سجل الصيانة">
                                                        <DocumentTextIcon className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={() => openEditPropertyModal(prop)} className="text-gray-500 hover:text-indigo-600 p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Edit Property">
                                                        <PencilIcon className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={() => handleDeleteProperty(prop.id)} className="text-gray-500 hover:text-red-600 p-2 hover:bg-red-100 rounded-full transition-colors" aria-label="Delete Property">
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )) : <p className="text-center text-gray-500 py-4">لا توجد عقارات حالياً.</p>}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">إدارة فئات الصيانة</h2>
                                    <button onClick={openAddCategoryModal} className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                                        <PlusIcon className="w-5 h-5" />
                                        <span>إضافة فئة</span>
                                    </button>
                                </div>
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                    {maintenanceCategories.length > 0 ? maintenanceCategories.map(cat => (
                                        <div key={cat.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-lg text-gray-800">{cat.name}</h4>
                                                    <p className="text-sm text-gray-600 mt-1">{cat.description}</p>
                                                    <p className="text-sm text-green-700 font-semibold mt-2">رسوم الكشف: {cat.inspectionFee > 0 ? `${cat.inspectionFee.toLocaleString()} ريال` : 'لا يوجد'}</p>
                                                </div>
                                                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                                    <button onClick={() => openEditCategoryModal(cat)} className="text-gray-500 hover:text-indigo-600 p-2" aria-label={`Edit ${cat.name}`}>
                                                        <PencilIcon className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={() => handleDeleteCategory(cat.id)} className="text-gray-500 hover:text-red-600 p-2" aria-label={`Delete ${cat.name}`}>
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                            {cat.commonIssues.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                    <h5 className="text-sm font-semibold text-gray-700 mb-2">الأعطال الشائعة والضمان:</h5>
                                                    <div className="flex flex-wrap gap-2">
                                                        {cat.commonIssues.map((issue) => (
                                                            <span key={issue.id} className="bg-gray-200 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
                                                                {issue.name} ({issue.warrantyDays} يوم)
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )) : <p className="text-center text-gray-500 py-4">لا توجد فئات صيانة معرفة.</p>}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">إعدادات نظام النقاط والمكافآت</h2>
                            <form onSubmit={handlePointsSettingsSubmit} className="space-y-6">
                                <div className="flex items-center gap-4 pt-2">
                                    <label htmlFor="points-enabled-toggle" className="flex items-center cursor-pointer">
                                        <div className="relative">
                                            <input type="checkbox" id="points-enabled-toggle" name="isEnabled" className="sr-only" checked={formPointsSettings.isEnabled} onChange={handlePointsSettingsChange} />
                                            <div className={`block w-14 h-8 rounded-full transition-all ${formPointsSettings.isEnabled ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formPointsSettings.isEnabled ? 'transform translate-x-6' : ''}`}></div>
                                        </div>
                                        <div className="ml-3 text-gray-700 font-medium">
                                            {formPointsSettings.isEnabled ? 'نظام النقاط مفعل' : 'نظام النقاط معطل'}
                                        </div>
                                    </label>
                                </div>

                                <div className={`space-y-4 ${!formPointsSettings.isEnabled && 'opacity-50 pointer-events-none'}`}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                        <div>
                                            <label htmlFor="pointsPerRental" className={labelClass}>نقاط لكل إيجار جديد</label>
                                            <input type="number" id="pointsPerRental" name="pointsPerRental" value={formPointsSettings.pointsPerRental} onChange={handlePointsSettingsChange} className={inputClass} />
                                        </div>
                                        <div>
                                            <label htmlFor="pointsPerReview" className={labelClass}>نقاط لكل تقييم</label>
                                            <input type="number" id="pointsPerReview" name="pointsPerReview" value={formPointsSettings.pointsPerReview} onChange={handlePointsSettingsChange} className={inputClass} />
                                        </div>
                                        <div>
                                            <label htmlFor="pointsPerMaintenanceRequest" className={labelClass}>نقاط لكل طلب صيانة</label>
                                            <input type="number" id="pointsPerMaintenanceRequest" name="pointsPerMaintenanceRequest" value={formPointsSettings.pointsPerMaintenanceRequest} onChange={handlePointsSettingsChange} className={inputClass} />
                                        </div>
                                        <div>
                                            <label htmlFor="pointsPerReferral" className={labelClass}>نقاط لكل إحالة</label>
                                            <input type="number" id="pointsPerReferral" name="pointsPerReferral" value={formPointsSettings.pointsPerReferral} onChange={handlePointsSettingsChange} className={inputClass} />
                                        </div>
                                        <div>
                                            <label htmlFor="pointValueInSAR" className={labelClass}>قيمة النقطة (بالريال)</label>
                                            <input type="number" step="0.01" id="pointValueInSAR" name="pointValueInSAR" value={formPointsSettings.pointValueInSAR} onChange={handlePointsSettingsChange} className={inputClass} />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">ملاحظة: منح النقاط يتم يدويًا من قبل المسؤول من أقسام الطلبات والتقييمات لضمان جودة الإجراء. نقاط الإحالة تتم تلقائياً.</p>
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400" disabled={isSavingPoints}>
                                        {isSavingPoints ? 'جاري الحفظ...' : 'حفظ إعدادات النقاط'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                
                {activeTab === 'chatbot' && (
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200 animate-fade-in">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">إعدادات المساعد الآلي (Chatbot)</h2>
                        <form onSubmit={handleChatbotSettingsSubmit} className="space-y-6">
                             <div className="flex items-center gap-4 pt-2">
                                <label htmlFor="chatbot-enabled-toggle" className="flex items-center cursor-pointer">
                                    <div className="relative">
                                        <input type="checkbox" id="chatbot-enabled-toggle" name="isEnabled" className="sr-only" checked={formChatbotSettings.isEnabled} onChange={handleChatbotSettingsChange} />
                                        <div className={`block w-14 h-8 rounded-full transition-all ${formChatbotSettings.isEnabled ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formChatbotSettings.isEnabled ? 'transform translate-x-6' : ''}`}></div>
                                    </div>
                                    <div className="ml-3 text-gray-700 font-medium">
                                        {formChatbotSettings.isEnabled ? 'المساعد الآلي مفعل' : 'المساعد الآلي معطل'}
                                    </div>
                                </label>
                            </div>

                            <div className={`space-y-4 ${!formChatbotSettings.isEnabled && 'opacity-50 pointer-events-none'}`}>
                                <div>
                                    <label htmlFor="greetingMessage" className={labelClass}>الرسالة الترحيبية</label>
                                    <textarea id="greetingMessage" name="greetingMessage" value={formChatbotSettings.greetingMessage} onChange={handleChatbotSettingsChange} rows={2} className={inputClass} />
                                </div>
                                <div>
                                    <label htmlFor="companyInfo" className={labelClass}>معلومات عن الشركة</label>
                                    <textarea id="companyInfo" name="companyInfo" value={formChatbotSettings.companyInfo} onChange={handleChatbotSettingsChange} rows={3} className={inputClass} />
                                </div>
                                <div>
                                    <label htmlFor="servicesSummary" className={labelClass}>ملخص الخدمات</label>
                                    <textarea id="servicesSummary" name="servicesSummary" value={formChatbotSettings.servicesSummary} onChange={handleChatbotSettingsChange} rows={3} className={inputClass} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="howToRent" className={labelClass}>كيفية حجز عقار</label>
                                        <textarea id="howToRent" name="howToRent" value={formChatbotSettings.howToRent} onChange={handleChatbotSettingsChange} rows={3} className={inputClass} />
                                    </div>
                                    <div>
                                        <label htmlFor="howToRequestMaintenance" className={labelClass}>كيفية طلب صيانة</label>
                                        <textarea id="howToRequestMaintenance" name="howToRequestMaintenance" value={formChatbotSettings.howToRequestMaintenance} onChange={handleChatbotSettingsChange} rows={3} className={inputClass} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="realEstatePhone" className={labelClass}>هاتف العقارات</label>
                                        <input type="tel" id="realEstatePhone" name="realEstatePhone" value={formChatbotSettings.realEstatePhone} onChange={handleChatbotSettingsChange} className={inputClass} />
                                    </div>
                                    <div>
                                        <label htmlFor="maintenancePhone" className={labelClass}>هاتف الصيانة</label>
                                        <input type="tel" id="maintenancePhone" name="maintenancePhone" value={formChatbotSettings.maintenancePhone} onChange={handleChatbotSettingsChange} className={inputClass} />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="fallbackMessage" className={labelClass}>رسالة عند عدم معرفة الإجابة</label>
                                    <textarea id="fallbackMessage" name="fallbackMessage" value={formChatbotSettings.fallbackMessage} onChange={handleChatbotSettingsChange} rows={3} className={inputClass} />
                                    <p className="text-xs text-gray-500 mt-1">يمكنك استخدام <code>{`{realEstatePhone}`}</code> و <code>{`{maintenancePhone}`}</code> وسيتم استبدالهما بالأرقام المدخلة أعلاه.</p>
                                </div>
                            </div>
                            
                            <div className="pt-4 flex justify-end">
                                <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400" disabled={isSavingChatbot}>
                                    {isSavingChatbot ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'marketplace' && (
                    <div className="space-y-12">
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200">
                             <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">إدارة فئات سوق الخدمات</h2>
                                <button onClick={openAddMarketplaceCategoryModal} className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                                    <PlusIcon className="w-5 h-5" />
                                    <span>إضافة فئة</span>
                                </button>
                            </div>
                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                {marketplaceCategories.map(cat => (
                                    <div key={cat.id} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center gap-3 border border-gray-200">
                                        <div className="flex-grow">
                                            <p className="font-bold text-gray-800">{cat.name}</p>
                                            <p className="text-sm text-gray-500">{cat.description}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openEditMarketplaceCategoryModal(cat)} className="text-gray-500 hover:text-indigo-600 p-2 hover:bg-gray-100 rounded-full"><PencilIcon className="w-5 h-5"/></button>
                                            <button onClick={() => handleDeleteMarketplaceCategory(cat.id)} className="text-gray-500 hover:text-red-600 p-2 hover:bg-red-100 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200">
                             <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">إدارة مزودي الخدمات</h2>
                                <button onClick={openAddMarketplaceProviderModal} className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                                    <PlusIcon className="w-5 h-5" />
                                    <span>إضافة مزود خدمة</span>
                                </button>
                            </div>
                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                {marketplaceServiceProviders.map(prov => {
                                    const category = marketplaceCategories.find(c => c.id === prov.categoryId);
                                    return (
                                        <div key={prov.id} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center gap-3 border border-gray-200">
                                            <div className="flex-grow">
                                                <p className="font-bold text-gray-800">{prov.name} <span className="text-sm font-normal text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">{category?.name}</span></p>
                                                <p className="text-sm text-gray-500">{prov.description}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => openEditMarketplaceProviderModal(prov)} className="text-gray-500 hover:text-indigo-600 p-2 hover:bg-gray-100 rounded-full"><PencilIcon className="w-5 h-5"/></button>
                                                <button onClick={() => handleDeleteMarketplaceProvider(prov.id)} className="text-gray-500 hover:text-red-600 p-2 hover:bg-red-100 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200">
                             <h2 className="text-2xl font-bold text-gray-800 mb-6">طلبات سوق الخدمات</h2>
                             <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                                {marketplaceBookings.map(req => (
                                    <div key={req.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-indigo-700">{req.serviceProviderName}</p>
                                                <p className="text-sm text-gray-500">بتاريخ: {new Date(req.requestDate).toLocaleDateString('ar-EG')}</p>
                                            </div>
                                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(req.status)}`}>{req.status}</span>
                                        </div>
                                        <div className="mt-3 pt-3 border-t">
                                            <p><span className="font-semibold">العميل:</span> {req.userName}</p>
                                            <p><span className="font-semibold">الهاتف:</span> {req.userPhone}</p>
                                        </div>
                                        <div className="mt-3 pt-3 border-t flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <select value={req.status} onChange={(e) => handleMarketplaceBookingStatusChange(req.id, e.target.value as MarketplaceBooking['status'])} className="text-sm p-1 border rounded-md">
                                                    <option value="جديد">جديد</option>
                                                    <option value="تم التواصل">تم التواصل</option>
                                                    <option value="مكتمل">مكتمل</option>
                                                    <option value="ملغي">ملغي</option>
                                                </select>
                                            </div>
                                            <button onClick={() => handleDeleteMarketplaceBooking(req.id)} className="text-red-600 hover:text-red-500 p-2 hover:bg-red-100 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                )}


                {activeTab === 'settings' && (
                     <div className="space-y-12">
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">إعدادات الموقع العامة</h2>
                             <form onSubmit={handleSettingsSubmit} className="space-y-8">
                                
                                <div className="p-4 border rounded-lg bg-gray-50/50">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-3">معلومات عامة وتفعيل الميزات</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                        <div>
                                            <label htmlFor="siteName" className={labelClass}>اسم الموقع</label>
                                            <input type="text" id="siteName" name="siteName" value={formSettings.siteName} onChange={handleSettingsChange} className={inputClass} required />
                                        </div>
                                        <ImageInput label="شعار الموقع (اللوجو)" field="logoUrl" currentUrl={formSettings.logoUrl} />
                                    </div>
                                    <div className="mt-6 pt-4 border-t">
                                        <label htmlFor="marketplaceEnabled-toggle" className="flex items-center cursor-pointer">
                                            <div className="relative">
                                                <input type="checkbox" id="marketplaceEnabled-toggle" name="marketplaceEnabled" className="sr-only" checked={formSettings.marketplaceEnabled} onChange={handleSettingsChange} />
                                                <div className={`block w-14 h-8 rounded-full transition-all ${formSettings.marketplaceEnabled ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                                                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formSettings.marketplaceEnabled ? 'transform translate-x-6' : ''}`}></div>
                                            </div>
                                            <div className="ml-3 text-gray-700 font-medium">
                                                {formSettings.marketplaceEnabled ? 'سوق الخدمات مفعل' : 'سوق الخدمات معطل'}
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="p-4 border rounded-lg bg-gray-50/50">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-3">محتوى الواجهة الرئيسية (Homepage)</h3>
                                    <div className="space-y-6 pt-2">
                                        <ImageInput label="صورة الواجهة الرئيسية" field="heroImageUrl" currentUrl={formSettings.heroImageUrl} />
                                        <div>
                                            <label htmlFor="heroTitle" className={labelClass}>العنوان الرئيسي في الواجهة</label>
                                            <input type="text" id="heroTitle" name="heroTitle" value={formSettings.heroTitle} onChange={handleSettingsChange} className={inputClass} required />
                                        </div>
                                        <div>
                                            <label htmlFor="heroSubtitle" className={labelClass}>النص الفرعي في الواجهة</label>
                                            <textarea id="heroSubtitle" name="heroSubtitle" value={formSettings.heroSubtitle} onChange={handleSettingsChange} rows={3} className={inputClass} required />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-4 border rounded-lg bg-gray-50/50">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-3">محتوى صفحة الصيانة</h3>
                                    <div className="space-y-6 pt-2">
                                        <ImageInput label="صورة خلفية صفحة الصيانة" field="maintenancePageImageUrl" currentUrl={formSettings.maintenancePageImageUrl} />
                                        <div>
                                            <label htmlFor="maintenancePageSubtitle" className={labelClass}>النص الفرعي في صفحة الصيانة</label>
                                            <textarea id="maintenancePageSubtitle" name="maintenancePageSubtitle" value={formSettings.maintenancePageSubtitle} onChange={handleSettingsChange} rows={3} className={inputClass} required />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-4 border rounded-lg bg-gray-50/50">
                                    <div className="flex justify-between items-center mb-4 border-b pb-3">
                                        <h3 className="text-lg font-bold text-gray-800">مميزات صفحة الصيانة</h3>
                                        <button type="button" onClick={openAddFeatureModal} className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                                            <PlusIcon className="w-5 h-5" />
                                            <span>إضافة ميزة</span>
                                        </button>
                                    </div>
                                    <div className="space-y-4 pt-2 max-h-96 overflow-y-auto pr-2">
                                        {formSettings.maintenanceFeatures.length > 0 ? formSettings.maintenanceFeatures.map(feature => (
                                            <div key={feature.id} className="bg-white p-4 rounded-lg border border-gray-200 flex items-start gap-4">
                                                <div className="flex-shrink-0 mt-1"><AdminIcon icon={feature.icon} /></div>
                                                <div className="flex-grow">
                                                    <h4 className="font-bold text-gray-800">{feature.title}</h4>
                                                    <p className="text-sm text-gray-600">{feature.description}</p>
                                                </div>
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    <button type="button" onClick={() => openEditFeatureModal(feature)} className="text-gray-500 hover:text-indigo-600 p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Edit Feature">
                                                        <PencilIcon className="w-5 h-5" />
                                                    </button>
                                                    <button type="button" onClick={() => handleDeleteFeature(feature.id)} className="text-gray-500 hover:text-red-600 p-2 hover:bg-red-100 rounded-full transition-colors" aria-label="Delete Feature">
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        )) : <p className="text-center text-gray-500 py-4">لا توجد مميزات مضافة حالياً.</p>}
                                    </div>
                                </div>

                                <div className="p-4 border rounded-lg bg-gray-50/50">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-3">عناوين الصفحات</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 pt-2">
                                        <div>
                                            <label htmlFor="rentalsPageTitle" className={labelClass}>عنوان صفحة العقارات</label>
                                            <input type="text" id="rentalsPageTitle" name="rentalsPageTitle" value={formSettings.rentalsPageTitle} onChange={handleSettingsChange} className={inputClass} required />
                                        </div>
                                        <div>
                                            <label htmlFor="maintenancePageTitle" className={labelClass}>عنوان صفحة الصيانة</label>
                                            <input type="text" id="maintenancePageTitle" name="maintenancePageTitle" value={formSettings.maintenancePageTitle} onChange={handleSettingsChange} className={inputClass} required />
                                        </div>
                                        <div>
                                            <label htmlFor="aboutPageTitle" className={labelClass}>عنوان صفحة "عنا"</label>
                                            <input type="text" id="aboutPageTitle" name="aboutPageTitle" value={formSettings.aboutPageTitle} onChange={handleSettingsChange} className={inputClass} required />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6">إعدادات شاشة تأكيد المعاينة</h2>
                                    <form onSubmit={handleViewingConfirmationSubmit} className="space-y-6">
                                        <div className="flex items-center gap-4 pt-2">
                                            <label htmlFor="viewing-conf-enabled-toggle" className="flex items-center cursor-pointer">
                                                <div className="relative">
                                                    <input type="checkbox" id="viewing-conf-enabled-toggle" name="isEnabled" className="sr-only" checked={formViewingConfirmation.isEnabled} onChange={handleViewingConfirmationChange} />
                                                    <div className={`block w-14 h-8 rounded-full transition-all ${formViewingConfirmation.isEnabled ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                                                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formViewingConfirmation.isEnabled ? 'transform translate-x-6' : ''}`}></div>
                                                </div>
                                                <div className="ml-3 text-gray-700 font-medium">
                                                    {formViewingConfirmation.isEnabled ? 'شاشة العروض مفعلة' : 'شاشة العروض معطلة'}
                                                </div>
                                            </label>
                                        </div>
                                        
                                        {formViewingConfirmation.isEnabled && (
                                            <div className="space-y-4 animate-fade-in border-t pt-6">
                                                <div>
                                                    <label className={labelClass}>صورة العرض (اختياري)</label>
                                                    <div className="mt-2 flex items-center gap-4">
                                                        {formViewingConfirmation.imageUrl ? (
                                                            <img src={formViewingConfirmation.imageUrl} alt="Preview" className="h-24 w-auto max-w-[300px] object-contain bg-gray-100 p-1 rounded-md border" />
                                                        ) : (
                                                            <div className="h-24 w-48 flex items-center justify-center bg-gray-100 rounded-md border">
                                                                <PhotoIcon className="h-8 w-8 text-gray-400" />
                                                            </div>
                                                        )}
                                                        <label htmlFor="viewingConfImageUrl" className="relative cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                                                            <span>تغيير الصورة</span>
                                                            <input id="viewingConfImageUrl" name="viewingConfImageUrl" type="file" className="sr-only" accept="image/*" onChange={handleViewingConfirmationImageUpload} />
                                                        </label>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label htmlFor="viewingConfTitle" className={labelClass}>العنوان الرئيسي</label>
                                                    <input type="text" id="viewingConfTitle" name="title" value={formViewingConfirmation.title} onChange={handleViewingConfirmationChange} className={inputClass} />
                                                </div>
                                                <div>
                                                    <label htmlFor="viewingConfSubtitle" className={labelClass}>النص الفرعي</label>
                                                    <textarea id="viewingConfSubtitle" name="subtitle" value={formViewingConfirmation.subtitle} onChange={handleViewingConfirmationChange} rows={3} className={inputClass} />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label htmlFor="primaryButtonText" className={labelClass}>نص الزر الأساسي</label>
                                                        <input type="text" id="primaryButtonText" name="primaryButtonText" value={formViewingConfirmation.primaryButtonText} onChange={handleViewingConfirmationChange} className={inputClass} />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="primaryButtonLink" className={labelClass}>رابط الزر الأساسي</label>
                                                        <input type="text" id="primaryButtonLink" name="primaryButtonLink" value={formViewingConfirmation.primaryButtonLink} onChange={handleViewingConfirmationChange} className={inputClass} placeholder="maintenance أو https://..." />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label htmlFor="showMaintenanceServices" className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" id="showMaintenanceServices" name="showMaintenanceServices" checked={formViewingConfirmation.showMaintenanceServices} onChange={handleViewingConfirmationChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                                        <span className="text-gray-700">عرض قائمة خدمات الصيانة المقترحة</span>
                                                    </label>
                                                </div>
                                                {formViewingConfirmation.showMaintenanceServices && (
                                                    <div className="border-t pt-4 animate-fade-in">
                                                        <label className={labelClass}>أقسام الصيانة المرشحة (اختر حتى 4)</label>
                                                        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                                                            {maintenanceCategories.map(cat => (
                                                                <label key={cat.id} className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${!formViewingConfirmation.featuredCategoryIds.includes(cat.id) && formViewingConfirmation.featuredCategoryIds.length >= 4 ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'cursor-pointer bg-gray-50 hover:bg-indigo-50'}`}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={formViewingConfirmation.featuredCategoryIds.includes(cat.id)}
                                                                        onChange={() => handleFeaturedCategoryToggle(cat.id)}
                                                                        disabled={!formViewingConfirmation.featuredCategoryIds.includes(cat.id) && formViewingConfirmation.featuredCategoryIds.length >= 4}
                                                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                    />
                                                                    <span className="text-gray-700 font-medium text-sm">{cat.name}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-2">سيتم عرض هذه الأقسام للعميل بعد طلب المعاينة. ({formViewingConfirmation.featuredCategoryIds.length}/4)</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        
                                        <div className="pt-4 flex justify-end">
                                            <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400" disabled={isSavingViewingConfirmation}>
                                                {isSavingViewingConfirmation ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                                
                                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6">إعدادات شاشة تأكيد طلب الصيانة</h2>
                                    <form onSubmit={handleMaintenanceConfirmationSubmit} className="space-y-6">
                                        <div className="flex items-center gap-4 pt-2">
                                            <label htmlFor="maint-conf-enabled-toggle" className="flex items-center cursor-pointer">
                                                <div className="relative">
                                                    <input type="checkbox" id="maint-conf-enabled-toggle" name="isEnabled" className="sr-only" checked={formMaintenanceConfirmation.isEnabled} onChange={handleMaintenanceConfirmationChange} />
                                                    <div className={`block w-14 h-8 rounded-full transition-all ${formMaintenanceConfirmation.isEnabled ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                                                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formMaintenanceConfirmation.isEnabled ? 'transform translate-x-6' : ''}`}></div>
                                                </div>
                                                <div className="ml-3 text-gray-700 font-medium">
                                                    {formMaintenanceConfirmation.isEnabled ? 'شاشة العروض مفعلة' : 'شاشة العروض معطلة'}
                                                </div>
                                            </label>
                                        </div>
                                        
                                        {formMaintenanceConfirmation.isEnabled && (
                                            <div className="space-y-4 animate-fade-in border-t pt-6">
                                                <div>
                                                    <label className={labelClass}>صورة العرض (اختياري)</label>
                                                    <div className="mt-2 flex items-center gap-4">
                                                        {formMaintenanceConfirmation.imageUrl ? (
                                                            <img src={formMaintenanceConfirmation.imageUrl} alt="Preview" className="h-24 w-auto max-w-[300px] object-contain bg-gray-100 p-1 rounded-md border" />
                                                        ) : (
                                                            <div className="h-24 w-48 flex items-center justify-center bg-gray-100 rounded-md border">
                                                                <PhotoIcon className="h-8 w-8 text-gray-400" />
                                                            </div>
                                                        )}
                                                        <label htmlFor="maintConfImageUrl" className="relative cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                                                            <span>تغيير الصورة</span>
                                                            <input id="maintConfImageUrl" name="maintConfImageUrl" type="file" className="sr-only" accept="image/*" onChange={handleMaintenanceConfirmationImageUpload} />
                                                        </label>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label htmlFor="maintConfTitle" className={labelClass}>العنوان الرئيسي</label>
                                                    <input type="text" id="maintConfTitle" name="title" value={formMaintenanceConfirmation.title} onChange={handleMaintenanceConfirmationChange} className={inputClass} />
                                                </div>
                                                <div>
                                                    <label htmlFor="maintConfSubtitle" className={labelClass}>النص الفرعي</label>
                                                    <textarea id="maintConfSubtitle" name="subtitle" value={formMaintenanceConfirmation.subtitle} onChange={handleMaintenanceConfirmationChange} rows={3} className={inputClass} />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label htmlFor="maintPrimaryButtonText" className={labelClass}>نص الزر الأساسي (سكني)</label>
                                                        <input type="text" id="maintPrimaryButtonText" name="primaryButtonText" value={formMaintenanceConfirmation.primaryButtonText} onChange={handleMaintenanceConfirmationChange} className={inputClass} />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="maintPrimaryButtonLink" className={labelClass}>رابط الزر الأساسي</label>
                                                        <input type="text" id="maintPrimaryButtonLink" name="primaryButtonLink" value={formMaintenanceConfirmation.primaryButtonLink} onChange={handleMaintenanceConfirmationChange} className={inputClass} placeholder="rentals أو https://..." />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label htmlFor="maintSecondaryButtonText" className={labelClass}>نص الزر الثانوي (تجاري)</label>
                                                        <input type="text" id="maintSecondaryButtonText" name="secondaryButtonText" value={formMaintenanceConfirmation.secondaryButtonText} onChange={handleMaintenanceConfirmationChange} className={inputClass} />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="maintSecondaryButtonLink" className={labelClass}>رابط الزر الثانوي</label>
                                                        <input type="text" id="maintSecondaryButtonLink" name="secondaryButtonLink" value={formMaintenanceConfirmation.secondaryButtonLink} onChange={handleMaintenanceConfirmationChange} className={inputClass} placeholder="rentals أو https://..." />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label htmlFor="showPropertySections" className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" id="showPropertySections" name="showPropertySections" checked={formMaintenanceConfirmation.showPropertySections} onChange={handleMaintenanceConfirmationChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                                        <span className="text-gray-700">عرض أزرار تصفح العقارات</span>
                                                    </label>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="pt-4 flex justify-end">
                                            <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400" disabled={isSavingMaintenanceConfirmation}>
                                                {isSavingMaintenanceConfirmation ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                 <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6">إعدادات عقد الإيجار</h2>
                                    <form onSubmit={handleRentalAgreementSettingsSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label htmlFor="companySignatoryName" className={labelClass}>اسم المُوقع عن الشركة</label>
                                                <input type="text" id="companySignatoryName" name="companySignatoryName" value={formRentalAgreementSettings.companySignatoryName} onChange={handleRentalAgreementSettingsChange} className={inputClass} />
                                            </div>
                                            <div>
                                                <label htmlFor="companySignatoryTitle" className={labelClass}>منصب المُوقع</label>
                                                <input type="text" id="companySignatoryTitle" name="companySignatoryTitle" value={formRentalAgreementSettings.companySignatoryTitle} onChange={handleRentalAgreementSettingsChange} className={inputClass} />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className={labelClass}>بنود العقد</label>
                                                <button type="button" onClick={handleAddTerm} className="flex items-center gap-1 bg-green-100 text-green-700 font-bold py-1 px-3 rounded-md hover:bg-green-200 text-sm">
                                                    <PlusIcon className="w-4 h-4" />
                                                    إضافة بند
                                                </button>
                                            </div>
                                            <div className="space-y-3 max-h-80 overflow-y-auto p-3 bg-gray-50 rounded-lg border">
                                                {formRentalAgreementSettings.contractTerms.map((term, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <textarea
                                                            value={term}
                                                            onChange={(e) => handleTermChange(index, e.target.value)}
                                                            rows={2}
                                                            className={`${inputClass} flex-grow`}
                                                            placeholder={`نص البند رقم ${index + 1}`}
                                                        />
                                                        <button type="button" onClick={() => handleRemoveTerm(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
                                                            <TrashIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-4 flex justify-end">
                                            <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400" disabled={isSavingRentalAgreementSettings}>
                                                {isSavingRentalAgreementSettings ? 'جاري الحفظ...' : 'حفظ إعدادات العقد'}
                                            </button>
                                        </div>
                                    </form>
                                </div>


                                <div className="pt-4 flex justify-end">
                                    <button type="submit" className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400" disabled={isSavingSettings}>
                                        {isSavingSettings ? 'جاري الحفظ...' : 'حفظ الإعدادات العامة'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200">
                             <h2 className="text-2xl font-bold text-gray-800 mb-6">محتوى صفحة "عن الموقع"</h2>
                             <form onSubmit={handleAboutUsSubmit} className="space-y-6">
                                <div>
                                    <label className={labelClass}>صورة الصفحة</label>
                                    <div className="mt-2 flex items-center gap-4">
                                        {formAboutUsSettings.imageUrl ? (
                                            <img src={formAboutUsSettings.imageUrl} alt="About us preview" className="h-24 w-auto max-w-[300px] object-contain bg-gray-100 p-1 rounded-md border" />
                                        ) : (
                                            <div className="h-24 w-48 flex items-center justify-center bg-gray-100 rounded-md border">
                                                <PhotoIcon className="h-8 w-8 text-gray-400" />
                                            </div>
                                        )}
                                        <label htmlFor="aboutUsImageUrl" className="relative cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                                            <span>تغيير الصورة</span>
                                            <input id="aboutUsImageUrl" name="aboutUsImageUrl" type="file" className="sr-only" accept="image/*" onChange={handleAboutUsImageUpload} />
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="aboutText" className={labelClass}>النص التعريفي</label>
                                    <textarea id="aboutText" name="aboutText" value={formAboutUsSettings.aboutText} onChange={handleAboutUsChange} rows={6} className={inputClass} required />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="realEstatePhone" className={labelClass}>هاتف قسم العقارات</label>
                                        <input type="tel" id="realEstatePhone" name="realEstatePhone" value={formAboutUsSettings.realEstatePhone} onChange={handleAboutUsChange} className={inputClass} required />
                                    </div>
                                    <div>
                                        <label htmlFor="maintenancePhone" className={labelClass}>هاتف قسم الصيانة</label>
                                        <input type="tel" id="maintenancePhone" name="maintenancePhone" value={formAboutUsSettings.maintenancePhone} onChange={handleAboutUsChange} className={inputClass} required />
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400" disabled={isSavingAbout}>
                                        {isSavingAbout ? 'جاري الحفظ...' : 'حفظ المحتوى'}
                                    </button>
                                </div>
                             </form>
                        </div>
                        
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">إعدادات البانر الإعلاني</h2>
                             <form onSubmit={handleAdSettingsSubmit} className="space-y-6">
                                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                                     <label htmlFor="isEnabled" className={labelClass}>
                                        {formAdSettings.isEnabled ? 'الإعلان مفعل حاليًا' : 'الإعلان معطل حاليًا'}
                                     </label>
                                     <label htmlFor="ad-enabled-toggle" className="flex items-center cursor-pointer">
                                        <div className="relative">
                                            <input type="checkbox" id="ad-enabled-toggle" name="isEnabled" className="sr-only" checked={formAdSettings.isEnabled} onChange={handleAdSettingsChange} />
                                            <div className={`block w-14 h-8 rounded-full transition-all ${formAdSettings.isEnabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formAdSettings.isEnabled ? 'transform translate-x-6' : ''}`}></div>
                                        </div>
                                    </label>
                                </div>
                                {formAdSettings.isEnabled && (
                                    <div className="space-y-6 border-t pt-6 animate-fade-in">
                                         <div>
                                            <label className={labelClass}>صورة الإعلان</label>
                                            <div className="mt-2 flex items-center gap-4">
                                                {formAdSettings.imageUrl ? (
                                                    <img src={formAdSettings.imageUrl} alt="Ad preview" className="h-24 w-auto max-w-[300px] object-contain bg-gray-100 p-1 rounded-md border" />
                                                ) : (
                                                    <div className="h-24 w-48 flex items-center justify-center bg-gray-100 rounded-md border">
                                                        <PhotoIcon className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                )}
                                                <label htmlFor="adImageUrl" className="relative cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                                                    <span>تغيير الصورة</span>
                                                    <input id="adImageUrl" name="adImageUrl" type="file" className="sr-only" accept="image/*" onChange={handleAdImageUpload} />
                                                </label>
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="linkUrl" className={labelClass}>الرابط (عند الضغط على الإعلان)</label>
                                            <input type="url" id="linkUrl" name="linkUrl" value={formAdSettings.linkUrl} onChange={handleAdSettingsChange} className={inputClass} placeholder="https://example.com" />
                                        </div>
                                        <div>
                                            <label className={labelClass}>عرض في الصفحات التالية:</label>
                                            <div className="mt-2 flex flex-wrap gap-4">
                                                {availablePages.map(page => (
                                                    <label key={page} className="flex items-center gap-2">
                                                        <input 
                                                            type="checkbox"
                                                            checked={formAdSettings.displayPages.includes(page)}
                                                            onChange={() => handleAdPageToggle(page)}
                                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                        {page === 'home' && 'الرئيسية'}
                                                        {page === 'rentals' && 'العقارات'}
                                                        {page === 'maintenance' && 'الصيانة'}
                                                        {page === 'about' && 'عن الموقع'}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="pt-4 flex justify-between items-center">
                                    <button type="button" onClick={handleDeleteAd} className="text-red-600 hover:text-red-800 font-semibold text-sm flex items-center gap-2" aria-label="Delete Ad">
                                        <TrashIcon className="w-4 h-4"/>
                                        حذف الإعلان
                                    </button>
                                    <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400" disabled={isSavingAd}>
                                        {isSavingAd ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {isPropertyModalOpen && (
                <Modal isOpen={isPropertyModalOpen} onClose={closePropertyModal} title={editingProperty ? 'تعديل العقار' : 'إضافة عقار جديد'} size="lg">
                    <PropertyForm initialData={editingProperty} onSubmit={handlePropertyFormSubmit} onCancel={closePropertyModal} />
                </Modal>
            )}

            {isCategoryModalOpen && (
                <Modal isOpen={isCategoryModalOpen} onClose={closeCategoryModal} title={editingCategory ? 'تعديل فئة الصيانة' : 'إضافة فئة صيانة جديدة'} size="lg">
                    <MaintenanceCategoryForm initialData={editingCategory} onSubmit={handleCategoryFormSubmit} onCancel={closeCategoryModal} />
                </Modal>
            )}

            {isTechnicianModalOpen && (
                <Modal isOpen={isTechnicianModalOpen} onClose={closeTechnicianModal} title={editingTechnician ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'} size="lg">
                    <TechnicianForm initialData={editingTechnician} maintenanceCategories={maintenanceCategories} onSubmit={handleTechnicianFormSubmit} onCancel={closeTechnicianModal} />
                </Modal>
            )}

            {isFeatureModalOpen && (
                <Modal isOpen={isFeatureModalOpen} onClose={closeFeatureModal} title={editingFeature ? 'تعديل الميزة' : 'إضافة ميزة جديدة'}>
                    <MaintenanceFeatureForm initialData={editingFeature} onSubmit={handleFeatureFormSubmit} onCancel={closeFeatureModal} />
                </Modal>
            )}
            
            {selectedPropertyForLogs && (
                <Modal isOpen={isLogModalOpen} onClose={closeLogModal} title={`سجل صيانة لـ "${selectedPropertyForLogs.title}"`} size="lg">
                    <MaintenanceLogModal property={selectedPropertyForLogs} onClose={closeLogModal} />
                </Modal>
            )}

            {isMarketplaceCategoryModalOpen && (
                 <Modal isOpen={isMarketplaceCategoryModalOpen} onClose={closeMarketplaceCategoryModal} title={editingMarketplaceCategory ? 'تعديل فئة خدمة' : 'إضافة فئة خدمة جديدة'}>
                    <MarketplaceCategoryForm initialData={editingMarketplaceCategory} onSubmit={handleMarketplaceCategorySubmit} onCancel={closeMarketplaceCategoryModal} />
                </Modal>
            )}

            {isMarketplaceProviderModalOpen && (
                 <Modal isOpen={isMarketplaceProviderModalOpen} onClose={closeMarketplaceProviderModal} title={editingMarketplaceProvider ? 'تعديل مزود خدمة' : 'إضافة مزود خدمة جديد'} size="lg">
                    <MarketplaceProviderForm categories={marketplaceCategories} initialData={editingMarketplaceProvider} onSubmit={handleMarketplaceProviderSubmit} onCancel={closeMarketplaceProviderModal} />
                </Modal>
            )}

            {completingRequest && (
                <Modal isOpen={!!completingRequest} onClose={() => setCompletingRequest(null)} title={`إكمال طلب الصيانة #${completingRequest.id.slice(-8)}`}>
                    <CompleteRequestForm
                        onSubmit={handleCompletionSubmit}
                        onCancel={() => setCompletingRequest(null)}
                    />
                </Modal>
            )}

            {viewingInvoice && (
                <Modal isOpen={!!viewingInvoice} onClose={() => setViewingInvoice(null)} title={`فاتورة الطلب #${viewingInvoice.id.slice(-8)}`} size="lg">
                    <InvoiceView
                        request={viewingInvoice}
                        siteSettings={siteSettings}
                    />
                </Modal>
            )}

            {viewingContract && (
                <Modal isOpen={!!viewingContract} onClose={() => setViewingContract(null)} title={`عقد إيجار #${viewingContract.agreement.id.slice(-8)}`} size="lg">
                    <RentalAgreementView
                        agreement={viewingContract.agreement}
                        property={viewingContract.property}
                        siteSettings={siteSettings}
                        rentalAgreementSettings={rentalAgreementSettings}
                        onClose={() => setViewingContract(null)}
                    />
                </Modal>
            )}

            {confirmation?.isOpen && (
                 <Modal isOpen={confirmation.isOpen} onClose={handleCancelConfirmation} title={confirmation.title}>
                    <div className="p-4">
                        <div className="flex items-start gap-4">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:text-right">
                                <p className="text-lg leading-6 font-medium text-gray-900">{confirmation.message}</p>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end gap-3">
                            <button type="button" className="bg-gray-200 text-gray-800 font-bold py-2 px-5 rounded-lg hover:bg-gray-300" onClick={handleCancelConfirmation}>
                                إلغاء
                            </button>
                            <button type="button" className="bg-red-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-red-700" onClick={handleConfirm}>
                                تأكيد
                            </button>
                        </div>
                    </div>
                 </Modal>
            )}
        </div>
    );
};

export default AdminPage;