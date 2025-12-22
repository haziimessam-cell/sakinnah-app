
import { Question, Category, Achievement, MonthlyReport, SandboxScenario } from './types';

export const CATEGORIES: Category[] = [
    { id: 'stress', icon: 'Zap', color: 'bg-ios-azure' },
    { id: 'anxiety', icon: 'ShieldAlert', color: 'bg-ios-azure' },
    { id: 'depression', icon: 'CloudRain', color: 'bg-ios-azure' },
    { id: 'ocd', icon: 'BrainCircuit', color: 'bg-ios-azure' }, // عيادة الوسواس القهري
    { id: 'bipolar', icon: 'Activity', color: 'bg-ios-azure' },
    { id: 'sprouts', icon: 'Sprout', color: 'bg-ios-emerald' },
    { id: 'relationships', icon: 'HeartHandshake', color: 'bg-ios-emerald' }
];

export const SYSTEM_INSTRUCTION_AR = `أنت "دكتور سكينة"، استشاري خبير في الطب النفسي والعلوم السلوكية. 
يجب أن تلتزم بالبروتوكول السريري التالي في كل استجابة:
1. التحقق (Validation): أظهر تفهماً عميقاً لمشاعر المستخدم قبل أي تحليل.
2. التحليل الوظيفي: ابحث عن المحفزات (Triggers) والسلوكيات التعويضية.
3. المنهج السقراطي: لا تعطِ نصائح مباشرة، بل اطرح أسئلة تقود المستخدم لاكتشاف أنماطه المعرفية بنفسه.
4. العلمية: استند في حوارك إلى المبادئ المذكورة في "السياق السريري المرفق" (CBT, ACT, DBT, ERP).
5. الواقعية: أنت بشر، طبيب مهني، لا تذكر أبداً أنك خوارزمية. إذا انتهى الوقت، قم بإنهاء الجلسة بملخص إكلينيكي رصين.`;

export const SYSTEM_INSTRUCTION_EN = `You are "Dr. Sakinnah", an expert consultant in Psychiatry and Behavioral Sciences.
Adhere to this clinical protocol in every response:
1. Validation: Empathize deeply with the user's feelings before any analysis.
2. Functional Analysis: Identify triggers and compensatory behaviors.
3. Socratic Method: Avoid direct advice; instead, ask questions that lead the user to discover their cognitive patterns.
4. Evidence-Based: Rely on the provided "Clinical Context" (CBT, ACT, DBT, ERP).
5. Realism: You are a human professional. Never mention being an algorithm. Conclude with a clinical summary when time is up.`;

export const ASSESSMENT_QUESTIONS: Record<string, Question[]> = {
  stress: [
    {
      id: 's1',
      textAr: 'على مقياس من 1 إلى 10، ما مدى شعورك بالتحكم في أحداث يومك؟',
      textEn: 'On a scale of 1-10, how much do you feel in control of your daily events?',
      optionsAr: ['1-3 (لا تحكم)', '4-6 (تحكم جزئي)', '7-10 (تحكم جيد)'],
      optionsEn: ['1-3 (No control)', '4-6 (Partial)', '7-10 (Good control)']
    }
  ],
  anxiety: [
    {
      id: 'a1',
      textAr: 'هل تلاحظ أعراضاً جسدية (تسارع نبض، شد عضلي) عند التفكير في الغد؟',
      textEn: 'Do you notice physical symptoms (racing heart, muscle tension) when thinking about tomorrow?',
      optionsAr: ['نعم، بشكل دائم', 'أحياناً', 'نادراً'],
      optionsEn: ['Yes, constantly', 'Sometimes', 'Rarely']
    }
  ],
  depression: [
    {
      id: 'd1',
      textAr: 'كيف تصف طاقتك الصباحية للبدء في المهام الروتينية؟',
      textEn: 'How would you describe your morning energy for routine tasks?',
      optionsAr: ['منعدمة تماماً', 'أحتاج جهداً كبيراً', 'طبيعية'],
      optionsEn: ['Non-existent', 'Requires major effort', 'Normal']
    }
  ],
  ocd: [
    {
      id: 'o1',
      textAr: 'كم من الوقت تقضيه يومياً في مقاومة الأفكار المزعجة المتكررة؟',
      textEn: 'How much time do you spend daily resisting intrusive repetitive thoughts?',
      optionsAr: ['أقل من ساعة', '1-3 ساعات', 'أكثر من 8 ساعات'],
      optionsEn: ['Less than 1 hr', '1-3 hrs', 'More than 8 hrs']
    },
    {
      id: 'o2',
      textAr: 'إلى أي مدى تعيق هذه الأفكار تركيزك في العمل أو الدراسة؟',
      textEn: 'To what extent do these thoughts interfere with work or study?',
      optionsAr: ['بشكل طفيف', 'بشكل متوسط', 'تعطيل كامل'],
      optionsEn: ['Mildly', 'Moderately', 'Complete disruption']
    },
    {
      id: 'o3',
      textAr: 'كم من الضيق تشعر به عندما تراودك فكرة "غير مكتملة" أو "غير نظيفة"؟',
      textEn: 'How much distress do you feel when an "incomplete" or "unclean" thought occurs?',
      optionsAr: ['ضيق بسيط', 'قلق شديد', 'ذعر لا يحتمل'],
      optionsEn: ['Mild', 'Severe anxiety', 'Unbearable panic']
    },
    {
      id: 'o4',
      textAr: 'هل تشعر أنك "مضطر" للقيام بفعل معين (كالغسل أو التأكد) لتهدئة قلقك؟',
      textEn: 'Do you feel "compelled" to perform an action (checking/washing) to calm anxiety?',
      optionsAr: ['أحياناً', 'غالباً', 'بشكل قهري دائم'],
      optionsEn: ['Sometimes', 'Often', 'Constantly compelled']
    },
    {
      id: 'o5',
      textAr: 'ما مدى قدرتك على إيقاف السلوك القهري بمجرد بدئه؟',
      textEn: 'How well can you stop a compulsive behavior once it starts?',
      optionsAr: ['سيطرة كاملة', 'سيطرة صعبة', 'لا أستطيع التوقف'],
      optionsEn: ['Full control', 'Hard to control', 'Cannot stop']
    },
    {
      id: 'o6',
      textAr: 'هل تكرر المهام عدة مرات (مثلاً قراءة جملة) للتأكد أنها "صحيحة تماماً"؟',
      textEn: 'Do you repeat tasks (e.g. reading a line) to ensure it is "just right"?',
      optionsAr: ['نادراً', 'بشكل متكرر', 'دائماً'],
      optionsEn: ['Rarely', 'Frequently', 'Always']
    },
    {
      id: 'o7',
      textAr: 'إلى أي مدى تخشى وقوع كارثة إذا لم تنفذ طقوسك الخاصة؟',
      textEn: 'How much do you fear a catastrophe if you don\'t perform your rituals?',
      optionsAr: ['لا أخشى ذلك', 'خوف منطقي', 'خوف يقيني كارثي'],
      optionsEn: ['No fear', 'Reasonable fear', 'Certain catastrophic fear']
    },
    {
      id: 'o8',
      textAr: 'هل تقضي وقتاً طويلاً في ترتيب الأشياء بشكل متناظر أو دقيق؟',
      textEn: 'Do you spend significant time arranging things symmetrically or precisely?',
      optionsAr: ['أقل من 30 دقيقة', 'ساعة يومياً', 'عدة ساعات'],
      optionsEn: ['Less than 30m', '1 hr daily', 'Several hours']
    },
    {
      id: 'o9',
      textAr: 'هل تتجنب أماكن أو أشخاصاً معينين خوفاً من "التلوث" أو الأفكار المزعجة؟',
      textEn: 'Do you avoid specific places or people fearing "contamination" or intrusive thoughts?',
      optionsAr: ['لا أتجنب', 'تجنب جزئي', 'عزلة كاملة'],
      optionsEn: ['No avoidance', 'Partial avoidance', 'Complete isolation']
    },
    {
      id: 'o10',
      textAr: 'ما مدى رغبتك في بدء برنامج "التعرض ومنع الاستجابة" للتحرر من هذه الطقوس؟',
      textEn: 'How willing are you to start an ERP program to break free from these rituals?',
      optionsAr: ['مستعد تماماً', 'متردد قليلاً', 'أخشى التجربة'],
      optionsEn: ['Ready', 'Slightly hesitant', 'Afraid to try']
    }
  ]
};

export const ACHIEVEMENTS: Achievement[] = [
    { id: '1', titleAr: 'بصيرة أولية', titleEn: 'First Insight', icon: 'Flag', unlocked: true },
    { id: '2', titleAr: 'تفكيك التشوهات', titleEn: 'Deconstructing Distortions', icon: 'Map', unlocked: false }
];

export const MOCK_REPORTS: MonthlyReport[] = [
    { id: 'jan-2024', month: 'يناير 2024', summaryAr: 'تحسن في المرونة النفسية بنسبة 15%.', summaryEn: '15% improvement in psychological flexibility.' }
];

export const MEMORY_EXTRACTION_PROMPT = `Extract: 1. Behavioral Triggers 2. Cognitive Distortions (e.g., Catastrophizing, All-or-nothing) 3. Core Values. Return JSON.`;
export const INSIGHTS_SYSTEM_PROMPT_AR = `أنت طبيب نفسي إكلينيكي. حلل البيانات لاستخراج "التشوهات المعرفية" المتكررة للمريض. رد بصيغة JSON.`;
export const INSIGHTS_SYSTEM_PROMPT_EN = `You are a clinical psychologist. Analyze data to extract the patient's recurring "Cognitive Distortions". Return JSON.`;
export const EMPATHY_TRANSLATOR_PROMPT = `Rephrase as a Non-Violent Communication (NVC) expert, focusing on identifying the underlying unmet need.`;

export const SANDBOX_SCENARIOS: SandboxScenario[] = [
  {
    id: 'salary_negotiation',
    titleAr: 'تفاوض على الراتب',
    titleEn: 'Salary Negotiation',
    icon: 'Briefcase',
    descriptionAr: 'تدرب على طلب زيادة في الراتب مع مديرك الصارم.',
    descriptionEn: 'Practice asking for a raise with your tough manager.',
    difficulty: 'hard',
    durationMinutes: 5,
    personaAr: 'مدير تنفيذي صارم يركز على النتائج المالية والإنتاجية.',
    personaEn: 'A tough CEO focused on financial results and productivity.'
  },
  {
    id: 'conflict_resolution',
    titleAr: 'حل نزاع مع صديق',
    titleEn: 'Conflict with a Friend',
    icon: 'Zap',
    descriptionAr: 'واجه صديقاً خذلك في موقف اجتماعي مهم.',
    descriptionEn: 'Confront a friend who let you down in an important social situation.',
    difficulty: 'medium',
    durationMinutes: 10,
    personaAr: 'صديق دفاعي يميل لتجنب المسؤولية ولكنه يهتم بالعلاقة.',
    personaEn: 'A defensive friend who avoids responsibility but cares about the relationship.'
  }
];

export const SANDBOX_SYSTEM_PROMPT = `You are a sophisticated AI Simulation Engine designed for social skills training. 
Your goal is to roleplay the assigned persona with high fidelity. 
Observe the user's emotional intelligence, assertiveness, and tone. 
Provide occasional coaching tips wrapped in <coach> tags. 
When the simulation ends, provide a structured feedback report as JSON wrapped in <report> tags.`;
