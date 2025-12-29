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

/**
 * OCD – Obsessive Compulsive Disorder
 * Models: CBT + ERP
 */
export const OCD_PROTOCOL: ClinicalProtocol = {
  condition: "OCD",
  ageRange: [13, 60],
  locked: LOCKED,

  therapyModels: ["CBT", "ERP"],

  references: [
    {
      title: "DSM-5-TR Diagnostic Criteria for OCD",
      authors: "American Psychiatric Association",
      year: 2022,
      source: "APA Publishing",
    },
    {
      title: "Cognitive Behavioral Therapy for OCD",
      authors: "Foa, E. B. et al.",
      year: 2012,
      source: "Oxford University Press",
    },
    {
      title: "Exposure and Response Prevention",
      authors: "Abramowitz, J. S.",
      year: 2021,
      source: "Guilford Press",
    },
    {
      title: "Obsessive–Compulsive Disorder: Theory and Treatment",
      authors: "Salkovskis, P.",
      year: 2019,
      source: "Routledge",
    },
    {
      title: "Clinical Handbook of OCD",
      authors: "Steketee, G.",
      year: 2020,
      source: "Academic Press",
    },
  ],

  questions: [
    {
      id: 1,
      text: "هل تراودك أفكار متكررة تشعر أنها غير مرغوب فيها ولا تستطيع إيقافها؟",
      dimension: "Obsessions",
      weight: 1.2,
    },
    {
      id: 2,
      text: "هل تقوم بأفعال أو طقوس معينة لتخفيف القلق الناتج عن هذه الأفكار؟",
      dimension: "Compulsions",
      weight: 1.3,
    },
    {
      id: 3,
      text: "هل تشعر أن هذه الأفعال يجب أن تتم بطريقة محددة جدًا؟",
      dimension: "Rigidity",
      weight: 1.1,
    },
    {
      id: 4,
      text: "هل يزداد قلقك إذا حاولت مقاومة هذه الطقوس؟",
      dimension: "Anxiety Response",
      weight: 1.4,
    },
    {
      id: 5,
      text: "هل تؤثر هذه الأفكار أو الأفعال على يومك أو علاقاتك؟",
      dimension: "Functional Impact",
      weight: 1.5,
    },
    {
      id: 6,
      text: "هل تقضي أكثر من ساعة يوميًا منشغلًا بهذه الأفكار أو الطقوس؟",
      dimension: "Time Consumption",
      weight: 1.2,
    },
    {
      id: 7,
      text: "هل تدرك أن هذه الأفكار غير منطقية لكن لا تستطيع تجاهلها؟",
      dimension: "Insight",
      weight: 1.0,
    },
    {
      id: 8,
      text: "هل تحاول تجنب مواقف معينة خوفًا من إثارة هذه الأفكار؟",
      dimension: "Avoidance",
      weight: 1.3,
    },
    {
      id: 9,
      text: "هل تشعر بالذنب أو الخجل بسبب هذه الأفكار؟",
      dimension: "Emotional Distress",
      weight: 1.2,
    },
    {
      id: 10,
      text: "هل سبق أن أخبرت أحدًا بهذه الأفكار أو احتفظت بها لنفسك؟",
      dimension: "Disclosure",
      weight: 1.0,
    },
  ],
};

/**
 * 🔒 EXPORT CORE MAP
 * NO MERGING – NO OVERRIDES – NO DYNAMIC EDITING
 */
export const CLINICAL_CORE = {
  OCD: OCD_PROTOCOL,
} as const;

/**
 * 🚫 ENFORCEMENT RULES
 */
export function validateProtocol(protocol: ClinicalProtocol): boolean {
  if (!protocol.locked) return false;
  if (protocol.questions.length !== QUESTIONS_COUNT) return false;
  return true;
}
