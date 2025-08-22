import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { Database } from '../types';
import { loadDatabase, saveDatabase } from '../services/database';

type Setters = {
    [K in keyof Database as `set${Capitalize<K>}`]: (value: React.SetStateAction<Database[K]>) => void;
};

interface DataContextType extends Setters {
    db: Database;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [db, setDb] = useState<Database>(loadDatabase);

    useEffect(() => {
        saveDatabase(db);
    }, [db]);

    const createSetter = <K extends keyof Database>(key: K) => 
        useCallback((value: React.SetStateAction<Database[K]>) => {
            setDb(prevDb => {
                const prevValue = prevDb[key];
                const newValue = typeof value === 'function'
                    ? (value as (prevState: Database[K]) => Database[K])(prevValue)
                    : value;
                return { ...prevDb, [key]: newValue };
            });
        }, [key]);
        
    const value: DataContextType = {
        db,
        setUsers: createSetter('users'),
        setProperties: createSetter('properties'),
        setMaintenanceCategories: createSetter('maintenanceCategories'),
        setTechnicians: createSetter('technicians'),
        setSiteSettings: createSetter('siteSettings'),
        setAdSettings: createSetter('adSettings'),
        setViewingRequests: createSetter('viewingRequests'),
        setMaintenanceRequests: createSetter('maintenanceRequests'),
        setAboutUsSettings: createSetter('aboutUsSettings'),
        setReviews: createSetter('reviews'),
        setViewingConfirmationSettings: createSetter('viewingConfirmationSettings'),
        setMaintenanceConfirmationSettings: createSetter('maintenanceConfirmationSettings'),
        setChatbotSettings: createSetter('chatbotSettings'),
        setEmergencyServices: createSetter('emergencyServices'),
        setEmergencyMaintenanceRequests: createSetter('emergencyMaintenanceRequests'),
        setRentalAgreements: createSetter('rentalAgreements'),
        setRentalAgreementSettings: createSetter('rentalAgreementSettings'),
        setPointsSettings: createSetter('pointsSettings'),
        setMarketplaceCategories: createSetter('marketplaceCategories'),
        setMarketplaceServiceProviders: createSetter('marketplaceServiceProviders'),
        setMarketplaceBookings: createSetter('marketplaceBookings'),
        setMaintenanceJobPosts: createSetter('maintenanceJobPosts'),
        setMaintenanceOffers: createSetter('maintenanceOffers'),
        setMaintenanceLogs: createSetter('maintenanceLogs'),
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};