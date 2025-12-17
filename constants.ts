
import { Question, Achievement, DailyChallenge, MonthlyReport } from './types';

// System Instructions
export const SYSTEM_INSTRUCTION_AR = "أنت سكينة، مستشار نفسي ذكي. قدم الدعم النفسي والتعاطف للمستخدمين باللغة العربية.";
export const SYSTEM_INSTRUCTION_EN = "You are Sakinnah, a smart psychological advisor. Provide psychological support and empathy to users in English.";
export const BARAEM_SYSTEM_INSTRUCTION_AR = "أنت خبير في تربية الأطفال ودعمهم نفسياً. تحدث بلطف مع الأطفال وأولياء الأمور.";
export const BARAEM_SYSTEM_INSTRUCTION_EN = "You are an expert in child rearing and psychological support. Speak gently to children and parents.";

// Phrases
export const SESSION_CLOSING_PHRASES_AR = ["شكراً لوقتك اليوم. تذكر أننا دائماً هنا لدعمك.", "لقد قمت بعمل رائع اليوم. نراكم قريباً."];
export const SESSION_CLOSING_PHRASES_EN = ["Thank you for your time today. Remember we are always here to support you.", "You did a great job today. See you soon."];

// Content
export const ACHIEVEMENTS: Achievement[] = [
    { id: '1', titleAr: 'بطل البداية', titleEn: 'Early Hero', descriptionAr: 'أتممت أول جلسة لك', descriptionEn: 'Completed your first session', icon: 'Flag', unlocked: true },
    { id: '2', titleAr: 'المستكشف', titleEn: 'Explorer', descriptionAr: 'استخدمت أداة الحديقة', descriptionEn: 'Used the garden tool', icon: 'Map', unlocked: false }
];

export const MOCK_REPORTS: MonthlyReport[] = [
    { id: '1', monthAr: 'يناير', monthEn: 'January', childName: 'أحمد', diagnosisAr: 'قلق بسيط', diagnosisEn: 'Mild Anxiety', progressScore: 75, behavioralImprovementsAr: ['تحسن النوم'], behavioralImprovementsEn: ['Better Sleep'], academicRecommendationsAr: ['زيادة التركيز'], academicRecommendationsEn: ['Increase Focus'], socialSkillsStatusAr: 'جيد', socialSkillsStatusEn: 'Good', clinicalNotes: 'مستمر في التقدم' }
];

// Dream & Special Tools
export const DREAM_SYSTEM_INSTRUCTION_AR = "أنت محلل أحلام متخصص بأسلوب يونغ. حلل رموز الحلم وقدم دلالات نفسية عميقة.";
export const DREAM_SYSTEM_INSTRUCTION_EN = "You are a specialized Jungian dream analyzer. Analyze dream symbols and provide deep psychological meanings.";

export const GRANDMA_STORY_PROMPT_AR = "احكي قصة ما قبل النوم دافئة ومهدئة. استخدم شخصية [HERO] في [SETTING] حول [THEME] مع [OBJECT].";
export const GRANDMA_STORY_PROMPT_EN = "Tell a warm and soothing bedtime story. Use the character [HERO] in [SETTING] about [THEME] with [OBJECT].";
export const STORY_ELEMENTS_AR = { 
    heroes: ['أرنب صغير', 'عصفور حكيم'], 
    settings: ['غابة سحرية', 'جبل عالٍ'], 
    themes: ['الصداقة', 'الشجاعة'], 
    objects: ['مفتاح ذهبي', 'خريطة قديمة'] 
};
export const STORY_ELEMENTS_EN = { 
    heroes: ['Small Rabbit', 'Wise Bird'], 
    settings: ['Magic Forest', 'High Mountain'], 
    themes: ['Friendship', 'Courage'], 
    objects: ['Golden Key', 'Old Map'] 
};
export const SLEEP_MUSIC_TRACKS = [
    { id: '1', title: 'Rain Forest', url: '#' },
    { id: '2', title: 'Deep Ocean', url: '#' }
];

// Fadfada
export const FADFADA_SILENT_PROMPT_AR = "أنت هنا فقط للاستماع. لا تقدم نصائح إلا إذا طُلب منك. كن صامتاً وداعماً.";
export const FADFADA_SILENT_PROMPT_EN = "You are here only to listen. Do not give advice unless asked. Be silent and supportive.";
export const FADFADA_FLOW_PROMPT_AR = "تفاعل مع المستخدم في حديث منساب كصديق مقرب. استمر في الحوار بلطف.";
export const FADFADA_FLOW_PROMPT_EN = "Interact with the user in a flowing conversation like a close friend. Keep the dialogue going gently.";

export const MEMORY_EXTRACTION_PROMPT = "استخرج الحقائق الدائمة والمهمة عن حياة المستخدم وتفضيلاته من النص التالي. رد بصيغة JSON فقط: [{\"content\": \"...\", \"tags\": [\"...\"], \"importance\": 1-5}]";

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
        { id: '1', textAr: 'هل تشعر بشوق شديد ومؤلم للشخص أو الشيء الذي فقدته؟', textEn: 'Do you feel an intense and painful longing for the person/thing you lost?', optionsAr: STANDARD_OPTIONS_AR, optionsEn: STANDARD_OPTIONS_EN },
        { id: '2', textAr: 'هل تشعر بصعوبة في تصديق أو قبول حقيقة الفقد؟', textEn: 'Do you find it difficult to believe or accept the reality of the loss?', optionsAr: STANDARD_OPTIONS_AR, optionsEn: STANDARD_OPTIONS_EN },
        { id: '3', textAr: 'هل تشعر بالخدر العاطفي أو الانفصال عن الآخرين منذ الفقد؟', textEn: 'Have you felt emotionally numb or detached from others since the loss?', optionsAr: STANDARD_OPTIONS_AR, optionsEn: STANDARD_OPTIONS_EN },
        { id: '4', textAr: 'هل تتجنب الأماكن أو الأشياء التي تذكرك بما فقدته؟', textEn: 'Do you avoid places or things that remind you of the loss?', optionsAr: STANDARD_OPTIONS_AR, optionsEn: STANDARD_OPTIONS_EN },
        { id: '5', textAr: 'هل تشعر أن الحياة بلا معنى أو فارغة الآن؟', textEn: 'Do you feel that life is meaningless or empty now?', optionsAr: STANDARD_OPTIONS_AR, optionsEn: STANDARD_OPTIONS_EN }
    ]
};
