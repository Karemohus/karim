

export interface CommonIssue {
  id: string;
  name: string;
  warrantyDays: number;
}

export interface MaintenanceAnalysis {
  category: string;
  summary: string;
  urgency: 'منخفضة' | 'متوسطة' | 'عالية' | 'طارئة';
  suggested_technician: string;
  suggestion_reason?: string;
  identified_issue?: string;
  // AI Enhancement Fields
  estimated_cost_range?: string; // e.g., "150-250 ريال"
  potential_parts?: string[]; // e.g., ["صمام جديد", "شريط تفلون"]
  safety_warnings?: string[]; // e.g., ["افصل التيار الكهربائي قبل أي محاولة فحص"]
  photo_recommendation?: string; // AI Suggestion for a better photo
}

export interface MaintenanceCategory {
  id: string;
  name:string;
  description: string;
  commonIssues: CommonIssue[];
  inspectionFee: number;
}

export interface Technician {
  id:string;
  name: string;
  specialization: string;
  phone: string;
  isAvailable: boolean;
  experienceYears: number;
  rating: number; // 1-5 scale
  skills: string[];
  bio: string;
  imageUrl: string; // data URL
  region: string;
}

export type PropertyType = 'سكني' | 'تجاري';
export type PropertyStatus = 'متاح' | 'مؤجر';

export interface Property {
  id: string; // Using string for UUID
  title: string;
  type: PropertyType;
  price: number;
  location: string;
  imageUrls: string[];
  description: string;
  area: number; // in square meters
  bedrooms?: number;
  bathrooms?: number;
  commission: number;
  createdAt: string; // ISO date string
  status: PropertyStatus;
}

export const MaintenanceFeatureIconNames = ['ShieldCheckIcon', 'LockClosedIcon', 'ChatBubbleLeftEllipsisIcon', 'TagIcon', 'ReceiptPercentIcon', 'ArrowUturnLeftIcon', 'WrenchScrewdriverIcon', 'StarIcon', 'CheckCircleIcon'] as const;
export type MaintenanceFeatureIconName = typeof MaintenanceFeatureIconNames[number];

export interface MaintenanceFeature {
  id: string;
  icon: MaintenanceFeatureIconName;
  title: string;
  description: string;
}

export interface SiteSettings {
  siteName: string;
  logoUrl: string; // data URL
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string; // data URL or external URL
  rentalsPageTitle: string;
  maintenancePageTitle: string;
  maintenancePageSubtitle: string;
  maintenancePageImageUrl: string;
  aboutPageTitle: string;
  maintenanceFeatures: MaintenanceFeature[];
}

export interface AboutUsSettings {
    imageUrl: string; // data URL or external
    aboutText: string;
    realEstatePhone: string;
    maintenancePhone: string;
}

// Moved from App.tsx to be reusable
export type Page = 'home' | 'rentals' | 'maintenance' | 'admin' | 'login' | 'about';
export type AdminTab = 'requests' | 'reviews' | 'employees' | 'content' | 'settings' | 'reports';


export interface AdvertisementSettings {
    imageUrl: string; // data URL
    linkUrl: string;
    displayPages: Page[];
    isEnabled: boolean;
}

export interface ViewingRequest {
  id: string; // unique ID for the request
  propertyId: string;
  propertyName: string;
  userName: string;
  userPhone: string;
  userEmail?: string;
  preferredTime: string;
  requestDate: string; // ISO date string
  status: 'جديد' | 'تم التواصل' | 'مكتمل';
}

export interface MaintenanceRequest {
  id: string;
  analysis: MaintenanceAnalysis;
  userName: string;
  userPhone: string;
  userEmail?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  requestDate: string; // ISO date string
  status: 'جديد' | 'قيد التنفيذ' | 'مكتمل' | 'ملغي';
  // New optional fields for completion
  problemCause?: string;
  solution?: string;
  amountPaid?: number;
  completedAt?: string; // ISO date string
}

export interface AIPropertySearchResult {
  propertyId: string;
  reason: string;
}

export interface Review {
  id: string;
  type: 'technician' | 'property';
  targetId: string; // ID of the rated technician or property
  targetName: string; // Name of the rated technician or property title
  userName: string;
  userPhone?: string;
  rating: number; // 1-5 scale
  comment: string;
  createdAt: string; // ISO date string
}

export interface ViewingConfirmationSettings {
  isEnabled: boolean;
  title: string;
  subtitle: string;
  imageUrl: string; // data URL or external URL
  primaryButtonText: string;
  primaryButtonLink: string; // Can be a page name like 'maintenance' or a full URL
  showMaintenanceServices: boolean;
  featuredCategoryIds: string[];
}

export interface MaintenanceConfirmationSettings {
  isEnabled: boolean;
  title: string;
  subtitle: string;
  imageUrl: string; // data URL or external URL
  primaryButtonText: string;
  primaryButtonLink: string; // Can be a page name like 'rentals' or a full URL
  secondaryButtonText: string;
  secondaryButtonLink: string;
  showPropertySections: boolean;
}