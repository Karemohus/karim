import { Property, SiteSettings, AdvertisementSettings, ViewingRequest, MaintenanceCategory, AboutUsSettings, MaintenanceRequest, Technician, Review, ViewingConfirmationSettings, MaintenanceConfirmationSettings, ChatbotSettings, EmergencyService, EmergencyMaintenanceRequest, RentalAgreement, RentalAgreementSettings, User, PointsSettings, Database, MarketplaceServiceCategory, MarketplaceServiceProvider, MarketplaceBooking, MaintenanceLog } from '../types';

export const INITIAL_USERS: User[] = [
    {
        id: 'user-1',
        name: 'عبدالله',
        phone: '0512345678',
        password: 'password123', // In a real app, this should be hashed.
        favoritePropertyIds: ['prop-1', 'prop-3'],
        points: 150,
        referralCode: 'ABDULLAH123',
    }
];

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    title: 'شقة فاخرة بإطلالة على المدينة',
    type: 'سكني',
    price: 5000,
    location: 'الرياض، حي العليا',
    latitude: 24.7056,
    longitude: 46.6823,
    imageUrls: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560185893-a55d88p-40d0-40e9-a5d88p-1456?q=80&w=1974&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=2070&auto=format&fit=crop'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=y9j-BL5ocW8',
    description: 'شقة عصرية تقع في قلب حي العليا بالرياض، تتميز بتصميم داخلي أنيق وتشطيبات عالية الجودة. توفر إطلالات بانورامية خلابة على أفق المدينة من خلال نوافذها الكبيرة. مثالية للمحترفين والعائلات الصغيرة التي تبحث عن الفخامة والراحة.',
    area: 150,
    bedrooms: 3,
    bathrooms: 2,
    commission: 500,
    createdAt: new Date().toISOString(),
    status: 'متاح',
  },
  {
    id: 'prop-2',
    title: 'مكتب تجاري حديث في مركز الأعمال',
    type: 'تجاري',
    price: 8000,
    location: 'جدة، طريق الملك عبد العزيز',
    latitude: 21.5793,
    longitude: 39.1611,
    imageUrls: [
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1784&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2232&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop',
    ],
    description: 'مساحة مكتبية ملهمة تقع في مبنى مرموق على طريق الملك عبد العزيز في جدة. مصممة لتعزيز الإنتاجية والإبداع، مع مناطق عمل مفتوحة، غرف اجتماعات مجهزة بالكامل، ومنطقة استقبال احترافية. موقع استراتيجي يضمن سهولة الوصول.',
    area: 200,
    commission: 800,
    createdAt: new Date().toISOString(),
    status: 'متاح',
  },
  {
    id: 'prop-3',
    title: 'فيلا عائلية مع حديقة خاصة',
    type: 'سكني',
    price: 12000,
    location: 'الدمام، حي الشاطئ',
    latitude: 26.4682,
    longitude: 50.1195,
    imageUrls: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1974&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
    ],
    description: 'فيلا فسيحة في حي الشاطئ الراقي بالدمام، توفر مساحات معيشة رحبة وحديقة خاصة مثالية للتجمعات العائلية. تحتوي على مجلس كبير، صالة طعام، ومطبخ حديث، بالإضافة إلى غرف نوم ماستر. تمثل الخيار الأمثل للعائلات الباحثة عن الخصوصية والرفاهية.',
    area: 350,
    bedrooms: 5,
    bathrooms: 4,
    commission: 1200,
    createdAt: new Date().toISOString(),
    status: 'متاح',
  },
];

export const INITIAL_TECHNICIANS: Technician[] = [
  { id: 'tech-1', name: 'أحمد المصري', nationality: 'مصري', specialization: 'سباكة', phone: '0501112221', isAvailable: true, experienceYears: 12, rating: 4.8, skills: ['كشف تسريبات', 'تركيب سخانات', 'تمديد مواسير'], bio: 'سباك خبير متخصص في حلول السباكة السكنية والتجارية المعقدة.', imageUrl: '', region: 'شمال الرياض' },
  { id: 'tech-2', name: 'خالد عبد الله', nationality: 'سعودي', specialization: 'كهرباء', phone: '0501112222', isAvailable: true, experienceYears: 8, rating: 4.6, skills: ['تركيب إضاءة', 'حل مشاكل انقطاع التيار', 'صيانة لوحات التوزيع'], bio: 'كهربائي معتمد، أضمن لك الأمان والكفاءة في جميع الأعمال الكهربائية.', imageUrl: '', region: 'جنوب الرياض' },
  { id: 'tech-3', name: 'يوسف شاهين', nationality: 'مصري', specialization: 'تكييف وتبريد', phone: '0501112223', isAvailable: false, experienceYears: 15, rating: 4.9, skills: ['صيانة المكيفات المركزية', 'تعبئة فريون', 'تنظيف مجاري الهواء'], bio: 'خبير تكييف وتبريد بخبرة طويلة في جميع أنواع الوحدات.', imageUrl: '', region: 'الدمام' },
  { id: 'tech-4', name: 'محمد كريم', nationality: 'باكستاني', specialization: 'نجارة', phone: '0501112224', isAvailable: true, experienceYears: 7, rating: 4.5, skills: ['تركيب أبواب', 'تصنيع خزائن', 'إصلاح أثاث'], bio: 'نجار محترف للأعمال المخصصة والإصلاحات الدقيقة.', imageUrl: '', region: 'وسط جدة' },
  { id: 'tech-5', name: 'سعيد الجابري', nationality: 'سعودي', specialization: 'سباكة', phone: '0501112225', isAvailable: true, experienceYears: 5, rating: 4.4, skills: ['تسليك مجاري', 'تركيب أدوات صحية', 'صيانة عامة'], bio: 'أقدم خدمات سباكة سريعة وموثوقة لجميع احتياجاتك.', imageUrl: '', region: 'شرق الرياض' },
  { id: 'tech-6', name: 'علي حسن', nationality: 'سوداني', specialization: 'كهرباء', phone: '0501112226', isAvailable: false, experienceYears: 10, rating: 4.7, skills: ['تمديدات كهربائية', 'فحص أحمال', 'تركيب أنظمة ذكية'], bio: 'متخصص في الأنظمة الكهربائية الحديثة والذكية.', imageUrl: '', region: 'شمال جدة' },
  { id: 'tech-7', name: 'محمود السيد', nationality: 'هندي', specialization: 'أعمال عامة', phone: '0501112227', isAvailable: true, experienceYears: 9, rating: 4.5, skills: ['تركيب ستائر', 'إصلاحات جبس', 'تجميع أثاث ايكيا'], bio: 'فني متعدد المهارات لجميع أعمال الصيانة العامة في المنزل.', imageUrl: '', region: 'الخبر' },
];


export const INITIAL_MAINTENANCE_CATEGORIES: MaintenanceCategory[] = [
  {
    id: 'maint-cat-1',
    name: 'سباكة',
    description: 'كل ما يتعلق بأعمال السباكة، من تسريبات المياه وتركيب الأدوات الصحية إلى صيانة السخانات.',
    commonIssues: [
      { id: 'ci-1-1', name: 'تسريب صنبور', warrantyDays: 30, minCost: 80, maxCost: 150, iconName: 'DropletIcon' },
      { id: 'ci-1-2', name: 'انسداد بالوعة', warrantyDays: 7, minCost: 100, maxCost: 200, iconName: 'ExclamationCircleIcon' },
      { id: 'ci-1-3', name: 'مشكلة في السخان', warrantyDays: 60, minCost: 150, maxCost: 350, iconName: 'FireIcon' },
      { id: 'ci-1-4', name: 'تركيب غسالة', warrantyDays: 15, minCost: 120, maxCost: 180, iconName: 'CogIcon' },
      { id: 'ci-1-5', name: 'ضعف ضغط المياه', warrantyDays: 10, minCost: 150, maxCost: 300, iconName: 'ArrowDownCircleIcon' },
    ],
    inspectionFee: 50,
  },
  {
    id: 'maint-cat-2',
    name: 'كهرباء',
    description: 'صيانة وإصلاح جميع المشاكل الكهربائية، بما في ذلك انقطاع التيار، ومشاكل الإضاءة، وتركيب الأجهزة.',
    commonIssues: [
      { id: 'ci-2-1', name: 'انقطاع التيار', warrantyDays: 15, minCost: 100, maxCost: 250, iconName: 'PowerIcon' },
      { id: 'ci-2-2', name: 'تذبذب الإضاءة', warrantyDays: 20, minCost: 120, maxCost: 280, iconName: 'SunIcon' },
      { id: 'ci-2-3', name: 'مقبس لا يعمل', warrantyDays: 30, minCost: 70, maxCost: 130, iconName: 'ExclamationCircleIcon' },
      { id: 'ci-2-4', name: 'تركيب ثريا', warrantyDays: 10, minCost: 150, maxCost: 400, iconName: 'LightBulbIcon' },
    ],
    inspectionFee: 50,
  },
  {
    id: 'maint-cat-3',
    name: 'تكييف وتبريد',
    description: 'خدمات صيانة وتنظيف وحدات التكييف، ومعالجة مشاكل التبريد والتسريبات.',
    commonIssues: [
      { id: 'ci-3-1', name: 'التكييف لا يبرد', warrantyDays: 30, minCost: 150, maxCost: 300, iconName: 'SnowflakeIcon' },
      { id: 'ci-3-2', name: 'تسريب مياه', warrantyDays: 20, minCost: 120, maxCost: 250, iconName: 'DropletIcon' },
      { id: 'ci-3-3', name: 'صوت مزعج', warrantyDays: 15, minCost: 100, maxCost: 280, iconName: 'SpeakerWaveIcon' },
      { id: 'ci-3-4', name: 'تنظيف فلاتر', warrantyDays: 7, minCost: 80, maxCost: 150, iconName: 'AdjustmentsHorizontalIcon' },
    ],
    inspectionFee: 75,
  },
  {
    id: 'maint-cat-4',
    name: 'نجارة',
    description: 'إصلاح وتركيب الأبواب، النوافذ، الخزائن، وجميع الأعمال الخشبية الأخرى.',
    commonIssues: [
      { id: 'ci-4-1', name: 'باب لا يغلق', warrantyDays: 30, minCost: 100, maxCost: 220, iconName: 'WrenchScrewdriverIcon' },
      { id: 'ci-4-2', name: 'تركيب قفل', warrantyDays: 45, minCost: 120, maxCost: 250, iconName: 'KeyIcon' },
      { id: 'ci-4-3', name: 'إصلاح خزانة', warrantyDays: 25, minCost: 150, maxCost: 350, iconName: 'CubeIcon' },
      { id: 'ci-4-4', name: 'تجميع أثاث', warrantyDays: 10, minCost: 200, maxCost: 500, iconName: 'CubeIcon' },
    ],
    inspectionFee: 40,
  },
  {
    id: 'maint-cat-5',
    name: 'دهان',
    description: 'أعمال الدهان الداخلي والخارجي، معالجة الرطوبة، وإصلاح تشققات الجدران.',
    commonIssues: [
      { id: 'ci-5-1', name: 'إعادة دهان غرفة', warrantyDays: 90, minCost: 500, maxCost: 1200, iconName: 'PaintBrushIcon' },
      { id: 'ci-5-2', name: 'تقشير الدهان', warrantyDays: 60, minCost: 150, maxCost: 400, iconName: 'PaintBrushIcon' },
      { id: 'ci-5-3', name: 'معالجة رطوبة', warrantyDays: 120, minCost: 250, maxCost: 600, iconName: 'PaintBrushIcon' },
    ],
    inspectionFee: 40,
  },
  {
    id: 'maint-cat-7',
    name: 'تنظيف',
    description: 'خدمات تنظيف شاملة للمنازل والمكاتب، بما في ذلك تنظيف الأرضيات، النوافذ، والمفروشات.',
    commonIssues: [
      { id: 'ci-7-1', name: 'تنظيف شقة', warrantyDays: 3, minCost: 300, maxCost: 700, iconName: 'SparklesIcon' },
      { id: 'ci-7-2', name: 'تنظيف واجهات', warrantyDays: 7, minCost: 250, maxCost: 600, iconName: 'BuildingOffice2Icon' },
      { id: 'ci-7-3', name: 'ما بعد البناء', warrantyDays: 5, minCost: 500, maxCost: 1500, iconName: 'SparklesIcon' },
      { id: 'ci-7-4', name: 'جلي بلاط', warrantyDays: 14, minCost: 400, maxCost: 1000, iconName: 'SparklesIcon' },
    ],
    inspectionFee: 0,
  },
  {
    id: 'maint-cat-8',
    name: 'مكافحة حشرات',
    description: 'حلول فعالة وآمنة للقضاء على جميع أنواع الحشرات والقوارض، مع ضمان عدم عودتها.',
    commonIssues: [
      { id: 'ci-8-1', name: 'مكافحة صراصير', warrantyDays: 90, minCost: 150, maxCost: 300, iconName: 'BugIcon' },
      { id: 'ci-8-2', name: 'مكافحة نمل أبيض', warrantyDays: 180, minCost: 400, maxCost: 1200, iconName: 'BugIcon' },
      { id: 'ci-8-3', name: 'طرد قوارض', warrantyDays: 60, minCost: 200, maxCost: 450, iconName: 'BugIcon' },
      { id: 'ci-8-4', name: 'رش مبيدات', warrantyDays: 90, minCost: 150, maxCost: 350, iconName: 'BugIcon' },
    ],
    inspectionFee: 60,
  },
  {
    id: 'maint-cat-9',
    name: 'نقل أثاث',
    description: 'خدمات نقل وتغليف الأثاث بخبرة واحترافية، مع ضمان سلامة المنقولات من الباب إلى الباب.',
    commonIssues: [
        { id: 'ci-9-1', name: 'نقل داخل المدينة', warrantyDays: 7, minCost: 400, maxCost: 1500, iconName: 'TruckIcon' },
        { id: 'ci-9-2', name: 'نقل خارج المدينة', warrantyDays: 7, minCost: 1200, maxCost: 3500, iconName: 'TruckIcon' },
        { id: 'ci-9-3', name: 'فك وتركيب', warrantyDays: 15, minCost: 250, maxCost: 500, iconName: 'CubeIcon' },
        { id: 'ci-9-4', name: 'تغليف احترافي', warrantyDays: 3, minCost: 200, maxCost: 600, iconName: 'CubeIcon' },
    ],
    inspectionFee: 0,
  },
  {
    id: 'maint-cat-6',
    name: 'أعمال عامة',
    description: 'للطلبات التي لا تندرج تحت الفئات الأخرى، مثل الإصلاحات البسيطة أو مهام الصيانة العامة.',
    commonIssues: [
        { id: 'ci-6-1', name: 'تركيب ستائر', warrantyDays: 10, minCost: 100, maxCost: 250, iconName: 'WrenchScrewdriverIcon' },
        { id: 'ci-6-2', name: 'إصلاحات متنوعة', warrantyDays: 7, minCost: 80, maxCost: 300, iconName: 'QuestionMarkCircleIcon' },
    ],
    inspectionFee: 0,
  }
];

export const INITIAL_EMERGENCY_SERVICES: EmergencyService[] = [
    { id: 'em-1', name: 'تسريب مياه كبير', description: 'تسريب مياه يتطلب تدخلاً فورياً لمنع الضرر.', inspectionFee: 150 },
    { id: 'em-2', name: 'انقطاع كامل للكهرباء', description: 'انقطاع التيار الكهربائي عن كامل الوحدة.', inspectionFee: 150 },
    { id: 'em-3', name: 'مشكلة في قفل الباب الرئيسي', description: 'عدم القدرة على فتح أو إغلاق الباب الرئيسي.', inspectionFee: 120 },
    { id: 'em-4', name: 'رائحة غاز', description: 'اشتباه بوجود تسريب غاز يتطلب فحصاً عاجلاً.', inspectionFee: 200 },
];

export const INITIAL_SITE_SETTINGS: SiteSettings = {
  siteName: 'عقار لينك',
  logoUrl: '',
  heroTitle: 'اعثر على مكانك المثالي',
  heroSubtitle: 'منصة عقار لينك هي وجهتك الأولى لاستئجار العقارات السكنية والتجارية، وطلب خدمات الصيانة الذكية بسهولة وأمان.',
  heroImageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2670&auto=format&fit=crop',
  rentalsPageTitle: 'ابحث عن عقارك المثالي',
  maintenancePageTitle: 'خدمات الصيانة الذكية',
  maintenancePageSubtitle: 'اختر القسم، صف المشكلة وأرفق صورًا، ودع الذكاء الاصطناعي يحللها لك فورًا.',
  maintenancePageImageUrl: 'https://images.unsplash.com/photo-1472224371017-08207f84aa6a?q=80&w=2070&auto=format&fit=crop',
  aboutPageTitle: 'عن عقار لينك',
  maintenanceFeatures: [
    {
      id: 'mf-1',
      icon: 'ShieldCheckIcon',
      title: 'ضمان على الخدمة',
      description: 'نضمن لك جودة العمل لمدة 7 أيام على العيب الذي تم إصلاحه لضمان رضاك التام.'
    },
    {
      id: 'mf-2',
      icon: 'LockClosedIcon',
      title: 'دفع آمن وفواتير',
      description: 'نظام دفع آمن مع حفظ للمبلغ حتى إتمام الخدمة، وإصدار فواتير رسمية وموثقة.'
    },
    {
      id: 'mf-3',
      icon: 'ChatBubbleLeftEllipsisIcon',
      title: 'مساعدك الشخصي',
      description: 'استخدم المحادثة الفورية (Chatbot) للاستفسارات السريعة والحصول على إجابات فورية عن خدماتنا وعقاراتنا.'
    },
    {
      id: 'mf-4',
      icon: 'TagIcon',
      title: 'خصومات ومكافآت',
      description: 'استفد من خصومات حصرية واجمع نقاطًا لاستخدامها في خدمات الصيانة القادمة.'
    },
    {
      id: 'mf-5',
      icon: 'ReceiptPercentIcon',
      title: 'قطع غيار موثوقة',
      description: 'نوفر قطع غيار بأسعار تنافسية مع فواتير موثقة لضمان الشفافية الكاملة ومعرفة المصدر.'
    },
    {
      id: 'mf-6',
      icon: 'ArrowUturnLeftIcon',
      title: 'سياسة إلغاء مرنة',
      description: 'سياسة واضحة تضمن حقوقك في حال عدم حل المشكلة أو الحاجة لترشيح فني آخر.'
    }
  ],
  marketplaceEnabled: false,
};

export const INITIAL_AD_SETTINGS: AdvertisementSettings = {
    imageUrl: '',
    linkUrl: '',
    displayPages: [],
    isEnabled: false,
};

export const INITIAL_ABOUT_US_SETTINGS: AboutUsSettings = {
    imageUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop',
    aboutText: 'عقار لينك هي منصة رائدة تهدف إلى تسهيل عمليات تأجير العقارات وطلب خدمات الصيانة في المملكة العربية السعودية. نحن نؤمن بأن البحث عن منزل أو طلب صيانة يجب أن يكون تجربة سهلة وموثوقة. لهذا السبب، قمنا بتطوير منصة تجمع بين أحدث التقنيات وواجهة سهلة الاستخدام لخدمة عملائنا بشكل أفضل.\n\nمهمتنا هي توفير حلول مبتكرة تلبي احتياجات المستأجرين وأصحاب العقارات على حد سواء، مع التركيز على الشفافية والجودة والكفاءة.',
    realEstatePhone: '920000001',
    maintenancePhone: '920000002',
};

export const INITIAL_CHATBOT_SETTINGS: ChatbotSettings = {
    isEnabled: true,
    greetingMessage: "أهلاً بك في عقار لينك! أنا مساعدك الشخصي. يمكنك أن تسألني عن أي شيء، مثل 'ابحث عن شقة' أو 'لدي مشكلة في السباكة'.",
    companyInfo: 'عقار لينك هي منصة رائدة تهدف إلى تسهيل عمليات تأجير العقارات وطلب خدمات الصيانة في المملكة العربية السعودية. نحن نؤمن بأن البحث عن منزل أو طلب صيانة يجب أن يكون تجربة سهلة وموثوقة.',
    servicesSummary: 'نحن نقدم منصة متكاملة لاستئجار العقارات السكنية والتجارية، وطلب خدمات الصيانة الذكية.',
    howToRent: 'يمكنك تصفح العقارات من صفحة "العقارات"، وعند إيجاد عقار مناسب، اضغط على زر "احجز معاينة الآن" في صفحة تفاصيل العقار واملأ النموذج.',
    howToRequestMaintenance: 'يمكنك الذهاب إلى صفحة "خدمات الصيانة"، اختيار الفئة، ووصف المشكلة. سيقوم مساعدنا الذكي بتحليل الطلب.',
    realEstatePhone: '920000001',
    maintenancePhone: '920000002',
    fallbackMessage: 'ليس لدي معلومات كافية حول هذا الموضوع، لكن يمكنك التواصل مع فريق الدعم على الأرقام التالية: للعقارات {realEstatePhone}، وللصيانة {maintenancePhone}.'
};

export const INITIAL_POINTS_SETTINGS: PointsSettings = {
    isEnabled: true,
    pointsPerRental: 100,
    pointsPerReview: 25,
    pointsPerMaintenanceRequest: 15,
    pointValueInSAR: 0.1, // 1 point = 0.1 SAR, so 10 points = 1 SAR
    pointsPerReferral: 50,
};


export const INITIAL_VIEWING_REQUESTS: ViewingRequest[] = [];

export const INITIAL_MAINTENANCE_REQUESTS: MaintenanceRequest[] = [];

export const INITIAL_EMERGENCY_MAINTENANCE_REQUESTS: EmergencyMaintenanceRequest[] = [];

export const INITIAL_REVIEWS: Review[] = [];

export const INITIAL_RENTAL_AGREEMENTS: RentalAgreement[] = [];

export const INITIAL_RENTAL_AGREEMENT_SETTINGS: RentalAgreementSettings = {
  companySignatoryName: 'إدارة عقار لينك',
  companySignatoryTitle: 'عن الشركة - توقيع إلكتروني معتمد',
  contractTerms: [
    'يلتزم الطرف الثاني باستخدام العين المؤجرة للغرض المحدد في العقد (سكني أو تجاري) ولا يحق له تغيير هذا الغرض.',
    'يلتزم الطرف الثاني بسداد قيمة الإيجار الشهري في موعد أقصاه اليوم الخامس من كل شهر ميلادي.',
    'يتحمل الطرف الثاني مسؤولية سداد فواتير الخدمات (الكهرباء، الماء، الإنترنت) الخاصة بالوحدة طوال مدة العقد.',
    'يلتزم الطرف الثاني بالمحافظة على الوحدة المؤجرة، ويعتبر مسؤولاً عن أي أضرار تلحق بها نتيجة سوء الاستخدام.',
    'لا يحق للطرف الثاني تأجير الوحدة من الباطن أو التنازل عنها للغير إلا بموافقة خطية من الطرف الأول.',
    'يتم تجديد العقد تلقائياً لمدة مماثلة ما لم يخطر أحد الطرفين الآخر بعدم رغبته في التجديد قبل شهرين من تاريخ انتهاء العقد.'
  ]
};

export const INITIAL_VIEWING_CONFIRMATION_SETTINGS: ViewingConfirmationSettings = {
    isEnabled: true,
    title: 'تم إرسال طلبك بنجاح!',
    subtitle: 'سنتواصل معك قريبًا لترتيب موعد المعاينة. وتذكر، نحن نقدم خدمات صيانة متكاملة لتلبية كل احتياجاتك بعد الانتقال!',
    imageUrl: '', // Empty by default
    primaryButtonText: 'اكتشف خدمات الصيانة',
    primaryButtonLink: 'maintenance',
    showMaintenanceServices: true,
    featuredCategoryIds: ['maint-cat-1', 'maint-cat-2', 'maint-cat-3', 'maint-cat-4'],
};

export const INITIAL_MAINTENANCE_CONFIRMATION_SETTINGS: MaintenanceConfirmationSettings = {
    isEnabled: true,
    title: 'تم استلام طلب الصيانة!',
    subtitle: 'سيقوم فريقنا بالتواصل معك قريبًا. في أثناء ذلك، هل تعلم أننا نوفر مجموعة مميزة من العقارات السكنية والتجارية للإيجار؟',
    imageUrl: '', // Empty by default
    primaryButtonText: 'تصفح العقارات السكنية',
    primaryButtonLink: 'rentals',
    secondaryButtonText: 'تصفح العقارات التجارية',
    secondaryButtonLink: 'rentals',
    showPropertySections: true,
};

// Marketplace Initial Data
export const INITIAL_MARKETPLACE_CATEGORIES: MarketplaceServiceCategory[] = [
    { id: 'mp-cat-1', name: 'مغاسل ملابس', description: 'خدمات غسيل وكي الملابس والسجاد.', icon: 'SunIcon' },
    { id: 'mp-cat-2', name: 'تنظيف المنازل', description: 'خدمات تنظيف شاملة للشقق والفلل.', icon: 'ComputerDesktopIcon' },
    { id: 'mp-cat-3', name: 'توصيل مياه', description: 'توصيل عبوات المياه المعبأة للمنازل.', icon: 'DropletIcon' },
];

export const INITIAL_MARKETPLACE_PROVIDERS: MarketplaceServiceProvider[] = [
    { id: 'mp-prov-1', name: 'مغسلة البياض الناصع', categoryId: 'mp-cat-1', description: 'نعتني بملابسكم بأحدث التقنيات. خدمة استلام وتوصيل.', phone: '920011111', logoUrl: '' },
    { id: 'mp-prov-2', name: 'الرهدن للملابس', categoryId: 'mp-cat-1', description: 'أكثر من 50 عاماً من الخبرة في العناية بالملابس.', phone: '920022222', logoUrl: '' },
    { id: 'mp-prov-3', name: 'شركة النظافة المثالية', categoryId: 'mp-cat-2', description: 'عمالة مدربة ومواد آمنة لتنظيف منزلك بالكامل.', phone: '920033333', logoUrl: '' },
    { id: 'mp-prov-4', name: 'مياه نوفا', categoryId: 'mp-cat-3', description: 'توصيل سريع لعبوات مياه نوفا الصحية.', phone: '920044444', logoUrl: '' },
];

export const INITIAL_MARKETPLACE_BOOKINGS: MarketplaceBooking[] = [];

export const INITIAL_MAINTENANCE_LOGS: MaintenanceLog[] = [
    { 
      id: 'log-1', 
      propertyId: 'prop-1', 
      date: '2024-05-20T10:00:00Z', 
      description: 'صيانة دورية للمكيفات وتنظيف الفلاتر.', 
      technicianName: 'يوسف شاهين' 
    },
    { 
      id: 'log-2', 
      propertyId: 'prop-1', 
      date: '2024-02-15T14:30:00Z', 
      description: 'إصلاح تسريب في صنبور المطبخ.', 
      technicianName: 'أحمد المصري' 
    },
];

export const INITIAL_DATABASE: Database = {
    users: INITIAL_USERS,
    properties: INITIAL_PROPERTIES,
    maintenanceCategories: INITIAL_MAINTENANCE_CATEGORIES,
    technicians: INITIAL_TECHNICIANS,
    siteSettings: INITIAL_SITE_SETTINGS,
    adSettings: INITIAL_AD_SETTINGS,
    viewingRequests: INITIAL_VIEWING_REQUESTS,
    maintenanceRequests: INITIAL_MAINTENANCE_REQUESTS,
    aboutUsSettings: INITIAL_ABOUT_US_SETTINGS,
    reviews: INITIAL_REVIEWS,
    viewingConfirmationSettings: INITIAL_VIEWING_CONFIRMATION_SETTINGS,
    maintenanceConfirmationSettings: INITIAL_MAINTENANCE_CONFIRMATION_SETTINGS,
    chatbotSettings: INITIAL_CHATBOT_SETTINGS,
    emergencyServices: INITIAL_EMERGENCY_SERVICES,
    emergencyMaintenanceRequests: INITIAL_EMERGENCY_MAINTENANCE_REQUESTS,
    rentalAgreements: INITIAL_RENTAL_AGREEMENTS,
    rentalAgreementSettings: INITIAL_RENTAL_AGREEMENT_SETTINGS,
    pointsSettings: INITIAL_POINTS_SETTINGS,
    marketplaceCategories: INITIAL_MARKETPLACE_CATEGORIES,
    marketplaceServiceProviders: INITIAL_MARKETPLACE_PROVIDERS,
    marketplaceBookings: INITIAL_MARKETPLACE_BOOKINGS,
    maintenanceJobPosts: [],
    maintenanceOffers: [],
    maintenanceLogs: INITIAL_MAINTENANCE_LOGS,
};