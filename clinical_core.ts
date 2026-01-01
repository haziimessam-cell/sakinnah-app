// clinical_core.ts
// Sakinnah Clinical Core Engine
// STRICT – Evidence-based – Locked

export type ClinicalCondition =
  | "OCD"
  | "DEPRESSION"
  | "ANXIETY"
  | "PTSD"
  | "AUTISM"
  | "ADHD";

export type TherapyModel =
  | "CBT"
  | "ERP"
  | "ACT"
  | "DBT"
  | "ABA"
  | "PARENT_TRAINING";

export interface ClinicalReference {
  title: string;
  authors: string;
  year: number;
  source: string;
}

export interface ClinicalQuestion {
  id: number;
  text: string;
  dimension: string;
  weight: number;
}

export interface ClinicalProtocol {
  condition: ClinicalCondition;
  ageRange: [number, number];
  locked: true;
  therapyModels: TherapyModel[];
  references: ClinicalReference[];
  questions: ClinicalQuestion[];
}

/**
 * 🔒 GLOBAL LOCKS
 */
const QUESTIONS_COUNT = 10;
const LOCKED = true;

/* ========================= OCD ========================= */
export const OCD_PROTOCOL: ClinicalProtocol = {
  condition: "OCD",
  ageRange: [13, 60],
  locked: LOCKED,
  therapyModels: ["CBT", "ERP"],
  references: [
    { title: "DSM-5-TR Diagnostic Criteria for OCD", authors: "APA", year: 2022, source: "APA" },
    { title: "CBT for OCD", authors: "Foa et al.", year: 2012, source: "Oxford" },
    { title: "Exposure and Response Prevention", authors: "Abramowitz", year: 2021, source: "Guilford" },
    { title: "Theory and Treatment of OCD", authors: "Salkovskis", year: 2019, source: "Routledge" },
    { title: "Clinical Handbook of OCD", authors: "Steketee", year: 2020, source: "Academic Press" }
  ],
  questions: [
    { id: 1, text: "هل تراودك أفكار قهرية متكررة لا تستطيع إيقافها؟", dimension: "Obsessions", weight: 1.2 },
    { id: 2, text: "هل تقوم بطقوس لتخفيف القلق؟", dimension: "Compulsions", weight: 1.3 },
    { id: 3, text: "هل تشعر بقلق شديد عند مقاومة الطقوس؟", dimension: "Anxiety", weight: 1.4 },
    { id: 4, text: "هل تؤثر هذه الأعراض على حياتك اليومية؟", dimension: "Function", weight: 1.5 },
    { id: 5, text: "هل تستغرق أكثر من ساعة يوميًا؟", dimension: "Time", weight: 1.2 },
    { id: 6, text: "هل تحاول تجنب مواقف معينة؟", dimension: "Avoidance", weight: 1.3 },
    { id: 7, text: "هل تشعر بالخجل أو الذنب؟", dimension: "Emotion", weight: 1.1 },
    { id: 8, text: "هل تدرك عدم منطقية الأفكار؟", dimension: "Insight", weight: 1.0 },
    { id: 9, text: "هل تزداد الأعراض تحت الضغط؟", dimension: "Stress", weight: 1.2 },
    { id: 10, text: "ما مدى استعدادك للعلاج؟", dimension: "Readiness", weight: 1.0 }
  ]
};

/* ========================= DEPRESSION ========================= */
export const DEPRESSION_PROTOCOL: ClinicalProtocol = {
  condition: "DEPRESSION",
  ageRange: [18, 65],
  locked: LOCKED,
  therapyModels: ["CBT", "ACT"],
  references: [
    { title: "DSM-5-TR Depression", authors: "APA", year: 2022, source: "APA" },
    { title: "Beck Depression Inventory-II", authors: "Beck", year: 1996, source: "Pearson" },
    { title: "Cognitive Therapy of Depression", authors: "Beck et al.", year: 1979, source: "Guilford" },
    { title: "Behavioral Activation", authors: "Martell", year: 2010, source: "Guilford" },
    { title: "NICE Depression Guidelines", authors: "NICE", year: 2023, source: "UK" }
  ],
  questions: [
    { id: 1, text: "هل تشعر بحزن مستمر؟", dimension: "Mood", weight: 1.4 },
    { id: 2, text: "هل فقدت المتعة في الأنشطة؟", dimension: "Anhedonia", weight: 1.5 },
    { id: 3, text: "هل تعاني من اضطراب النوم؟", dimension: "Sleep", weight: 1.2 },
    { id: 4, text: "هل تشعر بالإرهاق؟", dimension: "Energy", weight: 1.3 },
    { id: 5, text: "هل تشعر بالذنب؟", dimension: "Guilt", weight: 1.4 },
    { id: 6, text: "هل تعاني من ضعف التركيز؟", dimension: "Cognition", weight: 1.2 },
    { id: 7, text: "هل تميل للعزلة؟", dimension: "Withdrawal", weight: 1.3 },
    { id: 8, text: "هل تشعر باليأس؟", dimension: "Hopelessness", weight: 1.5 },
    { id: 9, text: "هل تأثرت شهيتك؟", dimension: "Appetite", weight: 1.1 },
    { id: 10, text: "ما مدى رغبتك في التحسن؟", dimension: "Readiness", weight: 1.0 }
  ]
};

/* ========================= ANXIETY ========================= */
export const ANXIETY_PROTOCOL: ClinicalProtocol = {
  condition: "ANXIETY",
  ageRange: [18, 65],
  locked: LOCKED,
  therapyModels: ["CBT", "ACT"],
  references: [
    { title: "DSM-5 Anxiety Disorders", authors: "APA", year: 2022, source: "APA" },
    { title: "GAD-7", authors: "Spitzer", year: 2006, source: "Archives" },
    { title: "CBT for Anxiety", authors: "Craske", year: 2014, source: "Oxford" },
    { title: "ACT for Anxiety", authors: "Hayes", year: 2016, source: "Guilford" },
    { title: "NICE Anxiety Guidelines", authors: "NICE", year: 2023, source: "UK" }
  ],
  questions: [
    { id: 1, text: "هل تشعر بقلق مفرط؟", dimension: "Worry", weight: 1.4 },
    { id: 2, text: "هل تتوقع الأسوأ؟", dimension: "Catastrophic", weight: 1.3 },
    { id: 3, text: "هل تعاني من توتر جسدي؟", dimension: "Somatic", weight: 1.2 },
    { id: 4, text: "هل يؤثر القلق على نومك؟", dimension: "Sleep", weight: 1.1 },
    { id: 5, text: "هل تجد صعوبة في الاسترخاء؟", dimension: "Relax", weight: 1.3 },
    { id: 6, text: "هل تتجنب مواقف؟", dimension: "Avoidance", weight: 1.4 },
    { id: 7, text: "هل تشعر بسرعة الانفعال؟", dimension: "Irritability", weight: 1.2 },
    { id: 8, text: "هل يؤثر القلق على تركيزك؟", dimension: "Focus", weight: 1.2 },
    { id: 9, text: "هل تشعر بفقدان السيطرة؟", dimension: "Control", weight: 1.4 },
    { id: 10, text: "ما مدى استعدادك للعلاج؟", dimension: "Readiness", weight: 1.0 }
  ]
};

/* ========================= AUTISM – Mama Mai ========================= */
export const AUTISM_PROTOCOL: ClinicalProtocol = {
  condition: "AUTISM",
  ageRange: [3, 12],
  locked: LOCKED,
  therapyModels: ["ABA", "PARENT_TRAINING"],
  references: [
    { title: "DSM-5 Autism Spectrum Disorder", authors: "APA", year: 2022, source: "APA" },
    { title: "Early Start Denver Model", authors: "Rogers & Dawson", year: 2010, source: "Guilford" },
    { title: "Applied Behavior Analysis", authors: "Cooper", year: 2020, source: "Pearson" },
    { title: "Parent Training for ASD", authors: "Bearss", year: 2015, source: "JADD" },
    { title: "NICE Autism Guidelines", authors: "NICE", year: 2023, source: "UK" }
  ],
  questions: [
    { id: 1, text: "هل يعاني الطفل من ضعف التواصل البصري؟", dimension: "Social", weight: 1.4 },
    { id: 2, text: "هل يتأخر الكلام؟", dimension: "Language", weight: 1.5 },
    { id: 3, text: "هل يكرر سلوكيات معينة؟", dimension: "Repetitive", weight: 1.3 },
    { id: 4, text: "هل يرفض التغيير؟", dimension: "Rigidity", weight: 1.2 },
    { id: 5, text: "هل يعاني من حساسية حسية؟", dimension: "Sensory", weight: 1.3 },
    { id: 6, text: "هل يواجه صعوبة في اللعب التخيلي؟", dimension: "Play", weight: 1.2 },
    { id: 7, text: "هل يتفاعل اجتماعيًا بصعوبة؟", dimension: "Interaction", weight: 1.4 },
    { id: 8, text: "هل يعتمد على الروتين؟", dimension: "Routine", weight: 1.2 },
    { id: 9, text: "هل يعاني من نوبات غضب؟", dimension: "Behavior", weight: 1.3 },
    { id: 10, text: "ما مدى تعاون الأسرة؟", dimension: "Family", weight: 1.0 }
  ]
};

/* ========================= ADHD – Mama Mai ========================= */
export const ADHD_PROTOCOL: ClinicalProtocol = {
  condition: "ADHD",
  ageRange: [3, 12],
  locked: LOCKED,
  therapyModels: ["CBT", "PARENT_TRAINING"],
  references: [
    { title: "DSM-5 ADHD", authors: "APA", year: 2022, source: "APA" },
    { title: "Parent Management Training", authors: "Barkley", year: 2013, source: "Guilford" },
    { title: "Behavioral Interventions for ADHD", authors: "Evans", year: 2018, source: "APA" },
    { title: "School-Based ADHD Programs", authors: "DuPaul", year: 2016, source: "Guilford" },
    { title: "NICE ADHD Guidelines", authors: "NICE", year: 2023, source: "UK" }
  ],
  questions: [
    { id: 1, text: "هل يعاني الطفل من تشتت الانتباه؟", dimension: "Attention", weight: 1.5 },
    { id: 2, text: "هل يتحرك بشكل مفرط؟", dimension: "Hyperactivity", weight: 1.4 },
    { id: 3, text: "هل يقاطع الآخرين؟", dimension: "Impulsivity", weight: 1.3 },
    { id: 4, text: "هل يواجه صعوبة في إتمام المهام؟", dimension: "Task", weight: 1.3 },
    { id: 5, text: "هل يعاني من مشاكل مدرسية؟", dimension: "School", weight: 1.4 },
    { id: 6, text: "هل يتشتت بسهولة؟", dimension: "Focus", weight: 1.5 },
    { id: 7, text: "هل ينسى التعليمات؟", dimension: "Memory", weight: 1.2 },
    { id: 8, text: "هل يواجه صعوبة في التنظيم؟", dimension: "Organization", weight: 1.3 },
    { id: 9, text: "هل يعاني من نوبات غضب؟", dimension: "Emotion", weight: 1.2 },
    { id: 10, text: "ما مدى التزام الأسرة بالخطة؟", dimension: "Family", weight: 1.0 }
  ]
};

/* ========================= CORE MAP ========================= */
export const CLINICAL_CORE = {
  OCD: OCD_PROTOCOL,
  DEPRESSION: DEPRESSION_PROTOCOL,
  ANXIETY: ANXIETY_PROTOCOL,
  AUTISM: AUTISM_PROTOCOL,
  ADHD: ADHD_PROTOCOL
} as const;

/* ========================= VALIDATION ========================= */
export function validateProtocol(protocol: ClinicalProtocol): boolean {
  if (!protocol.locked) return false;
  if (protocol.questions.length !== QUESTIONS_COUNT) return false;
  return true;
}
