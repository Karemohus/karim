import React, { useState, useEffect } from 'react';
import { WrenchScrewdriverIcon, Bars3Icon, XMarkIcon, ShoppingBagIcon } from './icons';
import { Page, SiteSettings } from '../types';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

interface HeaderProps {
    currentPage: Page;
    onNavigate: (page: Page) => void;
}

// NavLink for desktop
const DesktopNavLink: React.FC<{
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

// NavLink for mobile
const MobileNavLink: React.FC<{
    page: Page;
    currentPage: Page;
    onNavigate: (page: Page) => void;
    children: React.ReactNode;
}> = ({ page, currentPage, onNavigate, children }) => {
    const isActive = currentPage === page;
    return (
        <button
            onClick={() => onNavigate(page)}
            className={`block w-full text-right px-4 py-3 text-lg font-bold transition-colors duration-200 rounded-md ${
                isActive 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
        >
            {children}
        </button>
    );
};


const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate }) => {
  const { isAuthenticated, isUser, isAdmin, logout } = useAuth();
  const { db } = useData();
  const { siteSettings, viewingRequests, maintenanceRequests, emergencyMaintenanceRequests } = db;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const newRequestCount = viewingRequests.filter(r => r.status === 'جديد').length + 
                            maintenanceRequests.filter(r => r.status === 'جديد').length +
                            emergencyMaintenanceRequests.filter(r => r.status === 'جديد').length;


  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  const handleMobileNav = (page: Page) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    onNavigate('home');
  };

  const renderMobileMenu = () => (
    <div 
      className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'visible' : 'invisible'}`}
      aria-modal="true"
      role="dialog"
    >
        <div 
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-60' : 'opacity-0'}`} 
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        ></div>

        <div 
          className={`absolute top-0 right-0 bottom-0 w-4/5 max-w-sm bg-white shadow-xl transition-transform duration-300 ease-in-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex justify-between items-center p-5 border-b border-gray-200 flex-shrink-0">
              <button onClick={() => handleMobileNav('home')} className="flex items-center gap-3">
                  {siteSettings.logoUrl ? (
                      <img src={siteSettings.logoUrl} alt={`${siteSettings.siteName} Logo`} className="h-8 w-auto object-contain" />
                  ) : (
                      <div className="bg-indigo-600 p-2 rounded-lg">
                      <WrenchScrewdriverIcon className="h-5 w-5 text-white" />
                      </div>
                  )}
                  <span className="text-xl font-bold text-gray-900">{siteSettings.siteName}</span>
              </button>
              <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-800"
                  aria-label="إغلاق القائمة"
              >
                  <XMarkIcon className="h-7 w-7" />
              </button>
          </div>
          
          <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
              <MobileNavLink page="home" currentPage={currentPage} onNavigate={handleMobileNav}>الرئيسية</MobileNavLink>
              <MobileNavLink page="rentals" currentPage={currentPage} onNavigate={handleMobileNav}>العقارات</MobileNavLink>
              <MobileNavLink page="maintenance" currentPage={currentPage} onNavigate={handleMobileNav}>خدمات الصيانة</MobileNavLink>
              {siteSettings.marketplaceEnabled && <MobileNavLink page="marketplace" currentPage={currentPage} onNavigate={handleMobileNav}>سوق الخدمات</MobileNavLink>}
              <MobileNavLink page="about" currentPage={currentPage} onNavigate={handleMobileNav}>عنا</MobileNavLink>
              {isUser && <MobileNavLink page="profile" currentPage={currentPage} onNavigate={handleMobileNav}>حسابي</MobileNavLink>}
              {isAdmin && 
                  <MobileNavLink page="admin" currentPage={currentPage} onNavigate={handleMobileNav}>
                    <div className="relative inline-block">
                      لوحة التحكم
                      {newRequestCount > 0 && (
                          <span className="absolute top-1/2 -translate-y-1/2 -right-7 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                              {newRequestCount > 9 ? '9+' : newRequestCount}
                          </span>
                      )}
                    </div>
                  </MobileNavLink>
              }
          </nav>
          
          <div className="p-4 border-t border-gray-200 flex-shrink-0">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 text-white font-bold px-5 py-3 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                تسجيل الخروج
              </button>
            ) : (
                <div className="space-y-3">
                    <button onClick={() => handleMobileNav('login')} className="w-full bg-indigo-600 text-white font-bold px-5 py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                        تسجيل الدخول
                    </button>
                     <button onClick={() => handleMobileNav('register')} className="w-full bg-white text-indigo-600 border border-indigo-600 font-bold px-5 py-3 rounded-lg hover:bg-indigo-50 transition-colors">
                        إنشاء حساب جديد
                    </button>
                </div>
            )}
          </div>
        </div>
    </div>
  );

  return (
    <>
        <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200 sticky top-0 z-40">
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
                    <DesktopNavLink page="home" currentPage={currentPage} onNavigate={onNavigate}>الرئيسية</DesktopNavLink>
                    <DesktopNavLink page="rentals" currentPage={currentPage} onNavigate={onNavigate}>العقارات</DesktopNavLink>
                    <DesktopNavLink page="maintenance" currentPage={currentPage} onNavigate={onNavigate}>خدمات الصيانة</DesktopNavLink>
                    {siteSettings.marketplaceEnabled && <DesktopNavLink page="marketplace" currentPage={currentPage} onNavigate={onNavigate}>سوق الخدمات</DesktopNavLink>}
                    <DesktopNavLink page="about" currentPage={currentPage} onNavigate={onNavigate}>عنا</DesktopNavLink>
                    {isUser && <DesktopNavLink page="profile" currentPage={currentPage} onNavigate={onNavigate}>حسابي</DesktopNavLink>}
                    {isAdmin && 
                        <DesktopNavLink page="admin" currentPage={currentPage} onNavigate={onNavigate}>
                        <span className="relative">
                            لوحة التحكم
                            {newRequestCount > 0 && (
                                <span className="absolute -top-1.5 -right-3.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                    {newRequestCount > 9 ? '9+' : newRequestCount}
                                </span>
                            )}
                        </span>
                        </DesktopNavLink>
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
                    <div className="flex items-center gap-2">
                        <button onClick={() => onNavigate('login')} className="bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md">
                            تسجيل الدخول
                        </button>
                        <button onClick={() => onNavigate('register')} className="bg-white text-indigo-600 border border-indigo-600 font-bold px-5 py-2.5 rounded-lg hover:bg-indigo-50 transition-colors">
                            إنشاء حساب
                        </button>
                    </div>
                )}
                </div>

                <div className="md:hidden">
                    <button 
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 text-gray-600 hover:text-gray-900"
                        aria-label="Open navigation menu"
                    >
                        <Bars3Icon className="h-8 w-8" />
                    </button>
                </div>

            </div>
        </div>
        </header>
        {renderMobileMenu()}
    </>
  );
};

export default Header;