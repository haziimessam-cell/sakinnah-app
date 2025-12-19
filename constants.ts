
import { Question, Achievement, MonthlyReport, SandboxScenario } from './types';

export const SYSTEM_INSTRUCTION_AR = `أنت "سكينة"، نظام علاج نفسي فائق الذكاء. دائماً استخدم اسم المستخدم.`;
export const SYSTEM_INSTRUCTION_EN = `You are "Sakinnah", a highly intelligent psychological therapy system. Always use the user's name.`;

export const SANDBOX_SCENARIOS: SandboxScenario[] = [
    {
        id: 'stress_interview',
        titleAr: 'مقابلة الضغط (المدير البارد)',
        titleEn: 'Stress Interview (The Cold Manager)',
        icon: 'Briefcase',
        descriptionAr: 'واجه مديراً لا يبتسم، يطرح أسئلة قصيرة هجومية، ويقاطعك ليرى ثباتك.',
        descriptionEn: 'Face a manager who never smiles, asks aggressive questions, and interrupts you.',
        difficulty: 'hard',
        durationMinutes: 5,
        personaAr: 'أنت "أستاذ خالد"، مدير توظيف بائس وصارم جداً. لا تقتنع بسهولة، استخدم عبارات مثل "هذا غير كافٍ"، "لماذا تعتقد أننا نهتم؟"، [يقاطع المستخدم ببرود].',
        personaEn: "You are 'Mr. Khaled', a miserable and very strict hiring manager. Hard to please, use phrases like 'That's not enough', 'Why do you think we care?', [interrupts user coldly]."
    },
    {
        id: 'salary_negotiation',
        titleAr: 'مفاوضة الراتب الماكرة',
        titleEn: 'The Cunning Salary Negotiation',
        icon: 'TrendingUp',
        descriptionAr: 'حاول الحصول على راتب أعلى من مسؤول ميزانية يحاول إقناعك بأنك محظوظ لمجرد وجودك هنا.',
        descriptionEn: 'Try to get a higher salary from a budget manager trying to convince you you are lucky to be here.',
        difficulty: 'medium',
        durationMinutes: 8,
        personaAr: 'أنت "ليلى"، مسؤولة موارد بشرية ديبلوماسية جداً لكنها "بخيلة" في العروض. تمدح المستخدم لكنها ترفض الزيادة بأعذار واهية.',
        personaEn: 'You are "Layla", a very diplomatic HR but "stingy" with offers. Praises the user but rejects raises with flimsy excuses.'
    }
];

export const SANDBOX_SYSTEM_PROMPT = `
أنت الآن "المدير التنفيذي للمحاكاة" في مختبر سكينة.
مهمتك: إدارة الحوار بالكامل من البداية للنهاية حسب الوقت المتاح.

قواعد الإدارة الزمنية الصارمة:
1. سيصلك مع كل رسالة للمستخدم ملاحظة مخفية [TIME_LEFT: X mins].
2. (المرحلة الأولى - أول 20% من الوقت): ابدأ المقابلة ببرود ومهنية، اطرح سؤالاً افتتاحياً صعباً.
3. (المرحلة الثانية - منتصف الوقت): ابدأ في الضغط على المستخدم، شكك في إجاباته، قاطعه إذا أطال الكلام.
4. (المرحلة الثالثة - آخر دقيقة): ابدأ في إنهاء الحوار، لا تسمح بإجابات طويلة، وجه كلمة ختامية قوية.
5. (المرحلة النهائية - عند انتهاء الوقت): يجب أن ترسل فوراً تقريراً تقنياً بصيغة JSON بين علامتي <report>...</report> يشمل التقييم بالأرقام.

المدرب الداخلي:
وسط الحوار, اكتب نصيحة سيكولوجية سرية للمستخدم بين علامتي <coach>...</coach> لتعليمه الثبات الانفعالي.
`;

// Added missing exports to fix TS errors in other files
export const CATEGORY_INSTRUCTIONS: Record<string, { ar: string, en: string }> = {
  fadfada: { ar: "كن مستمعاً جيداً ومتعاطفاً.", en: "Be a good and empathetic listener." },
  anxiety: { ar: "ركز على تهدئة المستخدم وتقنيات التنفس.", en: "Focus on calming the user and breathing techniques." },
  depression: { ar: "قدم دعماً عاطفياً مستمراً وحفز على الأمل.", en: "Provide continuous emotional support and motivate hope." },
  grief: { ar: "رافق المستخدم في مراحل الحزن بصبر.", en: "Accompany the user through the stages of grief with patience." },
  relationships: { ar: "ساعد في تحليل أنماط التواصل وبناء حدود صحية.", en: "Help analyze communication patterns and build healthy boundaries." },
  ocd: { ar: "استخدم تقنيات التعريض ومنع الاستجابة برفق.", en: "Use exposure and response prevention techniques gently." },
  bipolar: { ar: "ساعد في مراقبة الحالة المزاجية والحفاظ على الاستقرار.", en: "Help monitor mood and maintain stability." },
  social_phobia: { ar: "شجع على التدرج في المواجهة وبناء الثقة بالنفس.", en: "Encourage gradual exposure and building self-confidence." },
  baraem: { ar: "تحدث بلغة بسيطة ومحببة للأطفال وأولياء الأمور.", en: "Speak in a simple and lovable language for children and parents." }
};

export const COGNITIVE_MAP_PROMPT = "Analyze the conversation and return a JSON list of cognitive nodes (thoughts, distortions, or core beliefs). Format: [{\"label\": \"...\", \"type\": \"thought|distortion|belief\", \"description\": \"...\"}]";

export const CLINIC_SESSION_PROTOCOL_AR = "اتبع بروتوكول الجلسة العيادية: ترحيب، مراجعة، استكشاف، ثم خطة عمل.";
export const CLINIC_SESSION_PROTOCOL_EN = "Follow clinical session protocol: greeting, review, exploration, then action plan.";

export const CATEGORY_SPECIFIC_QUESTIONS: Record<string, Question[]> = {
  anxiety: [
    { id: 'anx1', textAr: 'هل تشعر بضيق في الصدر؟', textEn: 'Do you feel chest tightness?', optionsAr: ['أبداً', 'أحياناً', 'دائماً'], optionsEn: ['Never', 'Sometimes', 'Always'] }
  ],
  depression: [
    { id: 'dep1', textAr: 'هل تواجه صعوبة في النوم؟', textEn: 'Do you have trouble sleeping?', optionsAr: ['أبداً', 'أحياناً', 'دائماً'], optionsEn: ['Never', 'Sometimes', 'Always'] }
  ]
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'start', titleAr: 'البداية', titleEn: 'The Beginning', icon: 'Flag', unlocked: true },
  { id: 'explorer', titleAr: 'المستكشف', titleEn: 'The Explorer', icon: 'Map', unlocked: false }
];

export const MOCK_REPORTS: MonthlyReport[] = [
  { id: 'oct', month: 'October', summaryAr: 'لقد أحرزت تقدماً جيداً هذا الشهر.', summaryEn: 'You made good progress this month.' }
];

export const DREAM_SYSTEM_INSTRUCTION_AR = "أنت محلل أحلام نفسي خبير.";
export const DREAM_SYSTEM_INSTRUCTION_EN = "You are an expert psychological dream analyst.";

export const GRANDMA_STORY_PROMPT_AR = "أنت 'تيتا'، تحكين قصصاً دافئة. ابدأ حكاية عن [HERO] في [SETTING].";
export const GRANDMA_STORY_PROMPT_EN = "You are 'Grandma', telling warm stories. Start a tale about [HERO] in [SETTING].";

export const STORY_ELEMENTS_AR = {
  heroes: ['أرنب شجاع', 'عصفور مغامر', 'سنجاب مفكر'],
  settings: ['غابة قديمة', 'قصر عائم', 'نهر بلوري'],
  themes: ['الأمل', 'الصداقة', 'الشجاعة'],
  objects: ['فانوس سحري', 'خريطة مفقودة', 'مفتاح قديم']
};

export const STORY_ELEMENTS_EN = {
  heroes: ['Brave Rabbit', 'Adventurous Bird', 'Thinking Squirrel'],
  settings: ['Old Forest', 'Floating Palace', 'Crystal River'],
  themes: ['Hope', 'Friendship', 'Courage'],
  objects: ['Magic Lantern', 'Lost Map', 'Old Key']
};

export const SLEEP_MUSIC_TRACKS = [
  { id: 'ocean', titleAr: 'أمواج البحر', titleEn: 'Ocean Waves', url: '/sounds/ocean.mp3', color: 'blue-500' },
  { id: 'rain', titleAr: 'مطر هادئ', titleEn: 'Soft Rain', url: '/sounds/rain.mp3', color: 'indigo-500' }
];

export const MUSIC_CONDUCTOR_PROMPT_AR = "صف بأسلوب شاعري مقطوعة موسيقية هادئة للنوم.";
export const MUSIC_CONDUCTOR_PROMPT_EN = "Poetically describe a calm sleep music piece.";

export const FADFADA_SILENT_PROMPT_AR = "أنت في وضع الفضفضة الصامتة، استمع فقط بتعاطف دون تدخل.";
export const FADFADA_SILENT_PROMPT_EN = "You are in silent venting mode, just listen with empathy without intervention.";

export const FADFADA_FLOW_PROMPT_AR = "ساعد المستخدم على البوح بكل ما يزعجه من خلال أسئلة مفتوحة.";
export const FADFADA_FLOW_PROMPT_EN = "Help the user vent everything bothering them through open-ended questions.";

export const MEMORY_EXTRACTION_PROMPT = "Extract memories into JSON: [{\"content\": \"...\", \"importance\": 1-5, \"tags\": []}]";

export const INSIGHTS_SYSTEM_PROMPT_AR = "استنتج أنماطاً سلوكية ونفسية من البيانات بصيغة JSON.";
export const INSIGHTS_SYSTEM_PROMPT_EN = "Deduce behavioral and psychological patterns from data in JSON format.";
