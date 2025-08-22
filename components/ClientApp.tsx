

import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { INITIAL_PROPERTIES, INITIAL_SITE_SETTINGS, INITIAL_AD_SETTINGS, INITIAL_VIEWING_REQUESTS, INITIAL_MAINTENANCE_CATEGORIES, INITIAL_MAINTENANCE_REQUESTS, INITIAL_TECHNICIANS, INITIAL_REVIEWS, INITIAL_VIEWING_CONFIRMATION_SETTINGS, INITIAL_MAINTENANCE_CONFIRMATION_SETTINGS, INITIAL_EMERGENCY_SERVICES, INITIAL_EMERGENCY_MAINTENANCE_REQUESTS, INITIAL_RENTAL_AGREEMENTS, INITIAL_RENTAL_AGREEMENT_SETTINGS, INITIAL_POINTS_SETTINGS } from '../data/initialData';
import { Property, SiteSettings, AdvertisementSettings, Page, ViewingRequest, MaintenanceCategory, MaintenanceRequest, Technician, Review, ViewingConfirmationSettings, MaintenanceConfirmationSettings, EmergencyService, EmergencyMaintenanceRequest, RentalAgreement, RentalAgreementSettings, PointsSettings } from '../types';
import Header from './Header';
import HomePage from './HomePage';
import RentalsPage from './RentalsPage';
import MaintenancePage from './MaintenancePage';
import PropertyDetailsPage from './PropertyDetailsPage';

const ClientApp: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

    // Data hooks
    const [properties, setProperties] = useLocalStorage<Property[]>('properties', INITIAL_PROPERTIES);
    const [maintenanceCategories] = useLocalStorage<MaintenanceCategory[]>('maintenanceCategories', INITIAL_MAINTENANCE_CATEGORIES);
    const [technicians] = useLocalStorage<Technician[]>('technicians', INITIAL_TECHNICIANS);
    const [siteSettings] = useLocalStorage<SiteSettings>('siteSettings', INITIAL_SITE_SETTINGS);
    const [adSettings] = useLocalStorage<AdvertisementSettings>('adSettings', INITIAL_AD_SETTINGS);
    const [viewingRequests, setViewingRequests] = useLocalStorage<ViewingRequest[]>('viewingRequests', INITIAL_VIEWING_REQUESTS);
    const [maintenanceRequests, setMaintenanceRequests] = useLocalStorage<MaintenanceRequest[]>('maintenanceRequests', INITIAL_MAINTENANCE_REQUESTS);
    const [reviews, setReviews] = useLocalStorage<Review[]>('reviews', INITIAL_REVIEWS);
    const [viewingConfirmationSettings] = useLocalStorage<ViewingConfirmationSettings>('viewingConfirmationSettings', INITIAL_VIEWING_CONFIRMATION_SETTINGS);
    const [maintenanceConfirmationSettings] = useLocalStorage<MaintenanceConfirmationSettings>('maintenanceConfirmationSettings', INITIAL_MAINTENANCE_CONFIRMATION_SETTINGS);
    const [emergencyServices] = useLocalStorage<EmergencyService[]>('emergencyServices', INITIAL_EMERGENCY_SERVICES);
    const [emergencyMaintenanceRequests, setEmergencyMaintenanceRequests] = useLocalStorage<EmergencyMaintenanceRequest[]>('emergencyMaintenanceRequests', INITIAL_EMERGENCY_MAINTENANCE_REQUESTS);
    const [rentalAgreements, setRentalAgreements] = useLocalStorage<RentalAgreement[]>('rentalAgreements', INITIAL_RENTAL_AGREEMENTS);
    const [rentalAgreementSettings] = useLocalStorage<RentalAgreementSettings>('rentalAgreementSettings', INITIAL_RENTAL_AGREEMENT_SETTINGS);
    const [pointsSettings] = useLocalStorage<PointsSettings>('pointsSettings', INITIAL_POINTS_SETTINGS);


    const handleNavigation = (page: Page) => {
        setCurrentPage(page);
        setSelectedPropertyId(null); // Reset selected property on page change
        window.scrollTo(0, 0);
    };
    
    const handleSelectProperty = (id: string) => {
        setSelectedPropertyId(id);
        window.scrollTo(0, 0);
    };
    
    const handleViewingRequestSubmit = (data: Omit<ViewingRequest, 'id' | 'requestDate' | 'status'>) => {
        const newRequest: ViewingRequest = {
            ...data,
            id: `req-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            requestDate: new Date().toISOString(),
            status: 'جديد',
        };
        setViewingRequests(prev => [newRequest, ...prev]);
    };
    
    const handleMaintenanceRequestSubmit = (data: Omit<MaintenanceRequest, 'id' | 'requestDate' | 'status' | 'problemCause' | 'solution' | 'amountPaid' | 'paymentStatus' | 'amountPaidForInspection' | 'pointsAwarded' | 'pointsDiscountApplied'>, paymentDetails?: { amount: number }): MaintenanceRequest => {
        const newRequest: MaintenanceRequest = {
            ...data,
            id: `maint-req-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            requestDate: new Date().toISOString(),
            status: 'جديد',
            paymentStatus: paymentDetails ? 'مدفوع' : 'لم يتم الدفع',
            amountPaidForInspection: paymentDetails ? paymentDetails.amount : 0,
            pointsAwarded: false,
            pointsDiscountApplied: 0
        };
        setMaintenanceRequests(prev => [newRequest, ...prev]);
        return newRequest;
    };

    const handleRentalSubmit = (property: Property, tenantData: { userName: string, userPhone: string }, paymentData: { paymentMethod: string }): RentalAgreement => {
        // 1. Create a new rental agreement
        const newAgreement: RentalAgreement = {
            id: `rent-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            propertyId: property.id,
            propertyName: property.title,
            tenantName: tenantData.userName,
            tenantPhone: tenantData.userPhone,
            amountPaid: property.price + property.commission,
            paymentMethod: paymentData.paymentMethod,
            rentalDate: new Date().toISOString(),
        };
        setRentalAgreements(prev => [newAgreement, ...prev]);

        // 2. Update the property status to 'مؤجر'
        setProperties(prev => prev.map(p => p.id === property.id ? { ...p, status: 'مؤجر' } : p));
        
        return newAgreement;
    };

    const handleEmergencyMaintenanceRequestSubmit = (data: Omit<EmergencyMaintenanceRequest, 'id' | 'requestDate' | 'status'>) => {
        const newRequest: EmergencyMaintenanceRequest = {
            ...data,
            id: `em-req-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            requestDate: new Date().toISOString(),
            status: 'جديد',
        };
        setEmergencyMaintenanceRequests(prev => [newRequest, ...prev]);
    };

    const handleReviewSubmit = (data: Omit<Review, 'id' | 'createdAt'>) => {
        const newReview: Review = {
            ...data,
            id: `rev-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            createdAt: new Date().toISOString(),
        };
        setReviews(prev => [newReview, ...prev]);
    };

    const renderPage = () => {
        if (selectedPropertyId) {
            const property = properties.find(p => p.id === selectedPropertyId);
            if (property) {
                return <PropertyDetailsPage 
                            property={property} 
                            onBack={() => setSelectedPropertyId(null)}
                            onSelectProperty={handleSelectProperty}
                            onNavigate={handleNavigation}
                            onShowAgreement={(agreement, prop) => { /* Placeholder */ }}
                        />;
            }
        }
        switch (currentPage) {
            case 'rentals':
                return <RentalsPage onSelectProperty={handleSelectProperty} />;
            case 'maintenance':
                return <MaintenancePage 
                            onNavigate={handleNavigation}
                        />;
            case 'home':
            default:
                return <HomePage onNavigate={handleNavigation} />;
        }
    };

    return (
        <>
            <Header currentPage={currentPage} onNavigate={handleNavigation} />
            <main>
                {renderPage()}
            </main>
            {/* Could add a Footer component here later */}
        </>
    );
};

export default ClientApp;
