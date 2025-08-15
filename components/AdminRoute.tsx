

import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminPage from './AdminPage';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { INITIAL_PROPERTIES, INITIAL_SITE_SETTINGS, INITIAL_AD_SETTINGS, INITIAL_VIEWING_REQUESTS, INITIAL_MAINTENANCE_CATEGORIES, INITIAL_ABOUT_US_SETTINGS, INITIAL_MAINTENANCE_REQUESTS, INITIAL_TECHNICIANS, INITIAL_REVIEWS, INITIAL_VIEWING_CONFIRMATION_SETTINGS, INITIAL_MAINTENANCE_CONFIRMATION_SETTINGS } from '../data/initialData';
import { Property, SiteSettings, AdvertisementSettings, ViewingRequest, MaintenanceCategory, AboutUsSettings, MaintenanceRequest, Technician, Review, ViewingConfirmationSettings, MaintenanceConfirmationSettings } from '../types';
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
    
    const newRequestCount = viewingRequests.filter(r => r.status === 'جديد').length + maintenanceRequests.filter(r => r.status === 'جديد').length;

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
            <AdminPage 
                properties={properties}
                setProperties={setProperties}
                maintenanceCategories={maintenanceCategories}
                setMaintenanceCategories={setMaintenanceCategories}
                technicians={technicians}
                setTechnicians={setTechnicians}
                siteSettings={siteSettings}
                setSiteSettings={setSiteSettings}
                adSettings={adSettings}
                setAdSettings={setAdSettings}
                viewingRequests={viewingRequests}
                setViewingRequests={setViewingRequests}
                maintenanceRequests={maintenanceRequests} 
                setMaintenanceRequests={setMaintenanceRequests}
                aboutUsSettings={aboutUsSettings}
                setAboutUsSettings={setAboutUsSettings}
                reviews={reviews}
                setReviews={setReviews}
                viewingConfirmationSettings={viewingConfirmationSettings}
                setViewingConfirmationSettings={setViewingConfirmationSettings}
                maintenanceConfirmationSettings={maintenanceConfirmationSettings}
                setMaintenanceConfirmationSettings={setMaintenanceConfirmationSettings}
            />
        </AdminLayout>
    );
};

export default AdminRoute;