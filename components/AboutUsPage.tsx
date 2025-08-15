import React from 'react';
import { AboutUsSettings, SiteSettings } from '../types';
import { PhoneIcon, BuildingOffice2Icon, WrenchScrewdriverIcon, InformationCircleIcon } from './icons';

interface AboutUsPageProps {
  aboutUsSettings: AboutUsSettings;
  siteSettings: SiteSettings;
}

const ContactCard: React.FC<{ icon: React.ReactNode; title: string; phone: string }> = ({ icon, title, phone }) => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-transform duration-300">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-4 ring-4 ring-indigo-50">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">للتواصل المباشر، يرجى الاتصال على الرقم:</p>
        <a href={`tel:${phone}`} className="flex items-center justify-center gap-2 text-2xl font-bold text-indigo-600 tracking-wider dir-ltr">
            <PhoneIcon className="w-6 h-6"/>
            <span>{phone}</span>
        </a>
    </div>
);


const AboutUsPage: React.FC<AboutUsPageProps> = ({ aboutUsSettings, siteSettings }) => {
  const { imageUrl, aboutText, realEstatePhone, maintenancePhone } = aboutUsSettings;

  return (
    <div className="animate-fade-in bg-gray-50">
        {/* Hero Section */}
        <div className="relative bg-gray-800 py-24 sm:py-32">
            <img
                src={imageUrl}
                alt="About us background"
                className="absolute inset-0 h-full w-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
            <div className="relative container mx-auto px-4 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                    {siteSettings.aboutPageTitle}
                </h1>
            </div>
        </div>

        <div className="bg-gray-50">
            <div className="container mx-auto px-4 py-16 sm:py-24">
                <div className="max-w-4xl mx-auto">
                    {/* About Text */}
                    <div className="bg-white p-8 md:p-10 rounded-2xl shadow-lg border border-gray-200 mb-16">
                        <div className="flex items-center gap-3 mb-4">
                            <InformationCircleIcon className="w-8 h-8 text-indigo-500" />
                            <h2 className="text-3xl font-bold text-gray-900">من نحن</h2>
                        </div>
                        <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                            {aboutText}
                        </p>
                    </div>

                    {/* Contact Section */}
                    <div className="text-center mb-12">
                         <h2 className="text-3xl font-bold text-gray-900">تواصل معنا</h2>
                         <p className="mt-3 text-lg text-gray-600">فريقنا جاهز لخدمتكم والإجابة على استفساراتكم.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <ContactCard 
                            icon={<BuildingOffice2Icon className="w-8 h-8 text-indigo-600" />}
                            title="إدارة العقارات"
                            phone={realEstatePhone}
                        />
                        <ContactCard 
                            icon={<WrenchScrewdriverIcon className="w-8 h-8 text-indigo-600" />}
                            title="قسم الصيانة"
                            phone={maintenancePhone}
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default AboutUsPage;