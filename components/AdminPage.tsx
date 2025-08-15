

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Property, SiteSettings, AdvertisementSettings, Page, ViewingRequest, MaintenanceCategory, AboutUsSettings, MaintenanceRequest, Technician, PropertyStatus, MaintenanceFeature, MaintenanceFeatureIconName, Review, ViewingConfirmationSettings, MaintenanceConfirmationSettings, AdminTab, CommonIssue } from '../types';
import { PlusIcon, TrashIcon, PencilIcon, PhotoIcon, ExclamationTriangleIcon, QueueListIcon, WrenchScrewdriverIcon, CogIcon, StarIcon, UserGroupIcon, DocumentTextIcon, PrinterIcon, MagnifyingGlassIcon, MapIcon, ShieldCheckIcon, LockClosedIcon, ChatBubbleLeftEllipsisIcon, TagIcon, ReceiptPercentIcon, ArrowUturnLeftIcon, CheckCircleIcon, HomeModernIcon, BuildingOffice2Icon, PhoneIcon, MapPinIcon, TableCellsIcon } from './icons';
import Modal from './Modal';
import PropertyForm from './PropertyForm';
import MaintenanceCategoryForm from './MaintenanceCategoryForm';
import TechnicianForm from './TechnicianForm';
import CompleteRequestForm from './CompleteRequestForm';
import InvoiceView from './InvoiceView';
import MaintenanceFeatureForm from './MaintenanceFeatureForm';

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
                <h4 className="font-bold text-lg text-gray-900">{tech.name}</h4>
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


interface AdminPageProps {
    properties: Property[];
    setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
    maintenanceCategories: MaintenanceCategory[];
    setMaintenanceCategories: React.Dispatch<React.SetStateAction<MaintenanceCategory[]>>;
    technicians: Technician[];
    setTechnicians: React.Dispatch<React.SetStateAction<Technician[]>>;
    siteSettings: SiteSettings;
    setSiteSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
    adSettings: AdvertisementSettings;
    setAdSettings: React.Dispatch<React.SetStateAction<AdvertisementSettings>>;
    viewingRequests: ViewingRequest[];
    setViewingRequests: React.Dispatch<React.SetStateAction<ViewingRequest[]>>;
    maintenanceRequests: MaintenanceRequest[];
    setMaintenanceRequests: React.Dispatch<React.SetStateAction<MaintenanceRequest[]>>;
    aboutUsSettings: AboutUsSettings;
    setAboutUsSettings: React.Dispatch<React.SetStateAction<AboutUsSettings>>;
    reviews: Review[];
    setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
    viewingConfirmationSettings: ViewingConfirmationSettings;
    setViewingConfirmationSettings: React.Dispatch<React.SetStateAction<ViewingConfirmationSettings>>;
    maintenanceConfirmationSettings: MaintenanceConfirmationSettings;
    setMaintenanceConfirmationSettings: React.Dispatch<React.SetStateAction<MaintenanceConfirmationSettings>>;
}

const AdminPage: React.FC<AdminPageProps> = ({ 
    properties, setProperties, 
    maintenanceCategories, setMaintenanceCategories, 
    technicians, setTechnicians,
    siteSettings, setSiteSettings, 
    adSettings, setAdSettings,
    viewingRequests, setViewingRequests,
    maintenanceRequests, setMaintenanceRequests,
    aboutUsSettings, setAboutUsSettings,
    reviews, setReviews,
    viewingConfirmationSettings, setViewingConfirmationSettings,
    maintenanceConfirmationSettings, setMaintenanceConfirmationSettings
}) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('requests');
    // State for property modal
    const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);

    // State for maintenance category modal
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<MaintenanceCategory | null>(null);

    // State for technician modal
    const [isTechnicianModalOpen, setIsTechnicianModalOpen] = useState(false);
    const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);

    // State for maintenance feature modal
    const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
    const [editingFeature, setEditingFeature] = useState<MaintenanceFeature | null>(null);

    // State for site settings form
    const [formSettings, setFormSettings] = useState<SiteSettings>(siteSettings);
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    // State for Advertisement Settings Form
    const [formAdSettings, setFormAdSettings] = useState<AdvertisementSettings>(adSettings);
    const [isSavingAd, setIsSavingAd] = useState(false);
    const availablePages: Page[] = ['home', 'rentals', 'maintenance', 'about'];

    // State for About Us Settings Form
    const [formAboutUsSettings, setFormAboutUsSettings] = useState<AboutUsSettings>(aboutUsSettings);
    const [isSavingAbout, setIsSavingAbout] = useState(false);

    // State for Viewing Confirmation Settings Form
    const [formViewingConfirmation, setFormViewingConfirmation] = useState<ViewingConfirmationSettings>(viewingConfirmationSettings);
    const [isSavingViewingConfirmation, setIsSavingViewingConfirmation] = useState(false);

     // State for Maintenance Confirmation Settings Form
    const [formMaintenanceConfirmation, setFormMaintenanceConfirmation] = useState<MaintenanceConfirmationSettings>(maintenanceConfirmationSettings);
    const [isSavingMaintenanceConfirmation, setIsSavingMaintenanceConfirmation] = useState(false);

    // State for Reports
    const [reportStartDate, setReportStartDate] = useState('');
    const [reportEndDate, setReportEndDate] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // State for Confirmation Modal
    const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    } | null>(null);
    
    // State for completing maintenance requests
    const [completingRequest, setCompletingRequest] = useState<MaintenanceRequest | null>(null);
    
    // State for viewing invoice
    const [viewingInvoice, setViewingInvoice] = useState<MaintenanceRequest | null>(null);
    
    // State for maintenance requests search
    const [maintenanceSearchTerm, setMaintenanceSearchTerm] = useState('');

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

    // --- Report Generation Logic ---
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
        // Timeout to allow UI to update before blocking with file generation
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
        // Maintenance Revenue
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

        // Property Commissions (Assumption: earned on completed viewing requests)
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

        // Summary Sheet
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

    // --- Confirmation Modal Handlers ---
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

    // --- Property Handlers ---
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
    

    // --- Maintenance Category Handlers ---
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

    // --- Technician Handlers ---
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


    // --- Site Settings Form Handlers ---
    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormSettings(prev => ({ ...prev, [name]: value }));
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

    // --- Maintenance Feature Handlers ---
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


    // --- About Us Settings Form Handlers ---
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

    // --- Advertisement Settings Form Handlers ---
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

    // --- Viewing Confirmation Settings Handlers ---
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

    // --- Maintenance Confirmation Settings Handlers ---
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


    // --- Request Handlers ---
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

    const getStatusBadge = (status: ViewingRequest['status']) => {
        switch(status) {
            case 'جديد': return 'bg-blue-100 text-blue-800';
            case 'تم التواصل': return 'bg-yellow-100 text-yellow-800';
            case 'مكتمل': return 'bg-green-100 text-green-800';
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
    
    // --- Review Handlers ---
    const handleDeleteReview = (id: string) => {
        requestConfirmation(
            'حذف التقييم',
            'هل أنت متأكد من حذف هذا التقييم؟ لا يمكن التراجع عن هذا الإجراء.',
            () => setReviews(prev => prev.filter(r => r.id !== id))
        );
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

            {/* Tab Navigation */}
            <div className="mb-10 border-b border-gray-200">
                <nav className="-mb-px flex space-x-4 space-x-reverse flex-wrap" aria-label="Tabs">
                    <TabButton tab="requests" label="الطلبات" icon={<QueueListIcon className="w-5 h-5" />} />
                    <TabButton tab="reviews" label="التقييمات" icon={<StarIcon className="w-5 h-5" />} />
                    <TabButton tab="employees" label="الموظفين" icon={<UserGroupIcon className="w-5 h-5" />} />
                    <TabButton tab="content" label="إدارة المحتوى" icon={<PencilIcon className="w-5 h-5" />} />
                    <TabButton tab="reports" label="التقارير" icon={<TableCellsIcon className="w-5 h-5" />} />
                    <TabButton tab="settings" label="الإعدادات العامة" icon={<CogIcon className="w-5 h-5" />} />
                </nav>
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in">
                {activeTab === 'requests' && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                        {/* Maintenance Requests Section */}
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
                                        <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">تغيير الحالة:</span>
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
                                            <button onClick={() => handleDeleteMaintReq(req.id)} className="text-red-600 hover:text-red-500 hover:bg-red-100 rounded-full p-2 transition-colors" aria-label="Delete Request">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                )) : <p className="text-center text-gray-500 py-8">لا توجد طلبات صيانة تطابق بحثك.</p>}
                            </div>
                        </div>
                    
                        {/* Viewing Requests Section */}
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
                                        <button onClick={() => handleDeleteReview(review.id)} className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-100 rounded-full transition-colors flex-shrink-0" aria-label="حذف التقييم">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )) : <p className="text-center text-gray-500 py-12">لا توجد تقييمات حالياً.</p>}
                        </div>
                    </div>
                )}

                {activeTab === 'employees' && (
                     <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">إدارة الموظفين (الفنيين)</h2>
                            <button onClick={openAddTechnicianModal} className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                                <PlusIcon className="w-5 h-5" />
                                <span>إضافة موظف</span>
                            </button>
                        </div>
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

                {activeTab === 'content' && (
                    <div className="space-y-12">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                            {/* Property Management */}
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

                            {/* Maintenance Category Management */}
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

                        {/* Viewing Confirmation Settings */}
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
                        
                        {/* Maintenance Confirmation Settings */}
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
                    </div>
                )}


                {activeTab === 'settings' && (
                     <div className="space-y-12">
                        {/* Site Settings Section */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">إعدادات الموقع العامة</h2>
                             <form onSubmit={handleSettingsSubmit} className="space-y-8">
                                
                                {/* --- General Info --- */}
                                <div className="p-4 border rounded-lg bg-gray-50/50">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-3">معلومات عامة</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                        <div>
                                            <label htmlFor="siteName" className={labelClass}>اسم الموقع</label>
                                            <input type="text" id="siteName" name="siteName" value={formSettings.siteName} onChange={handleSettingsChange} className={inputClass} required />
                                        </div>
                                        <ImageInput label="شعار الموقع (اللوجو)" field="logoUrl" currentUrl={formSettings.logoUrl} />
                                    </div>
                                </div>

                                {/* --- Homepage Settings --- */}
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
                                
                                {/* --- Maintenance Page Settings --- */}
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
                                
                                {/* --- Maintenance Features --- */}
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


                                {/* --- Page Titles --- */}
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

                                <div className="pt-4 flex justify-end">
                                    <button type="submit" className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400" disabled={isSavingSettings}>
                                        {isSavingSettings ? 'جاري الحفظ...' : 'حفظ كل التغييرات'}
                                    </button>
                                </div>
                            </form>
                        </div>
                        
                        {/* About Us Settings Section */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">إعدادات صفحة "عنا"</h2>
                             <form onSubmit={handleAboutUsSubmit} className="space-y-6">
                                <div>
                                    <label className={labelClass}>صورة الصفحة</label>
                                    <div className="mt-2 flex items-center gap-4">
                                        {formAboutUsSettings.imageUrl ? (
                                            <img src={formAboutUsSettings.imageUrl} alt="About Us Preview" className="h-24 w-auto max-w-[300px] object-contain bg-gray-100 p-1 rounded-md border" />
                                        ) : (
                                            <div className="h-24 w-48 flex items-center justify-center bg-gray-100 rounded-md border">
                                                <PhotoIcon className="h-8 w-8 text-gray-400" />
                                            </div>
                                        )}
                                        <label htmlFor="aboutUsImageUrl" className="relative cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                            <span>تغيير الصورة</span>
                                            <input id="aboutUsImageUrl" name="aboutUsImageUrl" type="file" className="sr-only" accept="image/*" onChange={handleAboutUsImageUpload} />
                                        </label>
                                    </div>
                                </div>

                                 <div>
                                    <label htmlFor="aboutText" className={labelClass}>نص "من نحن"</label>
                                    <textarea id="aboutText" name="aboutText" value={formAboutUsSettings.aboutText} onChange={handleAboutUsChange} rows={5} className={inputClass} required />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                        {isSavingAbout ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                                    </button>
                                </div>
                            </form>
                        </div>
                        
                        {/* Advertisement Management Section */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">إدارة الإعلانات</h2>
                            <form onSubmit={handleAdSettingsSubmit} className="space-y-6">
                                <div>
                                    <label className={labelClass}>صورة الإعلان</label>
                                    <div className="mt-2 flex items-center gap-4">
                                        {formAdSettings.imageUrl ? (
                                            <img src={formAdSettings.imageUrl} alt="Advertisement Preview" className="h-24 w-auto max-w-[300px] object-contain bg-gray-100 p-1 rounded-md border" />
                                        ) : (
                                            <div className="h-24 w-48 flex items-center justify-center bg-gray-100 rounded-md border">
                                                <PhotoIcon className="h-8 w-8 text-gray-400" />
                                            </div>
                                        )}
                                        <label htmlFor="adImageUrl" className="relative cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                            <span>تغيير الصورة</span>
                                            <input id="adImageUrl" name="adImageUrl" type="file" className="sr-only" accept="image/*" onChange={handleAdImageUpload} />
                                        </label>
                                    </div>
                                </div>
                                
                                <div>
                                    <label htmlFor="linkUrl" className={labelClass}>رابط الإعلان (URL)</label>
                                    <input type="url" id="linkUrl" name="linkUrl" value={formAdSettings.linkUrl} onChange={handleAdSettingsChange} className={inputClass} placeholder="example.com/offer" />
                                </div>
                                
                                <div>
                                    <span className={labelClass}>عرض الإعلان في الصفحات التالية:</span>
                                    <div className="mt-2 flex flex-wrap gap-4">
                                        {availablePages.map(page => (
                                            <label key={page} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formAdSettings.displayPages.includes(page)}
                                                    onChange={() => handleAdPageToggle(page)}
                                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="text-gray-700">{
                                                    page === 'home' ? 'الرئيسية' : 
                                                    page === 'rentals' ? 'العقارات' : 
                                                    page === 'maintenance' ? 'الصيانة' : 'عنا'
                                                }</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-2">
                                     <label htmlFor="ad-enabled-toggle" className="flex items-center cursor-pointer">
                                        <div className="relative">
                                            <input type="checkbox" id="ad-enabled-toggle" name="isEnabled" className="sr-only" checked={formAdSettings.isEnabled} onChange={handleAdSettingsChange} />
                                            <div className={`block w-14 h-8 rounded-full transition-all ${formAdSettings.isEnabled ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formAdSettings.isEnabled ? 'transform translate-x-6' : ''}`}></div>
                                        </div>
                                        <div className="ml-3 text-gray-700 font-medium">
                                            {formAdSettings.isEnabled ? 'الإعلان مفعل' : 'الإعلان معطل'}
                                        </div>
                                    </label>
                                </div>
                                
                                <div className="pt-4 flex justify-between items-center">
                                    <button type="button" onClick={handleDeleteAd} className="text-red-600 font-bold py-2 px-4 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-transparent" disabled={!formAdSettings.imageUrl && !formAdSettings.linkUrl}>
                                        <TrashIcon className="w-5 h-5"/>
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

            <Modal isOpen={isPropertyModalOpen} onClose={closePropertyModal} title={editingProperty ? 'تعديل العقار' : 'إضافة عقار جديد'}>
                <PropertyForm 
                    initialData={editingProperty}
                    onSubmit={handlePropertyFormSubmit}
                    onCancel={closePropertyModal}
                />
            </Modal>
            
            <Modal isOpen={isCategoryModalOpen} onClose={closeCategoryModal} title={editingCategory ? 'تعديل فئة الصيانة' : 'إضافة فئة صيانة جديدة'}>
                <MaintenanceCategoryForm
                    initialData={editingCategory}
                    onSubmit={handleCategoryFormSubmit}
                    onCancel={closeCategoryModal}
                />
            </Modal>

            <Modal isOpen={isTechnicianModalOpen} onClose={closeTechnicianModal} title={editingTechnician ? 'تعديل بيانات فني' : 'إضافة فني جديد'}>
                <TechnicianForm 
                    initialData={editingTechnician}
                    maintenanceCategories={maintenanceCategories}
                    onSubmit={handleTechnicianFormSubmit}
                    onCancel={closeTechnicianModal}
                />
            </Modal>
             <Modal isOpen={isFeatureModalOpen} onClose={closeFeatureModal} title={editingFeature ? 'تعديل الميزة' : 'إضافة ميزة جديدة'}>
                <MaintenanceFeatureForm
                    initialData={editingFeature}
                    onSubmit={handleFeatureFormSubmit}
                    onCancel={closeFeatureModal}
                />
            </Modal>
            
            {completingRequest && (
                <Modal isOpen={!!completingRequest} onClose={() => setCompletingRequest(null)} title="إكمال طلب الصيانة">
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

            {confirmation?.isOpen && (
                <Modal
                    isOpen={confirmation.isOpen}
                    onClose={handleCancelConfirmation}
                    title={confirmation.title}
                >
                    <div className="text-center p-4">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                            <ExclamationTriangleIcon className="h-7 w-7 text-red-600" aria-hidden="true" />
                        </div>
                        <div className="mt-4">
                            <p className="text-lg text-gray-600">{confirmation.message}</p>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-center gap-4">
                        <button
                            type="button"
                            className="inline-flex justify-center w-full rounded-lg border border-transparent shadow-sm px-6 py-2.5 bg-red-600 text-base font-bold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                            onClick={handleConfirm}
                        >
                            تأكيد الحذف
                        </button>
                        <button
                            type="button"
                            className="inline-flex justify-center w-full rounded-lg border border-gray-300 shadow-sm px-6 py-2.5 bg-white text-base font-bold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                            onClick={handleCancelConfirmation}
                        >
                            إلغاء
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default AdminPage;