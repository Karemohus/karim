import React from 'react';
import { WrenchScrewdriverIcon } from './icons';
import { Page, SiteSettings } from '../types';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
    currentPage: Page;
    onNavigate: (page: Page) => void;
    siteSettings: SiteSettings;
    newRequestCount?: number;
}

const NavLink: React.FC<{
    page: Page;
    currentPage: Page;
    onNavigate: (page: Page) => void;
    children: React.ReactNode;
}> = ({ page, currentPage, onNavigate, children }) => {
    const isActive = currentPage === page;
    return (
        <button
            onClick={() => onNavigate(page)}
            className={`px-3 py-2 rounded-md text-base font-bold transition-colors duration-300 relative ${
                isActive 
                ? 'text-indigo-600' 
                : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
            }`}
        >
            {children}
            {isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/5 h-0.5 bg-indigo-600 rounded-full"></span>}
        </button>
    );
};

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate, siteSettings, newRequestCount }) => {
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onNavigate('home');
  };

  return (
    <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
            <button onClick={() => onNavigate('home')} className="flex items-center gap-3 group">
              {siteSettings.logoUrl ? (
                <img src={siteSettings.logoUrl} alt={`${siteSettings.siteName} Logo`} className="h-10 w-auto object-contain" />
              ) : (
                <div className="bg-indigo-600 group-hover:bg-indigo-700 p-2 rounded-lg transition-colors">
                  <WrenchScrewdriverIcon className="h-6 w-6 text-white" />
                </div>
              )}
              <span className="text-2xl font-bold text-gray-900">{siteSettings.siteName}</span>
            </button>
            <div className="hidden md:flex items-center space-x-2 space-x-reverse">
                <NavLink page="home" currentPage={currentPage} onNavigate={onNavigate}>الرئيسية</NavLink>
                <NavLink page="rentals" currentPage={currentPage} onNavigate={onNavigate}>العقارات</NavLink>
                <NavLink page="maintenance" currentPage={currentPage} onNavigate={onNavigate}>خدمات الصيانة</NavLink>
                <NavLink page="about" currentPage={currentPage} onNavigate={onNavigate}>عنا</NavLink>
                {isAuthenticated && 
                    <NavLink page="admin" currentPage={currentPage} onNavigate={onNavigate}>
                      <span className="relative">
                        لوحة التحكم
                        {newRequestCount > 0 && (
                            <span className="absolute -top-1.5 -right-3.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                {newRequestCount > 9 ? '9+' : newRequestCount}
                            </span>
                        )}
                      </span>
                    </NavLink>
                }
            </div>
            <div className="hidden md:block">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white font-bold px-5 py-2.5 rounded-lg hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
                >
                  تسجيل الخروج
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('login')}
                  className="bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md"
                >
                  تسجيل الدخول
                </button>
              )}
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;