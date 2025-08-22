

import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminPage from './AdminPage';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { INITIAL_PROPERTIES, INITIAL_SITE_SETTINGS, INITIAL_AD_SETTINGS, INITIAL_VIEWING_REQUESTS, INITIAL_MAINTENANCE_CATEGORIES, INITIAL_ABOUT_US_SETTINGS, INITIAL_MAINTENANCE_REQUESTS, INITIAL_TECHNICIANS, INITIAL_REVIEWS, INITIAL_VIEWING_CONFIRMATION_SETTINGS, INITIAL_MAINTENANCE_CONFIRMATION_SETTINGS, INITIAL_CHATBOT_SETTINGS, INITIAL_EMERGENCY_MAINTENANCE_REQUESTS, INITIAL_RENTAL_AGREEMENTS, INITIAL_RENTAL_AGREEMENT_SETTINGS, INITIAL_USERS, INITIAL_POINTS_SETTINGS, INITIAL_MARKETPLACE_CATEGORIES, INITIAL_MARKETPLACE_PROVIDERS, INITIAL_MARKETPLACE_BOOKINGS } from '../data/initialData';
import { Property, SiteSettings, AdvertisementSettings, ViewingRequest, MaintenanceCategory, AboutUsSettings, MaintenanceRequest, Technician, Review, ViewingConfirmationSettings, MaintenanceConfirmationSettings, ChatbotSettings, EmergencyMaintenanceRequest, RentalAgreement, RentalAgreementSettings, User, PointsSettings, MarketplaceServiceCategory, MarketplaceServiceProvider, MarketplaceBooking } from '../types';
import AdminLayout from './AdminLayout';

const AdminRoute: React.FC = () => {
    const { isAuthenticated } = useAuth();
    
    const [properties, setProperties] = useLocalStorage<Property[]>('properties', INITIAL_PROPERTIES);
    const [maintenanceCategories, setMaintenanceCategories] = useLocalStorage<MaintenanceCategory[]>('maintenanceCategories', INITIAL_MAINTENANCE_CATEGORIES);
    const [technicians, setTechnicians] = useLocalStorage<Technician[]>('technicians', INITIAL_TECHNICIANS);
    const [siteSettings, setSiteSettings] = useLocalStorage<SiteSettings>('siteSettings', INITIAL_SITE_SETTINGS);
    const [adSettings, setAdSettings] = useLocalStorage<AdvertisementSettings>('adSettings', INITIAL_AD_SETTINGS);
    const [viewingRequests, setViewingRequests] = useLocalStorage<ViewingRequest[]>('viewingRequests', INITIAL_VIEWING_REQUESTS);
    const [maintenanceRequests, setMaintenanceRequests] = useLocalStorage<MaintenanceRequest[]>('maintenanceRequests', INITIAL_MAINTENANCE_REQUESTS);
    const [aboutUsSettings, setAboutUsSettings] = useLocalStorage<AboutUsSettings>('aboutUsSettings', INITIAL_ABOUT_US_SETTINGS);
    const [reviews, setReviews] = useLocalStorage<Review[]>('reviews', INITIAL_REVIEWS);
    const [viewingConfirmationSettings, setViewingConfirmationSettings] = useLocalStorage<ViewingConfirmationSettings>('viewingConfirmationSettings', INITIAL_VIEWING_CONFIRMATION_SETTINGS);
    const [maintenanceConfirmationSettings, setMaintenanceConfirmationSettings] = useLocalStorage<MaintenanceConfirmationSettings>('maintenanceConfirmationSettings', INITIAL_MAINTENANCE_CONFIRMATION_SETTINGS);
    const [chatbotSettings, setChatbotSettings] = useLocalStorage<ChatbotSettings>('chatbotSettings', INITIAL_CHATBOT_SETTINGS);
    const [emergencyMaintenanceRequests, setEmergencyMaintenanceRequests] = useLocalStorage<EmergencyMaintenanceRequest[]>('emergencyMaintenanceRequests', INITIAL_EMERGENCY_MAINTENANCE_REQUESTS);
    const [rentalAgreements, setRentalAgreements] = useLocalStorage<RentalAgreement[]>('rentalAgreements', INITIAL_RENTAL_AGREEMENTS);
    const [rentalAgreementSettings, setRentalAgreementSettings] = useLocalStorage<RentalAgreementSettings>('rentalAgreementSettings', INITIAL_RENTAL_AGREEMENT_SETTINGS);
    const [users, setUsers] = useLocalStorage<User[]>('users', INITIAL_USERS);
    const [pointsSettings, setPointsSettings] = useLocalStorage<PointsSettings>('pointsSettings', INITIAL_POINTS_SETTINGS);
    const [marketplaceCategories, setMarketplaceCategories] = useLocalStorage<MarketplaceServiceCategory[]>('marketplaceCategories', INITIAL_MARKETPLACE_CATEGORIES);
    const [marketplaceServiceProviders, setMarketplaceServiceProviders] = useLocalStorage<MarketplaceServiceProvider[]>('marketplaceServiceProviders', INITIAL_MARKETPLACE_PROVIDERS);
    const [marketplaceBookings, setMarketplaceBookings] = useLocalStorage<MarketplaceBooking[]>('marketplaceBookings', INITIAL_MARKETPLACE_BOOKINGS);
    
    const newRequestCount = viewingRequests.filter(r => r.status === 'جديد').length + 
                            maintenanceRequests.filter(r => r.status === 'جديد').length +
                            emergencyMaintenanceRequests.filter(r => r.status === 'جديد').length;

    useEffect(() => {
        if (!isAuthenticated) {
            window.location.href = '/login';
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        // Render nothing while redirecting
        return null;
    }

    return (
        <AdminLayout siteSettings={siteSettings} newRequestCount={newRequestCount}>
            <AdminPage />
        </AdminLayout>
    );
};

export default AdminRoute;
