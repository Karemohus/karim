import React, { useState, useEffect } from 'react';
import { Property, Page, RentalAgreement, MarketplaceBooking } from './types';
import Header from './components/Header';
import HomePage from './components/HomePage';
import RentalsPage from './components/RentalsPage';
import MaintenancePage from './components/MaintenancePage';
import PropertyDetailsPage from './components/PropertyDetailsPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ProfilePage from './components/ProfilePage';
import AdminPage from './components/AdminPage';
import { useAuth } from './context/AuthContext';
import { useData } from './context/DataContext';
import AboutUsPage from './components/AboutUsPage';
import Chatbot from './components/Chatbot';
import RentalAgreementView from './components/RentalAgreementView';
import MarketplacePage from './components/MarketplacePage';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

    const { db, setMarketplaceBookings } = useData();
    const { isAuthenticated, currentUser, isUser, isAdmin } = useAuth();
    const { siteSettings, rentalAgreementSettings, chatbotSettings, properties, maintenanceRequests, emergencyMaintenanceRequests } = db;

    const [agreementToShow, setAgreementToShow] = useState<RentalAgreement | null>(null);
    const [propertyForAgreement, setPropertyForAgreement] = useState<Property | null>(null);
    
    const handleSelectProperty = (id: string) => {
        setSelectedPropertyId(id);
        window.scrollTo(0, 0);
    };

    useEffect(() => {
        // Protection for admin/profile pages
        if (currentPage === 'admin' && !isAdmin) {
            setCurrentPage('login');
            return;
        }
        if (currentPage === 'profile' && !isUser) {
            setCurrentPage('login');
            return;
        }

        // Logic for after login/register
        if ((currentPage === 'login' || currentPage === 'register') && isAuthenticated) {
            const redirectDataJSON = localStorage.getItem('loginRedirect');
            
            if (redirectDataJSON) {
                localStorage.removeItem('loginRedirect'); // Consume it
                try {
                    const redirectData = JSON.parse(redirectDataJSON);
                    
                    if (redirectData.page === 'property' && redirectData.id) {
                        handleSelectProperty(redirectData.id);
                        return;
                    } else if (redirectData.page === 'maintenance') {
                        setCurrentPage('maintenance');
                        return;
                    }
                } catch (e) {
                    console.error("Failed to parse redirect data:", e);
                }
            }
            
            // Default navigation after login/register
            if (isAdmin) {
                setCurrentPage('admin');
            } else if (isUser) {
                setCurrentPage('profile');
            }
        }
    }, [currentPage, isAuthenticated, isUser, isAdmin]);

    const handleNavigation = (page: Page) => {
        setCurrentPage(page);
        setSelectedPropertyId(null);
        window.scrollTo(0, 0);
    };

    const handleShowAgreement = (agreement: RentalAgreement, property: Property) => {
        setPropertyForAgreement(property);
        setAgreementToShow(agreement);
        setSelectedPropertyId(null); // Deselect property to hide details page
    };

    const handleBookingSubmit = (data: Omit<MarketplaceBooking, 'id' | 'requestDate' | 'status'>) => {
        const newBooking: MarketplaceBooking = {
            ...data,
            id: `booking-${Date.now()}`,
            requestDate: new Date().toISOString(),
            status: 'جديد',
            userId: currentUser?.id,
        };
        setMarketplaceBookings(prev => [newBooking, ...prev]);
    };
    
    const renderPage = () => {
        if (agreementToShow && propertyForAgreement) {
            return (
                <div className="bg-gray-100 py-12 px-4">
                    <div className="max-w-4xl mx-auto">
                        <RentalAgreementView
                            agreement={agreementToShow}
                            property={propertyForAgreement}
                            siteSettings={siteSettings}
                            rentalAgreementSettings={rentalAgreementSettings}
                            onClose={() => {
                                setAgreementToShow(null);
                                setPropertyForAgreement(null);
                                handleNavigation('rentals');
                            }}
                        />
                    </div>
                </div>
            );
        }

        if (selectedPropertyId) {
            const property = db.properties.find(p => p.id === selectedPropertyId);
            if (property) {
                return <PropertyDetailsPage 
                            property={property}
                            onBack={() => setSelectedPropertyId(null)}
                            onSelectProperty={handleSelectProperty}
                            onShowAgreement={handleShowAgreement}
                            onNavigate={handleNavigation}
                        />;
            }
        }
        switch (currentPage) {
            case 'login':
                return <LoginPage onNavigate={handleNavigation} />;
            case 'register':
                return <RegisterPage onNavigate={handleNavigation} />;
             case 'profile':
                if (!isUser) return null;
                return <ProfilePage onNavigate={handleNavigation} onSelectProperty={handleSelectProperty} />;
            case 'admin':
                if (!isAdmin) return null;
                return <AdminPage />;
            case 'rentals':
                return <RentalsPage onSelectProperty={handleSelectProperty} />;
            case 'maintenance':
                return <MaintenancePage onNavigate={handleNavigation} />;
            case 'marketplace':
                return <MarketplacePage onNavigate={handleNavigation} onBookingSubmit={handleBookingSubmit} />;
            case 'about':
                return <AboutUsPage />;
            case 'home':
            default:
                return <HomePage onNavigate={handleNavigation} />;
        }
    };
    
    const showHeader = currentPage !== 'login' && currentPage !== 'register' && !(agreementToShow && propertyForAgreement);
    const showChatbot = chatbotSettings.isEnabled && !['login', 'register', 'admin'].includes(currentPage) && !(agreementToShow && propertyForAgreement);

    return (
        <>
            {showHeader && <Header currentPage={currentPage} onNavigate={handleNavigation} />}
            <main className="bg-gray-50 min-h-screen">
                {renderPage()}
            </main>
            {showChatbot && <Chatbot 
                siteSettings={siteSettings} 
                chatbotSettings={chatbotSettings}
                properties={properties}
                maintenanceRequests={maintenanceRequests}
                emergencyMaintenanceRequests={emergencyMaintenanceRequests}
            />}
        </>
    );
};

export default App;
