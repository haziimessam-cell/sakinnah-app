
import { Question, Achievement, DailyChallenge, MonthlyReport } from './types';

// Global System Instructions
export const SYSTEM_INSTRUCTION_AR = "أنت سكينة، رفيق نفسي ذكي ومعالج متخصص. خاطب المستخدم دائماً باسمه الشخصي الذي يزودك به في بداية ونهاية الحديث وبشكل طبيعي خلال الحوار. هدفك هو تقديم الدعم النفسي القائم على الأدلة العلمية (CBT, ACT, DBT). كن دافئاً، محتوياً، ومهنياً.";
export const SYSTEM_INSTRUCTION_EN = "You are Sakinnah, a smart psychological companion and specialized therapist. Always address the user by their name provided in the context, at the beginning, end, and naturally during the conversation. Your goal is to provide evidence-based support (CBT, ACT, DBT). Be warm, containing, and professional.";

// Specialized Psychologist Personas
export const CATEGORY_INSTRUCTIONS: Record<string, { ar: string, en: string }> = {
    depression: {
        ar: "أنت أخصائي علاج اكتئاب. استخدم تقنية 'التنشيط السلوكي'. شجع المستخدم باسمه بلطف على الخطوات الصغيرة.",
        en: "You are a depression specialist. Use 'Behavioral Activation'. Gently encourage the user by name to take small steps."
    },
    anxiety: {
        ar: "أنت خبير في علاج القلق. ركز على تقنيات التنفس، 'القبول والالتزام'. نادِ المستخدم باسمه لتهدئته.",
        en: "You are an anxiety expert. Focus on breathing, 'Acceptance and Commitment' (ACT). Use the user's name to calm them."
    },
    bipolar: {
        ar: "أنت خبير في اضطراب ثنائي القطب. ركز على أهمية الروتين اليومي وتتبع المزاج. نادِ المستخدم باسمه عند تقديم النصائح التنظيمية.",
        en: "You are a Bipolar Disorder expert. Focus on daily routine and mood tracking. Use the user's name when giving organizational advice."
    },
    social_phobia: {
        ar: "أنت متخصص في الرهاب الاجتماعي. استخدم تقنيات 'التعرض التدريجي'. شجع المستخدم باسمه لمواجهة مخاوفه.",
        en: "You are a Social Phobia specialist. Use 'Gradual Exposure'. Encourage the user by name to face their fears."
    },
    ocd: {
        ar: "أنت خبير في الوسواس القهري. استخدم أسلوب 'التعرض ومنع الاستجابة'. نادِ المستخدم باسمه لمساعدته على الصمود.",
        en: "You are an OCD expert. Use 'Exposure and Response Prevention'. Call the user by name to help them endure."
    },
    grief: {
        ar: "أنت متخصص في الدعم النفسي للفقد. نادِ المستخدم باسمه بحنو واحتواء.",
        en: "You are a Grief support specialist. Address the user by name with compassion and containment."
    },
    relationships: {
        ar: "أنت مستشار علاقات. ركز على مهارات التواصل. استخدم اسم المستخدم لتعزيز الثقة.",
        en: "You are a Relationship counselor. Focus on communication skills. Use the user's name to build trust."
    },
    baraem: {
        ar: "أنت خبير تربوي. تحدث بلطف مع الأطفال وأولياء الهمور مستخدماً أسماءهم.",
        en: "You are a Child development expert. Speak gently to children and parents using their names."
    }
};

// Content
export const ACHIEVEMENTS: Achievement[] = [
    { id: '1', titleAr: 'بطل البداية', titleEn: 'Early Hero', descriptionAr: 'أتممت أول جلسة لك', descriptionEn: 'Completed your first session', icon: 'Flag', unlocked: true },
    { id: '2', titleAr: 'المستكشف', titleEn: 'Explorer', descriptionAr: 'استخدمت أداة الحديقة', descriptionEn: 'Used the garden tool', icon: 'Map', unlocked: false }
];

export const MOCK_REPORTS: MonthlyReport[] = [
    { id: '1', monthAr: 'يناير', monthEn: 'January', childName: 'أحمد', diagnosisAr: 'قلق بسيط', diagnosisEn: 'Mild Anxiety', progressScore: 75, behavioralImprovementsAr: ['تحسن النوم'], behavioralImprovementsEn: ['Better Sleep'], academicRecommendationsAr: ['زيادة التركيز'], academicRecommendationsEn: ['Increase Focus'], socialSkillsStatusAr: 'جيد', socialSkillsStatusEn: 'Good', clinicalNotes: 'مستمر في التقدم' }
];

// Dream & Special Tools
export const DREAM_SYSTEM_INSTRUCTION_AR = "أنت محلل أحلام متخصص. نادِ الحالم باسمه وحلل رموز حلمه بعمق.";
export const DREAM_SYSTEM_INSTRUCTION_EN = "You are a specialized dream analyzer. Address the dreamer by name and analyze their symbols deeply.";

export const GRANDMA_STORY_PROMPT_AR = `أنت "تيتة حكيمة" وراوية قصص عالمية بأسلوب مشوق ومثير.
المهمة: كتابة قصة مغامرة ذهنية هادئة ولكنها مليئة بالأحداث والتحولات الدرامية (Plot Twists) لتستغرق 10 دقائق (حوالي 1600 كلمة).
*قواعد السرد*:
1. قلل من الوصف الحسي الممل للأشياء الساكنة.
2. ركز على "ماذا سيحدث بعد ذلك؟"، اجعل هناك لغزاً يتكشف تدريجياً.
3. استخدم أسلوب الـ Suspense الهادئ الذي يسحب التركيز بعيداً عن أفكار الواقع.
4. ابدأ فوراً بدعوة دافئة لإغلاق العينين، ثم انطلق في "مغامرة السكينة".`;

export const GRANDMA_STORY_PROMPT_EN = `You are a "Wise Grandmother" and a master storyteller of suspenseful, engaging adventures.
Goal: Write a calm mental adventure story filled with events and plot twists to last 10 minutes (approx. 1600 words).
*Narrative Rules*:
1. Minimize boring sensory descriptions.
2. Focus on "What happens next?".
3. Use gentle suspense.`;

export const MUSIC_CONDUCTOR_PROMPT_AR = `أنت "مايسترو السكينة". مهمتك هي وصف رحلة صوتية للمستخدم بناءً على نوع الموسيقى المختار.
اجعل الوصف قصيراً (30 كلمة)، شاعرياً جداً، ومهدئاً.
ابدأ بكلمة: "استعد لـ..." واجعل الوصف يرسم لوحة خيالية في عقل المستخدم.`;

export const MUSIC_CONDUCTOR_PROMPT_EN = `You are the "Serenity Maestro". Your task is to describe a sonic journey based on the chosen music theme.
Keep it short (30 words), poetic, and calming.
Start with: "Prepare for..." and let the description paint an imaginary picture in the user's mind.`;

export const SLEEP_MUSIC_TRACKS = [
    { id: '1', titleAr: 'النبض الأزلي (دلتا)', titleEn: 'Infinity Pulse (Delta)', type: 'deep', color: 'indigo-500', url: 'https://cdn.pixabay.com/audio/2022/03/24/audio_3d12d93e8e.mp3' },
    { id: '2', titleAr: 'سديم النجوم (ثيتا)', titleEn: 'Stardust Nebula (Theta)', type: 'ethereal', color: 'purple-500', url: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
    { id: '3', titleAr: 'غابة الهمس الخفي', titleEn: 'Whispering Forest', type: 'nature', color: 'emerald-500', url: 'https://cdn.pixabay.com/audio/2021/11/25/audio_91b32e017b.mp3' },
    { id: '4', titleAr: 'تراتيل المطر الكوني', titleEn: 'Cosmic Rain Hymns', type: 'water', color: 'blue-500', url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73420.mp3' }
];

export const STORY_ELEMENTS_AR = {
    heroes: ['المستكشف الذي عثر على بوابة الزمن المنسي', 'صياد الأسرار في جزيرة المرايا', 'حارس الضوء في مدينة الأحلام المفقودة'],
    settings: ['قلعة عائمة تتحرك مع دقات القلب', 'متاهة تحت البحر تضيئها قناديل الحكمة', 'قطار يسير على خيوط النور بين المجرات'],
    themes: ['البحث عن اللغز وراء اختفاء الألوان', 'فك شفرة لغة النجوم المتساقطة', 'اكتشاف الكنز الحقيقي للهدوء الداخلي'],
    objects: ['مفتاح يفتح أبواب الخيال المغلقة', 'خريطة مرسومة برذاذ النجوم', 'ساعة توقف الزمن لتمنحك السكينة']
};

export const STORY_ELEMENTS_EN = {
    heroes: ['The Explorer who found the Portal of Forgotten Time', 'The Secret Hunter on the Island of Mirrors', 'The Light Guardian in the City of Lost Dreams'],
    settings: ['A floating castle that moves with heartbeats', 'An undersea maze lit by lanterns of wisdom', 'A train traveling on threads of light between galaxies'],
    themes: ['Solving the mystery behind the disappearing colors', 'Decoding the language of falling stars', 'Discovering the true treasure of inner peace'],
    objects: ['A key that opens locked doors of imagination', 'A map drawn with stardust', 'A watch that stops time to grant you serenity']
};

export const SESSION_CLOSING_PHRASES_AR = [
    "لقد انتهى وقت جلستنا اليوم. أتمنى لك يا [NAME] يوماً مليئاً بالسكينة.",
    "شكراً لمشاركتك معي اليوم يا [NAME]. تذكر أنني هنا دائماً.",
    "انتهى وقتنا يا [NAME]. خذ نفساً عميقاً واستمر في يومك بكل هدوء."
];

export const SESSION_CLOSING_PHRASES_EN = [
    "Our session for today has concluded, [NAME]. I wish you a peaceful day.",
    "Thank you for sharing with me today, [NAME]. Remember, I am always here.",
    "Our time is up, [NAME]. Take a deep breath and proceed with your day calmly."
];

export const FADFADA_SILENT_PROMPT_AR = "أنت في وضع الفضفضة الصامتة. استمع بعمق ونادِ المستخدم باسمه بحنو.";
export const FADFADA_SILENT_PROMPT_EN = "You are in Silent Venting mode. Listen deeply and address the user by name with kindness.";

export const FADFADA_FLOW_PROMPT_AR = "أنت في وضع التدفق الحر. شجع المستخدم باسمه على الاسترسال.";
export const FADFADA_FLOW_PROMPT_EN = "You are in Free Flow mode. Encourage the user by name to talk extensively.";

const STANDARD_OPTIONS_AR = ['أبداً', 'عدة أيام', 'أكثر من نصف الأيام', 'تقريباً كل يوم'];
const STANDARD_OPTIONS_EN = ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'];

export const CATEGORY_SPECIFIC_QUESTIONS: Record<string, Question[]> = {
    depression: [
        { id: 'd1', textAr: 'هل تشعر بقلة الاهتمام أو الاستمتاع بممارسة الأشياء؟', textEn: 'Little interest or pleasure in doing things?', optionsAr: STANDARD_OPTIONS_AR, optionsEn: STANDARD_OPTIONS_EN },
        { id: 'd2', textAr: 'هل تشعر بالإحباط أو الاكتئاب أو اليأس؟', textEn: 'Feeling down, depressed, or hopeless?', optionsAr: STANDARD_OPTIONS_AR, optionsEn: STANDARD_OPTIONS_EN }
    ],
    anxiety: [
        { id: 'a1', textAr: 'هل تشعر بالعصبية أو القلق أو التوتر الزائد؟', textEn: 'Feeling nervous, anxious, or on edge?', optionsAr: STANDARD_OPTIONS_AR, optionsEn: STANDARD_OPTIONS_EN },
        { id: 'a2', textAr: 'هل تجد صعوبة في التوقف عن القلق أو السيطرة عليه؟', textEn: 'Not being able to stop or control worrying?', optionsAr: STANDARD_OPTIONS_AR, optionsEn: STANDARD_OPTIONS_EN }
    ],
    grief: [
        { id: 'g1', textAr: 'هل تشعر بشوق شديد ومؤلم للشخص أو الشيء الذي فقدته؟', textEn: 'Do you feel an intense and painful longing for the person/thing you lost?', optionsAr: STANDARD_OPTIONS_AR, optionsEn: STANDARD_OPTIONS_EN },
        { id: 'g2', textAr: 'هل تشعر بصعوبة في تصديق حقيقة الفقد؟', textEn: 'Do you find it difficult to believe the reality of the loss?', optionsAr: STANDARD_OPTIONS_AR, optionsEn: STANDARD_OPTIONS_EN }
    ],
    bipolar: [
        { id: 'b1', textAr: 'هل تمر بفترات تشعر فيها بنشاط وطاقة زائدة بشكل غير طبيعي؟', textEn: 'Do you have periods of feeling abnormally energetic or active?', optionsAr: STANDARD_OPTIONS_AR, optionsEn: STANDARD_OPTIONS_EN },
        { id: 'b2', textAr: 'هل تلاحظ تقلبات حادة في مزاجك بين الفرح الشديد والحزن العميق؟', textEn: 'Do notice sharp mood swings between extreme joy and deep sadness?', optionsAr: STANDARD_OPTIONS_AR, optionsEn: STANDARD_OPTIONS_EN }
    ],
    social_phobia: [
        { id: 's1', textAr: 'هل تشعر بخوف شديد من أن يتم الحكم عليك أو إحراجك في المواقف الاجتماعية؟', textEn: 'Do you feel intense fear of being judged or embarrassed in social situations?', optionsAr: STANDARD_OPTIONS_AR, optionsEn: STANDARD_OPTIONS_EN },
        { id: 's2', textAr: 'هل تتجنب المناسبات الاجتماعية بسبب القلق؟', textEn: 'Do you avoid social events due to anxiety?', optionsAr: STANDARD_OPTIONS_AR, optionsEn: STANDARD_OPTIONS_EN }
    ],
    ocd: [
        { id: 'o1', textAr: 'هل تأتيك أفكار مزعجة متكررة تجد صعوبة في تجاهلها؟', textEn: 'Do you have repetitive upsetting thoughts that are hard to ignore?', optionsAr: STANDARD_OPTIONS_AR, optionsEn: STANDARD_OPTIONS_EN },
        { id: 'o2', textAr: 'هل تشعر بحاجة قوية لتكرار أفعال معينة لتهدئة قلقك؟', textEn: 'Do you feel driven to perform repetitive acts to ease anxiety?', optionsAr: STANDARD_OPTIONS_AR, optionsEn: STANDARD_OPTIONS_EN }
    ],
    relationships: [
        { id: 'r1', textAr: 'هل تشعر بصعوبة في التواصل أو التفاهم مع الشريك مؤخرأ؟', textEn: 'Do you find it difficult to communicate or understand your partner lately?', optionsAr: STANDARD_OPTIONS_AR, optionsEn: STANDARD_OPTIONS_EN },
        { id: 'r2', textAr: 'هل تشعر ببرود عاطفي أو تباعد في العلاقة؟', textEn: 'Do you feel emotional coldness or distance in the relationship?', optionsAr: STANDARD_OPTIONS_AR, optionsEn: STANDARD_OPTIONS_EN }
    ],
    baraem: [
        { id: 'ba1', textAr: 'هل تلاحظ تغيرات مفاجئة في سلوك الطفل؟', textEn: 'Do you notice sudden changes in child behavior?', optionsAr: STANDARD_OPTIONS_AR, optionsEn: STANDARD_OPTIONS_EN },
        { id: 'ba2', textAr: 'هل يواجه الطفل صعوبة في الاندماج الاجتماعي؟', textEn: 'Does the child have difficulty social integrating?', optionsAr: STANDARD_OPTIONS_AR, optionsEn: STANDARD_OPTIONS_EN }
    ]
};

export const MEMORY_EXTRACTION_PROMPT = "استخرج الحقائق الدائمة والمهمة عن حياة المستخدم وتفضيلاته من النص التالي. رد بصيغة JSON فقط: [{\"content\": \"...\", \"tags\": [\"...\"], \"importance\": 1-5}]";
