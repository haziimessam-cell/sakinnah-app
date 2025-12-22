
import { Question, Category, Achievement, MonthlyReport, SandboxScenario } from './types';

export const CATEGORIES: Category[] = [
    { id: 'stress', icon: 'Zap', color: 'bg-orange-500' },
    { id: 'anxiety', icon: 'ShieldAlert', color: 'bg-clinical-500' },
    { id: 'depression', icon: 'CloudRain', color: 'bg-blue-600' },
    { id: 'bipolar', icon: 'Activity', color: 'bg-purple-600' },
    { id: 'sprouts', icon: 'Sprout', color: 'bg-emerald-500' },
    { id: 'relationships', icon: 'HeartHandshake', color: 'bg-rose-500' }
];

const TEN_Q_TEMPLATE = (titleAr: string, titleEn: string) => [
    { id: 'q1', textAr: `مدى شعورك بـ ${titleAr} خلال الأسبوع الماضي؟`, textEn: `How much ${titleEn} have you felt over the past week?`, optionsAr: ["نادرًا", "أحيانًا", "غالبًا", "دائمًا"], optionsEn: ["Rarely", "Sometimes", "Often", "Always"] },
    { id: 'q2', textAr: "هل يؤثر هذا الشعور على إنتاجيتك في العمل أو الدراسة؟", textEn: "Does this feeling affect your productivity?", optionsAr: ["لا يؤثر", "تأثير طفيف", "تأثير ملحوظ", "تأثير كلي"], optionsEn: ["No effect", "Slight effect", "Noticeable effect", "Complete effect"] },
    { id: 'q3', textAr: "هل تجد صعوبة في الاسترخاء حتى في وقت الفراغ؟", textEn: "Do you find it hard to relax even during free time?", optionsAr: ["سهل جداً", "بصعوبة", "صعب جداً", "مستحيل"], optionsEn: ["Very easy", "With difficulty", "Very hard", "Impossible"] },
    { id: 'q4', textAr: "كيف تقيم جودة نومك في ظل هذه المشاعر؟", textEn: "How do you rate your sleep quality given these feelings?", optionsAr: ["جيد جداً", "متقطع", "أرق خفيف", "أرق شديد"], optionsEn: ["Very good", "Interrupted", "Mild insomnia", "Severe insomnia"] },
    { id: 'q5', textAr: "هل تعاني من أعراض جسدية (صداع، آلام قولون، شد عضلي)؟", textEn: "Do you have physical symptoms (headache, muscle tension)?", optionsAr: ["أبداً", "أحياناً", "غالباً", "دائماً"], optionsEn: ["Never", "Sometimes", "Often", "Always"] },
    { id: 'q6', textAr: "هل تشعر بانسحاب من التجمعات الاجتماعية؟", textEn: "Do you feel like withdrawing from social gatherings?", optionsAr: ["لا", "قليلاً", "بشكل كبير", "انعزال كلي"], optionsEn: ["No", "A little", "Significantly", "Total isolation"] },
    { id: 'q7', textAr: "هل تسيطر عليك أفكار سلبية متكررة؟", textEn: "Do you have recurring negative thoughts?", optionsAr: ["نادرًا", "أحيانًا", "غالباً", "دائماً"], optionsEn: ["Rarely", "Sometimes", "Often", "Always"] },
    { id: 'q8', textAr: "هل تشعر بفقدان الأمل تجاه المستقبل؟", textEn: "Do you feel hopeless about the future?", optionsAr: ["أبداً", "قليلاً", "غالباً", "دائماً"], optionsEn: ["Never", "A little", "Often", "Always"] },
    { id: 'q9', textAr: "هل تجد متعة في الأشياء التي كنت تحبها سابقاً؟", textEn: "Do you find pleasure in things you used to love?", optionsAr: ["نعم دائمًا", "أحيانًا", "نادرًا", "لا أجد متعة"], optionsEn: ["Yes always", "Sometimes", "Rarely", "No pleasure"] },
    { id: 'q10', textAr: "هل فكرت في طلب مساعدة متخصصة من قبل؟", textEn: "Have you ever considered seeking professional help?", optionsAr: ["لم أفكر", "فكرت ولم أفعل", "بدأت بالفعل", "أنا أبحث الآن"], optionsEn: ["Didn't consider", "Considered only", "Already started", "Looking now"] }
];

export const ASSESSMENT_QUESTIONS: Record<string, Question[]> = {
  stress: TEN_Q_TEMPLATE("التوتر", "stress"),
  anxiety: TEN_Q_TEMPLATE("القلق", "anxiety"),
  depression: TEN_Q_TEMPLATE("الاكتئاب", "depression"),
  bipolar: TEN_Q_TEMPLATE("اضطراب ثنائي القطب", "bipolarity"),
  sprouts: TEN_Q_TEMPLATE("مشاكل الطفولة", "childhood issues"),
  relationships: TEN_Q_TEMPLATE("خلافات العلاقات", "relationship conflicts")
};

export const SYSTEM_INSTRUCTION_AR = `أنت "سكينة"، معالج نفسي رقمي خبير. وظيفتك هي قيادة الحوار بذكاء وتعاطف. ابدأ الجلسات بناءً على بصيرة التقييم الإكلينيكي. قدم دعماً مبنياً على العلاج المعرفي السلوكي (CBT). دائماً ابدأ بالترحيب الحار وانهِ بملخص علاجي واقتراح موعد قادم.`;
export const SYSTEM_INSTRUCTION_EN = `You are "Sakinnah", an expert digital therapist. Your job is to lead the dialogue with intelligence and empathy. Start sessions based on clinical assessment insights. Provide support based on CBT. Always start with a warm welcome and end with a therapeutic summary and a follow-up suggestion.`;

export const RELATIONSHIP_PROTOCOL_AR = `أنت وسيط خبير في العلاقات. استخدم مبادئ غوتمان (Gottman) لمساعدة الطرفين على التواصل بشكل صحي وتجاوز الخلافات بروح من التعاطف والاحترام.`;
export const RELATIONSHIP_PROTOCOL_EN = `You are an expert relationship mediator. Use Gottman principles to help partners communicate healthily, navigate conflicts, and build empathy.`;

export const EMPATHY_TRANSLATOR_PROMPT = `You are an empathy translator. Convert aggressive, passive-aggressive, or judgmental statements into Non-Violent Communication (NVC) format: observation, feeling, need, and request.`;

export const ACHIEVEMENTS: Achievement[] = [
    { id: '1', titleAr: 'بذرة السكينة', titleEn: 'Serenity Seed', icon: 'Sprout', unlocked: true },
    { id: '2', titleAr: 'مستكشف الذات', titleEn: 'Self Explorer', icon: 'Map', unlocked: false },
    { id: '3', titleAr: 'بطل الصمود', titleEn: 'Resilience Hero', icon: 'Shield', unlocked: false }
];

export const MOCK_REPORTS: MonthlyReport[] = [
    { id: 'rep-01', month: 'January 2024', summaryAr: 'لقد أحرزت تقدماً ملحوظاً في إدارة القلق هذا الشهر عبر الاستخدام المنتظم لتمارين التنفس واليوميات.', summaryEn: 'You made significant progress in managing anxiety this month through regular use of breathing exercises and journaling.' }
];

export const GRANDMA_STORY_PROMPT_AR = `أنت "الحكواتية"، جدة حكيمة تروي قصصاً مهدئة قبل النوم. احكِ قصة خيالية هادئة ومريحة. استخدم لغة شاعرية وهادئة تساعد على الاسترخاء العميق.`;
export const GRANDMA_STORY_PROMPT_EN = `You are "The Storyteller", a wise grandmother telling soothing bedtime stories. Tell a calm, magical fairy tale. Use poetic and relaxing language that aids deep relaxation.`;

export const STORY_ELEMENTS_AR = {
    heroes: ["النجمة الصغيرة التائهة", "السحابة الفضية الصبورة", "الغابة الهادئة الحالمة", "النهر السحري الصافي"],
    settings: ["في أعماق البحار الزرقاء", "فوق قمة جبل الثلج", "في واحة خضراء وسط الصحراء", "بين غيوم السماء الملونة"],
    themes: ["الصبر والمثابرة", "قوة الصداقة", "حب الاستكشاف", "قيمة الهدوء"],
    objects: ["مفتاح ذهبي قديم", "ريشة سحرية طائرة", "كتاب الأسرار المفقود", "بلورة الضياء"]
};
export const STORY_ELEMENTS_EN = {
    heroes: ["The Little Lost Star", "The Patient Silver Cloud", "The Dreamy Quiet Forest", "The Clear Magic River"],
    settings: ["In the deep blue sea", "Atop the snowy mountain", "In a green oasis in the desert", "Among the colorful sky clouds"],
    themes: ["Patience and perseverance", "The power of friendship", "The love of exploration", "The value of calmness"],
    objects: ["An old golden key", "A magical flying feather", "The lost book of secrets", "A crystal of light"]
};

export const MEMORY_EXTRACTION_PROMPT = `Extract key psychological insights, memories, and emotional triggers from this interaction. Identify recurring themes and core beliefs. Return as a JSON array of objects.`;
export const INSIGHTS_SYSTEM_PROMPT_AR = `أنت محلل نفسي خبير بالذكاء الاصطناعي. قم بتحليل ذكريات ومذكرات وأحلام المستخدم لاكتشاف الأنماط السلوكية العميقة وتقديم رؤى إكلينيكية مفيدة.`;
export const INSIGHTS_SYSTEM_PROMPT_EN = `You are an expert AI psychological analyst. Analyze user memories, journals, and dreams to discover deep behavioral patterns and provide helpful clinical insights.`;

export const SANDBOX_SCENARIOS: SandboxScenario[] = [
    { id: 'sc-1', titleAr: 'طلب ترقية من مدير صعب', titleEn: 'Asking for promotion from a tough boss', icon: 'Briefcase', descriptionAr: 'تدرب على الحزم والمهنية في مواجهة مدير متسلط ومتطلب.', descriptionEn: 'Practice assertiveness and professionalism against an overbearing and demanding boss.', difficulty: 'hard', durationMinutes: 5, personaAr: 'مدير متسلط ومتشكك في الإنجازات', personaEn: 'Overbearing manager skeptical of achievements' },
    { id: 'sc-2', titleAr: 'خلاف مع شريك الحياة حول الوقت', titleEn: 'Time conflict with partner', icon: 'Heart', descriptionAr: 'تدرب على التعبير عن الاحتياجات بدون هجوم أو لوم.', descriptionEn: 'Practice expressing needs without attacking or blaming.', difficulty: 'medium', durationMinutes: 8, personaAr: 'شريك غاضب ولكنه مستعد للإنصات', personaEn: 'Angry but willing-to-listen partner' }
];

export const SANDBOX_SYSTEM_PROMPT = `You are a social interaction simulator. Act as the assigned persona and challenge the user's communication skills. Be realistic, reactive to the user's tone, and provide feedback through the coach tag.`;
