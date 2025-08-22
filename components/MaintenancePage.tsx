import React, { useState } from 'react';
import { MaintenanceAnalysis, MaintenanceCategory, MaintenanceRequest, Technician, MaintenanceFeatureIconName, Review, Page, CommonIssue, CommonIssueIconName, EmergencyService, EmergencyMaintenanceRequest, MaintenanceAdvice, MaintenanceOffer, MaintenanceJobPost } from '../types';
import { analyzeMaintenanceRequest, getMaintenanceAdvice } from '../services/geminiService';
import { SparklesIcon, CogIcon, PhotoIcon, TrashIcon, ShieldCheckIcon, LockClosedIcon, ChatBubbleLeftEllipsisIcon, TagIcon, ReceiptPercentIcon, ArrowUturnLeftIcon, WrenchScrewdriverIcon, StarIcon, CheckCircleIcon, HomeModernIcon, BuildingOffice2Icon, ExclamationTriangleIcon, UserGroupIcon, DocumentTextIcon, DropletIcon, ExclamationCircleIcon, FireIcon, ArrowDownCircleIcon, PowerIcon, SunIcon, LightBulbIcon, SnowflakeIcon, SpeakerWaveIcon, AdjustmentsHorizontalIcon, KeyIcon, CubeIcon, PaintBrushIcon, QuestionMarkCircleIcon, BugIcon, TruckIcon, BanknotesIcon } from './icons';
import { Part } from '@google/ai';
import AdvertisementBanner from './AdvertisementBanner';
import AnalysisDisplay from './AnalysisDisplay';
import ReviewsList from './ReviewsList';
import ReviewForm from './ReviewForm';
import Modal from './Modal';
import InvoiceView from './InvoiceView';
import AIMaintenanceGuide from './AIMaintenanceGuide';
import MaintenanceJobPostForm from './MaintenanceJobPostForm';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';


interface MaintenancePageProps {
  onNavigate: (page: Page) => void;
}

const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

const getFeatureIcon = (iconName: MaintenanceFeatureIconName) => {
    const iconClass = "h-7 w-7 text-indigo-600";
    switch (iconName) {
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

const getCommonIssueIcon = (iconName: CommonIssueIconName) => {
    const iconClass = "h-8 w-8 text-indigo-600";
    switch (iconName) {
        case 'DropletIcon': return <DropletIcon className={iconClass} />;
        case 'ExclamationCircleIcon': return <ExclamationCircleIcon className={iconClass} />;
        case 'FireIcon': return <FireIcon className={iconClass} />;
        case 'CogIcon': return <CogIcon className={iconClass} />;
        case 'ArrowDownCircleIcon': return <ArrowDownCircleIcon className={iconClass} />;
        case 'PowerIcon': return <PowerIcon className={iconClass} />;
        case 'SunIcon': return <SunIcon className={iconClass} />;
        case 'LightBulbIcon': return <LightBulbIcon className={iconClass} />;
        case 'SnowflakeIcon': return <SnowflakeIcon className={iconClass} />;
        case 'SpeakerWaveIcon': return <SpeakerWaveIcon className={iconClass} />;
        case 'AdjustmentsHorizontalIcon': return <AdjustmentsHorizontalIcon className={iconClass} />;
        case 'KeyIcon': return <KeyIcon className={iconClass} />;
        case 'CubeIcon': return <CubeIcon className={iconClass} />;
        case 'PaintBrushIcon': return <PaintBrushIcon className={iconClass} />;
        case 'SparklesIcon': return <SparklesIcon className={iconClass} />;
        case 'BuildingOffice2Icon': return <BuildingOffice2Icon className={iconClass} />;
        case 'WrenchScrewdriverIcon': return <WrenchScrewdriverIcon className={iconClass} />;
        case 'BugIcon': return <BugIcon className={iconClass} />;
        case 'TruckIcon': return <TruckIcon className={iconClass} />;
        case 'QuestionMarkCircleIcon': return <QuestionMarkCircleIcon className={iconClass} />;
        default: return <CogIcon className={iconClass} />;
    }
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 ring-4 ring-indigo-50">
            {icon}
        </div>
        <h3 className="mt-6 text-xl font-bold text-gray-900">{title}</h3>
        <p className="mt-2 text-base text-gray-600">{children}</p>
    </div>
);

type RequestLookupResult = {
  status: 'found' | 'not_found';
  message?: string;
  request?: MaintenanceRequest;
  technician?: Technician | null;
} | null;

type MaintenanceTab = 'ai' | 'bidding';

const EmergencyRequestForm: React.FC<{
    services: EmergencyService[];
    onSubmit: (data: Omit<EmergencyMaintenanceRequest, 'id' | 'requestDate' | 'status'>) => void;
    onCancel: () => void;
}> = ({ services, onSubmit, onCancel }) => {
    const [selectedServiceId, setSelectedServiceId] = useState<string>(services.length > 0 ? services[0].id : '');
    const [userPhone, setUserPhone] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!selectedServiceId) {
            setError('الرجاء اختيار نوع الحالة الطارئة.');
            return;
        }
        if (!userPhone.trim()) {
            setError('الرجاء إدخال رقم الهاتف.');
            return;
        }
        const selectedService = services.find(s => s.id === selectedServiceId);
        if (selectedService) {
            onSubmit({ serviceId: selectedService.id, serviceName: selectedService.name, userPhone });
            setIsSubmitted(true);
        }
    };
    
    if (isSubmitted) {
        return (
            <div className="text-center p-6 sm:p-8 animate-fade-in">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800">تم استلام طلب الطوارئ!</h3>
                <p className="text-gray-600 mt-2 max-w-md mx-auto">سيتم الاتصال بك على الفور من قبل فريقنا المختص. الرجاء إبقاء هاتفك قيد الانتظار.</p>
                <button onClick={onCancel} className="mt-8 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors">
                    إغلاق
                </button>
            </div>
        );
    }
    
    const selectedService = services.find(s => s.id === selectedServiceId);

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-4">
            <div className="text-center">
                <div className="inline-block bg-red-100 p-3 rounded-full ring-4 ring-red-50">
                    <ExclamationTriangleIcon className="w-8 h-8 text-red-600"/>
                </div>
                <p className="mt-4 text-gray-700">هذا النموذج مخصص للحالات العاجلة فقط. سيتم التواصل معك بشكل فوري.</p>
            </div>

            <div>
                <label htmlFor="emergencyService" className="block text-sm font-medium text-gray-700 mb-2">1. اختر نوع الحالة الطارئة</label>
                <select
                    id="emergencyService"
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                    required
                >
                    {services.map(service => (
                        <option key={service.id} value={service.id}>{service.name}</option>
                    ))}
                </select>
                {selectedService && (
                    <div className="mt-2 text-sm text-gray-600 bg-gray-100 p-3 rounded-md border">
                        <p>{selectedService.description}</p>
                        <p className="font-bold mt-1">رسوم المعاينة الطارئة: <span className="text-red-600">{selectedService.inspectionFee} ريال</span></p>
                    </div>
                )}
            </div>
            
            <div>
                <label htmlFor="emergencyPhone" className="block text-sm font-medium text-gray-700 mb-2">2. أدخل رقم هاتفك</label>
                <input
                    type="tel"
                    id="emergencyPhone"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    required
                    placeholder="رقم الجوال للتواصل الفوري"
                />
            </div>
            
             {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md text-sm" role="alert">
                    <p>{error}</p>
                </div>
            )}

            <div className="pt-4 flex flex-col sm:flex-row-reverse gap-3">
                <button type="submit" className="w-full flex-1 bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-colors">
                    إرسال طلب طوارئ
                </button>
                <button type="button" onClick={onCancel} className="w-full flex-1 bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                    إلغاء
                </button>
            </div>
        </form>
    );
};


const MaintenancePage: React.FC<MaintenancePageProps> = ({ onNavigate }) => {
  const { db, setMaintenanceRequests, setReviews, setEmergencyMaintenanceRequests, setMaintenanceJobPosts, setMaintenanceOffers } = useData();
  const { maintenanceCategories, technicians, adSettings, siteSettings, reviews, maintenanceConfirmationSettings, maintenanceRequests, emergencyServices, pointsSettings } = db;
  const { isAuthenticated, currentUser, updateUser, isUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState<MaintenanceTab>('ai');

  // AI Form State
  const [description, setDescription] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [userLocation, setUserLocation] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);
  
  const [analysis, setAnalysis] = useState<MaintenanceAnalysis | null>(null);
  const [maintenanceAdvice, setMaintenanceAdvice] = useState<MaintenanceAdvice | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [suggestedTechnician, setSuggestedTechnician] = useState<Technician | null>(null);
  const [alternativeTechnicians, setAlternativeTechnicians] = useState<Technician[]>([]);
  const [finalSelectedTechnician, setFinalSelectedTechnician] = useState<Technician | null>(null);

  const [inspectionFee, setInspectionFee] = useState<number>(0);
  const [isSubmissionSuccessful, setIsSubmissionSuccessful] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<MaintenanceRequest | null>(null);
  
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [isCheckingRequest, setIsCheckingRequest] = useState(false);
  const [requestLookupResult, setRequestLookupResult] = useState<RequestLookupResult>(null);
  const [viewingInvoice, setViewingInvoice] = useState<MaintenanceRequest | null>(null);
  const [isGuideVisible, setIsGuideVisible] = useState(!sessionStorage.getItem('aiMaintenanceGuideDismissed'));
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const features = siteSettings.maintenanceFeatures || [];
  const technicianReviews = reviews.filter(r => r.type === 'technician');

  const handleMaintenanceRequestSubmit = (data: Omit<MaintenanceRequest, 'id' | 'requestDate' | 'status' | 'problemCause' | 'solution' | 'amountPaid' | 'paymentStatus' | 'amountPaidForInspection' | 'pointsAwarded' | 'pointsDiscountApplied'>, paymentDetails?: { amount: number }, pointsToUse?: number): MaintenanceRequest => {
    if (pointsToUse && pointsToUse > 0 && currentUser && isUser) {
        const updatedUser = { ...currentUser, points: currentUser.points - pointsToUse };
        updateUser(updatedUser);
    }

    const newRequest: MaintenanceRequest = {
        ...data,
        id: `maint-req-${Date.now()}`,
        requestDate: new Date().toISOString(),
        status: 'جديد',
        paymentStatus: paymentDetails ? 'مدفوع' : 'لم يتم الدفع',
        amountPaidForInspection: paymentDetails ? paymentDetails.amount : 0,
        userId: currentUser?.id,
        pointsDiscountApplied: pointsToUse,
        pointsAwarded: false,
    };
    setMaintenanceRequests(prev => [newRequest, ...prev]);
    return newRequest;
  };
  
  const onEmergencyMaintenanceRequestSubmit = (data: Omit<EmergencyMaintenanceRequest, 'id' | 'requestDate' | 'status'>) => {
    const newRequest: EmergencyMaintenanceRequest = {
        ...data,
        id: `em-req-${Date.now()}`,
        requestDate: new Date().toISOString(),
        status: 'جديد',
        userId: currentUser?.id,
    };
    setEmergencyMaintenanceRequests(prev => [newRequest, ...prev]);
  };

  const onReviewSubmit = (data: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
        ...data,
        id: `rev-${Date.now()}`,
        createdAt: new Date().toISOString(),
        userId: currentUser?.id,
        pointsAwarded: false,
    };
    setReviews(prev => [newReview, ...prev]);
  };
  
  const simulateBids = (jobPostId: string, categoryName: string) => {
    const relevantTechnicians = technicians.filter(t => t.isAvailable && t.specialization === categoryName);
    if (relevantTechnicians.length === 0) return;

    // Create 1 to 3 bids
    const numberOfBids = Math.floor(Math.random() * Math.min(relevantTechnicians.length, 3)) + 1;
    const shuffledTechs = relevantTechnicians.sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < numberOfBids; i++) {
        const tech = shuffledTechs[i];
        setTimeout(() => {
            const newOffer: MaintenanceOffer = {
                id: `offer-${jobPostId}-${tech.id}`,
                jobPostId: jobPostId,
                technicianId: tech.id,
                technicianName: tech.name,
                technicianRating: tech.rating,
                technicianImageUrl: tech.imageUrl,
                price: Math.floor(Math.random() * 251) + 50, // Random price between 50 and 300
                notes: 'يمكنني البدء في العمل غداً. السعر يشمل قطع الغيار الأساسية.',
                createdAt: new Date().toISOString(),
                status: 'pending',
            };
            setMaintenanceOffers(prev => [...prev, newOffer]);
        }, (i + 1) * 3000 + Math.random() * 2000); // Stagger bids
    }
  };
  
  const handleMaintenanceJobPostSubmit = (jobPostData: Omit<MaintenanceJobPost, 'id' | 'requestDate' | 'status' | 'userId'>): MaintenanceJobPost => {
    const newJobPost: MaintenanceJobPost = {
        ...jobPostData,
        id: `job-${Date.now()}`,
        requestDate: new Date().toISOString(),
        status: 'open',
        userId: currentUser?.id,
    };
    setMaintenanceJobPosts(prev => [newJobPost, ...prev]);

    // SIMULATE BIDS
    simulateBids(newJobPost.id, newJobPost.categoryName);
    
    return newJobPost;
  };

  const dismissGuide = () => {
    sessionStorage.setItem('aiMaintenanceGuideDismissed', 'true');
    setIsGuideVisible(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prevFiles => [...prevFiles, ...Array.from(e.target.files)]);
    }
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };
  
  const processAnalysisResult = (result: Omit<MaintenanceAnalysis, 'category'>) => {
    const fullAnalysis: MaintenanceAnalysis = {
        ...result,
        category: selectedCategory
    };
    setAnalysis(fullAnalysis);
    
    const categoryDetails = maintenanceCategories.find(cat => cat.name === selectedCategory);
    setInspectionFee(categoryDetails?.inspectionFee || 0);

    const technicianObject = technicians.find(t => t.name === result.suggested_technician);
    setSuggestedTechnician(technicianObject || null);
    setFinalSelectedTechnician(technicianObject || null);
    
    const locationTrimmed = userLocation.trim().toLowerCase();
    const alternatives = technicians.filter(t => 
        t.isAvailable &&
        t.specialization === selectedCategory &&
        t.id !== technicianObject?.id &&
        (locationTrimmed ? (t.region.toLowerCase().includes(locationTrimmed) || locationTrimmed.includes(t.region.toLowerCase())) : true)
    );
    setAlternativeTechnicians(alternatives);
  }

  const handleInitialSubmit = async () => {
    if (!selectedCategory) {
      setError('الرجاء اختيار قسم الصيانة أولاً.');
      return;
    }
    if (!description.trim()) {
      setError('الرجاء إدخال وصف لمشكلة الصيانة.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setMaintenanceAdvice(null);

    try {
      const imageParts = await Promise.all(files.map(fileToGenerativePart));
      const categoryDetails = maintenanceCategories.find(cat => cat.name === selectedCategory);
      const commonIssuesForCategory = categoryDetails?.commonIssues || [];
      
      const analysisPromise = analyzeMaintenanceRequest(description, selectedCategory, imageParts, technicians, userLocation, commonIssuesForCategory);
      const advicePromise = getMaintenanceAdvice(description, selectedCategory);

      const [analysisResult, adviceResult] = await Promise.all([analysisPromise, advicePromise]);
      
      processAnalysisResult(analysisResult);
      setMaintenanceAdvice(adviceResult);

    } catch (err) {
      console.error('Error analyzing maintenance request:', err);
      setError('عذرًا، حدث خطأ أثناء تحليل طلبك. الرجاء المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFormSubmitClick = () => {
    if (isAuthenticated) {
        handleInitialSubmit();
    } else {
        localStorage.setItem('loginRedirect', JSON.stringify({ page: 'maintenance' }));
        onNavigate('login');
    }
  };

  const handleTechnicianSelection = (technician: Technician) => {
    setFinalSelectedTechnician(technician);
  };
  
  const handleVisualProblemSelect = (issue: CommonIssue) => {
    setDescription(`لدي مشكلة بخصوص: ${issue.name}.\n\n(يرجى إضافة المزيد من التفاصيل هنا...)`);
    const textarea = document.getElementById('description');
    if (textarea) textarea.focus();
  };

  const handleConfirmRequest = (userData: { userName: string; userPhone: string; userEmail?: string, address: string; latitude?: number; longitude?: number; }, paymentDetails?: { amount: number }, pointsUsed?: number) => {
      if (analysis) {
           const finalAnalysis: MaintenanceAnalysis = {
              ...analysis,
              suggested_technician: finalSelectedTechnician?.name || analysis.suggested_technician,
              suggestion_reason: analysis.suggested_technician === finalSelectedTechnician?.name 
                  ? analysis.suggestion_reason 
                  : 'تم اختياره يدوياً من قبل العميل.',
          };

          const newRequest = handleMaintenanceRequestSubmit({
              analysis: finalAnalysis,
              ...userData
          }, paymentDetails, pointsUsed);
          setSubmittedRequest(newRequest);
          setAnalysis(null);
          setSuggestedTechnician(null);
          setAlternativeTechnicians([]);
          setFinalSelectedTechnician(null);
          setDescription('');
          setUserLocation('');
          setFiles([]);
          setInspectionFee(0);
          setIsSubmissionSuccessful(true);
          window.scrollTo(0, 0);
      }
  };

 const handleRequestLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceNumber.trim()) return;
    setIsCheckingRequest(true);
    setRequestLookupResult(null);
    
    setTimeout(() => {
        const request = maintenanceRequests.find(req => 
            req.id.toLowerCase().slice(-8) === invoiceNumber.trim().toLowerCase()
        );

        if (!request) {
            setRequestLookupResult({ status: 'not_found', message: 'رقم الطلب غير صحيح. الرجاء التأكد والمحاولة مرة أخرى.' });
        } else {
            const technician = technicians.find(t => t.name === request.analysis.suggested_technician);
            setRequestLookupResult({ status: 'found', request, technician });
        }
        setIsCheckingRequest(false);
    }, 500);
  };
  
  const StatusStep: React.FC<{ label: string; active: boolean; done: boolean }> = ({ label, active, done }) => (
    <div className="flex-1 flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${active || done ? 'bg-indigo-600 border-indigo-600' : 'bg-gray-100 border-gray-300'}`}>
            {done && <CheckCircleIcon className="w-6 h-6 text-white" />}
        </div>
        <p className={`mt-2 text-xs text-center font-bold ${active || done ? 'text-indigo-600' : 'text-gray-500'}`}>{label}</p>
    </div>
  );
  
  const handleResetForm = () => {
    setIsSubmissionSuccessful(false);
    setSubmittedRequest(null);
    setDescription('');
    setSelectedCategory('');
    setUserLocation('');
    setFiles([]);
    setAnalysis(null);
    setError(null);
  }

  const SubmissionSuccessDisplay = ({ submittedRequest }: { submittedRequest: MaintenanceRequest | null }) => {
    const settings = maintenanceConfirmationSettings;
    
    const requestNumberDisplay = submittedRequest && (
        <div className="mt-6 text-center bg-gray-100 p-4 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-600 font-medium">رقم طلبك هو:</p>
            <p className="font-bold text-2xl text-indigo-600 font-mono bg-indigo-50 px-3 py-1.5 rounded-md tracking-widest inline-block my-2">
                {submittedRequest.id.slice(-8)}
            </p>
            <p className="text-sm text-gray-500">الرجاء الاحتفاظ بهذا الرقم لمتابعة حالة طلبك.</p>
        </div>
    );

    if (!settings.isEnabled) {
      return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-200 text-center animate-fade-in">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800">تم استلام طلب الصيانة بنجاح!</h3>
          <p className="text-gray-600 mt-2 max-w-md mx-auto">سيتم التواصل معك قريبًا من قبل فريقنا المختص.</p>
          {requestNumberDisplay}
          <button onClick={handleResetForm} className="mt-8 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors">
            إرسال طلب آخر
          </button>
        </div>
      );
    }

    const handleNavigationClick = (link: string) => {
      if (!link) return;
      const pages: Page[] = ['home', 'rentals', 'maintenance', 'admin', 'login', 'about'];
      if (pages.includes(link as Page)) {
        onNavigate(link as Page);
      } else if (link.startsWith('http')) {
        window.open(link, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = link.startsWith('/') ? link : `/${link}`;
      }
    };

    return (
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-200 text-center animate-fade-in">
        {settings.imageUrl ? (
          <img src={settings.imageUrl} alt="Offer" className="max-h-48 w-auto mx-auto mb-6 rounded-lg object-contain" />
        ) : (
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
        )}
        <h3 className="text-2xl font-bold text-gray-800">{settings.title}</h3>
        <p className="text-gray-600 mt-2 max-w-lg mx-auto">{settings.subtitle}</p>
        
        {requestNumberDisplay}

        {settings.showPropertySections && (
          <div className="my-8 pt-8 border-t-2 border-dashed border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">اكتشف عقاراتنا المتاحة للإيجار</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
              {settings.primaryButtonText && settings.primaryButtonLink && (
                  <button onClick={() => handleNavigationClick(settings.primaryButtonLink)} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                      <HomeModernIcon className="w-6 h-6"/>
                      <span>{settings.primaryButtonText}</span>
                  </button>
              )}
              {settings.secondaryButtonText && settings.secondaryButtonLink && (
                  <button onClick={() => handleNavigationClick(settings.secondaryButtonLink)} className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors">
                      <BuildingOffice2Icon className="w-6 h-6"/>
                      <span>{settings.secondaryButtonText}</span>
                  </button>
              )}
            </div>
          </div>
        )}
        
        <button onClick={handleResetForm} className="mt-8 text-sm text-gray-500 hover:text-gray-700 hover:underline py-2">
          أو قم بإرسال طلب صيانة آخر
        </button>
      </div>
    );
  };


  const renderContent = () => {
    if (isSubmissionSuccessful) {
        return <SubmissionSuccessDisplay submittedRequest={submittedRequest} />;
    }

    if (isLoading) {
      return (
        <div className="mt-8 text-center p-8 bg-white rounded-lg shadow-md border border-gray-200">
            <CogIcon className="animate-spin h-12 w-12 mx-auto text-indigo-500" />
            <p className="mt-4 text-lg font-semibold text-gray-700">يقوم الذكاء الاصطناعي بتحليل طلبك وتقديم نصائح أولية...</p>
            <p className="text-gray-500">قد يستغرق الأمر بضع لحظات.</p>
        </div>
      );
    }

    if (analysis) {
        return (
            <AnalysisDisplay 
                analysis={analysis} 
                maintenanceAdvice={maintenanceAdvice}
                suggestedTechnician={suggestedTechnician}
                alternativeTechnicians={alternativeTechnicians}
                selectedTechnician={finalSelectedTechnician}
                onTechnicianSelect={handleTechnicianSelection}
                inspectionFee={inspectionFee} 
                onConfirmRequest={handleConfirmRequest} 
                pointsSettings={pointsSettings}
            />
        );
    }
    
    return (
        <>
            {isGuideVisible && <AIMaintenanceGuide onDismiss={dismissGuide} />}
            {adSettings.isEnabled && adSettings.displayPages.includes('maintenance') && adSettings.imageUrl && (
            <div className="mb-8">
                <AdvertisementBanner imageUrl={adSettings.imageUrl} linkUrl={adSettings.linkUrl} />
            </div>
            )}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-200">
                 <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('ai')}
                            className={`flex items-center gap-2 whitespace-nowrap border-b-2 py-4 px-1 text-base font-medium ${activeTab === 'ai' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
                        >
                            <SparklesIcon className="w-5 h-5"/>
                            تشخيص ذكي
                        </button>
                        <button
                            onClick={() => setActiveTab('bidding')}
                            className={`flex items-center gap-2 whitespace-nowrap border-b-2 py-4 px-1 text-base font-medium ${activeTab === 'bidding' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
                        >
                             <BanknotesIcon className="w-5 h-5"/>
                            اطلب عروض أسعار
                        </button>
                    </nav>
                </div>
                
                {activeTab === 'ai' && (
                    <div className="animate-fade-in">
                        <form onSubmit={(e) => { e.preventDefault(); handleFormSubmitClick(); }} className="space-y-6">
                            <div>
                                <label htmlFor="category" className="block text-base font-medium text-gray-700 mb-2">
                                1. اختر قسم الصيانة
                                </label>
                                <select
                                id="category"
                                name="category"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-white"
                                required
                                disabled={isLoading}
                                >
                                <option value="" disabled>-- الرجاء اختيار قسم --</option>
                                {maintenanceCategories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                                </select>
                            </div>

                            {selectedCategory && (
                                <div className="animate-fade-in">
                                    <label className="block text-base font-medium text-gray-700 mb-2">
                                        2. حدد المشكلة الشائعة (اختياري)
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {maintenanceCategories.find(cat => cat.name === selectedCategory)?.commonIssues.map(issue => (
                                            <button
                                                type="button"
                                                key={issue.id}
                                                onClick={() => handleVisualProblemSelect(issue)}
                                                className="text-center p-3 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 space-y-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                            >
                                                {issue.iconName && getCommonIssueIcon(issue.iconName)}
                                                <span className="block text-sm font-semibold text-gray-700">{issue.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label htmlFor="userLocation" className="block text-base font-medium text-gray-700 mb-2">
                                3. أدخل منطقتك أو حيك (لترشيح أقرب فني)
                                </label>
                                <input
                                id="userLocation"
                                type="text"
                                value={userLocation}
                                onChange={(e) => setUserLocation(e.target.value)}
                                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-white"
                                placeholder="مثال: جدة، حي السلامة"
                                disabled={isLoading}
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-base font-medium text-gray-700 mb-2">
                                    4. صف مشكلة الصيانة بالتفصيل
                                </label>
                                <textarea
                                    id="description"
                                    rows={6}
                                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                                    placeholder="مثال: يوجد تسريب مياه أسفل حوض المطبخ، والصنبور لا يغلق بإحكام."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    disabled={isLoading}
                                />
                                <p className="text-sm text-gray-500 mt-2">كلما كان الوصف أكثر تفصيلاً، كان تحليل الذكاء الاصطناعي أكثر دقة.</p>
                            </div>
                            
                            <div>
                                <label className="block text-base font-medium text-gray-700 mb-2">
                                5. إرفاق صور (اختياري)
                                </label>
                                <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm text-gray-600 justify-center">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 px-1">
                                        <span>اختر ملفات</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleFileChange} disabled={isLoading}/>
                                    </label>
                                    <p className="pl-1">أو اسحبها وأفلتها هنا</p>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                    ملفات صور (PNG, JPG)
                                    </p>
                                </div>
                                </div>
                            </div>

                            {files.length > 0 && (
                                <div className="mt-4">
                                    <p className="font-medium text-gray-700">الملفات المحددة:</p>
                                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {files.map((file, index) => (
                                            <div key={index} className="relative group">
                                                <img src={URL.createObjectURL(file)} alt={`preview ${index}`} className="h-28 w-full object-cover rounded-md border border-gray-200" />
                                                <button 
                                                    type="button"
                                                    onClick={() => removeFile(index)} 
                                                    aria-label="Remove file"
                                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    disabled={isLoading}
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {error && (
                                <div className="mt-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
                                    <p className="font-bold">خطأ</p>
                                    <p>{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading || !description.trim() || !selectedCategory}
                                className="mt-8 w-full flex items-center justify-center gap-3 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                <>
                                    <CogIcon className="animate-spin h-5 w-5" />
                                    <span>جاري التحليل...</span>
                                </>
                                ) : (
                                'حلّل الطلب بالذكاء الاصطناعي'
                                )}
                            </button>
                        </form>
                    </div>
                )}
                 {activeTab === 'bidding' && (
                    <div className="animate-fade-in">
                       <MaintenanceJobPostForm 
                          onNavigate={onNavigate}
                          onSubmit={handleMaintenanceJobPostSubmit}
                       />
                    </div>
                )}
            </div>
        </>
    );
  }

  return (
    <div className="animate-fade-in bg-gray-50">
        <div className="relative bg-gray-800 py-24 sm:py-32">
            <img
                src={siteSettings.maintenancePageImageUrl}
                alt="خلفية لخدمات الصيانة"
                className="absolute inset-0 h-full w-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
            <div className="relative container mx-auto px-4 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                    {siteSettings.maintenancePageTitle}
                </h1>
                <p className="mt-6 text-lg lg:text-xl max-w-3xl mx-auto text-gray-300">
                  {siteSettings.maintenancePageSubtitle}
                </p>
            </div>
        </div>
        
        <div className="py-12 bg-gray-50">
          <div className="container mx-auto px-4 relative z-10">
              <button
                  onClick={() => setIsEmergencyModalOpen(true)}
                  className="w-full max-w-4xl mx-auto flex items-center justify-center gap-4 bg-red-600 text-white font-bold py-5 px-6 rounded-2xl shadow-lg hover:bg-red-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl"
              >
                  <ExclamationTriangleIcon className="w-8 h-8 animate-pulse flex-shrink-0" />
                  <span className="text-xl text-center">هل لديك حالة طارئة؟ اضغط هنا للتدخل الفوري</span>
              </button>
          </div>
        </div>

        <div className="bg-white py-16 sm:py-24">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">لماذا تختار خدماتنا للصيانة؟</h2>
                    <p className="mt-4 text-lg text-gray-600">نلتزم بتقديم تجربة متكاملة وموثوقة تضمن راحة بالك وأمانك.</p>
                </div>
                {features.length > 0 && (
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                        {features.map((feature) => (
                            <FeatureCard key={feature.id} icon={getFeatureIcon(feature.icon)} title={feature.title}>
                                {feature.description}
                            </FeatureCard>
                        ))}
                    </div>
                )}
            </div>
        </div>

        <div className="container mx-auto px-4 pt-12 pb-16 relative z-10" id="maintenance-form">
            <div className="max-w-3xl mx-auto">
              {renderContent()}
            </div>
        </div>
        
        <div className="py-16 sm:py-24 bg-white border-t">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">متابعة الطلبات والضمان</h2>
                <p className="mt-4 text-lg text-gray-600">أدخل رقم الطلب (آخر 8 أرقام) للمتابعة أو للتحقق من حالة الضمان.</p>
              </div>
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-200">
                <form onSubmit={handleRequestLookup} className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-shadow text-lg font-mono tracking-widest text-center"
                        placeholder="أدخل رقم الطلب هنا"
                        required
                        disabled={isCheckingRequest}
                    />
                    <button
                        type="submit"
                        disabled={isCheckingRequest || !invoiceNumber.trim()}
                        className="flex items-center justify-center gap-3 bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-all duration-300 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                        {isCheckingRequest ? (
                            <>
                                <CogIcon className="animate-spin h-5 w-5" />
                                <span>جاري البحث...</span>
                            </>
                        ) : 'بحث'}
                    </button>
                </form>
                {requestLookupResult && (
                    <div className="mt-6 animate-fade-in">
                        {requestLookupResult.status === 'not_found' && (
                            <div className="p-4 rounded-lg border-l-4 bg-red-50 border-red-500 text-red-800" role="alert">
                               <div className="flex items-center gap-3">
                                   <ExclamationTriangleIcon className="h-6 w-6"/>
                                   <p className="font-semibold">{requestLookupResult.message}</p>
                               </div>
                            </div>
                        )}
                        {requestLookupResult.status === 'found' && requestLookupResult.request && (
                            <div className="p-5 border border-gray-200 rounded-lg bg-gray-50">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">تفاصيل الطلب #{requestLookupResult.request.id.slice(-8)}</h3>
                                
                                <div className="my-6">
                                    <div className="flex items-center">
                                        <StatusStep label="جديد" active={requestLookupResult.request.status === 'جديد'} done={['قيد التنفيذ', 'مكتمل'].includes(requestLookupResult.request.status)} />
                                        <div className={`flex-1 h-1 transition-colors duration-500 ${['قيد التنفيذ', 'مكتمل'].includes(requestLookupResult.request.status) ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                                        <StatusStep label="قيد التنفيذ" active={requestLookupResult.request.status === 'قيد التنفيذ'} done={requestLookupResult.request.status === 'مكتمل'} />
                                        <div className={`flex-1 h-1 transition-colors duration-500 ${requestLookupResult.request.status === 'مكتمل' ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                                        <StatusStep label="مكتمل" active={requestLookupResult.request.status === 'مكتمل'} done={requestLookupResult.request.status === 'مكتمل'} />
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                     <p><span className="font-semibold">ملخص المشكلة:</span> {requestLookupResult.request.analysis.summary}</p>
                                     <p><span className="font-semibold">تاريخ الطلب:</span> {new Date(requestLookupResult.request.requestDate).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric'})}</p>
                                    
                                    {requestLookupResult.technician && (
                                        <div className="p-3 bg-white border rounded-lg flex items-center gap-4">
                                            {requestLookupResult.technician.imageUrl ? (
                                                <img src={requestLookupResult.technician.imageUrl} alt={requestLookupResult.technician.name} className="w-12 h-12 rounded-full object-cover"/>
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center"><UserGroupIcon className="w-6 h-6 text-gray-500"/></div>
                                            )}
                                            <div>
                                                 <p className="text-sm text-gray-500">الفني المسؤول</p>
                                                 <p className="font-bold text-gray-800">{requestLookupResult.technician.name}</p>
                                            </div>
                                        </div>
                                    )}

                                    {requestLookupResult.request.status === 'مكتمل' && (
                                        <div className="pt-4 border-t border-dashed">
                                            <button onClick={() => setViewingInvoice(requestLookupResult.request!)} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                                                <DocumentTextIcon className="w-5 h-5" />
                                                <span>عرض وتحميل الفاتورة</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 py-16 sm:py-24 border-t">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">تقييمات الفنيين</h2>
                    <p className="mt-4 text-lg text-gray-600">شاهد ما يقوله عملاؤنا عن أداء فريقنا الفني.</p>
                </div>
                <div className="mt-12 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 items-start">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">هل تعاملت مع أحد فنيينا؟ شاركنا رأيك!</h3>
                        <ReviewForm
                            reviewType="technician"
                            technicians={technicians}
                            onSubmit={onReviewSubmit}
                        />
                    </div>
                    <div className="max-h-[550px] overflow-y-auto pr-2">
                        <ReviewsList reviews={technicianReviews} />
                    </div>
                </div>
            </div>
        </div>
        
        {viewingInvoice && (
            <Modal isOpen={!!viewingInvoice} onClose={() => setViewingInvoice(null)} title={`فاتورة الطلب #${viewingInvoice.id.slice(-8)}`} size="lg">
                <InvoiceView
                    request={viewingInvoice}
                    siteSettings={siteSettings}
                />
            </Modal>
        )}

        <Modal isOpen={isEmergencyModalOpen} onClose={() => setIsEmergencyModalOpen(false)} title="طلب صيانة طارئة">
            <EmergencyRequestForm 
                services={emergencyServices}
                onSubmit={onEmergencyMaintenanceRequestSubmit}
                onCancel={() => setIsEmergencyModalOpen(false)}
            />
        </Modal>

    </div>
  );
};

export default MaintenancePage;