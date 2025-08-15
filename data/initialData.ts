import { Property, SiteSettings, AdvertisementSettings, ViewingRequest, MaintenanceCategory, AboutUsSettings, MaintenanceRequest, Technician, Review, ViewingConfirmationSettings, MaintenanceConfirmationSettings } from '../types';

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    title: 'شقة فاخرة بإطلالة على المدينة',
    type: 'سكني',
    price: 5000,
    location: 'الرياض، حي العليا',
    imageUrls: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560185893-a55d88p-40d0-40e9-a5d88p-1456?q=80&w=1974&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=2070&auto=format&fit=crop'
    ],
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
  { id: 'tech-1', name: 'أحمد المصري', specialization: 'سباكة', phone: '0501112221', isAvailable: true, experienceYears: 12, rating: 4.8, skills: ['كشف تسريبات', 'تركيب سخانات', 'تمديد مواسير'], bio: 'سباك خبير متخصص في حلول السباكة السكنية والتجارية المعقدة.', imageUrl: '', region: 'شمال الرياض' },
  { id: 'tech-2', name: 'خالد عبد الله', specialization: 'كهرباء', phone: '0501112222', isAvailable: true, experienceYears: 8, rating: 4.6, skills: ['تركيب إضاءة', 'حل مشاكل انقطاع التيار', 'صيانة لوحات التوزيع'], bio: 'كهربائي معتمد، أضمن لك الأمان والكفاءة في جميع الأعمال الكهربائية.', imageUrl: '', region: 'جنوب الرياض' },
  { id: 'tech-3', name: 'يوسف شاهين', specialization: 'تكييف وتبريد', phone: '0501112223', isAvailable: false, experienceYears: 15, rating: 4.9, skills: ['صيانة المكيفات المركزية', 'تعبئة فريون', 'تنظيف مجاري الهواء'], bio: 'خبير تكييف وتبريد بخبرة طويلة في جميع أنواع الوحدات.', imageUrl: '', region: 'الدمام' },
  { id: 'tech-4', name: 'محمد كريم', specialization: 'نجارة', phone: '0501112224', isAvailable: true, experienceYears: 7, rating: 4.5, skills: ['تركيب أبواب', 'تصنيع خزائن', 'إصلاح أثاث'], bio: 'نجار محترف للأعمال المخصصة والإصلاحات الدقيقة.', imageUrl: '', region: 'وسط جدة' },
  { id: 'tech-5', name: 'سعيد الجابري', specialization: 'سباكة', phone: '0501112225', isAvailable: true, experienceYears: 5, rating: 4.4, skills: ['تسليك مجاري', 'تركيب أدوات صحية', 'صيانة عامة'], bio: 'أقدم خدمات سباكة سريعة وموثوقة لجميع احتياجاتك.', imageUrl: '', region: 'شرق الرياض' },
  { id: 'tech-6', name: 'علي حسن', specialization: 'كهرباء', phone: '0501112226', isAvailable: false, experienceYears: 10, rating: 4.7, skills: ['تمديدات كهربائية', 'فحص أحمال', 'تركيب أنظمة ذكية'], bio: 'متخصص في الأنظمة الكهربائية الحديثة والذكية.', imageUrl: '', region: 'شمال جدة' },
  { id: 'tech-7', name: 'محمود السيد', specialization: 'أعمال عامة', phone: '0501112227', isAvailable: true, experienceYears: 9, rating: 4.5, skills: ['تركيب ستائر', 'إصلاحات جبس', 'تجميع أثاث ايكيا'], bio: 'فني متعدد المهارات لجميع أعمال الصيانة العامة في المنزل.', imageUrl: '', region: 'الخبر' },
];


export const INITIAL_MAINTENANCE_CATEGORIES: MaintenanceCategory[] = [
  {
    id: 'maint-cat-1',
    name: 'سباكة',
    description: 'كل ما يتعلق بأعمال السباكة، من تسريبات المياه وتركيب الأدوات الصحية إلى صيانة السخانات.',
    commonIssues: [
      { id: 'ci-1-1', name: 'تسريب صنبور', warrantyDays: 30 },
      { id: 'ci-1-2', name: 'انسداد بالوعة', warrantyDays: 7 },
      { id: 'ci-1-3', name: 'مشكلة في السخان', warrantyDays: 60 },
      { id: 'ci-1-4', name: 'تركيب غسالة', warrantyDays: 15 },
      { id: 'ci-1-5', name: 'ضعف ضغط المياه', warrantyDays: 10 },
    ],
    inspectionFee: 50,
  },
  {
    id: 'maint-cat-2',
    name: 'كهرباء',
    description: 'صيانة وإصلاح جميع المشاكل الكهربائية، بما في ذلك انقطاع التيار، ومشاكل الإضاءة، وتركيب الأجهزة.',
    commonIssues: [
      { id: 'ci-2-1', name: 'انقطاع التيار', warrantyDays: 15 },
      { id: 'ci-2-2', name: 'تذبذب الإضاءة', warrantyDays: 20 },
      { id: 'ci-2-3', name: 'مقبس لا يعمل', warrantyDays: 30 },
      { id: 'ci-2-4', name: 'تركيب ثريا', warrantyDays: 10 },
    ],
    inspectionFee: 50,
  },
  {
    id: 'maint-cat-3',
    name: 'تكييف وتبريد',
    description: 'خدمات صيانة وتنظيف وحدات التكييف، ومعالجة مشاكل التبريد والتسريبات.',
    commonIssues: [
      { id: 'ci-3-1', name: 'التكييف لا يبرد', warrantyDays: 30 },
      { id: 'ci-3-2', name: 'تسريب مياه من الوحدة', warrantyDays: 20 },
      { id: 'ci-3-3', name: 'صوت مزعج من المكيف', warrantyDays: 15 },
      { id: 'ci-3-4', name: 'تنظيف فلاتر', warrantyDays: 7 },
    ],
    inspectionFee: 75,
  },
  {
    id: 'maint-cat-4',
    name: 'نجارة',
    description: 'إصلاح وتركيب الأبواب، النوافذ، الخزائن، وجميع الأعمال الخشبية الأخرى.',
    commonIssues: [
      { id: 'ci-4-1', name: 'باب لا يغلق جيدًا', warrantyDays: 30 },
      { id: 'ci-4-2', name: 'تركيب قفل جديد', warrantyDays: 45 },
      { id: 'ci-4-3', name: 'إصلاح خزانة', warrantyDays: 25 },
      { id: 'ci-4-4', name: 'تجميع أثاث', warrantyDays: 10 },
    ],
    inspectionFee: 40,
  },
  {
    id: 'maint-cat-5',
    name: 'دهان',
    description: 'أعمال الدهان الداخلي والخارجي، معالجة الرطوبة، وإصلاح تشققات الجدران.',
    commonIssues: [
      { id: 'ci-5-1', name: 'إعادة دهان غرفة', warrantyDays: 90 },
      { id: 'ci-5-2', name: 'تقشير الدهان', warrantyDays: 60 },
      { id: 'ci-5-3', name: 'معالجة رطوبة الجدار', warrantyDays: 120 },
    ],
    inspectionFee: 40,
  },
  {
    id: 'maint-cat-7',
    name: 'تنظيف',
    description: 'خدمات تنظيف شاملة للمنازل والمكاتب، بما في ذلك تنظيف الأرضيات، النوافذ، والمفروشات.',
    commonIssues: [
      { id: 'ci-7-1', name: 'تنظيف شقة بالكامل', warrantyDays: 3 },
      { id: 'ci-7-2', name: 'تنظيف واجهات زجاجية', warrantyDays: 7 },
      { id: 'ci-7-3', name: 'تنظيف ما بعد البناء', warrantyDays: 5 },
      { id: 'ci-7-4', name: 'جلي بلاط ورخام', warrantyDays: 14 },
    ],
    inspectionFee: 0,
  },
  {
    id: 'maint-cat-8',
    name: 'مكافحة حشرات',
    description: 'حلول فعالة وآمنة للقضاء على جميع أنواع الحشرات والقوارض، مع ضمان عدم عودتها.',
    commonIssues: [
      { id: 'ci-8-1', name: 'مكافحة الصراصير', warrantyDays: 90 },
      { id: 'ci-8-2', name: 'مكافحة النمل الأبيض', warrantyDays: 180 },
      { id: 'ci-8-3', name: 'طرد القوارض', warrantyDays: 60 },
      { id: 'ci-8-4', name: 'رش مبيدات آمنة', warrantyDays: 90 },
    ],
    inspectionFee: 60,
  },
  {
    id: 'maint-cat-9',
    name: 'نقل أثاث',
    description: 'خدمات نقل وتغليف الأثاث بخبرة واحترافية، مع ضمان سلامة المنقولات من الباب إلى الباب.',
    commonIssues: [
        { id: 'ci-9-1', name: 'نقل أثاث داخل المدينة', warrantyDays: 7 },
        { id: 'ci-9-2', name: 'نقل أثاث خارج المدينة', warrantyDays: 7 },
        { id: 'ci-9-3', name: 'فك وتركيب غرف نوم', warrantyDays: 15 },
        { id: 'ci-9-4', name: 'تغليف احترافي', warrantyDays: 3 },
    ],
    inspectionFee: 0,
  },
  {
    id: 'maint-cat-6',
    name: 'أعمال عامة',
    description: 'للطلبات التي لا تندرج تحت الفئات الأخرى، مثل الإصلاحات البسيطة أو مهام الصيانة العامة.',
    commonIssues: [
        { id: 'ci-6-1', name: 'تركيب ستائر', warrantyDays: 10 },
        { id: 'ci-6-2', name: 'إصلاحات متنوعة', warrantyDays: 7 },
    ],
    inspectionFee: 0,
  }
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
      title: 'خدمة عملاء 24/7',
      description: 'فريقنا متواجد على مدار الساعة لمساعدتك والرد على كافة استفساراتك في أي وقت.'
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
  ]
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

export const INITIAL_VIEWING_REQUESTS: ViewingRequest[] = [];

export const INITIAL_MAINTENANCE_REQUESTS: MaintenanceRequest[] = [];

export const INITIAL_REVIEWS: Review[] = [];

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