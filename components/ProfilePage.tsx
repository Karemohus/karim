import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Page, User, ProfileTab, MaintenanceJobPost } from '../types';
import { UserIcon, WrenchScrewdriverIcon, HomeModernIcon, DocumentTextIcon, HeartIcon, CogIcon, PencilIcon, SparklesIcon, CheckCircleIcon, PaintBrushIcon, BanknotesIcon } from './icons';
import InteriorDesignAssistant from './InteriorDesignAssistant';
import { useData } from '../context/DataContext';
import PropertyCard from './PropertyCard';
import JobPostDetailsModal from './JobPostDetailsModal';

interface ProfilePageProps {
    onNavigate: (page: Page) => void;
    onSelectProperty: (id: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate, onSelectProperty }) => {
    const { currentUser, updateUser, logout } = useAuth();
    const { db } = useData();
    const { 
        maintenanceRequests: allMaintenanceRequests, 
        maintenanceJobPosts: allMaintenanceJobPosts,
        viewingRequests: allViewingRequests, 
        rentalAgreements: allRentalAgreements,
        properties: allProperties,
        pointsSettings,
        technicians,
    } = db;

    const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
    
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: currentUser?.name || '', phone: currentUser?.phone || '' });
    const [copySuccess, setCopySuccess] = useState('');
    const [viewingJobPost, setViewingJobPost] = useState<MaintenanceJobPost | null>(null);

    if (!currentUser) {
        onNavigate('login');
        return null;
    }

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditData({...editData, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = () => {
        const updatedUser: User = { ...currentUser, ...editData };
        updateUser(updatedUser);
        setIsEditing(false);
    };
    
    const handleCopyCode = () => {
        if (!currentUser?.referralCode) return;
        navigator.clipboard.writeText(currentUser.referralCode).then(() => {
            setCopySuccess('تم النسخ!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, (err) => {
            setCopySuccess('فشل النسخ');
            console.error('Could not copy text: ', err);
        });
    };

    const userMaintenanceRequests = allMaintenanceRequests
        .filter(req => req.userId === currentUser.id)
        .map(req => ({ ...req, type: 'ai' as const }));

    const userMaintenanceJobPosts = allMaintenanceJobPosts
        .filter(req => req.userId === currentUser.id)
        .map(req => ({ ...req, type: 'bid' as const }));

    const combinedMaintenanceHistory = [...userMaintenanceRequests, ...userMaintenanceJobPosts]
        .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());

    const userViewingRequests = allViewingRequests.filter(req => req.userId === currentUser.id);
    const userRentalAgreements = allRentalAgreements.filter(req => req.userId === currentUser.id);
    const favoriteProperties = allProperties.filter(p => currentUser.favoritePropertyIds.includes(p.id));
    const userHasContracts = userRentalAgreements.length > 0;

    const TabButton: React.FC<{ tab: ProfileTab; icon: React.ReactNode; label: string }> = ({ tab, icon, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg text-right font-bold transition-colors ${activeTab === tab ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    const renderTabContent = () => {
        switch(activeTab) {
            case 'profile':
                return (
                    <div>
                        <h3 className="text-xl font-bold mb-4">بياناتي الشخصية</h3>
                        {!isEditing ? (
                            <div className="space-y-4 p-4 bg-gray-100 rounded-lg border">
                                <p><strong>الاسم:</strong> {currentUser.name}</p>
                                <p><strong>رقم الهاتف:</strong> {currentUser.phone}</p>
                                <div className="pt-3 mt-3 border-t">
                                    <p className="flex items-center gap-2">
                                        <SparklesIcon className="w-5 h-5 text-yellow-500" />
                                        <strong>رصيد النقاط:</strong> {currentUser.points || 0} نقطة
                                    </p>
                                    {pointsSettings.isEnabled && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            قيمة النقاط الحالية: <strong>{((currentUser.points || 0) * pointsSettings.pointValueInSAR).toFixed(2)} ريال</strong>.
                                            يمكنك استخدامها للحصول على خصم في رسوم كشف طلبات الصيانة.
                                        </p>
                                    )}
                                </div>
                                <div className="pt-3 mt-3 border-t">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">كود الدعوة الخاص بك</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={currentUser.referralCode} 
                                            className="w-full p-2 border bg-white rounded-md font-mono text-center tracking-widest"
                                        />
                                        <button onClick={handleCopyCode} className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-md hover:bg-indigo-200 font-semibold transition-colors">
                                            {copySuccess || 'نسخ'}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">شارك هذا الكود مع أصدقائك واحصل على نقاط عند تسجيلهم!</p>
                                </div>
                                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm text-indigo-600 font-semibold hover:underline pt-2">
                                    <PencilIcon className="w-4 h-4" />
                                    تعديل البيانات
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4 p-4 bg-gray-100 rounded-lg border">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">الاسم</label>
                                    <input type="text" name="name" value={editData.name} onChange={handleEditChange} className="w-full p-2 border rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">رقم الهاتف</label>
                                    <input type="tel" name="phone" value={editData.phone} onChange={handleEditChange} className="w-full p-2 border rounded-md" />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleSaveProfile} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">حفظ</button>
                                    <button onClick={() => setIsEditing(false)} className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300">إلغاء</button>
                                </div>
                            </div>
                        )}
                         <div className="mt-8 border-t pt-6">
                            <button
                                onClick={() => { logout(); onNavigate('home'); }}
                                className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition-colors"
                            >
                                تسجيل الخروج
                            </button>
                        </div>
                    </div>
                );
            case 'maintenance':
                return (
                     <div>
                        <h3 className="text-xl font-bold mb-4">طلبات الصيانة الخاصة بي</h3>
                        {combinedMaintenanceHistory.length > 0 ? (
                            <div className="space-y-4">
                                {combinedMaintenanceHistory.map(req => {
                                    const assignedTechnician = req.type === 'ai' && req.assignedTechnicianId
                                        ? technicians.find(t => t.id === req.assignedTechnicianId)
                                        : null;
                                    
                                    return (
                                    <div key={req.id} className="p-4 border rounded-lg bg-gray-50">
                                        <div className="flex justify-between items-start flex-wrap gap-2">
                                            <div>
                                                <p className="font-bold">{req.type === 'ai' ? req.analysis.summary : req.title}</p>
                                                <p className="text-sm text-gray-500"><strong>التاريخ:</strong> {new Date(req.requestDate).toLocaleDateString('ar-EG-u-nu-latn')}</p>
                                                <p className="text-sm text-gray-500"><strong>الحالة:</strong> <span className="font-semibold">{req.status}</span></p>
                                                {req.type === 'ai' && req.scheduledDate && (
                                                    <div className="mt-2 text-sm p-2 bg-blue-100 border border-blue-200 rounded-md">
                                                        <p className="font-bold text-blue-800">
                                                            الموعد: {new Date(req.scheduledDate).toLocaleDateString('ar-EG-u-nu-latn', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                        </p>
                                                        {assignedTechnician && <p className="text-blue-700">الفني المسؤول: {assignedTechnician.name}</p>}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 ${req.type === 'ai' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                                    {req.type === 'ai' ? <SparklesIcon className="w-3 h-3"/> : <BanknotesIcon className="w-3 h-3"/>}
                                                    {req.type === 'ai' ? 'تشخيص ذكي' : 'طلب تسعير'}
                                                </span>
                                                {req.type === 'bid' && (
                                                    <button onClick={() => setViewingJobPost(req)} className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-md hover:bg-indigo-700">
                                                        عرض العروض
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    )
                                })}
                            </div>
                        ) : <p>لا توجد طلبات صيانة.</p>}
                    </div>
                );
            case 'viewings':
                 return (
                     <div>
                        <h3 className="text-xl font-bold mb-4">طلبات معاينة العقارات</h3>
                        {userViewingRequests.length > 0 ? (
                            <div className="space-y-4">
                                {userViewingRequests.map(req => (
                                    <div key={req.id} className="p-4 border rounded-lg bg-gray-50">
                                        <p><strong>العقار:</strong> {req.propertyName}</p>
                                        <p><strong>الحالة:</strong> {req.status}</p>
                                        <p><strong>التاريخ:</strong> {new Date(req.requestDate).toLocaleDateString()}</p>
                                    </div>
                                ))}
                            </div>
                        ) : <p>لا توجد طلبات معاينة.</p>}
                    </div>
                );
            case 'favorites':
                return (
                    <div>
                        <h3 className="text-xl font-bold mb-4">عقاراتي المفضلة</h3>
                        {favoriteProperties.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {favoriteProperties.map(prop => (
                                    <PropertyCard 
                                        key={prop.id}
                                        property={prop}
                                        onSelect={onSelectProperty}
                                        isFavorite={true}
                                        onToggleFavorite={() => {}} // Handled by useFavorites hook
                                        isBeingCompared={false}
                                        onToggleCompare={() => {}}
                                        showCompareButton={false}
                                    />
                                ))}
                            </div>
                        ) : <p>لم تقم بإضافة أي عقارات للمفضلة بعد.</p>}
                    </div>
                );
            case 'contracts':
                return (
                    <div>
                        <h3 className="text-xl font-bold mb-4">عقود الإيجار الخاصة بي</h3>
                        {userRentalAgreements.length > 0 ? (
                            <div className="space-y-4">
                                {userRentalAgreements.map(agreement => (
                                    <div key={agreement.id} className="p-4 border rounded-lg bg-gray-50">
                                        <p><strong>العقار:</strong> {agreement.propertyName}</p>
                                        <p><strong>تاريخ الإيجار:</strong> {new Date(agreement.rentalDate).toLocaleDateString()}</p>
                                    </div>
                                ))}
                            </div>
                        ) : <p>لا توجد عقود إيجار مسجلة.</p>}
                    </div>
                );
            case 'designAssistant':
                if (!userHasContracts) {
                    return (
                        <div>
                             <h3 className="text-xl font-bold mb-4">مساعد التصميم الداخلي</h3>
                             <div className="p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                                <p className="font-semibold text-yellow-800">هذه الميزة متاحة فقط للمستأجرين الحاليين.</p>
                                <p className="text-yellow-700 mt-1">قم باستئجار أحد عقاراتنا لتتمكن من استخدام مساعد التصميم الداخلي.</p>
                            </div>
                        </div>
                    );
                }
                return <InteriorDesignAssistant />;
            default:
                return null;
        }
    };

    return (
        <>
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8">مرحباً بك، {currentUser.name}</h1>
            <div className="grid lg:grid-cols-4 gap-8">
                <aside className="lg:col-span-1">
                    <div className="bg-white p-4 rounded-lg shadow border sticky top-24">
                        <nav className="space-y-2">
                            <TabButton tab="profile" icon={<UserIcon className="w-5 h-5"/>} label="ملفي الشخصي" />
                            <TabButton tab="maintenance" icon={<WrenchScrewdriverIcon className="w-5 h-5"/>} label="طلبات الصيانة" />
                            <TabButton tab="viewings" icon={<HomeModernIcon className="w-5 h-5"/>} label="طلبات المعاينة" />
                            <TabButton tab="favorites" icon={<HeartIcon className="w-5 h-5"/>} label="المفضلة" />
                            <TabButton tab="contracts" icon={<DocumentTextIcon className="w-5 h-5"/>} label="عقودي" />
                             <TabButton tab="designAssistant" icon={<PaintBrushIcon className="w-5 h-5"/>} label="مساعد التصميم" />
                        </nav>
                    </div>
                </aside>
                <main className="lg:col-span-3">
                    <div className="bg-white p-6 rounded-lg shadow border min-h-[60vh]">
                       {renderTabContent()}
                    </div>
                </main>
            </div>
        </div>
        {viewingJobPost && (
            <JobPostDetailsModal 
                jobPost={viewingJobPost}
                onClose={() => setViewingJobPost(null)}
            />
        )}
        </>
    );
};

export default ProfilePage;