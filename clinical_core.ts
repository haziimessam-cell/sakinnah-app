
/**
 * SAKINNAH IMMUTABLE CLINICAL CORE
 * This registry is the absolute source of truth for clinical logic.
 * AI is strictly prohibited from generating or altering this data.
 */

export const CLINICAL_CORE: Record<string, any> = {
  depression: {
    "condition_id": "depression",
    "display_name": "الاكتئاب",
    "category": "العلاج النفسي",
    "age_range": "18+",
    "persona": "sakinnah",
    "clinical_definition": {
      "short": "اضطراب نفسي يتميز بانخفاض المزاج وفقدان الاهتمام والطاقة، ويؤثر على التفكير والسلوك والوظائف اليومية.",
      "expanded": "الاكتئاب اضطراب مزاجي شائع ومعقد، يتضمن أعراضًا معرفية، سلوكية، وجسدية، ويحتاج إلى تقييم منهجي وخطة علاجية متدرجة."
    },
    "scientific_references": [
      "DSM-5-TR – American Psychiatric Association (2022)",
      "Beck, A. T. – Cognitive Therapy of Depression",
      "APA Clinical Practice Guideline for the Treatment of Depression (2023)",
      "Oxford Handbook of Depression and Anxiety",
      "WHO – Depression Fact Sheet & mhGAP Guidelines"
    ],
    "therapeutic_models": [
      {
        "name": "CBT",
        "focus": "الأفكار السلبية، التشوهات المعرفية، السلوك التجنبي"
      },
      {
        "name": "Behavioral Activation (BA)",
        "focus": "فقدان المتعة، الانسحاب، انخفاض النشاط"
      },
      {
        "name": "ACT",
        "focus": "القبول، القيم، فك الاندماج مع الأفكار"
      }
    ],
    "assessment_questions": [
      { "id": 1, "question": "خلال الأسبوعين الماضيين، إلى أي مدى شعرت بالحزن أو الفراغ معظم الوقت؟", "maps_to": "low_mood", "model": "DSM-5" },
      { "id": 2, "question": "هل لاحظت فقدان الاهتمام أو المتعة في الأنشطة التي كنت تستمتع بها سابقًا؟", "maps_to": "anhedonia", "model": "DSM-5" },
      { "id": 3, "question": "كيف كان مستوى طاقتك الجسدية خلال الأيام الأخيرة؟", "maps_to": "fatigue", "model": "WHO" },
      { "id": 4, "question": "هل تعاني من اضطرابات في النوم (أرق أو نوم مفرط)؟", "maps_to": "sleep_disturbance", "model": "DSM-5" },
      { "id": 5, "question": "هل تغيّر شهيتك أو وزنك بشكل ملحوظ دون قصد؟", "maps_to": "appetite_change", "model": "DSM-5" },
      { "id": 6, "question": "هل تجد صعوبة في التركيز أو اتخاذ القرارات؟", "maps_to": "concentration_difficulty", "model": "Beck CBT" },
      { "id": 7, "question": "هل تراودك أفكار سلبية متكررة عن نفسك أو قيمتك الشخصية؟", "maps_to": "negative_core_beliefs", "model": "CBT" },
      { "id": 8, "question": "هل تشعر بالذنب أو تأنيب الضمير بشكل مفرط أو غير مبرر؟", "maps_to": "excessive_guilt", "model": "DSM-5" },
      { "id": 9, "question": "هل تشعر ببطء في الحركة أو الكلام، أو على العكس توتر حركي؟", "maps_to": "psychomotor_change", "model": "DSM-5" },
      { "id": 10, "question": "هل راودتك أفكار عن عدم الرغبة في الاستمرار أو إيذاء النفس؟", "maps_to": "suicidal_ideation", "model": "APA" }
    ],
    "severity_logic": {
      "low": "أعراض محدودة – تدخل نفسي خفيف",
      "moderate": "أعراض واضحة – جلسات منتظمة",
      "high": "أعراض شديدة – تدخل مكثف وإحالة متخصصة"
    },
    "session_recommendation": {
      "sessions_per_week": "2–3",
      "session_duration_minutes": "30–45"
    },
    "ai_behavior_rules": {
      "no_diagnosis_claim": true,
      "no_medication_advice": true,
      "use_supportive_clinical_language": true,
      "no_reference_mentions_during_conversation": true
    },
    "lock": {
      "questions_count": 10,
      "immutable": true,
      "no_merge_allowed": true,
      "persona_locked": true
    }
  },
  anxiety: {
    "condition_id": "anxiety",
    "display_name": "القلق والتوتر",
    "category": "العلاج النفسي",
    "age_range": "18+",
    "persona": "sakinnah",
    "clinical_definition": {
      "short": "اضطراب نفسي يتميز بالشعور المستمر بالقلق والتوتر والخوف غير المبرر، ويؤثر على التفكير والتركيز والاستجابة الجسدية.",
      "expanded": "القلق اضطراب شائع يتضمن استجابة مفرطة للتهديدات المتوقعة، ويظهر في صورة أعراض نفسية وجسدية وسلوكية تتطلب تقييمًا منهجيًا وخطة علاجية متدرجة."
    },
    "scientific_references": [
      "DSM-5-TR – Anxiety Disorders Section (APA, 2022)",
      "Barlow, D. H. – Anxiety and Its Disorders",
      "APA Clinical Practice Guideline for Anxiety Disorders (2023)",
      "Oxford Handbook of Anxiety Disorders",
      "WHO – mhGAP Guidelines for Anxiety"
    ],
    "therapeutic_models": [
      { "name": "CBT", "focus": "التفكير الكارثي، التوقعات السلبية، التجنب" },
      { "name": "Exposure Therapy", "focus": "التجنب، الحساسية الزائدة للقلق" },
      { "name": "ACT", "focus": "القبول، فك الاندماج مع القلق، القيم" }
    ],
    "assessment_questions": [
      { "id": 1, "question": "إلى أي مدى تشعر بالقلق أو التوتر في معظم أيامك؟", "maps_to": "persistent_worry", "model": "DSM-5" },
      { "id": 2, "question": "هل تجد صعوبة في التحكم في أفكار القلق عندما تبدأ؟", "maps_to": "worry_control", "model": "DSM-5" },
      { "id": 3, "question": "هل تشعر بتوتر أو شدّ عضلي متكرر؟", "maps_to": "muscle_tension", "model": "WHO" },
      { "id": 4, "question": "هل تعاني من تسارع ضربات القلب أو ضيق في التنفس أثناء القلق؟", "maps_to": "physical_arousal", "model": "Barlow" },
      { "id": 5, "question": "هل يؤثر القلق على نومك أو قدرتك على الاسترخاء؟", "maps_to": "sleep_disturbance", "model": "DSM-5" },
      { "id": 6, "question": "هل تتجنب مواقف أو أنشطة بسبب القلق؟", "maps_to": "avoidance_behavior", "model": "CBT" },
      { "id": 7, "question": "هل تشعر بصعوبة في التركيز عندما تكون قلقًا؟", "maps_to": "concentration_difficulty", "model": "DSM-5" },
      { "id": 8, "question": "هل تراودك أفكار سلبية متكررة حول المستقبل؟", "maps_to": "anticipatory_anxiety", "model": "CBT" },
      { "id": 9, "question": "هل تشعر بالإرهاق الذهني نتيجة القلق المستمر؟", "maps_to": "mental_fatigue", "model": "WHO" },
      { "id": 10, "question": "هل يؤثر القلق على علاقاتك أو أدائك اليومي؟", "maps_to": "functional_impairment", "model": "APA" }
    ],
    "severity_logic": {
      "low": "قلق بسيط – تدخل نفسي خفيف وتنظيم نمط الحياة",
      "moderate": "قلق متوسط – جلسات علاج منتظمة",
      "high": "قلق شديد – تدخل مكثف وخطة علاجية متقدمة"
    },
    "session_recommendation": {
      "sessions_per_week": "2–3",
      "session_duration_minutes": "30–45"
    },
    "ai_behavior_rules": {
      "no_diagnosis_claim": true,
      "no_medication_advice": true,
      "avoid_reassurance_loops": true,
      "use_grounded_clinical_language": true,
      "no_reference_mentions_during_conversation": true
    },
    "lock": {
      "questions_count": 10,
      "immutable": true,
      "no_merge_allowed": true,
      "persona_locked": true
    }
  }
};
