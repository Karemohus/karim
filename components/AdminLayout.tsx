import React from 'react';
import { useAuth } from '../context/AuthContext';
import { SiteSettings } from '../types';
import { QueueListIcon, WrenchScrewdriverIcon } from './icons';

interface AdminLayoutProps {
  children: React.ReactNode;
  siteSettings: SiteSettings;
  newRequestCount: number;
}

const AdminHeader: React.FC<{siteSettings: SiteSettings, newRequestCount: number}> = ({siteSettings, newRequestCount}) => {
    const { logout } = useAuth();
    const handleLogout = () => {
        logout();
        window.location.href = '/'; // Redirect to home on logout
    };

    return (
        <header className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-20">
                    <a href="/admin" className="flex items-center gap-3 group">
                         <div className="bg-gray-800 group-hover:bg-gray-900 p-2 rounded-lg transition-colors">
                            <WrenchScrewdriverIcon className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-800">{siteSettings.siteName} - لوحة التحكم</span>
                    </a>
                    <div className="flex items-center gap-6">
                        <a href="/" target="_blank" rel="noopener noreferrer" className="text-gray-600 font-semibold hover:text-indigo-600 transition-colors">
                            عرض الموقع
                        </a>
                         <div className="h-8 w-px bg-gray-200"></div>
                         <a href="/admin" className="text-gray-600 font-semibold hover:text-indigo-600 transition-colors relative flex items-center gap-2">
                            <QueueListIcon className="w-5 h-5"/>
                            <span>طلبات المعاينة</span>
                            {newRequestCount > 0 && (
                                <span className="absolute -top-1.5 -right-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                    {newRequestCount > 9 ? '9+' : newRequestCount}
                                </span>
                            )}
                        </a>
                        <button onClick={handleLogout} className="bg-red-600 text-white font-bold px-5 py-2.5 rounded-lg hover:bg-red-700 transition-colors">
                            تسجيل الخروج
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, siteSettings, newRequestCount }) => {
    return (
        <div className="min-h-screen bg-gray-100">
            <AdminHeader siteSettings={siteSettings} newRequestCount={newRequestCount} />
            <main>
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;