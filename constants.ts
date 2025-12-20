
import { Question, Achievement, MonthlyReport, SandboxScenario, Category } from './types';

export const CATEGORIES: Category[] = [
    { id: 'depression', icon: 'CloudRain', color: 'bg-indigo-500' },
    { id: 'anxiety', icon: 'Zap', color: 'bg-teal-500' },
    { id: 'bipolar', icon: 'Zap', color: 'bg-amber-500' }, 
    { id: 'relationships', icon: 'Heart', color: 'bg-rose-500' },
    { id: 'ocd', icon: 'RefreshCw', color: 'bg-purple-500' },
    { id: 'baraem', icon: 'Sprout', color: 'bg-lime-500' },
    { id: 'sleep', icon: 'Moon', color: 'bg-slate-800' }
];

export const ASSESSMENT_QUESTIONS: Record<string, Question[]> = {
  // مقياس PHQ-9 للاكتئاب
  depression: [
    { id: 'd1', textAr: "ضعف الاهتمام أو الرغبة في القيام بالأنشطة؟", textEn: "Little interest or pleasure in doing things?", optionsAr: ["أبداً", "عدة أيام", "أكثر من نصف الأيام", "تقريباً كل يوم"], optionsEn: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
    { id: 'd2', textAr: "الشعور بالحزن، الاكتئاب، أو اليأس؟", textEn: "Feeling down, depressed, or hopeless?", optionsAr: ["أبداً", "عدة أيام", "أكثر من نصف الأيام", "تقريباً كل يوم"], optionsEn: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
    { id: 'd3', textAr: "صعوبة في النوم أو البقاء نائماً، أو النوم الزائد؟", textEn: "Trouble falling or staying asleep, or sleeping too much?", optionsAr: ["أبداً", "عدة أيام", "أكثر من نصف الأيام", "تقريباً كل يوم"], optionsEn: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
    { id: 'd4', textAr: "الشعور بالتعب أو ضعف الطاقة؟", textEn: "Feeling tired or having little energy?", optionsAr: ["أبداً", "عدة أيام", "أكثر من نصف الأيام", "تقريباً كل يوم"], optionsEn: ["Not at all", "Several days", "More than half the days", "Nearly every day"] }
  ],
  // مقياس GAD-7 للقلق
  anxiety: [
    { id: 'a1', textAr: "الشعور بالتوتر، القلق، أو الانزعاج الشديد؟", textEn: "Feeling nervous, anxious, or on edge?", optionsAr: ["أبداً", "عدة أيام", "أكثر من نصف الأيام", "تقريباً كل يوم"], optionsEn: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
    { id: 'a2', textAr: "عدم القدرة على التوقف عن القلق أو التحكم فيه؟", textEn: "Not being able to stop or control worrying?", optionsAr: ["أبداً", "عدة أيام", "أكثر من نصف الأيام", "تقريباً كل يوم"], optionsEn: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
    { id: 'a3', textAr: "القلق المفرط بشأن أشياء مختلفة؟", textEn: "Worrying too much about different things?", optionsAr: ["أبداً", "عدة أيام", "أكثر من نصف الأيام", "تقريباً كل يوم"], optionsEn: ["Not at all", "Several days", "More than half the days", "Nearly every day"] }
  ],
  // مقياس العلاقات - Gottman Inventory
  relationships: [
    { id: 'r1', textAr: "هل تشعر أن شريكك يفهم أحلامك وطموحاتك؟", textEn: "Does your partner understand your dreams and goals?", optionsAr: ["نادراً", "أحياناً", "غالباً", "دائماً"], optionsEn: ["Rarely", "Sometimes", "Often", "Always"] },
    { id: 'r2', textAr: "عند الخلاف، هل يتحول النقاش إلى هجوم شخصي؟", textEn: "During conflict, does the discussion turn into a personal attack?", optionsAr: ["دائماً", "غالباً", "أحياناً", "نادراً"], optionsEn: ["Always", "Often", "Sometimes", "Rarely"] }
  ],
  // مقياس الوسواس القهري - Y-BOCS
  ocd: [
    { id: 'o1', textAr: "كم من الوقت تقضيه في التفكير في أفكار غير مرغوب فيها؟", textEn: "How much time do you spend on unwanted thoughts?", optionsAr: ["أقل من ساعة", "1-3 ساعات", "3-8 ساعات", "أكثر من 8 ساعات"], optionsEn: ["< 1 hour", "1-3 hours", "3-8 hours", "> 8 hours"] },
    { id: 'o2', textAr: "هل تشعر بضيق شديد إذا لم تقم بـ 'طقوس' معينة (نظافة، ترتيب)؟", textEn: "Do you feel extreme distress if you don't perform certain rituals?", optionsAr: ["لا", "قليلاً", "بشدة", "بشكل معطل"], optionsEn: ["No", "Mildly", "Severely", "Disablingly"] }
  ],
  // مقياس التربية (البراعم) - Positive Parenting
  baraem: [
    { id: 'p1', textAr: "هل تجد صعوبة في التعامل مع نوبات غضب طفلك؟", textEn: "Do you find it hard to handle your child's tantrums?", optionsAr: ["نادراً", "أحياناً", "غالباً", "دائماً"], optionsEn: ["Rarely", "Sometimes", "Often", "Always"] }
  ]
};

export const CLINICAL_PROTOCOLS = {
  DEPRESSION_CBT: "Behavioral Activation, Cognitive Restructuring, and Core Belief modification based on Beck's model.",
  ANXIETY_MBSR: "Mindfulness-Based Stress Reduction and Decentering from anxious thoughts.",
  OCD_ERP: "Exposure and Response Prevention: Gradual exposure to obsessions without performing compulsions.",
  RELATIONS_GOTTMAN: "The Sound Relationship House: Building Love Maps, Fondness, and managing conflict constructively.",
  BIPOLAR_IPSRT: "Interpersonal and Social Rhythm Therapy: Stabilizing circadian rhythms and social routines.",
  PARENTING_POSITIVE: "Connection before Correction: Focus on emotional regulation and firm but kind boundaries."
};

export const SYSTEM_INSTRUCTION_AR = `
أنت "سكينة"، نظام ذكاء اصطناعي إكلينيكي فائق التطور. 
خلفيتك العلمية مستمدة من DSM-5، ICD-11، وأحدث دراسات الجمعية الأمريكية لعلم النفس (APA).

القواعد العلمية الصارمة لسكينة:
1. في الاكتئاب: استخدم بروتوكول "التنشيط السلوكي". شجع على الأنشطة الصغيرة التراكمية.
2. في القلق: ركز على "اليقظة الذهنية" والتمييز بين القلق المنتج وغير المنتج.
3. في الوسواس (OCD): لا تقدم تطمينات مؤقتة (تزيد الوسواس)، بل شجع على "منع الاستجابة" (ERP).
4. في العلاقات: طبق مبادئ "جون غوتمان" (الفرسان الأربعة: النقد، الازدراء، الدفاعية، المماطلة).
5. في التربية: ركز على "التنظيم الذاتي" للوالد أولاً ثم "الاحتواء العاطفي" للطفل.
6. المصطلحات: استخدم مصطلحات مثل (Schema, Neuroplasticity, Circadian Rhythm) مع تبسيطها.
7. التشخيص التفريقي: ابحث دائماً عن تداخل الأعراض (Comorbidity).
`;

export const SYSTEM_INSTRUCTION_EN = `
You are "Sakinnah", a hyper-advanced clinical AI system.
Your scientific foundation is derived from DSM-5, ICD-11, and the latest APA guidelines.

Sakinnah's Strict Clinical Rules:
1. Depression: Use the "Behavioral Activation" protocol. Encourage small, cumulative steps.
2. Anxiety: Focus on "Mindfulness" and distinguishing between productive and unproductive worry.
3. OCD: Avoid temporary reassurances; promote "Exposure and Response Prevention" (ERP).
4. Relationships: Apply Gottman's principles (The Four Horsemen).
5. Parenting: Focus on parental self-regulation and child's emotional containment.
6. Terminology: Use and simplify clinical terms like Schema, Neuroplasticity, and Circadian Rhythm.
7. Differential Diagnosis: Always check for symptom overlaps (Comorbidity).
`;

export const RELATIONSHIP_PROTOCOL_AR = "بروتوكول الوساطة في العلاقات الزوجية باستخدام مبادئ غوتمان.";
export const RELATIONSHIP_PROTOCOL_EN = "Relationship mediation protocol based on Gottman principles.";
export const EMPATHY_TRANSLATOR_PROMPT = "You are an empathy translator. Convert aggressive messages into non-violent communication.";

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', titleAr: "البداية", titleEn: "The Beginning", icon: 'Flag', unlocked: true },
  { id: 'a2', titleAr: "المستكشف", titleEn: "The Explorer", icon: 'Map', unlocked: false }
];

export const MOCK_REPORTS: MonthlyReport[] = [
  { id: 'r1', month: 'January', summaryAr: "ملخص شهر يناير", summaryEn: "January Summary" }
];

export const DREAM_SYSTEM_INSTRUCTION_AR = "أنت خبير في تحليل الأحلام النفسي بناءً على مدارس يونغ وفرويد.";
export const DREAM_SYSTEM_INSTRUCTION_EN = "You are a psychological dream analyst based on Jungian and Freudian schools.";

export const GRANDMA_STORY_PROMPT_AR = "احكِ حكاية قبل النوم للأطفال بأسلوب دافئ وهادئ.";
export const GRANDMA_STORY_PROMPT_EN = "Tell a bedtime story for children in a warm and calm style.";

export const STORY_ELEMENTS_AR = {
  heroes: ["سندباد", "ليلى", "فارس الشجاع"],
  settings: ["غابة مسحورة", "جزيرة بعيدة", "قصر في الغيوم"],
  themes: ["الشجاعة", "الصداقة", "الاكتشاف"],
  objects: ["خريطة قديمة", "مصباح سحري", "ريشة طائرة"]
};

export const STORY_ELEMENTS_EN = {
  heroes: ["Sinbad", "Lily", "Brave Knight"],
  settings: ["Enchanted Forest", "Distant Island", "Castle in the Clouds"],
  themes: ["Bravery", "Friendship", "Discovery"],
  objects: ["Old Map", "Magic Lamp", "Flying Feather"]
};

export const SLEEP_MUSIC_TRACKS = [
  { id: 't1', titleAr: "أمواج هادئة", titleEn: "Calm Waves", url: "https://example.com/waves.mp3", color: "blue" },
  { id: 't2', titleAr: "مطر خفيف", titleEn: "Light Rain", url: "https://example.com/rain.mp3", color: "teal" }
];

export const MUSIC_CONDUCTOR_PROMPT_AR = "أنت مايسترو الهدوء، صف الأجواء الموسيقية للنوم.";
export const MUSIC_CONDUCTOR_PROMPT_EN = "You are the maestro of calm, describe the musical atmosphere for sleep.";

export const FADFADA_SILENT_PROMPT_AR = "أنا هنا لأستمع إليك بصمت واحتواء تام.";
export const FADFADA_SILENT_PROMPT_EN = "I am here to listen to you in complete silence and containment.";
export const FADFADA_FLOW_PROMPT_AR = "دع مشاعرك تتدفق بحرية، أنا أتابعك بكل اهتمام.";
export const FADFADA_FLOW_PROMPT_EN = "Let your feelings flow freely, I am following you with full attention.";

export const MEMORY_EXTRACTION_PROMPT = "Extract key psychological markers and events from the user's input.";
export const INSIGHTS_SYSTEM_PROMPT_AR = "أنت محلل بيانات سلوكي، استخرج الأنماط العميقة من ذكريات المستخدم.";
export const INSIGHTS_SYSTEM_PROMPT_EN = "You are a behavioral data analyst, extract deep patterns from the user's memories.";

export const SANDBOX_SCENARIOS: SandboxScenario[] = [
  { id: 's1', titleAr: "مقابلة عمل صعبة", titleEn: "Tough Job Interview", icon: 'Briefcase', descriptionAr: "محاكاة لمقابلة عمل مع مدير متطلب.", descriptionEn: "Simulating a job interview with a demanding manager.", difficulty: 'medium', durationMinutes: 10, personaAr: "مدير صارم", personaEn: "Strict Manager" }
];
export const SANDBOX_SYSTEM_PROMPT = "You are a social simulator. Act out difficult scenarios to build user resilience.";
