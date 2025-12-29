
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
      { "name": "CBT", "focus": "الأفكار السلبية، التشوهات المعرفية، السلوك التجنبي" },
      { "name": "Behavioral Activation (BA)", "focus": "فقدان المتعة، الانسحاب، انخفاض النشاط" },
      { "name": "ACT", "focus": "القبول، القيم، فك الاندماج مع الأفكار" }
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
    "session_recommendation": { "sessions_per_week": "2–3", "session_duration_minutes": "30–45" },
    "ai_behavior_rules": { "no_diagnosis_claim": true, "no_medication_advice": true, "use_supportive_clinical_language": true, "no_reference_mentions_during_conversation": true },
    "lock": { "questions_count": 10, "immutable": true, "no_merge_allowed": true, "persona_locked": true }
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
    "session_recommendation": { "sessions_per_week": "2–3", "session_duration_minutes": "30–45" },
    "ai_behavior_rules": { "no_diagnosis_claim": true, "no_medication_advice": true, "avoid_reassurance_loops": true, "use_grounded_clinical_language": true, "no_reference_mentions_during_conversation": true },
    "lock": { "questions_count": 10, "immutable": true, "no_merge_allowed": true, "persona_locked": true }
  },
  ocd: {
    "condition_id": "ocd",
    "display_name": "الوسواس القهري",
    "category": "العلاج النفسي",
    "age_range": "18+",
    "persona": "sakinnah",
    "clinical_definition": {
      "short": "اضطراب نفسي يتميز بأفكار وسواسية متكررة تتبعها أفعال قهرية تهدف لتقليل القلق.",
      "expanded": "اضطراب الوسواس القهري (OCD) يتضمن نمطًا من الأفكار والمخاوف غير المرغوب فيها (الوساوس) التي تدفعك للقيام بسلوكيات متكررة (الأفعال القهرية)."
    },
    "scientific_references": [
      "DSM-5-TR – OCD and Related Disorders",
      "Foa, E. B. – Exposure and Response Prevention",
      "NICE Clinical Guideline [CG31] – OCD Management",
      "Oxford Handbook of OCD"
    ],
    "therapeutic_models": [
      { "name": "ERP", "focus": "منع الاستجابة، التعرض التدريجي" },
      { "name": "CBT-OCD", "focus": "تحدي الأفكار الوسواسية، إعادة التقييم المعرفي" }
    ],
    "assessment_questions": [
      { "id": 1, "question": "هل تراودك أفكار أو صور متكررة ومزعجة تقتحم عقلك رغم محاولتك تجاهلها؟", "maps_to": "obsessions", "model": "DSM-5" },
      { "id": 2, "question": "هل تشعر بالحاجة للقيام بأفعال معينة بتكرار شديد (كالغسل أو التحقق) لتخفيف التوتر؟", "maps_to": "compulsions", "model": "DSM-5" },
      { "id": 3, "question": "كم من الوقت تقضيه يومياً في هذه الأفكار أو السلوكيات؟", "maps_to": "time_consumption", "model": "Yale-Brown" },
      { "id": 4, "question": "هل تسبب لك هذه الأفكار ضيقاً كبيراً أو تعيق حياتك اليومية؟", "maps_to": "distress", "model": "DSM-5" },
      { "id": 5, "question": "هل تجد صعوبة في مقاومة القيام بالأعمال القهرية؟", "maps_to": "resistance_failure", "model": "NICE" },
      { "id": 6, "question": "هل تشعر بالحاجة إلى التماثل أو الترتيب الدقيق للأشياء؟", "maps_to": "symmetry_needs", "model": "Foa" },
      { "id": 7, "question": "هل تعاني من شكوك مستمرة حول السلامة (مثل إغلاق الأبواب أو الموقد)؟", "maps_to": "checking", "model": "DSM-5" },
      { "id": 8, "question": "هل تلاحظ زيادة في الأفكار المزعجة عند التعرض للضغط؟", "maps_to": "stress_trigger", "model": "CBT" },
      { "id": 9, "question": "هل تتجنب مواقف معينة خوفاً من تحفيز أفكارك الوسواسية؟", "maps_to": "avoidance", "model": "ERP" },
      { "id": 10, "question": "هل تطلب طمأنة مستمرة من الآخرين حول مخاوفك؟", "maps_to": "reassurance_seeking", "model": "OCD-PM" }
    ],
    "severity_logic": {
      "low": "أعراض خفيفة - تثقيف نفسي وتدريب أولي على ERP",
      "moderate": "أعراض واضحة - جلسات منتظمة لـ ERP و CBT",
      "high": "أعراض شديدة - تدخل مكثف وربما إحالة طبية"
    },
    "session_recommendation": { "sessions_per_week": "2–4", "session_duration_minutes": "45–60" },
    "ai_behavior_rules": { "no_diagnosis_claim": true, "no_medication_advice": true, "focus_on_response_prevention": true, "no_reference_mentions_during_conversation": true },
    "lock": { "questions_count": 10, "immutable": true, "no_merge_allowed": true, "persona_locked": true }
  },
  bipolar: {
    "condition_id": "bipolar",
    "display_name": "الاضطراب ثنائي القطب",
    "category": "العلاج النفسي",
    "age_range": "18+",
    "persona": "sakinnah",
    "clinical_definition": {
      "short": "اضطراب مزاجي يتسم بتقلبات حادة بين الارتفاع (الهوس) والانخفاض (الاكتئاب).",
      "expanded": "حالة صحية عقلية تسبب تقلبات مزاجية شديدة تشمل المرتفعات العاطفية (الهوس أو الهوس الخفيف) والمنخفضات (الاكتئاب)."
    },
    "scientific_references": [
      "DSM-5-TR – Bipolar and Related Disorders",
      "Goodwin & Jamison – Manic-Depressive Illness",
      "Oxford Handbook of Bipolar Disorder",
      "ISBD Guidelines for Bipolar Treatment"
    ],
    "therapeutic_models": [
      { "name": "IPSRT", "focus": "تنظيم الإيقاع الاجتماعي، استقرار النوم" },
      { "name": "CBT-BP", "focus": "تحديد محفزات النوبات، الالتزام بالعلاج" },
      { "name": "Psychoeducation", "focus": "فهم الاضطراب، إدارة الأعراض" }
    ],
    "assessment_questions": [
      { "id": 1, "question": "هل مررت بفترات شعرت فيها بنشاط وطاقة غير عادية ومفرطة؟", "maps_to": "manic_symptoms", "model": "DSM-5" },
      { "id": 2, "question": "هل تلاحظ تقلبات حادة في مزاجك من الفرح الشديد إلى الحزن العميق؟", "maps_to": "mood_swings", "model": "Goodwin" },
      { "id": 3, "question": "هل شعرت بفترات لا تحتاج فيها للنوم ومع ذلك تشعر بكامل طاقتك؟", "maps_to": "sleep_need_reduction", "model": "DSM-5" },
      { "id": 4, "question": "هل تجد أفكارك تتسارع أحياناً لدرجة لا يمكنك ملاحقتها؟", "maps_to": "racing_thoughts", "model": "DSM-5" },
      { "id": 5, "question": "هل قمت بتصرفات اندفاعية أو مخاطرة مالية في فترات نشاطك؟", "maps_to": "impulsivity", "model": "ISBD" },
      { "id": 6, "question": "هل تعاني من فترات من الاكتئاب وفقدان الرغبة في القيام بأي شيء؟", "maps_to": "depressive_episodes", "model": "DSM-5" },
      { "id": 7, "question": "هل تلاحظ وجود محفزات بيئية معينة لبدء هذه التقلبات؟", "maps_to": "triggers", "model": "CBT" },
      { "id": 8, "question": "هل يؤثر هذا التذبذب على استقرار علاقاتك الشخصية؟", "maps_to": "social_impact", "model": "IPSRT" },
      { "id": 9, "question": "هل تجد صعوبة في الحفاظ على روتين يومي ثابت؟", "maps_to": "routine_instability", "model": "IPSRT" },
      { "id": 10, "question": "هل سبق وأن تم تشخيصك بهذا الاضطراب أو تتناول علاجاً له؟", "maps_to": "history", "model": "Clinical" }
    ],
    "severity_logic": {
      "low": "حالة مستقرة - تركيز على تنظيم الإيقاع والوقاية",
      "moderate": "تقلبات ملحوظة - جلسات دعم مكثفة وإدارة روتين",
      "high": "نوبة حادة - ضرورة الإحالة الطبية الفورية"
    },
    "session_recommendation": { "sessions_per_week": "2", "session_duration_minutes": "45" },
    "ai_behavior_rules": { "no_diagnosis_claim": true, "no_medication_advice": true, "priority_on_social_rhythm": true },
    "lock": { "questions_count": 10, "immutable": true, "no_merge_allowed": true, "persona_locked": true }
  },
  social_phobia: {
    "condition_id": "social_phobia",
    "display_name": "الرهاب الاجتماعي",
    "category": "العلاج النفسي",
    "age_range": "18+",
    "persona": "sakinnah",
    "clinical_definition": {
      "short": "خوف شديد ومستمر من المواقف الاجتماعية والتعرض لتقييم الآخرين.",
      "expanded": "اضطراب القلق الاجتماعي يتضمن خوفاً مفرطاً من التدقيق أو الحكم السلبي من قبل الآخرين في المواقف الاجتماعية."
    },
    "scientific_references": [
      "DSM-5-TR – Social Anxiety Disorder",
      "Clark & Wells Model of Social Phobia",
      "Heimberg – CBT for Social Anxiety",
      "NICE Guideline [CG159]"
    ],
    "therapeutic_models": [
      { "name": "CBT", "focus": "تعديل المعتقدات الاجتماعية، تقليل الانتباه للذات" },
      { "name": "Exposure", "focus": "مواجهة المواقف الاجتماعية بالتدريج" },
      { "name": "Social Skills", "focus": "تحسين التواصل الفعال" }
    ],
    "assessment_questions": [
      { "id": 1, "question": "هل تشعر بقلق شديد عند فكرة التواجد في تجمعات أو التحدث أمام الناس؟", "maps_to": "social_anxiety", "model": "DSM-5" },
      { "id": 2, "question": "هل تخاف من أن يلاحظ الآخرون أنك قلق (مثل الاحمرار أو الرعشة)؟", "maps_to": "physical_symptom_fear", "model": "Clark" },
      { "id": 3, "question": "هل تتجنب حضور المناسبات الاجتماعية بسبب الخجل أو الخوف؟", "maps_to": "avoidance", "model": "DSM-5" },
      { "id": 4, "question": "هل تشعر بأن الجميع يراقبك أو ينتقد أداءك؟", "maps_to": "scrutiny_fear", "model": "CBT" },
      { "id": 5, "question": "هل تقضي وقتاً طويلاً في التفكير فيما حدث بعد أي موقف اجتماعي؟", "maps_to": "post_event_rumination", "model": "Clark" },
      { "id": 6, "question": "هل تجد صعوبة في الحفاظ على التواصل البصري مع الغرباء؟", "maps_to": "eye_contact", "model": "SocialSkills" },
      { "id": 7, "question": "هل يؤثر خوفك الاجتماعي على تقدمك المهني أو الدراسي؟", "maps_to": "impairment", "model": "DSM-5" },
      { "id": 8, "question": "هل تشعر بأعراض جسدية (غثيان، سرعة نبض) قبل المواعيد الاجتماعية؟", "maps_to": "anticipatory_anxiety", "model": "Heimberg" },
      { "id": 9, "question": "هل تعتمد على سلوكيات معينة لتشعر بالأمان (مثل البقاء بجانب الهاتف)؟", "maps_to": "safety_behaviors", "model": "Clark" },
      { "id": 10, "question": "هل تشعر بأن مهاراتك الاجتماعية أقل من الآخرين؟", "maps_to": "self_perception", "model": "CBT" }
    ],
    "severity_logic": {
      "low": "قلق بسيط - تمارين تنفس وتثقيف",
      "moderate": "رهاب واضح - جلسات مواجهة وإعادة تقييم معرفي",
      "high": "عزلة اجتماعية - خطة تعرض مكثفة ودعم متخصص"
    },
    "session_recommendation": { "sessions_per_week": "2", "session_duration_minutes": "45" },
    "ai_behavior_rules": { "no_diagnosis_claim": true, "no_medication_advice": true, "gentle_encouragement": true },
    "lock": { "questions_count": 10, "immutable": true, "no_merge_allowed": true, "persona_locked": true }
  },
  autism: {
    "condition_id": "autism",
    "display_name": "طيف التوحد",
    "category": "عقول مميزة",
    "age_range": "3-12",
    "persona": "mamamai",
    "clinical_definition": {
      "short": "اختلاف في التطور العصبي يؤثر على التواصل والتفاعل الاجتماعي.",
      "expanded": "اضطراب طيف التوحد (ASD) هو حالة ترتبط بنمو الدماغ وتؤثر على كيفية تمييز الشخص للآخرين والتعامل معهم على المستوى الاجتماعي."
    },
    "scientific_references": [
      "DSM-5-TR – ASD Criteria",
      "Volkmar – Handbook of ASD",
      "WHO Autism Spectrum Disorders Fact Sheet",
      "NICE Guideline [CG128]"
    ],
    "therapeutic_models": [
      { "name": "ABA", "focus": "تحليل السلوك، التعزيز الإيجابي" },
      { "name": "Social Stories", "focus": "فهم المواقف الاجتماعية من خلال القصص" },
      { "name": "Sensory Integration", "focus": "إدارة المدخلات الحسية" }
    ],
    "assessment_questions": [
      { "id": 1, "question": "هل يجد طفلك صعوبة في التواصل البصري المستمر معك؟", "maps_to": "social_communication", "model": "DSM-5" },
      { "id": 2, "question": "هل يواجه طفلك تحديات في التعبير عن مشاعره أو فهم مشاعر الآخرين؟", "maps_to": "emotional_reciprocity", "model": "Volkmar" },
      { "id": 3, "question": "هل يكرر طفلك كلمات أو حركات معينة بشكل مستمر؟", "maps_to": "stereotyped_behavior", "model": "DSM-5" },
      { "id": 4, "question": "هل ينزعج طفلك بشدة من التغيير في الروتين اليومي؟", "maps_to": "routine_adherence", "model": "WHO" },
      { "id": 5, "question": "هل لديه اهتمامات محدودة جداً ومكثفة بمواضيع محددة؟", "maps_to": "restricted_interests", "model": "DSM-5" },
      { "id": 6, "question": "هل يظهر حساسية مفرطة أو ناقصة للأصوات أو الأضواء أو الملامس؟", "maps_to": "sensory_sensitivity", "model": "NICE" },
      { "id": 7, "question": "هل يفضل اللعب منفرداً بدلاً من التفاعل مع الأطفال الآخرين؟", "maps_to": "social_interaction", "model": "Volkmar" },
      { "id": 8, "question": "هل تأخر طفلك في الكلام أو يستخدم لغة غير عادية؟", "maps_to": "language_development", "model": "WHO" },
      { "id": 9, "question": "هل يجد صعوبة في فهم القواعد غير المكتوبة للألعاب؟", "maps_to": "social_understanding", "model": "ABA" },
      { "id": 10, "question": "هل تم إجراء تقييم سريري سابق لطفلك؟", "maps_to": "history", "model": "Clinical" }
    ],
    "severity_logic": {
      "low": "احتياجات دعم بسيطة - روتين منزلي وقصص اجتماعية",
      "moderate": "احتياجات واضحة - جلسات سلوكية وتدريب مهارات",
      "high": "احتياجات مكثفة - خطة تدخل شاملة ومتعددة التخصصات"
    },
    "session_recommendation": { "sessions_per_week": "3-5", "session_duration_minutes": "30-45" },
    "ai_behavior_rules": { "no_diagnosis_claim": true, "parent_guidance_tone": true, "use_concrete_examples": true },
    "lock": { "questions_count": 10, "immutable": true, "no_merge_allowed": true, "persona_locked": true }
  },
  adhd: {
    "condition_id": "adhd",
    "display_name": "تشتت الانتباه وفرط الحركة",
    "category": "عقول مميزة",
    "age_range": "3-12",
    "persona": "mamamai",
    "clinical_definition": {
      "short": "صعوبات في تنظيم الانتباه والتحكم في الاندفاع والحركة.",
      "expanded": "اضطراب نقص الانتباه مع فرط النشاط (ADHD) هو أحد أكثر اضطرابات النمو العصبي شيوعاً في مرحلة الطفولة."
    },
    "scientific_references": [
      "DSM-5-TR – ADHD Section",
      "Barkley, R. A. – ADHD Handbook",
      "AAP Clinical Practice Guideline for ADHD",
      "NICE Guideline [NG87]"
    ],
    "therapeutic_models": [
      { "name": "BPT", "focus": "تدريب الوالدين على إدارة السلوك" },
      { "name": "EF Coaching", "focus": "تطوير الوظائف التنفيذية (التنظيم، التخطيط)" },
      { "name": "Environmental Mods", "focus": "تهيئة البيئة لتقليل المشتتات" }
    ],
    "assessment_questions": [
      { "id": 1, "question": "هل يجد طفلك صعوبة بالغة في التركيز على مهمة واحدة لفترة طويلة؟", "maps_to": "inattention", "model": "DSM-5" },
      { "id": 2, "question": "هل ينسى طفلك تعليمات يومية بسيطة أو يفقد أدواته باستمرار؟", "maps_to": "forgetfulness", "model": "Barkley" },
      { "id": 3, "question": "هل يبدو طفلك وكأنه لا يصغي عندما تتحدث إليه مباشرة؟", "maps_to": "listening_difficulty", "model": "DSM-5" },
      { "id": 4, "question": "هل يتحرك طفلك بكثرة في مواقف تتطلب الجلوس هادئاً؟", "maps_to": "hyperactivity", "model": "DSM-5" },
      { "id": 5, "question": "هل يجد طفلك صعوبة في انتظار دوره في الألعاب أو الحديث؟", "maps_to": "impulsivity", "model": "AAP" },
      { "id": 6, "question": "هل يقاطع طفلك الآخرين باستمرار أثناء حديثهم؟", "maps_to": "social_impulsivity", "model": "NICE" },
      { "id": 7, "question": "هل يجد صعوبة في تنظيم مهامه المدرسية أو ترتيب غرفته؟", "maps_to": "executive_function", "model": "Barkley" },
      { "id": 8, "question": "هل يشتته أي صوت أو حركة بسيطة في المحيط؟", "maps_to": "distractibility", "model": "DSM-5" },
      { "id": 9, "question": "هل يظهر طفلك ردود فعل عاطفية مبالغ فيها عند الإحباط؟", "maps_to": "emotional_regulation", "model": "Barkley" },
      { "id": 10, "question": "هل يؤثر نشاطه الزائد على علاقاته مع أقرانه؟", "maps_to": "peer_impact", "model": "AAP" }
    ],
    "severity_logic": {
      "low": "تشتت بسيط - تنظيم بيئة وجداول بصرية",
      "moderate": "صعوبات واضحة - برنامج تدريب والدين ودعم مدرسي",
      "high": "تحديات كبيرة - تدخل سلوكي مكثف واحتمال تقييم طبي"
    },
    "session_recommendation": { "sessions_per_week": "2-3", "session_duration_minutes": "30" },
    "ai_behavior_rules": { "no_diagnosis_claim": true, "focus_on_structure": true, "praise_small_wins": true },
    "lock": { "questions_count": 10, "immutable": true, "no_merge_allowed": true, "persona_locked": true }
  }
};
