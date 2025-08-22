import { Part } from '@google/ai';

export interface CommonIssue {
  id: string;
  name: string;
  warrantyDays: number;
  minCost: number;
  maxCost: number;
  iconName?: CommonIssueIconName;
}

export interface MaintenanceAnalysis {
  category: string;
  summary: string;
  urgency: 'منخفضة' | 'متوسطة' | 'عالية' | 'طارئة';
  suggested_technician: string;
  suggestion_reason: string;
  identified_issue?: string;
  estimated_cost_range: string;
  potential_parts?: string[];
  safety_warnings?: string[];
}

export interface MaintenanceAdvice {
  safety_tips: string[];
  simple_checks: string[];
  things_to_avoid: string[];
}

export interface ChatMessage {
    role: 'user' | 'model';
    parts: Part[];
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
  nationality: string;
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
  latitude: number;
  longitude: number;
  imageUrls: string[];
  videoUrl?: string;
  description: string;
  area: number; // in square meters
  bedrooms?: number;
  bathrooms?: number;
  commission: number;
  createdAt: string; // ISO date string
  status: PropertyStatus;
}

export interface NeighborhoodInfo {
  summary: string;
  lifestyle: string;
  services: string[];
  transportation: string[];
}

export const MaintenanceFeatureIconNames = ['ShieldCheckIcon', 'LockClosedIcon', 'ChatBubbleLeftEllipsisIcon', 'TagIcon', 'ReceiptPercentIcon', 'ArrowUturnLeftIcon', 'WrenchScrewdriverIcon', 'StarIcon', 'CheckCircleIcon'] as const;
export type MaintenanceFeatureIconName = typeof MaintenanceFeatureIconNames[number];

export const CommonIssueIconNames = ['DropletIcon', 'ExclamationCircleIcon', 'FireIcon', 'CogIcon', 'ArrowDownCircleIcon', 'PowerIcon', 'SunIcon', 'LightBulbIcon', 'SnowflakeIcon', 'SpeakerWaveIcon', 'AdjustmentsHorizontalIcon', 'KeyIcon', 'CubeIcon', 'PaintBrushIcon', 'SparklesIcon', 'BuildingOffice2Icon', 'WrenchScrewdriverIcon', 'BugIcon', 'TruckIcon', 'QuestionMarkCircleIcon'] as const;
export type CommonIssueIconName = (typeof CommonIssueIconNames)[number];


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
  marketplaceEnabled: boolean; // Admin toggle for the new feature
}

export interface AboutUsSettings {
    imageUrl: string; // data URL or external
    aboutText: string;
    realEstatePhone: string;
    maintenancePhone: string;
}

// User type
export interface User {
  id: string;
  name: string;
  phone: string;
  password?: string; // Should be handled securely on a backend
  favoritePropertyIds: string[];
  points: number;
  referralCode: string;
  referredByCode?: string;
}

// Moved from App.tsx to be reusable
export type Page = 'home' | 'rentals' | 'maintenance' | 'admin' | 'login' | 'about' | 'register' | 'profile' | 'marketplace';
export type AdminTab = 'requests' | 'reviews' | 'employees' | 'content' | 'settings' | 'reports' | 'chatbot' | 'financials' | 'users' | 'marketplace';
export type ProfileTab = 'profile' | 'maintenance' | 'viewings' | 'favorites' | 'contracts' | 'designAssistant';


export interface AdvertisementSettings {
    imageUrl: string; // data URL
    linkUrl: string;
    displayPages: Page[];
    isEnabled: boolean;
}

export interface ViewingRequest {
  id: string; // unique ID for the request
  userId?: string; // Link to user
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
  userId?: string; // Link to user
  analysis: MaintenanceAnalysis;
  userName: string;
  userPhone: string;
  userEmail?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  requestDate: string; // ISO date string
  status: 'جديد' | 'قيد التنفيذ' | 'مكتمل' | 'ملغي';
  paymentStatus: 'لم يتم الدفع' | 'مدفوع';
  amountPaidForInspection?: number;
  assignedTechnicianId?: string | null;
  scheduledDate?: string | null; // ISO date string for the scheduled day
  problemCause?: string;
  solution?: string;
  amountPaid?: number;
  completedAt?: string; // ISO date string
  pointsAwarded?: boolean;
  pointsDiscountApplied?: number;
}

export interface RentalAgreement {
  id: string;
  userId?: string; // Link to user
  propertyId: string;
  propertyName: string;
  tenantName: string;
  tenantPhone: string;
  amountPaid: number;
  paymentMethod: string;
  rentalDate: string; // ISO date string
  pointsAwarded?: boolean;
}


export interface EmergencyService {
    id: string;
    name: string;
    description: string;
    inspectionFee: number;
}

export interface EmergencyMaintenanceRequest {
    id: string;
    userId?: string; // Link to user
    serviceId: string;
    serviceName: string;
    userPhone: string;
    requestDate: string; // ISO date string
    status: 'جديد' | 'تم التواصل' | 'مكتمل';
}


export interface AIPropertySearchResult {
  propertyId: string;
  reason: string;
}

export interface Review {
  id: string;
  userId?: string; // Link to user
  type: 'technician' | 'property';
  targetId: string; // ID of the rated technician or property
  targetName: string; // Name of the rated technician or property title
  userName: string;
  userPhone?: string;
  rating: number; // 1-5 scale
  comment: string;
  createdAt: string; // ISO date string
  pointsAwarded?: boolean;
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

export interface ChatbotSettings {
  isEnabled: boolean;
  greetingMessage: string;
  companyInfo: string;
  servicesSummary: string;
  howToRent: string;
  howToRequestMaintenance: string;
  realEstatePhone: string;
  maintenancePhone: string;
  fallbackMessage: string;
}


// AI Feature Types
export interface ReviewSummary {
  positive_points: string[];
  negative_points: string[];
  overall_summary: string;
}

export interface PropertyComparisonPoint {
    feature: string;
    details: {
        property_title: string;
        description: string;
    }[];
}

export interface PropertyComparison {
  comparison_points: PropertyComparisonPoint[];
  recommendation: string;
  recommendation_reason: string;
}

export interface RentalAgreementSettings {
  contractTerms: string[];
  companySignatoryName: string;
  companySignatoryTitle: string;
}

export interface PointsSettings {
    isEnabled: boolean;
    pointsPerRental: number;
    pointsPerReview: number;
    pointsPerMaintenanceRequest: number;
    pointValueInSAR: number;
    pointsPerReferral: number;
}

// Marketplace Types
export const MarketplaceIconNames = ['ComputerDesktopIcon', 'SunIcon', 'DropletIcon'] as const;
export type MarketplaceIconName = typeof MarketplaceIconNames[number];

export interface MarketplaceServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: MarketplaceIconName;
}

export interface MarketplaceServiceProvider {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  phone: string;
  logoUrl: string; // data URL
}

export interface MarketplaceBooking {
  id: string;
  userId?: string;
  serviceProviderId: string;
  serviceProviderName: string;
  userName: string;
  userPhone: string;
  requestDate: string; // ISO date string
  status: 'جديد' | 'تم التواصل' | 'مكتمل' | 'ملغي';
}

export interface MaintenanceJobPost {
  id: string;
  userId?: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  imageUrls: string[]; // data URLs
  address: string;
  latitude?: number;
  longitude?: number;
  requestDate: string; // ISO date string
  status: 'open' | 'assigned' | 'completed' | 'cancelled';
  acceptedOfferId?: string;
}

export interface MaintenanceOffer {
  id: string;
  jobPostId: string;
  technicianId: string;
  technicianName: string;
  technicianRating: number;
  technicianImageUrl: string;
  price: number;
  notes: string;
  createdAt: string; // ISO date string
  status: 'pending' | 'accepted' | 'rejected';
}

export interface MaintenanceLog {
  id: string;
  propertyId: string;
  date: string; // ISO date string
  description: string;
  technicianName?: string;
}

export interface Database {
  users: User[];
  properties: Property[];
  maintenanceCategories: MaintenanceCategory[];
  technicians: Technician[];
  siteSettings: SiteSettings;
  adSettings: AdvertisementSettings;
  viewingRequests: ViewingRequest[];
  maintenanceRequests: MaintenanceRequest[];
  aboutUsSettings: AboutUsSettings;
  reviews: Review[];
  viewingConfirmationSettings: ViewingConfirmationSettings;
  maintenanceConfirmationSettings: MaintenanceConfirmationSettings;
  chatbotSettings: ChatbotSettings;
  emergencyServices: EmergencyService[];
  emergencyMaintenanceRequests: EmergencyMaintenanceRequest[];
  rentalAgreements: RentalAgreement[];
  rentalAgreementSettings: RentalAgreementSettings;
  pointsSettings: PointsSettings;
  marketplaceCategories: MarketplaceServiceCategory[];
  marketplaceServiceProviders: MarketplaceServiceProvider[];
  marketplaceBookings: MarketplaceBooking[];
  maintenanceJobPosts: MaintenanceJobPost[];
  maintenanceOffers: MaintenanceOffer[];
  maintenanceLogs: MaintenanceLog[];
}