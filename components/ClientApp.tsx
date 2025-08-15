

import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { INITIAL_PROPERTIES, INITIAL_SITE_SETTINGS, INITIAL_AD_SETTINGS, INITIAL_VIEWING_REQUESTS, INITIAL_MAINTENANCE_CATEGORIES, INITIAL_MAINTENANCE_REQUESTS, INITIAL_TECHNICIANS, INITIAL_REVIEWS, INITIAL_VIEWING_CONFIRMATION_SETTINGS, INITIAL_MAINTENANCE_CONFIRMATION_SETTINGS } from '../data/initialData';
import { Property, SiteSettings, AdvertisementSettings, Page, ViewingRequest, MaintenanceCategory, MaintenanceRequest, Technician, Review, ViewingConfirmationSettings, MaintenanceConfirmationSettings } from '../types';
import Header from './Header';
import HomePage from './HomePage';
import RentalsPage from './RentalsPage';
import MaintenancePage from './MaintenancePage';
import PropertyDetailsPage from './PropertyDetailsPage';

const ClientApp: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

    // Data hooks
    const [properties] = useLocalStorage<Property[]>('properties', INITIAL_PROPERTIES);
    const [maintenanceCategories] = useLocalStorage<MaintenanceCategory[]>('maintenanceCategories', INITIAL_MAINTENANCE_CATEGORIES);
    const [technicians] = useLocalStorage<Technician[]>('technicians', INITIAL_TECHNICIANS);
    const [siteSettings] = useLocalStorage<SiteSettings>('siteSettings', INITIAL_SITE_SETTINGS);
    const [adSettings] = useLocalStorage<AdvertisementSettings>('adSettings', INITIAL_AD_SETTINGS);
    const [viewingRequests, setViewingRequests] = useLocalStorage<ViewingRequest[]>('viewingRequests', INITIAL_VIEWING_REQUESTS);
    const [maintenanceRequests, setMaintenanceRequests] = useLocalStorage<MaintenanceRequest[]>('maintenanceRequests', INITIAL_MAINTENANCE_REQUESTS);
    const [reviews, setReviews] = useLocalStorage<Review[]>('reviews', INITIAL_REVIEWS);
    const [viewingConfirmationSettings] = useLocalStorage<ViewingConfirmationSettings>('viewingConfirmationSettings', INITIAL_VIEWING_CONFIRMATION_SETTINGS);
    const [maintenanceConfirmationSettings] = useLocalStorage<MaintenanceConfirmationSettings>('maintenanceConfirmationSettings', INITIAL_MAINTENANCE_CONFIRMATION_SETTINGS);


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
    
    const handleMaintenanceRequestSubmit = (data: Omit<MaintenanceRequest, 'id' | 'requestDate' | 'status' | 'problemCause' | 'solution' | 'amountPaid'>): MaintenanceRequest => {
        const newRequest: MaintenanceRequest = {
            ...data,
            id: `maint-req-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            requestDate: new Date().toISOString(),
            status: 'جديد',
        };
        setMaintenanceRequests(prev => [newRequest, ...prev]);
        return newRequest;
    };

    const handleReviewSubmit = (data: Omit<Review, 'id' | 'createdAt'>) => {
        const newReview: Review = {
            ...data,
            id: `rev-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            createdAt: new Date().toISOString(),
        };
        setReviews(prev => [newReview, ...prev]);
    };

    const newRequestCount = viewingRequests.filter(r => r.status === 'جديد').length + maintenanceRequests.filter(r => r.status === 'جديد').length;

    const renderPage = () => {
        if (selectedPropertyId) {
            const property = properties.find(p => p.id === selectedPropertyId);
            if (property) {
                return <PropertyDetailsPage 
                            property={property} 
                            onBack={() => setSelectedPropertyId(null)}
                            onViewingRequestSubmit={handleViewingRequestSubmit}
                            reviews={reviews}
                            onReviewSubmit={handleReviewSubmit}
                            maintenanceCategories={maintenanceCategories}
                            onNavigate={handleNavigation}
                            viewingConfirmationSettings={viewingConfirmationSettings}
                        />;
            }
        }
        switch (currentPage) {
            case 'rentals':
                return <RentalsPage properties={properties} onSelectProperty={handleSelectProperty} adSettings={adSettings} siteSettings={siteSettings} />;
            case 'maintenance':
                return <MaintenancePage 
                            maintenanceCategories={maintenanceCategories} 
                            technicians={technicians} 
                            adSettings={adSettings} 
                            siteSettings={siteSettings} 
                            onMaintenanceRequestSubmit={handleMaintenanceRequestSubmit} 
                            reviews={reviews}
                            onReviewSubmit={handleReviewSubmit}
                            maintenanceConfirmationSettings={maintenanceConfirmationSettings}
                            onNavigate={handleNavigation}
                            maintenanceRequests={maintenanceRequests}
                        />;
            case 'home':
            default:
                return <HomePage onNavigate={handleNavigation} siteSettings={siteSettings} adSettings={adSettings} />;
        }
    };

    return (
        <>
            <Header currentPage={currentPage} onNavigate={handleNavigation} siteSettings={siteSettings} newRequestCount={newRequestCount} />
            <main>
                {renderPage()}
            </main>
            {/* Could add a Footer component here later */}
        </>
    );
};

export default ClientApp;