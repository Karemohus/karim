





import { GoogleGenAI, Type, Part, Chat, Modality } from "@google/genai";
import { MaintenanceAnalysis, Technician, Property, AIPropertySearchResult, CommonIssue, ChatMessage, NeighborhoodInfo, ChatbotSettings, Review, ReviewSummary, PropertyComparison, MaintenanceRequest, EmergencyMaintenanceRequest, MaintenanceAdvice } from '../types';

// As per guidelines, assume process.env.API_KEY is made available by the execution environment.
// Do not add defensive checks for `process`. The hosting environment is expected to populate this.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


export const analyzeMaintenanceRequest = async (
  description: string, 
  selectedCategory: string, 
  imageParts: Part[],
  technicians: Technician[],
  userLocation: string,
  commonIssuesForCategory: CommonIssue[]
): Promise<Omit<MaintenanceAnalysis, 'category'>> => {

  const availableTechnicians = technicians.filter(t => t.isAvailable);
  const technicianList = availableTechnicians.length > 0
    ? availableTechnicians.map(t => 
        `- الاسم: ${t.name}\n` +
        `  الجنسية: ${t.nationality}\n` +
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
        description: 'لخص المشكلة في جملة قصيرة وواضحة باللغة العربية.',
      },
      urgency: {
        type: Type.STRING,
        description: 'حدد مستوى الأهمية: منخفضة, متوسطة, عالية, طارئة.',
        enum: ['منخفضة', 'متوسطة', 'عالية', 'طارئة']
      },
      suggested_technician: {
        type: Type.STRING,
        description: 'اقترح اسم الفني الأنسب من القائمة المتوفرة. إذا لم يكن هناك فني مناسب، اذكر نوع الفني المطلوب (مثال: سباك، كهربائي).',
      },
      suggestion_reason: {
        type: Type.STRING,
        description: 'اشرح في جملة قصيرة وواضحة لماذا تم اقتراح هذا الفني أو التخصص.',
      },
      identified_issue: {
        type: Type.STRING,
        description: `حدد العطل الأكثر تطابقاً من قائمة الأعطال الشائعة المذكورة في التعليمات. إذا لم يتطابق أي منها، اترك هذا الحقل فارغًا.`,
        enum: commonIssueNames,
      },
      estimated_cost_range: {
          type: Type.STRING,
          description: 'قدم تقديراً أولياً لنطاق تكلفة الإصلاح بالريال السعودي على شكل "150-250 ريال".',
      },
      potential_parts: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'اذكر قائمة بأسماء قطع الغيار التي قد تكون مطلوبة للإصلاح.',
      },
      safety_warnings: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'إذا كان الطلب يتعلق بالكهرباء أو أي خطر محتمل، اذكر قائمة بتحذيرات السلامة الهامة.',
      },
    },
    required: ['summary', 'urgency', 'suggested_technician', 'suggestion_reason', 'estimated_cost_range']
  };

  const promptText = `حلل طلب الصيانة التالي الذي يندرج تحت فئة "${selectedCategory}" بناءً على الوصف والصور المرفقة (إن وجدت): "${description}".
موقع العميل (الحي/المنطقة): "${userLocation || 'غير محدد'}".

قائمة الفنيين المتاحين وتفاصيلهم الكاملة:
${technicianList}

قائمة الأعطال الشائعة لهذه الفئة مع نطاقات التكلفة الإرشادية:
${commonIssuesForCategory.map(issue => `- العطل: "${issue.name}", نطاق التكلفة المقترح: ${issue.minCost}-${issue.maxCost} ريال`).join('\n')}
`;
  const contents = { parts: [{ text: promptText }, ...imageParts] };

  const systemInstruction = `أنت مساعد ذكاء اصطناعي خبير في تحليل طلبات صيانة المباني. مهمتك هي تحليل الطلب التالي وتقديم تحليل نهائي وكامل بناءً على المعلومات المقدمة فقط. لا تطرح أسئلة توضيحية أبدًا. يجب أن يكون ردك دائمًا بتنسيق JSON حصراً بناءً على المخطط المحدد. عند اقتراح فني، أعط الأولوية للقرب الجغرافي ثم التخصص. يجب أن يكون تقديرك للتكلفة ضمن نطاق التكلفة المقترح للعطل الشائع إذا تم تحديده.`;

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

export const getMaintenanceAdvice = async (description: string, category: string): Promise<MaintenanceAdvice> => {
    const adviceSchema = {
        type: Type.OBJECT,
        properties: {
            safety_tips: {
                type: Type.ARRAY,
                description: 'قائمة بنصائح السلامة الهامة التي يجب على المستخدم اتباعها قبل وصول الفني. كن محدداً للمشكلة الموصوفة. مثال: "افصل التيار الكهربائي عن الجهاز".',
                items: { type: Type.STRING },
            },
            simple_checks: {
                type: Type.ARRAY,
                description: 'قائمة بالفحوصات البسيطة والآمنة التي يمكن للمستخدم القيام بها بنفسه وقد تحل المشكلة. مثال: "تأكد من أن قاطع الدائرة لم يفصل". يجب أن تكون النصائح آمنة جداً للمستخدم العادي.',
                items: { type: Type.STRING },
            },
            things_to_avoid: {
                type: Type.ARRAY,
                description: 'قائمة بالأشياء التي يجب على المستخدم تجنب فعلها والتي قد تزيد المشكلة سوءًا أو تعرضه للخطر. مثال: "لا تحاول فتح غطاء المكيف بنفسك".',
                items: { type: Type.STRING },
            }
        },
        required: ['safety_tips', 'simple_checks', 'things_to_avoid'],
    };

    const systemInstruction = `أنت خبير صيانة منزلية محترف ومساعد. مهمتك هي تقديم نصائح أولية آمنة ومفيدة للمستخدم بناءً على وصف مشكلة الصيانة. لا تقدم أبداً نصائح خطيرة أو تتطلب خبرة فنية. ركز على السلامة والفحوصات البسيطة جداً. يجب أن يكون ردك بتنسيق JSON حصراً بناءً على المخطط المحدد.`;

    const promptText = `
    قدم نصائح أولية لمشكلة الصيانة التالية:
    - الفئة: "${category}"
    - وصف المشكلة: "${description}"
  `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: promptText,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: adviceSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as MaintenanceAdvice;
    } catch (error) {
        console.error("Gemini maintenance advice failed:", error);
        throw new Error("Failed to get maintenance advice from Gemini API.");
    }
};


export const searchPropertiesWithAI = async (
  query: string,
  properties: Property[]
): Promise<AIPropertySearchResult[]> => {

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
                description: 'سبب مفصل ومقنع باللغة العربية لاقتراح هذا العقار، يربط بوضوح بين متطلبات المستخدم (بما في ذلك نمط الحياة، والمواصلات، والمرافق) ومميزات العقار المذكورة في بياناته.',
            },
        },
        required: ['propertyId', 'reason'],
    },
  };

  const textPart = {
    text: `طلب المستخدم للبحث عن عقار هو: "${query}".

قائمة العقارات المتاحة للتحليل:
${propertyListForAI}

مهمتك كخبير عقاري:
1.  **تحليل عميق لطلب المستخدم:** لا تكتفِ بالكلمات الرئيسية. افهم النية وراء الطلب. هل يبحث عن الهدوء؟ هل هو مناسب لعائلة لديها أطفال؟ هل يهمه القرب من أماكن العمل أو الترفيه؟
2.  **المطابقة الذكية:** قارن طلب المستخدم مع كل تفاصيل العقارات المتاحة (العنوان، الموقع، الوصف، النوع، السعر، عدد الغرف، إلخ). ابحث عن روابط بين طلب المستخدم ووصف العقار وموقعه. على سبيل المثال، إذا طلب المستخدم "حي هادئ"، ابحث عن عقارات في أحياء معروفة بالهدوء أو التي يصفها الوصف بذلك.
3.  **الترتيب حسب الأهمية:** أعد قائمة بالعقارات الأكثر مطابقة لطلب المستخدم. يجب أن تكون النتائج مرتبة من الأكثر صلة إلى الأقل صلة.
4.  **تقديم سبب مفصل ومقنع:** لكل عقار مقترح، اذكر سببًا واضحًا ومفصلاً لاقتراحه. اشرح كيف يلبي هذا العقار المتطلبات الصريحة والضمنية في طلب المستخدم. مثال: "هذا العقار مثالي لك لأنه يقع في حي العليا الهادئ الذي ذكرته، ويحتوي على 3 غرف نوم مناسبة لعائلتك، كما أن الوصف يذكر قربه من حديقة عامة وهو ما يتناسب مع طلبك لمكان مناسب للأطفال".
`
  };
  
  const systemInstruction = `أنت مستشار عقاري خبير ومتطور يعمل بالذكاء الاصطناعي. مهمتك هي فهم احتياجات المستخدمين المعقدة المتعلقة بنمط الحياة، والمواصلات، والمرافق، ومطابقتها بذكاء مع العقارات المتاحة. يجب أن يكون ردك دائمًا بتنسيق JSON حصراً بناءً على المخطط المحدد. لا تخترع معلومات غير موجودة في بيانات العقار. رتب النتائج دائمًا من الأكثر صلة إلى الأقل. إذا لم تجد أي عقار مطابق، أعد مصفوفة فارغة.`;

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

export const getNeighborhoodInfo = async (property: Property): Promise<NeighborhoodInfo> => {
    const neighborhoodSchema = {
        type: Type.OBJECT,
        properties: {
            summary: {
                type: Type.STRING,
                description: 'ملخص عام جذاب ومختصر عن الحي (2-3 جمل).',
            },
            lifestyle: {
                type: Type.STRING,
                description: 'وصف لطبيعة الحياة في الحي (هادئ، حيوي، مناسب للعائلات، إلخ).',
            },
            services: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'قائمة بأهم الخدمات القريبة (مثال: مدارس دولية، مستشفى سليمان الحبيب، مول الرياض بارك).',
            },
            transportation: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'قائمة بأبرز خيارات وسهولة الوصول للمواصلات (مثال: قريب من طريق الملك فهد، محطة مترو قريبة، سهولة الوصول لسيارات الأجرة).',
            },
            property_recommendation: {
                type: Type.STRING,
                description: 'اذكر سببًا محددًا وموجزًا يجعل هذا العقار المعروض مميزًا في هذا الحي، رابطًا بين مواصفات العقار (مثل نوعه أو حجمه) ومميزات الحي (مثل قربه من خدمات معينة).',
            },
        },
        required: ['summary', 'lifestyle', 'services', 'transportation', 'property_recommendation'],
    };
    
    const systemInstruction = `أنت خبير محلي في أحياء مدن المملكة العربية السعودية. مهمتك هي تقديم دليل موجز وجذاب عن حي معين وتقديم توصية مخصصة للعقار المعروض داخل هذا الحي. يجب أن يكون ردك بتنسيق JSON حصراً بناءً على المخطط المحدد.`;
    
    const promptText = `أنت خبير عقاري محلي. بناءً على بيانات العقار والموقع أدناه، قم بتحليل الحي وقدم توصية مخصصة.

**بيانات العقار المعروض:**
- العنوان: ${property.title}
- النوع: ${property.type}
- الوصف: ${property.description}
- الموقع (الحي): "${property.location}"

**المهمة:**
1.  قدم دليلاً عن الحي الموجود في الموقع أعلاه. ركز على أسلوب الحياة، الخدمات الهامة (مدارس، مستشفيات، مراكز تسوق)، وسهولة الوصول والمواصلات.
2.  بناءً على بيانات العقار ومميزات الحي، اكتب "توصية للعقار" (property_recommendation) قصيرة ومقنعة تشرح لماذا هذا العقار (بنوعه ومواصفاته) يعتبر خيارًا ممتازًا في هذا الموقع تحديدًا.
3.  اجعل الوصف إيجابياً ومفيداً للمستأجر المحتمل.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: promptText,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: neighborhoodSchema,
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText) as NeighborhoodInfo;
        return result;

    } catch (error) {
        console.error("Gemini neighborhood info failed:", error);
        throw new Error("Failed to get neighborhood info from Gemini API.");
    }
};

export const generatePropertyDescription = async (propertyData: Partial<Property>): Promise<string> => {
    const details = [
        `العنوان: ${propertyData.title}`,
        `النوع: ${propertyData.type}`,
        `الموقع: ${propertyData.location}`,
        `المساحة: ${propertyData.area} متر مربع`,
    ];
    if (propertyData.type === 'سكني') {
        details.push(`عدد غرف النوم: ${propertyData.bedrooms ?? 'غير محدد'}`);
        details.push(`عدد الحمامات: ${propertyData.bathrooms ?? 'غير محدد'}`);
    }
    
    const prompt = `
أنت خبير تسويق عقاري محترف. مهمتك هي كتابة وصف جذاب ومقنع باللغة العربية لعقار بناءً على البيانات التالية. 
اجعل الوصف إيجابياً، احترافياً، وركز على المميزات التي تجذب المستأجرين المحتملين.
استخدم لغة غنية وتعبيرات تسويقية قوية. يجب أن يكون الوصف على شكل فقرة واحدة متماسكة.

بيانات العقار:
${details.join('\n')}

اكتب الوصف الآن.
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Gemini property description generation failed:", error);
        throw new Error("Failed to generate property description from Gemini API.");
    }
};

export const summarizeReviewsWithAI = async (reviews: Review[]): Promise<ReviewSummary> => {
    const reviewComments = reviews.map(r => `- (تقييم ${r.rating}/5): ${r.comment}`).join('\n');

    const summarySchema = {
        type: Type.OBJECT,
        properties: {
            positive_points: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'قائمة بأبرز النقاط الإيجابية والمميزات المتكررة في التقييمات.',
            },
            negative_points: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'قائمة بأبرز النقاط السلبية والشكاوى المتكررة في التقييمات.',
            },
            overall_summary: {
                type: Type.STRING,
                description: 'ملخص عام وموجز يعطي انطباعًا نهائيًا عن مجمل التقييمات.',
            },
        },
        required: ['positive_points', 'negative_points', 'overall_summary'],
    };

    const systemInstruction = "أنت مساعد متخصص في تحليل آراء العملاء. مهمتك هي قراءة مجموعة من التقييمات وتلخيصها بشكل منظم ومفيد. يجب أن يكون ردك بتنسيق JSON حصراً بناءً على المخطط المحدد.";
    const promptText = `قم بتحليل التقييمات التالية واستخرج النقاط الإيجابية والسلبية الرئيسية، ثم قدم ملخصًا عامًا.\n\nالتقييمات:\n${reviewComments}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: promptText,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: summarySchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ReviewSummary;
    } catch (error) {
        console.error("Gemini review summarization failed:", error);
        throw new Error("Failed to get review summary from Gemini API.");
    }
};

export const comparePropertiesWithAI = async (properties: Property[], query: string): Promise<PropertyComparison> => {
    const propertyListForAI = properties.map(p => (
        `---\n` +
        `العنوان: ${p.title}\n` +
        `الموقع: ${p.location}\n` +
        `النوع: ${p.type}\n` +
        `السعر الشهري: ${p.price} ريال\n` +
        `المساحة: ${p.area} متر مربع\n` +
        (p.bedrooms ? `غرف النوم: ${p.bedrooms}\n` : '') +
        (p.bathrooms ? `الحمامات: ${p.bathrooms}\n` : '') +
        `الوصف: ${p.description}`
    )).join('\n');

    const comparisonSchema = {
        type: Type.OBJECT,
        properties: {
            comparison_points: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        feature: { type: Type.STRING, description: 'الميزة التي تتم مقارنتها (مثال: الموقع والخدمات).'},
                        details: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    property_title: { type: Type.STRING, description: 'عنوان العقار.' },
                                    description: { type: Type.STRING, description: 'وصف مقارن لهذه الميزة في هذا العقار.' },
                                },
                                required: ['property_title', 'description'],
                            },
                        },
                    },
                    required: ['feature', 'details'],
                },
            },
            recommendation: {
                type: Type.STRING,
                description: 'اسم العقار الموصى به بناءً على المقارنة وطلب المستخدم.',
            },
            recommendation_reason: {
                type: Type.STRING,
                description: 'شرح موجز لسبب التوصية بهذا العقار تحديداً.',
            },
        },
        required: ['comparison_points', 'recommendation', 'recommendation_reason'],
    };

    const systemInstruction = "أنت خبير عقاري متخصص في مقارنة العقارات. مهمتك هي تحليل مجموعة من العقارات بناءً على معايير يحددها المستخدم، ثم تقديم مقارنة مفصلة وتوصية. يجب أن يكون ردك بتنسيق JSON حصراً بناءً على المخطط المحدد.";
    const promptText = `
طلب المستخدم هو مقارنة العقارات التالية بناءً على: "${query}".

العقارات المتاحة للمقارنة:
${propertyListForAI}

مهمتك:
1.  حلل طلب المستخدم لفهم أهم معايير المقارنة بالنسبة له.
2.  قارن بين العقارات نقطة بنقطة بناءً على هذه المعايير.
3.  قدم توصية بالعقار الأنسب مع ذكر سبب واضح.
4.  قم بتنسيق إجابتك كملف JSON صالح.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: promptText,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: comparisonSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as PropertyComparison;
    } catch (error) {
        console.error("Gemini property comparison failed:", error);
        throw new Error("Failed to get property comparison from Gemini API.");
    }
};

export const generateInteriorDesign = async (imagePart: Part, userPrompt: string): Promise<string> => {
  const textPart = {
    text: `بناءً على الصورة المقدمة، أعد تصميم الديكور الداخلي وفقًا للطلب التالي: "${userPrompt}". 
حافظ على التخطيط الأصلي للغرفة (النوافذ والأبواب) ولكن غيّر الأثاث والديكور والألوان لتتناسب مع النمط الجديد.`,
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [imagePart, textPart],
      },
      config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }

    throw new Error("لم يقم الذكاء الاصطناعي بإرجاع صورة. يرجى تجربة طلب مختلف.");
  
  } catch (error) {
    console.error("Gemini interior design generation failed:", error);
    if (error instanceof Error && error.message.includes("SAFETY")) {
        throw new Error("تم حظر الطلب بسبب سياسات السلامة. يرجى تعديل طلبك والمحاولة مرة أخرى.");
    }
    throw new Error("فشل في إنشاء التصميم الداخلي من Gemini API.");
  }
};

export const createGeneralChat = (
    chatbotSettings: ChatbotSettings, 
    siteName: string, 
    properties: Property[],
    maintenanceRequests: MaintenanceRequest[],
    emergencyMaintenanceRequests: EmergencyMaintenanceRequest[]
): Chat => {
    const availableProperties = properties.filter(p => p.status === 'متاح');
    const propertyListForAI = availableProperties.length > 0 ? availableProperties.map(p => (
        `العنوان: ${p.title}\n` +
        `النوع: ${p.type}\n` +
        `السعر الشهري: ${p.price} ريال\n` +
        `الموقع: ${p.location}\n` +
        `المساحة: ${p.area} متر مربع\n` +
        (p.bedrooms ? `غرف النوم: ${p.bedrooms}\n` : '') +
        (p.bathrooms ? `الحمامات: ${p.bathrooms}\n` : '') +
        `الوصف: ${p.description}`
    )).join('\n---\n') : 'لا توجد عقارات متاحة حالياً.';

    const maintenanceRequestListForAI = maintenanceRequests.length > 0 ? maintenanceRequests.map(r => (
        `ID: ${r.id}\n` +
        `رقم الطلب المختصر: ${r.id.slice(-8)}\n` +
        `العميل: ${r.userName}\n` +
        `ملخص المشكلة: ${r.analysis.summary}\n` +
        `الحالة: ${r.status}`
    )).join('\n---\n') : 'لا توجد طلبات صيانة عادية حالياً.';

    const emergencyRequestListForAI = emergencyMaintenanceRequests.length > 0 ? emergencyMaintenanceRequests.map(r => (
        `ID: ${r.id}\n` +
        `رقم الطلب المختصر: ${r.id.slice(-8)}\n` +
        `العميل (رقم هاتف): ${r.userPhone}\n` +
        `نوع الخدمة: ${r.serviceName}\n` +
        `الحالة: ${r.status}`
    )).join('\n---\n') : 'لا توجد طلبات صيانة طارئة حالياً.';


    const fallbackMessage = chatbotSettings.fallbackMessage
        .replace('{realEstatePhone}', chatbotSettings.realEstatePhone)
        .replace('{maintenancePhone}', chatbotSettings.maintenancePhone);

    const systemInstruction = `أنت 'مساعد ${siteName} الشخصي'، مساعد ذكاء اصطناعي ودود ومحترف. اسم الشركة هو '${siteName}'.
مهمتك هي مساعدة المستخدمين في كل ما يتعلق بالعقارات والصيانة بأسلوب فعال وودود.

**قدراتك الأساسية:**

1.  **معلومات عامة:** أجب عن الأسئلة المتعلقة بالشركة، خدماتها، طرق التواصل، وكيفية استخدام الموقع.
2.  **البحث عن العقارات:** إذا طلب المستخدم البحث عن عقار (مثال: "ابحث لي عن شقة"، "أريد محلاً تجارياً")، استخدم قائمة العقارات المتاحة أدناه للإجابة.
    -   حلل طلبه (الموقع، النوع، السعر، عدد الغرف، إلخ).
    -   اذكر عناوين العقارات المطابقة.
    -   لكل عقار، وضح باختصار سبب كونه مناسباً.
    -   شجع المستخدم دائماً على زيارة صفحة "العقارات" لرؤية التفاصيل الكاملة واستخدام أدوات البحث والمقارنة المتقدمة.
    -   إذا لم تجد عقاراً مطابقاً، أبلغه بلطف واقترح عليه توسيع نطاق بحثه.
3.  **إرشادات الصيانة:** إذا وصف المستخدم مشكلة صيانة (مثال: "تسريب في المطبخ"، "المكيف لا يعمل")، قم بالتالي:
    -   قدم نصيحة سلامة عامة ومختصرة إذا كان الأمر يتعلق بالكهرباء أو ما شابه.
    -   **لا تحاول تشخيص المشكلة بنفسك.** بدلاً من ذلك، أرشده إلى صفحة "خدمات الصيانة" لاستخدام أداة التحليل الذكي وتقديم طلب رسمي للحصول على تشخيص دقيق.
4.  **متابعة طلبات الصيانة:** إذا سأل المستخدم عن حالة طلب صيانة (مثال: "ما حالة طلبي رقم XXXXXXXX؟"، "أريد متابعة طلبي")، قم بالخطوات التالية:
    -   ابحث عن رقم الطلب الذي يذكره المستخدم في قوائم طلبات الصيانة العادية والطارئة أدناه. ابحث عن 'رقم الطلب المختصر'.
    -   إذا وجدت الطلب، أبلغه بالحالة الحالية للطلب (مثال: 'جديد'، 'قيد التنفيذ'، 'مكتمل') وتفاصيل الطلب.
    -   إذا لم تجد الطلب، أبلغه بلطف أن الرقم غير صحيح واطلب منه التحقق، ثم أرشده إلى صفحة "خدمات الصيانة" لاستخدام نموذج متابعة الطلب.

**مصادر معلوماتك (استخدم هذه المصادر حصراً):**

- **عن الشركة**: ${chatbotSettings.companyInfo}
- **خدماتنا**: ${chatbotSettings.servicesSummary}
- **كيفية استئجار عقار**: ${chatbotSettings.howToRent}
- **كيفية طلب صيانة**: ${chatbotSettings.howToRequestMaintenance}
- **هاتف العقارات**: ${chatbotSettings.realEstatePhone}.
- **هاتف الصيانة**: ${chatbotSettings.maintenancePhone}.

- **قائمة العقارات المتاحة حالياً:**
---
${propertyListForAI}
---

- **قائمة طلبات الصيانة العادية الحالية:**
---
${maintenanceRequestListForAI}
---

- **قائمة طلبات الصيانة الطارئة الحالية:**
---
${emergencyRequestListForAI}
---

**قواعد صارمة:**
- كن مهذباً ومساعداً دائماً.
- لا تخترع معلومات غير موجودة هنا. إذا لم تكن تعرف الإجابة أو كان الطلب خارج نطاق قدراتك، استخدم هذه الرسالة الجاهزة: '${fallbackMessage}'.
- حافظ على أن تكون إجاباتك مختصرة وواضحة.
- تحدث باللغة العربية.
- **يجب** أن تبدأ محادثتك الأولى بالترحيب وتقديم نفسك باستخدام هذه الرسالة: "${chatbotSettings.greetingMessage}"`;

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
        },
    });

    return chat;
};

export const suggestSimilarProperties = async (
  currentProperty: Property,
  allProperties: Property[]
): Promise<AIPropertySearchResult[]> => {
  // Filter out the current property and get only available ones
  const otherProperties = allProperties.filter(p => p.id !== currentProperty.id && p.status === 'متاح');

  if (otherProperties.length === 0) {
    return [];
  }

  const propertyListForAI = otherProperties.map(p => (
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
  
  const currentPropertyDetails = 
    `العنوان: ${currentProperty.title}\n` +
    `النوع: ${currentProperty.type}\n` +
    `السعر الشهري: ${currentProperty.price} ريال\n` +
    `الموقع: ${currentProperty.location}\n` +
    `المساحة: ${currentProperty.area} متر مربع\n` +
    (currentProperty.bedrooms ? `غرف النوم: ${currentProperty.bedrooms}\n` : '') +
    (currentProperty.bathrooms ? `الحمامات: ${currentProperty.bathrooms}\n` : '');

  const suggestionsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            propertyId: {
                type: Type.STRING,
                description: 'معرّف العقار (ID) المشابه من القائمة.',
            },
            reason: {
                type: Type.STRING,
                description: 'سبب واضح ومختصر باللغة العربية لاقتراح هذا العقار بناءً على تشابهه مع العقار الحالي.',
            },
        },
        required: ['propertyId', 'reason'],
    },
  };

  const textPart = {
    text: `العقار الحالي الذي يشاهده المستخدم هو:
${currentPropertyDetails}

---
قائمة العقارات الأخرى المتاحة:
${propertyListForAI}

مهمتك:
1.  حلل العقار الحالي لفهم مميزاته الرئيسية (الموقع، النوع، السعر، المساحة، عدد الغرف).
2.  ابحث في قائمة العقارات الأخرى عن 3 عقارات هي الأكثر شبهاً بالعقار الحالي.
3.  أعط الأولوية للتشابه في الموقع والسعر والنوع.
4.  لكل عقار مقترح، اذكر سببًا موجزًا ومقنعًا يوضح لماذا هو مشابه للعقار الحالي.
`
  };
  
  const systemInstruction = `أنت مساعد خبير في التسويق العقاري. مهمتك هي اقتراح عقارات مشابهة للمستخدم بناءً على العقار الذي يشاهده حالياً. يجب أن يكون ردك بتنسيق JSON حصراً بناءً على المخطط المحدد. إذا لم تجد أي عقارات مشابهة، أعد مصفوفة فارغة.`;

  const contents = { parts: [textPart] };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: suggestionsSchema,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        return [];
    }
    const result = JSON.parse(jsonText) as AIPropertySearchResult[];
    return result;

  } catch (error) {
    console.error("Gemini property suggestion failed:", error);
    // Don't throw an error that breaks the page, just return empty array.
    return [];
  }
};