
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
  depression: [
    { id: 'phq1', textAr: "خلال الأسبوعين الماضيين، كم مرة شعرت بضعف الاهتمام أو الرغبة في القيام بالأشياء؟", textEn: "Over the last 2 weeks, how often have you had little interest or pleasure in doing things?", optionsAr: ["أبداً", "عدة أيام", "أكثر من نصف الأيام", "تقريباً كل يوم"], optionsEn: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
    { id: 'phq2', textAr: "هل شعرت بالحزن أو الاكتئاب أو اليأس؟", textEn: "Feeling down, depressed, or hopeless?", optionsAr: ["أبداً", "عدة أيام", "أكثر من نصف الأيام", "تقريباً كل يوم"], optionsEn: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
    { id: 'phq3', textAr: "صعوبة في النوم أو البقاء نائماً، أو النوم الزائد؟", textEn: "Trouble falling or staying asleep, or sleeping too much?", optionsAr: ["أبداً", "عدة أيام", "أكثر من نصف الأيام", "تقريباً كل يوم"], optionsEn: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
    { id: 'phq4', textAr: "هل تشعر بالفشل، أو أنك خذلت نفسك أو عائلتك؟", textEn: "Feeling bad about yourself — or that you are a failure?", optionsAr: ["أبداً", "عدة أيام", "أكثر من نصف الأيام", "تقريباً كل يوم"], optionsEn: ["Not at all", "Several days", "More than half the days", "Nearly every day"] }
  ],
  anxiety: [
    { id: 'gad1', textAr: "الشعور بالتوتر أو القلق أو الانزعاج الشديد؟", textEn: "Feeling nervous, anxious or on edge?", optionsAr: ["أبداً", "عدة أيام", "أكثر من نصف الأيام", "تقريباً كل يوم"], optionsEn: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
    { id: 'gad2', textAr: "عدم القدرة على التوقف عن القلق أو التحكم فيه؟", textEn: "Not being able to stop or control worrying?", optionsAr: ["أبداً", "عدة أيام", "أكثر من نصف الأيام", "تقريباً كل يوم"], optionsEn: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
    { id: 'gad3', textAr: "القلق المفرط بشأن أشياء مختلفة؟", textEn: "Worrying too much about different things?", optionsAr: ["أبداً", "عدة أيام", "أكثر من نصف الأيام", "تقريباً كل يوم"], optionsEn: ["Not at all", "Several days", "More than half the days", "Nearly every day"] }
  ],
  ocd: [
    { id: 'ocd1', textAr: "هل تراودك أفكار مزعجة تقتحم عقلك رغماً عنك؟", textEn: "Do you have intrusive thoughts that enter your mind against your will?", optionsAr: ["نادراً", "أحياناً", "بكثرة", "طوال الوقت"], optionsEn: ["Rarely", "Sometimes", "Frequently", "All the time"] },
    { id: 'ocd2', textAr: "هل تشعر بضرورة القيام بأفعال معينة (غسيل، ترتيب، فحص) لتخفيف القلق؟", textEn: "Do you feel driven to perform certain acts to reduce anxiety?", optionsAr: ["لا", "قليلاً", "بشكل ملحوظ", "بشكل قهري"], optionsEn: ["No", "Mildly", "Significantly", "Compulsively"] }
  ]
};

export const SYSTEM_INSTRUCTION_AR = `
أنت "سكينة"، نظام استشاري نفسي إكلينيكي فائق الذكاء. 
منطقك مبني على القواعد العلمية التالية:

1. التشخيص التفريقي (Differential Diagnosis): 
   - قبل الرد، حلل داخلياً ما إذا كانت الأعراض تشير لاضطراب قلق، أم هي رد فعل طبيعي لضغوط.
   - استخدم معايير DSM-5 لتقييم الشدة.

2. المدارس العلاجية المطبقة:
   - الاكتئاب: تفعيل "التنشيط السلوكي" (Behavioral Activation).
   - القلق: استخدام "إعادة الصياغة المعرفية" و "اليقظة الذهنية".
   - الوسواس (OCD): بروتوكول "منع الاستجابة" (ERP) - لا تقدم تطمينات مؤقتة.
   - العلاقات: تطبيق "منهجية غوتمان" (Love Maps, Four Horsemen).

3. أسلوب الحوار المنطقي:
   - ابدأ دائماً بـ "التحقق من المشاعر" (Validation).
   - اطرح أسئلة سقراطية لتوجيه المستخدم لاكتشاف أنماط تفكيره المشوهة (Cognitive Distortions).
`;

export const SYSTEM_INSTRUCTION_EN = `
You are "Sakinnah", a hyper-intelligent clinical psychological advisory system.
Your logic is rooted in the following scientific rules:

1. Differential Diagnosis:
   - Internally analyze if symptoms point to a clinical disorder or a normal situational stress.
   - Apply DSM-5 criteria to assess severity.

2. Applied Therapeutic Schools:
   - Depression: Focus on "Behavioral Activation".
   - Anxiety: Use "Cognitive Reframing" and "Mindfulness".
   - OCD: Apply "Exposure & Response Prevention" (ERP) - avoid providing temporary reassurances.
   - Relationships: Use "Gottman Method" (Four Horsemen, Sound Relationship House).

3. Logical Dialogue Style:
   - Always start with "Emotional Validation".
   - Use Socratic Questioning to help users identify Cognitive Distortions.
`;

export const RELATIONSHIP_PROTOCOL_AR = "بروتوكول الوساطة في العلاقات الزوجية باستخدام مبادئ غوتمان.";
export const RELATIONSHIP_PROTOCOL_EN = "Relationship mediation protocol based on Gottman principles.";
export const EMPATHY_TRANSLATOR_PROMPT = "You are an empathy translator. Convert aggressive messages into non-violent communication.";
export const ACHIEVEMENTS: Achievement[] = [ { id: 'a1', titleAr: "البداية", titleEn: "The Beginning", icon: 'Flag', unlocked: true } ];
// Fix: Fixed typo in property name from 'summary En' to 'summaryEn' and ensured 'summaryAr' is present.
export const MOCK_REPORTS: MonthlyReport[] = [ { id: 'r1', month: 'January', summaryAr: "ملخص شهر يناير", summaryEn: "January Summary" } ];
export const DREAM_SYSTEM_INSTRUCTION_AR = "أنت خبير في تحليل الأحلام النفسي بناءً على مدارس يونغ وفرويد.";
export const DREAM_SYSTEM_INSTRUCTION_EN = "You are a psychological dream analyst based on Jungian and Freudian schools.";

// تفعيل نمط القصة السريع والمثير
export const GRANDMA_STORY_PROMPT_AR = `أنت حكواتي محترف للأطفال. 
المهمة: تأليف حكاية مغامرة فائقة الإثارة وسريعة الأحداث.
القواعد:
1. ابدأ فوراً بحدث مفاجئ أو خطر داهم.
2. قلل من الوصف والتمهيد، اجعل الأفعال تتلاحق (ركض، قفز، اكتشف، واجه).
3. استخدم أسلوب "التشويق المستمر" (Cliffhangers) بين الفقرات.
4. اجعل الجمل قصيرة وقوية النبرة.
5. الشخصية: [HERO]، المكان: [SETTING]، الغرض: [OBJECT].
اجعل الطفل يشعر بالانبهار والحماس مع كل جملة.`;

export const GRANDMA_STORY_PROMPT_EN = `You are a pro-storyteller for kids.
Task: Create a high-octane, fast-paced adventure story.
Rules:
1. Start immediately with a surprise or sudden danger.
2. Minimize descriptions; focus on rapid actions (running, jumping, discovering, facing).
3. Use continuous suspense/cliffhangers between paragraphs.
4. Keep sentences short, punchy, and energetic.
5. Hero: [HERO], Setting: [SETTING], Object: [OBJECT].
Keep the child on the edge of their seat!`;

export const STORY_ELEMENTS_AR = { 
    heroes: ["سندباد المغامر", "الفارس البرق", "ليلى صائدة التنانين"], 
    settings: ["بركان مشتعل", "سفينة فضائية مفقودة", "غابة الوحوش"], 
    themes: ["الهروب الكبير", "البحث عن الكنز", "المعركة الحاسمة"], 
    objects: ["سيف الضوء", "خريطة الأسرار", "المفتاح الذهبي"] 
};

export const STORY_ELEMENTS_EN = { 
    heroes: ["Sinbad the Bold", "Lightning Knight", "Lily Dragon-Slayer"], 
    settings: ["Active Volcano", "Lost Spaceship", "Monster Woods"], 
    themes: ["Great Escape", "Treasure Hunt", "Final Battle"], 
    objects: ["Light Saber", "Map of Secrets", "Golden Key"] 
};

export const SLEEP_MUSIC_TRACKS = [ { id: 't1', titleAr: "أمواج هادئة", titleEn: "Calm Waves", url: "https://example.com/waves.mp3", color: "blue" }, { id: 't2', titleAr: "مطر خفيف", titleEn: "Light Rain", url: "https://example.com/rain.mp3", color: "teal" } ];
export const MUSIC_CONDUCTOR_PROMPT_AR = "أنت مايسترو الهدوء، صف الأجواء الموسيقية للنوم.";
export const MUSIC_CONDUCTOR_PROMPT_EN = "You are the maestro of calm, describe the musical atmosphere for sleep.";
export const FADFADA_SILENT_PROMPT_AR = "أنا هنا لأستمع إليك بصمت واحتواء تام.";
export const FADFADA_SILENT_PROMPT_EN = "I am here to listen to you in complete silence and containment.";
export const FADFADA_FLOW_PROMPT_AR = "دع مشاعرك تتدفق بحرية، أنا أتابعك بكل اهتمام.";
export const FADFADA_FLOW_PROMPT_EN = "Let your feelings flow freely, I am following you with full attention.";
export const MEMORY_EXTRACTION_PROMPT = "Extract key psychological markers and events from the user's input.";
export const INSIGHTS_SYSTEM_PROMPT_AR = "أنت محلل بيانات سلوكي، استخرج الأنماط العميقة من ذكريات المستخدم.";
export const INSIGHTS_SYSTEM_PROMPT_EN = "You are a behavioral data analyst, extract deep patterns from the user's memories.";
export const SANDBOX_SCENARIOS: SandboxScenario[] = [ { id: 's1', titleAr: "مقابلة عمل صعبة", titleEn: "Tough Job Interview", icon: 'Briefcase', descriptionAr: "محاكاة لمقابلة عمل مع مدير متطلب.", descriptionEn: "Simulating a job interview with a demanding manager.", difficulty: 'medium', durationMinutes: 10, personaAr: "مدير صارم", personaEn: "Strict Manager" } ];
export const SANDBOX_SYSTEM_PROMPT = "You are a social simulator. Act out difficult scenarios to build user resilience.";
