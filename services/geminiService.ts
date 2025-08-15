

import { GoogleGenAI, Type, Part } from "@google/genai";
import { MaintenanceAnalysis, Technician, Property, AIPropertySearchResult, CommonIssue } from '../types';

// Safely access the API key from the environment. This prevents a ReferenceError if 'process' is not defined in the browser.
// The hosting environment is expected to populate process.env.API_KEY.
const API_KEY = (typeof process !== 'undefined' && process.env && process.env.API_KEY) ? process.env.API_KEY : undefined;

if (!API_KEY) {
  // We log a warning instead of throwing an error that stops the whole app.
  // The Gemini calls will fail gracefully later if the key is missing.
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

// Initialize the client. If API_KEY is missing, calls will fail later.
const ai = new GoogleGenAI({ apiKey: API_KEY || '' });

export const analyzeMaintenanceRequest = async (
  description: string, 
  selectedCategory: string, 
  imageParts: Part[],
  technicians: Technician[],
  userLocation: string,
  commonIssuesForCategory: CommonIssue[]
): Promise<Omit<MaintenanceAnalysis, 'category'>> => {

  if (!API_KEY) {
    throw new Error("API Key is not configured. AI analysis is unavailable.");
  }

  const availableTechnicians = technicians.filter(t => t.isAvailable);
  const technicianList = availableTechnicians.length > 0
    ? availableTechnicians.map(t => 
        `- الاسم: ${t.name}\n` +
        `  التخصص: ${t.specialization}\n` +
        `  المنطقة: ${t.region}\n` +
        `  سنوات الخبرة: ${t.experienceYears}\n` +
        `  التقييم: ${t.rating} من 5\n` +
        `  المهارات: ${t.skills.join(', ')}\n` +
        `  نبذة: ${t.bio}`
      ).join('\n\n')
    : 'لا يوجد فنيين متاحين حاليًا.';
  
  const commonIssueNames = commonIssuesForCategory.map(issue => issue.name);

  const analysisSchema = {
    type: Type.OBJECT,
    properties: {
      summary: {
        type: Type.STRING,
        description: 'لخص المشكلة في جملة قصيرة وواضحة باللغة العربية.'
      },
      urgency: {
        type: Type.STRING,
        description: 'حدد مستوى الأهمية: منخفضة, متوسطة, عالية, طارئة.',
        enum: ['منخفضة', 'متوسطة', 'عالية', 'طارئة']
      },
      suggested_technician: {
        type: Type.STRING,
        description: 'اقترح اسم الفني الأنسب من القائمة المتوفرة. إذا لم يكن هناك فني مناسب، اذكر نوع الفني المطلوب (مثال: سباك، كهربائي).'
      },
      suggestion_reason: {
        type: Type.STRING,
        description: 'اشرح في جملة قصيرة وواضحة لماذا تم اقتراح هذا الفني أو التخصص. مثال: "لأنه سباك قريب ومتخصص في التسريبات ولديه تقييم عالٍ".'
      },
      identified_issue: {
        type: Type.STRING,
        description: `حدد العطل الأكثر تطابقاً من قائمة الأعطال الشائعة. إذا لم يتطابق أي منها، اترك هذا الحقل فارغًا. القائمة هي: ${commonIssueNames.join(', ')}`,
        enum: commonIssueNames,
      },
      estimated_cost_range: {
          type: Type.STRING,
          description: 'قدم تقديراً أولياً لنطاق تكلفة الإصلاح بالريال السعودي. يجب أن يكون على شكل "150-250 ريال". يجب أن يكون هذا التقدير منطقياً بناءً على حجم المشكلة الموصوفة. هذا تقدير مبدئي وليس نهائي.'
      },
      potential_parts: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'اذكر قائمة بأسماء قطع الغيار التي قد تكون مطلوبة للإصلاح. مثال: ["صمام جديد", "شريط تفلون"].'
      },
      safety_warnings: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'إذا كان الطلب يتعلق بالكهرباء أو أي خطر محتمل، اذكر قائمة بتحذيرات السلامة الهامة. مثال: ["افصل التيار الكهربائي قبل محاولة الفحص", "لا تلمس الأسلاك المكشوفة"].'
      },
      photo_recommendation: {
        type: Type.STRING,
        description: 'إذا كان الوصف النصي غير واضح أو غير كافٍ تمامًا، قدم رسالة قصيرة وواضحة باللغة العربية تطلب من المستخدم إرفاق صورة لجزء معين لتحسين دقة التحليل. مثال: "لتحليل أدق، يرجى إرفاق صورة للتسريب أسفل الحوض." إذا كانت الصور المرفقة أو الوصف كافيًا، اترك هذا الحقل فارغًا.'
      }
    },
    required: ['summary', 'urgency', 'suggested_technician', 'suggestion_reason']
  };

  const locationPrompt = userLocation.trim()
    ? `\n\nمعلومات إضافية هامة:\n- موقع العميل (الحي/المنطقة): "${userLocation}". يجب أن يكون هذا عاملاً رئيسياً في اختيارك، حيث يجب تفضيل الفنيين العاملين في نفس المنطقة أو المناطق القريبة جداً لضمان سرعة الوصول.`
    : '';

  const commonIssuesPrompt = commonIssueNames.length > 0
    ? `قائمة الأعطال الشائعة لهذه الفئة (للاستخدام في حقل identified_issue):\n${commonIssueNames.join('\n')}\n`
    : '';

  const textPart = {
    text: `حلل طلب الصيانة التالي الذي يندرج تحت فئة "${selectedCategory}" بناءً على الوصف والصور المرفقة (إن وجدت): "${description}".${locationPrompt}

قائمة الفنيين المتاحين وتفاصيلهم الكاملة (بما في ذلك منطقة عملهم):
${technicianList}

${commonIssuesPrompt}
مهمتك:
1.  لخص المشكلة بوضوح.
2.  حدد مستوى الأهمية.
3.  اقترح الفني **الأنسب** من القائمة أعلاه. يجب أن تعتمد بقوة على العوامل التالية بالترتيب:
    أ. **قرب المسافة:** اختر فنيًا تكون منطقته هي الأقرب لموقع العميل. هذا هو العامل الأكثر أهمية.
    ب. **التخصص:** يجب أن يتطابق تخصص الفني مع فئة الطلب.
    ت. **الخبرة والمهارات:** يجب أن تتناسب خبرته مع المشكلة الموصوفة.
    ث. **التقييم:** استخدم التقييم كعامل ثانوي للمفاضلة بين الخيارات المناسبة.
4.  اشرح **سبب** اختيارك للفني أو التخصص في جملة واحدة واضحة، مع الإشارة إلى عاملي **القرب والتخصص** بشكل أساسي. مثال: "لأنه سباك في نفس منطقة العميل ومتخصص في التسريبات".
5.  من قائمة الأعطال الشائعة المذكورة أعلاه، اختر **الأكثر تطابقاً** مع وصف المشكلة وضعه في حقل "identified_issue". إذا لم تجد تطابقاً دقيقاً، يمكنك ترك الحقل فارغاً.
6.  قدم **تقديراً أولياً لتكلفة الإصلاح** (estimated_cost_range) بناءً على المشكلة.
7.  اذكر قائمة **بقطع الغيار المحتملة** (potential_parts) التي قد تلزم للإصلاح.
8.  إذا كانت الفئة حساسة (مثل الكهرباء)، اذكر قائمة **بتحذيرات السلامة** الهامة (safety_warnings).
9.  إذا كان الوصف النصي **وحده** غير كافٍ للتشخيص الدقيق (حتى مع وجود صور عامة)، اذكر **توصية بإضافة صورة محددة** (photo_recommendation) توضح للمستخدم ما يجب تصويره بدقة. مثال: "يرجى تصوير الجزء الخلفي من الغسالة لتحديد مصدر التسريب". إذا كان الوصف والصور كافية، اترك هذا الحقل فارغًا.`,
  };

  const systemInstruction = `أنت نظام خبير في تحليل طلبات صيانة المباني وتوزيع المهام. مهمتك هي تحليل الوصف والصور المقدمة لتقديم ملخص، تحديد الأهمية، اقتراح فني، تحديد عطل شائع، تقدير تكلفة، اقتراح قطع غيار، وتقديم تحذيرات سلامة. يجب أن يكون ردك بتنسيق JSON حصراً بناءً على المخطط المحدد. لا تقم بتضمين حقل "category" في ردك.`;

  const contents = { parts: [textPart, ...imageParts] };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText) as Omit<MaintenanceAnalysis, 'category'>;
    return result;

  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error("Failed to get analysis from Gemini API.");
  }
};


export const searchPropertiesWithAI = async (
  query: string,
  properties: Property[]
): Promise<AIPropertySearchResult[]> => {

  if (!API_KEY) {
    throw new Error("API Key is not configured. AI search is unavailable.");
  }

  const propertyListForAI = properties.map(p => (
    `ID: ${p.id}\n` +
    `العنوان: ${p.title}\n` +
    `النوع: ${p.type}\n` +
    `السعر الشهري: ${p.price} ريال\n` +
    `الموقع: ${p.location}\n` +
    `المساحة: ${p.area} متر مربع\n` +
    (p.bedrooms ? `غرف النوم: ${p.bedrooms}\n` : '') +
    (p.bathrooms ? `الحمامات: ${p.bathrooms}\n` : '') +
    `الوصف: ${p.description}`
  )).join('\n---\n');

  const searchSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            propertyId: {
                type: Type.STRING,
                description: 'معرّف العقار (ID) المطابق من القائمة.',
            },
            reason: {
                type: Type.STRING,
                description: 'سبب واضح ومختصر باللغة العربية لاقتراح هذا العقار بناءً على طلب المستخدم.',
            },
        },
        required: ['propertyId', 'reason'],
    },
  };

  const textPart = {
    text: `طلب المستخدم للبحث عن عقار هو: "${query}".

قائمة العقارات المتاحة:
${propertyListForAI}

مهمتك:
1.  حلل طلب المستخدم بعناية لفهم متطلباته (مثل النوع، الموقع، عدد الغرف، السعر، المميزات الخاصة).
2.  قارن الطلب مع قائمة العقارات المتاحة.
3.  أعد قائمة بالعقارات الأكثر مطابقة لطلب المستخدم. رتب النتائج من الأكثر صلة إلى الأقل.
4.  لكل عقار مقترح، اذكر سببًا واضحًا وموجزًا لترشيحه يربط بين مواصفات العقار وطلب المستخدم.
`
  };
  
  const systemInstruction = `أنت مساعد خبير في البحث عن العقارات. مهمتك هي تحليل طلب المستخدم وقائمة العقارات المتاحة، ثم إرجاع قائمة بمعرفات العقارات (propertyId) التي تطابق طلب البحث بشكل أفضل، مع ذكر سبب الترشيح لكل عقار. يجب أن يكون ردك بتنسيق JSON حصراً بناءً على المخطط المحدد. إذا لم تجد أي عقار مطابق، أعد مصفوفة فارغة.`;

  const contents = { parts: [textPart] };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: searchSchema,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        return [];
    }
    const result = JSON.parse(jsonText) as AIPropertySearchResult[];
    return result;

  } catch (error) {
    console.error("Gemini property search failed:", error);
    throw new Error("Failed to get search results from Gemini API.");
  }
};