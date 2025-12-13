
import { Language } from "../types";

// 1. DATA STRUCTURES
interface ClinicalDocument {
  id: string;
  category: string;
  tags: string[];
  contentAr: string;
  contentEn: string;
  source: string; // Citation/Reference
}

// Helper: Normalize Arabic Text
const normalizeArabic = (text: string) => {
  return text
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[ًٌٍَُِّْ]/g, '') // Remove diacritics
    .replace(/\bال/g, ''); // Remove "Al-" definition prefix for better matching
};

// 2. THE VECTOR STORE (Simulating Pinecone Index)
// Contains Top 10 Clinical References/Protocols for each category based on US Standards.
const KNOWLEDGE_VECTOR_STORE: ClinicalDocument[] = [
  
  // =================================================================
  // CRISIS & EMERGENCY
  // =================================================================
  {
    id: 'cri-001',
    category: 'crisis',
    tags: ['suicide', 'harm', 'kill', 'die', 'emergency', 'panic', 'attack', 'help', 'انتحار', 'موت', 'أموت', 'طوارئ', 'هلع'],
    contentAr: `[بروتوكول التدخل في الأزمات]
    المرجع: APA & NIMH Guidelines.
    1. السلامة أولاً: "هل أنت في مكان آمن؟".
    2. تقليل الضرر: "القرارات الدائمة لا تُتخذ لمشاعر مؤقتة. أعطني 5 دقائق".
    3. التهدئة الفسيولوجية (TIPP): ماء بارد على الوجه فوراً لتفعيل "منعكس الغوص" وتهدئة القلب.
    4. التوجيه: شجع على الاتصال بـ 123 (مصر) أو 911 (عالمي) بحنان وحزم.`,
    contentEn: `[Crisis Intervention Protocol]
    Source: APA & NIMH.
    1. Safety First: "Are you in a safe place?".
    2. Harm Reduction: "Permanent decisions shouldn't be made on temporary feelings. Give me 5 mins."
    3. Physiological Calming (TIPP): Cold water on face to trigger Mammalian Dive Reflex.
    4. Referral: Warmly but firmly urge calling emergency services.`,
    source: "APA Practice Guidelines for Suicidal Behaviors (2020)."
  },

  // =================================================================
  // 1. DEPRESSION (CBT, BA, RFCBT, Positive Affect)
  // =================================================================
  {
    id: 'dep-001',
    category: 'depression',
    tags: ['behavioral', 'activation', 'depression', 'action', 'motivation', 'نشاط', 'اكتئاب', 'حافز', 'كسل'],
    contentAr: `[التنشيط السلوكي (BA)]
    المرجع: Martell et al. (University of Washington).
    قاعدة: "العمل يسبق الحافز". الاكتئاب يجعلك تنتظر "الرغبة" لتفعل شيئاً، وهذا فخ.
    العلاج: قم بنشاط صغير (5 دقائق) *رغم* عدم الرغبة. الحركة تولد الطاقة والمزاج، وليس العكس.`,
    contentEn: `[Behavioral Activation (BA)]
    Source: Martell et al. (2010).
    Rule: "Action precedes Motivation". Depression traps you in waiting to "feel like it".
    Rx: Do a micro-task (5 mins) *despite* lack of desire. Motion creates emotion.`,
    source: "Martell, C. R. (2010). Behavioral Activation."
  },
  {
    id: 'dep-002',
    category: 'depression',
    tags: ['rfcbt', 'rumination', 'watkins', 'focus', 'اجترار', 'تفكير', 'لماذا'],
    contentAr: `[علاج الاجترار المعرفي (RFCBT)]
    المرجع: Ed Watkins (UK/US Standards).
    الاكتئاب يجعلك تفكر بـ "لماذا؟" (لماذا أنا هكذا؟). هذا اجترار غير مفيد.
    العلاج: حول السؤال إلى "كيف؟" (كيف يمكنني تحسين اللحظة القادمة؟). انتقل من التفكير المجرد إلى التجربة الحسية الملموسة.`,
    contentEn: `[Rumination-Focused CBT (RFCBT)]
    Source: Ed Watkins.
    Depression loops on "Why?" (Why me?). This is toxic rumination.
    Rx: Shift to "How?" (How can I improve the next moment?). Shift from abstract thinking to concrete sensing.`,
    source: "Watkins, E. R. (2016). RFCBT."
  },
  {
    id: 'dep-003',
    category: 'depression',
    tags: ['positive', 'affect', 'treatment', 'craske', 'joy', 'anhedonia', 'متعة', 'فرح', 'شغف'],
    contentAr: `[علاج المشاعر الإيجابية (Positive Affect Treatment)]
    المرجع: Michelle Craske (UCLA).
    لعلاج "فقدان الشغف" (Anhedonia): التركيز فقط على السلبيات لا يكفي. يجب تدريب الدماغ على "تذوق" اللحظات الجيدة الصغيرة.
    التمرين: عندما يحدث شيء بسيط جيد (قهوة لذيذة)، ركز عليه لمدة 30 ثانية كاملة لتقوية مسار المكافأة في الدماغ.`,
    contentEn: `[Positive Affect Treatment]
    Source: Michelle Craske (UCLA).
    For Anhedonia (loss of joy): reducing sadness isn't enough. We must train "Savoring".
    Rx: When something small/good happens, focus on it for 30s to strengthen the brain's reward pathway.`,
    source: "Craske, M. G. (2019)."
  },
  {
    id: 'dep-004',
    category: 'depression',
    tags: ['cbt', 'cognitive', 'triad', 'beck', 'أفكار', 'تشوه'],
    contentAr: `[ثالوث بيك المعرفي]
    المرجع: Aaron Beck.
    الاكتئاب ينشأ من نظرة سلبية لـ (الذات، العالم، المستقبل).
    التدخل: الأسئلة السقراطية: "ما الدليل الحقيقي؟ هل هناك تفسير آخر؟"`,
    contentEn: `[Beck's Cognitive Triad]
    Source: Aaron Beck.
    Depression = Negative view of (Self, World, Future).
    Intervention: Socratic Questioning: "What is the evidence? Is there an alternative view?"`,
    source: "Beck, A. T. (1979)."
  },
  {
    id: 'dep-005',
    category: 'depression',
    tags: ['values', 'act', 'meaning', 'قيم', 'معنى'],
    contentAr: `[العمل القائم على القيم (ACT)]
    المرجع: Steven Hayes.
    السعادة ليست الهدف، بل "المعنى". اسأل: "حتى وأنا حزين، ما الذي يهمني؟". تحرك نحو قيمك واصطحب الحزن معك في الرحلة.`,
    contentEn: `[Values-Based Action (ACT)]
    Source: Steven Hayes.
    Happiness isn't the goal; Meaning is. Ask: "Even while sad, what matters to me?" Move towards values, taking sadness along for the ride.`,
    source: "Hayes, S. C. (2011)."
  },
  {
    id: 'dep-006',
    category: 'depression',
    tags: ['mbct', 'mindfulness', 'clouds', 'يقظة', 'أفكار'],
    contentAr: `[مراقبة الأفكار (MBCT)]
    المرجع: Segal, Williams, Teasdale.
    الأفكار ليست حقائق. هي مجرد "أحداث عقلية" مثل الغيوم. لا تحاربها ولا تصدقها، فقط لاحظ مرورها.`,
    contentEn: `[Thoughts are not Facts (MBCT)]
    Source: Segal et al.
    Thoughts are just "mental events", like clouds. Don't fight them, don't believe them. Just watch them pass.`,
    source: "Segal, Z. V. (2018)."
  },
  {
    id: 'dep-007',
    category: 'depression',
    tags: ['sleep', 'hygiene', 'circadian', 'نوم', 'ساعة'],
    contentAr: `[ضبط الساعة البيولوجية]
    المرجع: National Sleep Foundation.
    الاكتئاب يخل بالنوم. أهم علاج: الاستيقاظ في نفس الموعد يومياً والتعرض لضوء الشمس صباحاً، بغض النظر عن قلة النوم ليلاً.`,
    contentEn: `[Circadian Entrainment]
    Source: NSF.
    Depression disrupts rhythm. Rx: Wake up at the same time daily and get morning light, regardless of sleep quality.`,
    source: "NSF Guidelines."
  },
  {
    id: 'dep-008',
    category: 'depression',
    tags: ['journaling', 'burns', 'writing', 'كتابة', 'تفريغ'],
    contentAr: `[العلاج بالكتابة]
    المرجع: David Burns (Stanford).
    الكتابة تنقل المشاعر من "اللوزة الدماغية" (مركز الخوف) إلى "القشرة الأمامية" (مركز المنطق).`,
    contentEn: `[Mood Journaling]
    Source: David Burns.
    Writing moves emotion from the Amygdala (Fear) to the Prefrontal Cortex (Logic).`,
    source: "Burns, D. D. (1980)."
  },
  {
    id: 'dep-009',
    category: 'depression',
    tags: ['compassion', 'self', 'gilbert', 'رحمة', 'ذات'],
    contentAr: `[علاج الرحمة بالذات (CFT)]
    المرجع: Paul Gilbert.
    نقد الذات يرفع الكورتيزول ويزيد الاكتئاب. تخيل صوتاً رحيماً ودافئاً يكلمك كما تكلم طفلاً خائفاً.`,
    contentEn: `[Compassion Focused Therapy (CFT)]
    Source: Paul Gilbert.
    Self-criticism spikes cortisol. Imagine a warm, compassionate voice talking to you like a scared child.`,
    source: "Gilbert, P. (2009)."
  },
  {
    id: 'dep-010',
    category: 'depression',
    tags: ['ipt', 'interpersonal', 'social', 'علاقات', 'تواصل'],
    contentAr: `[العلاج التفاعلي (IPT)]
    المرجع: Klerman.
    تحسين جودة علاقاتك يحسن مزاجك. ركز على حل نزاع واحد أو بناء علاقة داعمة واحدة هذا الأسبوع.`,
    contentEn: `[Interpersonal Therapy (IPT)]
    Source: Klerman.
    Improving relationship quality improves mood. Focus on resolving one conflict or building one support link.`,
    source: "Weissman, M. M. (2000)."
  },

  // =================================================================
  // 2. ANXIETY (Unified Protocol, IUC, Worry Time)
  // =================================================================
  {
    id: 'anx-001',
    category: 'anxiety',
    tags: ['unified', 'protocol', 'avoidance', 'barlow', 'تجنب', 'مواجهة'],
    contentAr: `[البروتوكول الموحد: مواجهة التجنب]
    المرجع: David Barlow (Boston University).
    القلق يتغذى على "التجنب". كلما تجنبت ما يخيفك، زاد الخوف.
    العلاج: واجه الشعور غير المريح. اسمح لنفسك أن تشعر بالقلق دون الهروب منه. القلق موجة ستنكسر حتماً.`,
    contentEn: `[Unified Protocol: Confronting Avoidance]
    Source: Barlow (2017).
    Anxiety feeds on avoidance.
    Rx: Face the discomfort. Allow yourself to feel anxious without fleeing. The emotion is a wave that will break.`,
    source: "Barlow, D. H. (2017). Unified Protocol."
  },
  {
    id: 'anx-002',
    category: 'anxiety',
    tags: ['worry', 'scheduling', 'borkovec', 'تأجيل', 'قلق'],
    contentAr: `[جدولة القلق (Worry Time)]
    المرجع: Tom Borkovec.
    القلق ينتشر طوال اليوم. العلاج: حدد 30 دقيقة (مثلاً 5 مساءً) للقلق. إذا جاءتك فكرة مقلقة، قل: "ليس الآن، سأقلق بشأنك الساعة 5".`,
    contentEn: `[Worry Scheduling]
    Source: Borkovec.
    Assign a 30-min "Worry Window" daily. When a worry arises, defer it: "Not now, I'll worry about this at 5 PM."`,
    source: "Borkovec, T. D. (1993)."
  },
  {
    id: 'anx-003',
    category: 'anxiety',
    tags: ['interoceptive', 'exposure', 'panic', 'sensation', 'هلع', 'جسد'],
    contentAr: `[التعرض الحسي (Interoceptive Exposure)]
    المرجع: Craske & Barlow.
    لنوبات الهلع: الخوف ليس من المكان، بل من أعراض الجسد (دقات القلب).
    التمرين: تعمد الجري في مكانك لمدة دقيقة لتسريع قلبك، لتثبت للمخ أن "تسارع القلب آمن" ولا يعني الموت.`,
    contentEn: `[Interoceptive Exposure]
    Source: Craske & Barlow.
    For Panic: The fear is of the sensation (heartbeat).
    Rx: Intentionally induce symptoms (jog in place) to prove to the brain that racing heart is safe.`,
    source: "Craske, M. G. (2007)."
  },
  {
    id: 'anx-004',
    category: 'anxiety',
    tags: ['uncertainty', 'tolerance', 'dugas', 'مجهول', 'شك'],
    contentAr: `[تحمل المجهول (IUC)]
    المرجع: Dugas & Robichaud.
    القلق هو "حساسية ضد الغموض". لا تحاول الحصول على ضمانات.
    التمرين: تدرب على الشك. أرسل رسالة دون مراجعتها 10 مرات. اطلب طعاماً جديداً. ابنِ "عضلة تحمل المجهول".`,
    contentEn: `[Intolerance of Uncertainty (IUC)]
    Source: Dugas.
    Anxiety is an allergy to uncertainty.
    Rx: Practice small uncertain acts (send email without re-reading). Build the "uncertainty muscle".`,
    source: "Dugas, M. J. (2007)."
  },
  {
    id: 'anx-005',
    category: 'anxiety',
    tags: ['probability', 'estimation', 'cbt', 'تضخيم', 'احتمال'],
    contentAr: `[تصحيح تقدير الاحتمالات]
    المرجع: CBT Standard.
    القلق يخلط بين "الإمكانية" (ممكن تقع الطائرة) و"الاحتمالية" (1 في 11 مليون).
    السؤال العلاجي: "هل هذا ممكن؟ نعم. لكن هل هو *محتمل*؟"`,
    contentEn: `[Probability Estimation]
    Source: CBT Standard.
    Anxiety confuses "Possible" vs "Probable".
    Ask: "Is this just possible, or is it actually likely?" Check the stats.`,
    source: "Clark, D. A. (2010)."
  },
  {
    id: 'anx-006',
    category: 'anxiety',
    tags: ['decatastrophizing', 'whatif', 'beck', 'كارثة'],
    contentAr: `[تفكيك الكوارث]
    المرجع: Judith Beck.
    عند التفكير بـ "ماذا لو؟"، أجب عن الأسئلة: 1. ما هو أسوأ احتمال؟ 2. ما هو أفضل احتمال؟ 3. ما هو الأكثر واقعية؟ 4. لو حدث الأسوأ، هل سأنجو؟`,
    contentEn: `[Decatastrophizing]
    Source: Judith Beck.
    Answer: 1. Worst case? 2. Best case? 3. Most likely? 4. If worst happens, how would I cope?`,
    source: "Beck, J. S. (2011)."
  },
  {
    id: 'anx-007',
    category: 'anxiety',
    tags: ['worry', 'tree', 'butler', 'حل', 'مشكلة'],
    contentAr: `[شجرة القلق]
    المرجع: Butler & Hope.
    هل يمكنني فعل شيء الآن؟
    - نعم: افعله أو خطط له -> ثم اصرف انتباهك.
    - لا: هذا قلق غير منتج -> اصرف انتباهك فوراً.`,
    contentEn: `[The Worry Tree]
    Source: Butler & Hope.
    Can I do something now? YES (Plan/Act) or NO (Let go).`,
    source: "Butler, G. (1995)."
  },
  {
    id: 'anx-008',
    category: 'anxiety',
    tags: ['pmr', 'muscle', 'relaxation', 'jacobson', 'استرخاء', 'عضلات'],
    contentAr: `[الاسترخاء العضلي التدريجي (PMR)]
    المرجع: Edmund Jacobson.
    القلق يسبب شداً عضلياً خفياً. شد عضلاتك بقوة 5 ثواني، ثم ارخها فجأة. هذا يرسل إشارة "أمان" للدماغ.`,
    contentEn: `[Progressive Muscle Relaxation (PMR)]
    Source: Jacobson.
    Tense muscles for 5s, release suddenly. Breaks the physical stress loop.`,
    source: "Jacobson, E. (1938)."
  },
  {
    id: 'anx-009',
    category: 'anxiety',
    tags: ['grounding', '54321', 'mindfulness', 'تأريض', 'حواس'],
    contentAr: `[تمرين التأريض 5-4-3-2-1]
    المرجع: Mayo Clinic.
    لإيقاف طوفان الأفكار: سمِّ 5 أشياء تراها، 4 تلمسها، 3 تسمعها، 2 تشمها، 1 تتذوقها. عد للحاضر.`,
    contentEn: `[5-4-3-2-1 Grounding]
    Source: Mayo Clinic.
    Name 5 seen, 4 touched, 3 heard, 2 smelled, 1 tasted. Anchors you to the present.`,
    source: "Mayo Clinic Guidelines."
  },
  {
    id: 'anx-010',
    category: 'anxiety',
    tags: ['defusion', 'act', 'thought', 'انفصال', 'فكرة'],
    contentAr: `[الانفصال المعرفي]
    المرجع: Steven Hayes (ACT).
    بدلاً من "أنا خائف"، قل "أنا ألاحظ أن لدي شعور بالخوف". اخلق مسافة بينك وبين الشعور. أنت السماء، والمشاعر هي الطقس.`,
    contentEn: `[Cognitive Defusion]
    Source: Hayes.
    Instead of "I am scared", say "I notice I am having a feeling of fear". You are the sky; feelings are just the weather.`,
    source: "Hayes, S. C. (1999)."
  },

  // =================================================================
  // 3. OCD (I-CBT, ERP, Inhibitory Learning)
  // =================================================================
  {
    id: 'ocd-001',
    category: 'ocd',
    tags: ['icbt', 'inference', 'reality', 'oconnor', 'شك', 'واقع', 'خيال'],
    contentAr: `[العلاج القائم على الاستدلال (I-CBT)]
    المرجع: O'Connor & Aardema (2012).
    الوسواس يبدأ بـ "شك خيالي" (ربما الباب مفتوح) يتناقض مع "الواقع الحسي" (عيني ترى الباب مغلقاً).
    العلاج: ثق بحواسك. الشك هو مجرد قصة يختلقها الخيال، وليس دليلاً واقعياً. لا تحتاج للطقوس للتأكد، حواسك كافية.`,
    contentEn: `[Inference-based CBT (I-CBT)]
    Source: O'Connor & Aardema.
    OCD starts with "Imaginary Doubt" vs "Sensory Reality".
    Rx: Trust your senses. The doubt is a narrative, not a fact. You don't need rituals; your eyes are enough.`,
    source: "O'Connor, K. (2012). I-CBT."
  },
  {
    id: 'ocd-002',
    category: 'ocd',
    tags: ['erp', 'exposure', 'response', 'prevention', 'foa', 'منع', 'طقوس'],
    contentAr: `[التعرض ومنع الاستجابة (ERP)]
    المرجع: Edna Foa (Gold Standard).
    واجه ما تخاف منه (مثلاً: لمس سطح متسخ) وامتنع تماماً عن الطقوس (الغسيل). انتظر حتى ينخفض القلق تلقائياً (التعود).`,
    contentEn: `[Exposure & Response Prevention (ERP)]
    Source: Edna Foa.
    Face the fear (trigger) and strictly preventing the ritual (compulsion). Wait for anxiety to drop naturally.`,
    source: "Foa, E. B. (2012)."
  },
  {
    id: 'ocd-003',
    category: 'ocd',
    tags: ['inhibitory', 'learning', 'craske', 'توقعات', 'تعلم'],
    contentAr: `[التعلم التثبيطي]
    المرجع: Michelle Craske.
    الهدف ليس "الهدوء"، بل "إثبات خطأ الوسواس".
    التجربة: "الوسواس يقول إذا لم أغسل يدي سأمرض". لا تغسل يدك وانتظر. النتيجة: "لم أمرض". هكذا يتعلم الدماغ.`,
    contentEn: `[Inhibitory Learning]
    Source: Craske.
    Goal: Violate the expectancy. "OCD says if I don't wash, I get sick." Don't wash. Result: "I didn't get sick." Brain rewires.`,
    source: "Craske, M. G. (2014)."
  },
  {
    id: 'ocd-004',
    category: 'ocd',
    tags: ['acceptance', 'thoughts', 'noise', 'spam', 'ضوضاء'],
    contentAr: `[تقبل الأفكار المتطفلة]
    المرجع: Jon Hershfield.
    تعامل مع أفكار الوسواس كأنها "إعلانات مزعجة" (Pop-up Ads) أو "رسائل سبام". لا تفتحها، ولا تحاول حذفها. اتركها تمر في الخلفية وركز على عملك.`,
    contentEn: `[Accepting Intrusive Thoughts]
    Source: Hershfield.
    Treat thoughts like "Pop-up Ads" or "Spam". Don't click, don't fight. Let them sit in the background while you focus on life.`,
    source: "Hershfield, J. (2014)."
  },
  {
    id: 'ocd-005',
    category: 'ocd',
    tags: ['imaginal', 'exposure', 'script', 'سيناريو', 'كتابة'],
    contentAr: `[التعرض التخيلي]
    المرجع: CBT for OCD.
    اكتب قصة عن "أسوأ مخاوفك" تتحقق. اقرأها يومياً لمدة 20 دقيقة. التكرار يجعل القصة مملة ويفقدها قوتها المرعبة.`,
    contentEn: `[Imaginal Exposure]
    Source: Abramowitz.
    Write a script of your worst fear coming true. Read it daily for 20 mins until it becomes boring.`,
    source: "Abramowitz, J. S. (2011)."
  },
  {
    id: 'ocd-006',
    category: 'ocd',
    tags: ['uncertainty', 'grayson', 'certainty', 'يقين', 'شك'],
    contentAr: `[التعايش مع عدم اليقين]
    المرجع: Jonathan Grayson.
    الوسواس يطلب "يقيناً 100%". العلاج هو قول: "ربما نسيت الغاز مفتوحاً، سأقبل هذه المخاطرة وأعيش حياتي". طلب اليقين هو المشكلة.`,
    contentEn: `[Living with Uncertainty]
    Source: Grayson.
    OCD demands 100% certainty. The cure is saying: "Maybe I did leave the stove on. I will live with that risk."`,
    source: "Grayson, J. (2014)."
  },
  {
    id: 'ocd-007',
    category: 'ocd',
    tags: ['taf', 'thought', 'action', 'fusion', 'أخلاق', 'فكرة'],
    contentAr: `[دمج الفكرة بالفعل (TAF)]
    المرجع: Salkovskis.
    التفكير في إيذاء شخص لا يعني أنك ستفعلها، ولا يعني أنك شرير. الأفكار مجرد إشارات كهربائية، وليست حقائق أو نوايا.`,
    contentEn: `[Thought-Action Fusion (TAF)]
    Source: Salkovskis.
    Thinking about harm doesn't mean you will do it. Thoughts are electrical signals, not actions or character flaws.`,
    source: "Salkovskis, P. M. (1985)."
  },
  {
    id: 'ocd-008',
    category: 'ocd',
    tags: ['family', 'accommodation', 'support', 'طمأنة', 'عائلة'],
    contentAr: `[وقف الطمأنة العائلية]
    المرجع: Van Noppen.
    على العائلة التوقف عن المشاركة في الطقوس أو الإجابة على أسئلة "هل أنا نظيف؟". الطمأنة غذاء للوسواس، والحب الحقيقي هو المساعدة في منع الطقوس.`,
    contentEn: `[Stopping Family Accommodation]
    Source: Van Noppen.
    Family must stop reassuring or participating in rituals. Reassurance feeds OCD.`,
    source: "Van Noppen, B. (1999)."
  },
  {
    id: 'ocd-009',
    category: 'ocd',
    tags: ['values', 'act', 'focus', 'قيم', 'تركيز'],
    contentAr: `[التركيز القائم على القيم]
    المرجع: ACT for OCD.
    الوسواس يضيع وقتك الثمين. اسأل: "لو لم أكن مشغولاً بالوسواس الآن، ماذا كنت سأفعل؟". افعل ذلك الشيء فوراً مع وجود القلق.`,
    contentEn: `[Value-Based Focus]
    Source: Twohig.
    Ask: "If I wasn't obsessing, what would I be doing?" Go do that thing now, taking the anxiety with you.`,
    source: "Twohig, M. P. (2010)."
  },
  {
    id: 'ocd-010',
    category: 'ocd',
    tags: ['flooding', 'intense', 'غمر', 'مواجهة'],
    contentAr: `[الغمر (Flooding)]
    المرجع: Behavioral Therapy.
    (للحالات الشديدة) مواجهة المثير المخيف بأقصى درجة دفعة واحدة والبقاء معه حتى يختفي القلق تماماً.`,
    contentEn: `[Flooding]
    Source: Behavioral Therapy.
    Facing the fear fully and intensely until anxiety exhausts itself completely.`,
    source: "Foa, E. B. (2012)."
  },

  // =================================================================
  // 4. PTSD (CPT, PE, STAIR)
  // =================================================================
  {
    id: 'ptsd-001',
    category: 'ptsd',
    tags: ['cpt', 'stuck', 'points', 'resick', 'صدمة', 'نقاط'],
    contentAr: `[علاج المعالجة المعرفية (CPT)]
    المرجع: Patricia Resick (Duke Health).
    الصدمة تخلق "نقاط عالقة" (مثل: "العالم خطر"، "أنا السبب").
    العلاج: اكتب هذه الأفكار وتحدها بالأدلة. هل *حقاً* كل الناس خطرون؟ أم أن المعتدي كان استثناءً؟`,
    contentEn: `[Cognitive Processing Therapy (CPT)]
    Source: Patricia Resick.
    Trauma creates "Stuck Points" (e.g., "It was my fault").
    Rx: Write and challenge these beliefs. Is the *whole* world unsafe, or was that event an exception?`,
    source: "Resick, P. A. (2016)."
  },
  {
    id: 'ptsd-002',
    category: 'ptsd',
    tags: ['pe', 'prolonged', 'exposure', 'foa', 'سرد', 'تسجيل'],
    contentAr: `[التعرض المستمر (PE)]
    المرجع: Edna Foa (UPenn).
    تجنب الذكرى يبقيها حية ومخيفة.
    العلاج: سجل بصوتك قصة الصدمة بالتفصيل (بزمن المضارع). استمع للتسجيل يومياً. هذا يحول "الرعب" إلى مجرد "ذكرى حزينة".`,
    contentEn: `[Prolonged Exposure (PE)]
    Source: Edna Foa.
    Avoidance keeps trauma alive.
    Rx: Record the trauma narrative in present tense. Listen daily. Processes the memory from "Terror" to "Sadness".`,
    source: "Foa, E. B. (2019)."
  },
  {
    id: 'ptsd-003',
    category: 'ptsd',
    tags: ['grounding', 'dissociation', 'najavits', 'تأريض', 'انفصال'],
    contentAr: `[التأريض (Grounding)]
    المرجع: Lisa Najavits (Seeking Safety).
    عند الشعور بالانفصال (Dissociation): المس كرسيك، سم 5 ألوان تراها، اغسل وجهك بماء بارد. قل: "أنا هنا في 2025، ولست هناك في الماضي".`,
    contentEn: `[Grounding]
    Source: Lisa Najavits.
    For Dissociation: Touch your chair, name 5 colors. Say: "I am here in 2025, not back there."`,
    source: "Najavits, L. M. (2002)."
  },
  {
    id: 'ptsd-004',
    category: 'ptsd',
    tags: ['irt', 'nightmare', 'sleep', 'rescripting', 'كوابيس'],
    contentAr: `[علاج الكوابيس (IRT)]
    المرجع: Krakow.
    لا تستسلم للكوابيس. اكتب الكابوس في الصباح، لكن غير النهاية لتكون إيجابية أو آمنة. تدرب على السيناريو الجديد في خيالك قبل النوم.`,
    contentEn: `[Imagery Rehearsal Therapy (IRT)]
    Source: Krakow.
    Write down the nightmare but change the ending to a triumphant/safe one. Rehearse the new script daily.`,
    source: "Krakow, B. (2001)."
  },
  {
    id: 'ptsd-005',
    category: 'ptsd',
    tags: ['invivo', 'exposure', 'avoidance', 'مواجهة', 'واقع'],
    contentAr: `[التعرض الواقعي (In Vivo)]
    المرجع: VA PTSD Center.
    حدد الأماكن التي تتجنبها بسبب الصدمة (الزحام، القيادة). اذهب إليها تدريجياً وابق هناك 45 دقيقة حتى تدرك أنها آمنة الآن.`,
    contentEn: `[In Vivo Exposure]
    Source: VA National Center.
    Gradually visit safe places you avoid (crowds, driving). Stay for 45 mins until anxiety subsides.`,
    source: "Foa, E. B. (2007)."
  },
  {
    id: 'ptsd-006',
    category: 'ptsd',
    tags: ['dual', 'awareness', 'rothschild', 'وعي', 'مزدوج'],
    contentAr: `[الوعي المزدوج]
    المرجع: Babette Rothschild.
    "أنا أتذكر الماضي، لكن جسدي هنا في الحاضر". حافظ على قدميك على الأرض وعينيك مفتوحتين أثناء تذكر الصدمة لمنع الانغماس الكامل.`,
    contentEn: `[Dual Awareness]
    Source: Rothschild.
    "I am remembering the past, but my body is here now." Keep eyes open and feet on floor while processing.`,
    source: "Rothschild, B. (2000)."
  },
  {
    id: 'ptsd-007',
    category: 'ptsd',
    tags: ['trust', 'rebuilding', 'beliefs', 'ثقة', 'أمان'],
    contentAr: `[إعادة بناء الثقة]
    المرجع: CPT Protocol.
    الصدمة قد تجعلك تظن "لا أحد يستحق الثقة". تحدى هذا التعميم. ابحث عن أدلة لأشخاص جديرين بالثقة في حياتك الحالية.`,
    contentEn: `[Rebuilding Trust]
    Source: CPT Protocol.
    Challenge the belief "No one can be trusted". Look for evidence of trustworthy people in your current life.`,
    source: "Resick, P. A. (2016)."
  },
  {
    id: 'ptsd-008',
    category: 'ptsd',
    tags: ['somatic', 'release', 'levine', 'جسد', 'تحرير'],
    contentAr: `[التحرير الجسدي]
    المرجع: Peter Levine (Somatic Experiencing).
    إذا شعرت برغبة في الارتجاف أو البكاء، اسمح لجسدك بذلك. هذا تفريغ للطاقة الحبيسة من وقت الصدمة.`,
    contentEn: `[Somatic Release]
    Source: Peter Levine.
    Let your body shake or cry if it needs to. This discharges trapped survival energy.`,
    source: "Levine, P. A. (1997)."
  },
  {
    id: 'ptsd-009',
    category: 'ptsd',
    tags: ['window', 'tolerance', 'siegel', 'نافذة', 'تحمل'],
    contentAr: `[نافذة التحمل]
    المرجع: Dan Siegel.
    راقب جهازك العصبي. هل أنت في "استثارة عالية" (غضب) أم "انفصال" (تخدير)؟ استخدم التنفس للعودة للمنطقة الوسطى المتوازنة.`,
    contentEn: `[Window of Tolerance]
    Source: Dan Siegel.
    Monitor arousal. Are you Hyper-aroused (Panic) or Hypo-aroused (Numb)? Regulate back to the window.`,
    source: "Siegel, D. J. (1999)."
  },
  {
    id: 'ptsd-010',
    category: 'ptsd',
    tags: ['stair', 'interpersonal', 'skills', 'علاقات', 'مهارات'],
    contentAr: `[مهارات STAIR]
    المرجع: Cloitre.
    تدريب المهارات لتنظيم المشاعر والعلاقات. الصدمة تؤثر على علاقاتك؛ تعلم كيف تعبر عن احتياجاتك دون عدوانية أو خضوع.`,
    contentEn: `[STAIR (Skills Training in Affective and Interpersonal Regulation)]
    Source: Cloitre.
    Learn to regulate emotions and navigate relationships. Assert needs without aggression.`,
    source: "Cloitre, M. (2010)."
  },

  // =================================================================
  // 5. BIPOLAR (IPSRT, FFT)
  // =================================================================
  {
    id: 'bip-001',
    category: 'bipolar',
    tags: ['ipsrt', 'rhythm', 'routine', 'frank', 'إيقاع', 'نوم'],
    contentAr: `[تنظيم الإيقاع الاجتماعي (IPSRT)]
    المرجع: Ellen Frank (UPittsburgh).
    الدماغ ثنائي القطب حساس جداً لتغير الروتين.
    العلاج: ثبت مواعيد الاستيقاظ، النوم، والأكل بدقة. أي خلل في الساعة البيولوجية قد يقدح نوبة.`,
    contentEn: `[Interpersonal and Social Rhythm Therapy (IPSRT)]
    Source: Ellen Frank.
    Bipolar brains are sensitive to circadian disruption.
    Rx: Rigidly fix wake/sleep/meal times. Routine protects mood.`,
    source: "Frank, E. (2005)."
  },
  {
    id: 'bip-002',
    category: 'bipolar',
    tags: ['prodromal', 'warning', 'signs', 'lam', 'إنذار', 'مبكر'],
    contentAr: `[اكتشاف الإنذار المبكر]
    المرجع: Dominic Lam.
    كل شخص لديه "توقيع" قبل النوبة (مثلاً: النوم 4 ساعات فقط والشعور بالنشاط، أو كثرة الاتصالات). اعرف توقيعك وتصرف فوراً.`,
    contentEn: `[Prodromal Symptom Detection]
    Source: Lam.
    Identify your personal "signature" before a shift (e.g., sleeping less but feeling energetic). Act immediately.`,
    source: "Lam, D. (1999)."
  },
  {
    id: 'bip-003',
    category: 'bipolar',
    tags: ['dark', 'therapy', 'mania', 'phelps', 'ظلام', 'هوس'],
    contentAr: `[العلاج بالظلام]
    المرجع: Jim Phelps.
    عند بداية أعراض الهوس (Mania): الزم غرفة مظلمة تماماً لمدة 10-14 ساعة يومياً (حتى لو كنت مستيقظاً). الظلام يهدئ كيمياء الدماغ الهائجة.`,
    contentEn: `[Dark Therapy]
    Source: Phelps.
    At signs of mania: Stay in total darkness for 10-14 hours (Virtual Darkness). This downregulates the brain.`,
    source: "Phelps, J. (2006)."
  },
  {
    id: 'bip-004',
    category: 'bipolar',
    tags: ['mood', 'charting', 'nimh', 'track', 'تتبع', 'مزاج'],
    contentAr: `[رسم خريطة المزاج]
    المرجع: NIMH Guidelines.
    سجل يومياً: المزاج (1-10)، ساعات النوم، والدواء. هذا يكشف الأنماط الدورية ويساعد طبيبك على ضبط العلاج.`,
    contentEn: `[Mood Charting]
    Source: NIMH.
    Log daily: Mood, Sleep, Meds. Visualizing the cycles is key to management.`,
    source: "NIMH Guidelines."
  },
  {
    id: 'bip-005',
    category: 'bipolar',
    tags: ['fft', 'family', 'miklowitz', 'عائلة', 'دعم'],
    contentAr: `[العلاج العائلي (FFT)]
    المرجع: David Miklowitz (UCLA).
    على العائلة تقليل "التعبير الانفعالي العالي" (النقد والصراخ). البيئة الهادئة في المنزل تقلل الانتكاسات بنسبة كبيرة.`,
    contentEn: `[Family Focused Therapy (FFT)]
    Source: Miklowitz.
    Reduce "High Expressed Emotion" (criticism/hostility) at home. A calm family environment prevents relapse.`,
    source: "Miklowitz, D. J. (2008)."
  },
  {
    id: 'bip-006',
    category: 'bipolar',
    tags: ['medication', 'adherence', 'compliance', 'دواء', 'التزام'],
    contentAr: `[الالتزام الدوائي]
    المرجع: APA Guidelines.
    السبب الأول للانتكاسة هو وقف الدواء عند الشعور بالتحسن. "أنا لست مريضاً، أنا بخير". تذكر أن الدواء هو ما يجعلك بخير.`,
    contentEn: `[Medication Adherence]
    Source: APA.
    #1 cause of relapse: Stopping meds when feeling "better". Feeling better means the meds are working, not that you are cured.`,
    source: "Basco, M. R. (2005)."
  },
  {
    id: 'bip-007',
    category: 'bipolar',
    tags: ['impulse', 'delay', 'rule', 'تهور', 'قرار'],
    contentAr: `[قاعدة الـ 48 ساعة]
    المرجع: CBT for Bipolar.
    أثناء المزاج العالي: ممنوع اتخاذ قرارات كبرى (شراء، استقالة، سفر) قبل مرور 48 ساعة ومراجعة "شخص موثوق".`,
    contentEn: `[The 48-Hour Rule]
    Source: Newman.
    When mood is high: No major decisions (spending, quitting) for 48 hours. Consult a "Designated Person".`,
    source: "Newman, C. F. (2001)."
  },
  {
    id: 'bip-008',
    category: 'bipolar',
    tags: ['activity', 'pacing', 'energy', 'نشاط', 'توازن'],
    contentAr: `[ضبط إيقاع النشاط]
    المرجع: OT Standards.
    لا تفرط في النشاط عندما تكون طاقتك عالية (خطر الهوس)، ولا تستسلم للركود عند الاكتئاب. حافظ على وتيرة متوسطة وثابتة.`,
    contentEn: `[Activity Pacing]
    Source: OT Standards.
    Don't overdo it when high (risks mania). Don't stagnate when low. Maintain a moderate, steady pace.`,
    source: "Packer, T. (2009)."
  },
  {
    id: 'bip-009',
    category: 'bipolar',
    tags: ['safety', 'plan', 'suicide', 'خطة', 'طوارئ'],
    contentAr: `[خطة الأمان]
    المرجع: Stanley & Brown.
    اكتب ورقة فيها: 1. علامات التحذير. 2. أرقام الطبيب والأصدقاء. 3. ما يهدئك. احملها معك دائماً.`,
    contentEn: `[Safety Plan]
    Source: Stanley & Brown.
    List warning signs, coping skills, and emergency contacts. Keep accessible.`,
    source: "Stanley, B. (2012)."
  },
  {
    id: 'bip-010',
    category: 'bipolar',
    tags: ['cognitive', 'grandiosity', 'thoughts', 'عظمة', 'أفكار'],
    contentAr: `[تحدي أفكار العظمة]
    المرجع: CBT.
    عندما تشعر أنك "عبقري" أو "لديك قدرات خارقة"، اسأل: "هل هذا شعور واقعي أم عرض للنوبة؟". قارن بالواقع.`,
    contentEn: `[Challenging Grandiosity]
    Source: CBT.
    Check reality: "Do I really have superpowers, or is this a symptom?"`,
    source: "Basco, M. R. (2005)."
  },

  // =================================================================
  // 6. SOCIAL PHOBIA (CBT Group, Attention Training)
  // =================================================================
  {
    id: 'soc-001',
    category: 'social_phobia',
    tags: ['safety', 'behaviors', 'clark', 'wells', 'سلوك', 'أمان'],
    contentAr: `[إسقاط سلوكيات الأمان]
    المرجع: Clark & Wells (Oxford).
    تجنب النظر في العين، تحضير الكلام مسبقاً، أو مسك الهاتف.. هذه "عكازات" تزيد القلق. اتركها لترى أنك آمن بدونها.`,
    contentEn: `[Dropping Safety Behaviors]
    Source: Clark & Wells.
    Rehearsing speech, avoiding eye contact, holding phone... these maintain anxiety. Drop them to learn you are safe.`,
    source: "Clark, D. M. (1995)."
  },
  {
    id: 'soc-002',
    category: 'social_phobia',
    tags: ['attention', 'external', 'focus', 'انتباه', 'خارجي'],
    contentAr: `[تركيز الانتباه للخارج]
    المرجع: Adrian Wells.
    بدلاً من التركيز على دقات قلبك واحمرار وجهك (داخلي)، ركز في وجه الشخص الآخر وكلامه (خارجي).`,
    contentEn: `[External Focus]
    Source: Wells.
    Shift focus from internal symptoms (heartbeat, blushing) to the external environment (the other person).`,
    source: "Wells, A. (1997)."
  },
  {
    id: 'soc-003',
    category: 'social_phobia',
    tags: ['video', 'feedback', 'distortion', 'فيديو', 'صورة'],
    contentAr: `[التغذية الراجعة بالفيديو]
    المرجع: Harvey & Clark.
    نحن نتخيل أن شكلنا "كارثي" أثناء القلق. تصوير نفسك يثبت أنك تبدو طبيعياً أكثر بكثير مما تشعر.`,
    contentEn: `[Video Feedback]
    Source: Harvey.
    We imagine we look disastrous. Recording proves you look much more normal than you feel.`,
    source: "Harvey, A. G. (2000)."
  },
  {
    id: 'soc-004',
    category: 'social_phobia',
    tags: ['behavioral', 'experiments', 'mistakes', 'خطأ', 'تجربة'],
    contentAr: `[تجارب الأخطاء المتعمدة]
    المرجع: Hofmann (Boston U).
    تعمد ارتكاب خطأ صغير (أسقط قلماً، تللعثم). هل سخر أحد؟ غالباً لا. العالم متسامح.`,
    contentEn: `[Social Mishap Experiments]
    Source: Hofmann.
    Intentionally make a small mistake. Observe: Did anyone care? The world is forgiving.`,
    source: "Hofmann, S. G. (2008)."
  },
  {
    id: 'soc-005',
    category: 'social_phobia',
    tags: ['spotlight', 'effect', 'gilovich', 'أضواء', 'مراقبة'],
    contentAr: `[تأثير الأضواء (Spotlight Effect)]
    المرجع: Thomas Gilovich (Cornell).
    تذكر: الناس لا يراقبونك كما تظن. هم مشغولون بأنفسهم بنسبة 99%. أنت لست محور انتباههم.`,
    contentEn: `[Spotlight Effect]
    Source: Gilovich.
    People notice you way less than you think. They are focused on themselves.`,
    source: "Gilovich, T. (2000)."
  },
  {
    id: 'soc-006',
    category: 'social_phobia',
    tags: ['post', 'event', 'rumination', 'pep', 'اجترار', 'لوم'],
    contentAr: `[وقف الاجترار البعدي]
    المرجع: CBT for SAD.
    بعد الموقف الاجتماعي، لا تراجع "الشريط" وتلوم نفسك. انتهى الموقف، لا تحلله.`,
    contentEn: `[Ban Post-Event Processing (PEP)]
    Source: CBT.
    Don't conduct a "post-mortem" analysis of your social performance. Move on.`,
    source: "Clark, D. M. (2001)."
  },
  {
    id: 'soc-007',
    category: 'social_phobia',
    tags: ['assertiveness', 'skills', 'rights', 'توكيد', 'حقوق'],
    contentAr: `[التدريب على التوكيدية]
    المرجع: Alberti & Emmons.
    من حقك أن تقول "لا" وأن تطلب ما تريد. التوكيد هو حل وسط بين الخضوع والعدوانية.`,
    contentEn: `[Assertiveness Training]
    Source: Alberti.
    Practice saying "No" and stating needs. Neither passive nor aggressive.`,
    source: "Alberti, R. (2017)."
  },
  {
    id: 'soc-008',
    category: 'social_phobia',
    tags: ['exposure', 'hierarchy', 'heimberg', 'تدرج', 'مواجهة'],
    contentAr: `[سلم التعرض الاجتماعي]
    المرجع: Richard Heimberg.
    ابدأ بمواقف سهلة (سؤال غريب) ثم تدرج للأصعب (التحدث في اجتماع). كرر الموقف حتى يزول الخوف.`,
    contentEn: `[Social Exposure Hierarchy]
    Source: Heimberg.
    Rank fears 0-100. Start low, repeat until boring, move up.`,
    source: "Heimberg, R. G. (2002)."
  },
  {
    id: 'soc-009',
    category: 'social_phobia',
    tags: ['curiosity', 'questions', 'conversation', 'فضول', 'أسئلة'],
    contentAr: `[الفضول بدل الخوف]
    المرجع: Social Psychology.
    أفضل حيلة للتغلب على الخجل هي "الاهتمام بالآخر". اسأل أسئلة وكن فضولياً. هذا ينقل الضغط منك إليهم.`,
    contentEn: `[Curiosity over Fear]
    Source: Social Psych.
    Shift focus to the other person. Ask questions. Being interested lowers self-consciousness.`,
    source: "Carnegie, D."
  },
  {
    id: 'soc-010',
    category: 'social_phobia',
    tags: ['mind', 'reading', 'distortion', 'أفكار', 'قراءة'],
    contentAr: `[تحدي قراءة الأفكار]
    المرجع: CBT.
    أنت تفترض أنهم يقولون "إنه غبي". ما الدليل؟ لا يوجد. توقف عن اختلاق أفكار الناس.`,
    contentEn: `[Mind Reading Challenge]
    Source: CBT.
    You assume they think you are stupid. Evidence? None. Stop guessing.`,
    source: "Hope, D. A. (2010)."
  },

  // =================================================================
  // 7. SLEEP (CBT-I - Gold Standard)
  // =================================================================
  {
    id: 'slp-001',
    category: 'sleep',
    tags: ['stimulus', 'control', 'bed', 'sleep', 'سرير', 'أرق'],
    contentAr: `[التحكم في المثير (Stimulus Control)]
    المرجع: Spielman (CBT-I Gold Standard).
    قاعدة الـ 20 دقيقة: إذا لم تنم، غادر السرير فوراً. افعل شيئاً مملاً وعد فقط عند النعاس. السرير للنوم فقط، لا للقلق.`,
    contentEn: `[Stimulus Control]
    Source: Spielman.
    The 20-min Rule: If awake, LEAVE the bed. Only return when sleepy. Re-associate bed with sleep, not worry.`,
    source: "Spielman, A. J. (1987)."
  },
  {
    id: 'slp-002',
    category: 'sleep',
    tags: ['sleep', 'restriction', 'efficiency', 'window', 'وقت', 'نوم'],
    contentAr: `[تحديد نافذة النوم (Sleep Restriction)]
    المرجع: CBT-I.
    قلل ساعات وجودك في السرير لتطابق ساعات نومك الفعلية. هذا يزيد "ضغط النوم" ويجعله عميقاً ومتصلاً.`,
    contentEn: `[Sleep Restriction]
    Source: CBT-I.
    Limit time in bed to actual sleep time. Builds "sleep drive" and efficiency.`,
    source: "Spielman, A. J. (1987)."
  },
  {
    id: 'slp-003',
    category: 'sleep',
    tags: ['clock', 'watching', 'anxiety', 'ساعة', 'مراقبة'],
    contentAr: `[إخفاء الساعة]
    المرجع: Morin.
    حساب "كم تبقى من الوقت للنوم" يرفع القلق ويطير النوم. أدر الساعة بعيداً عن نظرك.`,
    contentEn: `[No Clock Watching]
    Source: Morin.
    Calculating "hours left" spikes cortisol. Turn the clock away.`,
    source: "Morin, C. M. (2003)."
  },
  {
    id: 'slp-004',
    category: 'sleep',
    tags: ['buffer', 'zone', 'wind', 'down', 'تهدئة', 'روتين'],
    contentAr: `[منطقة التهدئة]
    المرجع: NSF.
    آخر ساعة قبل النوم: لا شاشات، لا عمل. إضاءة خافتة ونشاط هادئ جداً (قراءة ورقية).`,
    contentEn: `[Buffer Zone]
    Source: NSF.
    1 hour before bed: No screens, no work. Dim lights and do low-energy activity.`,
    source: "Perlis, M. L. (2005)."
  },
  {
    id: 'slp-005',
    category: 'sleep',
    tags: ['worry', 'time', 'constructive', 'قلق', 'كتابة'],
    contentAr: `[تفريغ القلق المبكر]
    المرجع: Harvey.
    اكتب مخاوف الغد في ورقة مبكراً (مساءً). عندما تأتي الأفكار في السرير، قل: "مكتوبة وسأحلها غداً".`,
    contentEn: `[Constructive Worry]
    Source: Harvey.
    Write down tomorrow's worries early in the evening. Leave them on the paper, not in your head.`,
    source: "Harvey, A. G. (2002)."
  },
  {
    id: 'slp-006',
    category: 'sleep',
    tags: ['paradoxical', 'intention', 'trying', 'نية', 'عكسية'],
    contentAr: `[النية العكسية]
    المرجع: Viktor Frankl.
    بدلاً من "يجب أن أنام"، حاول أن "تبقى مستيقظاً" (وعيناك مغلقتان). إزالة ضغط المحاولة يجلب النوم.`,
    contentEn: `[Paradoxical Intention]
    Source: Frankl.
    Try to "stay awake" (eyes closed). Removing the effort to sleep allows sleep to happen.`,
    source: "Frankl, V. (1985)."
  },
  {
    id: 'slp-007',
    category: 'sleep',
    tags: ['caffeine', 'alcohol', 'half-life', 'كافيين', 'قهوة'],
    contentAr: `[قانون الكافيين]
    المرجع: Matthew Walker.
    الكافيين يبقى في الدم 8 ساعات. توقف عن القهوة بعد الظهر تماماً.`,
    contentEn: `[Caffeine Curfew]
    Source: Walker.
    Caffeine half-life is long. No coffee after 12 PM.`,
    source: "Walker, M. (2017)."
  },
  {
    id: 'slp-008',
    category: 'sleep',
    tags: ['light', 'darkness', 'melatonin', 'ضوء', 'ظلام'],
    contentAr: `[الضوء والظلام]
    المرجع: Circadian Biology.
    ضوء الشمس صباحاً يضبط الساعة. الظلام الدامس ليلاً يفرز الميلاتونين.`,
    contentEn: `[Light & Dark]
    Source: Circadian Science.
    Morning sun anchors the clock. Total darkness at night releases melatonin.`,
    source: "Lack, L. (2009)."
  },
  {
    id: 'slp-009',
    category: 'sleep',
    tags: ['relaxation', '478', 'breathing', 'benson', 'تنفس'],
    contentAr: `[استجابة الاسترخاء (4-7-8)]
    المرجع: Herbert Benson.
    تنفس بعمق لتفعيل الجهاز الباراسمبثاوي وتهدئة الجسم للنوم.`,
    contentEn: `[Relaxation Response]
    Source: Benson.
    Deep breathing triggers safety signals for sleep.`,
    source: "Benson, H. (1975)."
  },
  {
    id: 'slp-010',
    category: 'sleep',
    tags: ['body', 'scan', 'mindfulness', 'مسح', 'جسد'],
    contentAr: `[مسح الجسد]
    المرجع: MBSR.
    ارخِ عضلاتك من أصابع القدم للرأس. هذا يشغل العقل عن التفكير.`,
    contentEn: `[Body Scan]
    Source: MBSR.
    Relax muscles from toes to head to distract the racing mind.`,
    source: "Kabat-Zinn, J. (1990)."
  },

  // =================================================================
  // 8. RELATIONSHIPS (Gottman, EFT)
  // =================================================================
  {
    id: 'rel-001',
    category: 'relationships',
    tags: ['horsemen', 'gottman', 'criticism', 'contempt', 'نقد', 'احتقار'],
    contentAr: `[الفرسان الأربعة]
    المرجع: John Gottman (UWashington).
    أخطر سلوكيات: النقد، الاحتقار (الأخطر)، الدفاعية، المماطلة.
    الحل: اشتكِ بدون لوم ("أنا أشعر..." بدلاً من "أنت دائماً...").`,
    contentEn: `[The Four Horsemen]
    Source: Gottman.
    Toxic behaviors: Criticism, Contempt, Defensiveness, Stonewalling.
    Antidote: Gentle Start-up ("I feel..." vs "You always...").`,
    source: "Gottman, J. (1999)."
  },
  {
    id: 'rel-002',
    category: 'relationships',
    tags: ['eft', 'attachment', 'johnson', 'sue', 'أمان', 'تعلق'],
    contentAr: `[العلاج المرتكز على العاطفة (EFT)]
    المرجع: Sue Johnson.
    الشجار غالباً هو احتجاج على فقدان الأمان: "هل أنت موجود لأجلي؟". خاطب الحاجة العاطفية وليس المشكلة السطحية.`,
    contentEn: `[Emotionally Focused Therapy (EFT)]
    Source: Sue Johnson.
    Conflict is often an attachment protest: "Are you there for me?". Address the emotional need.`,
    source: "Johnson, S. (2008)."
  },
  {
    id: 'rel-003',
    category: 'relationships',
    tags: ['love', 'maps', 'knowing', 'خريطة', 'حب'],
    contentAr: `[خرائط الحب]
    المرجع: Gottman.
    اعرف تفاصيل حياة شريكك (أحلامه، مخاوفه، أصدقاؤه). حدث معلوماتك عنه باستمرار.`,
    contentEn: `[Love Maps]
    Source: Gottman.
    Know your partner's inner world (dreams, stresses). Update this map regularly.`,
    source: "Gottman, J. (1999)."
  },
  {
    id: 'rel-004',
    category: 'relationships',
    tags: ['bids', 'connection', 'turning', 'اهتمام', 'التفات'],
    contentAr: `[الالتفات للعروض (Bids)]
    المرجع: Gottman.
    عندما يطلب شريكك الانتباه (حتى بتنهيدة)، التفت إليه. تجاهله يقتل العلاقة ببطء.`,
    contentEn: `[Turning Towards Bids]
    Source: Gottman.
    Respond to small requests for connection. Ignoring them kills the relationship.`,
    source: "Gottman, J. (2002)."
  },
  {
    id: 'rel-005',
    category: 'relationships',
    tags: ['soft', 'startup', 'complaint', 'بداية', 'لينة'],
    contentAr: `[البداية اللينة]
    المرجع: Gottman.
    ابدأ النقاش بهدوء وبدون هجوم. "96% من النقاشات تنتهي كما بدأت".`,
    contentEn: `[Soft Startup]
    Source: Gottman.
    Start conflict gently. "96% of conversations end the way they start."`,
    source: "Gottman, J. (1999)."
  },
  {
    id: 'rel-006',
    category: 'relationships',
    tags: ['repair', 'apology', 'sorry', 'إصلاح', 'اعتذار'],
    contentAr: `[محاولات الإصلاح]
    المرجع: Gottman.
    السر في العلاقات السعيدة ليس "عدم الشجار"، بل "سرعة الإصلاح" والاعتذار وقبوله.`,
    contentEn: `[Repair Attempts]
    Source: Gottman.
    Happy couples repair early and often. "Sorry, let me try that again."`,
    source: "Gottman, J. (2015)."
  },
  {
    id: 'rel-007',
    category: 'relationships',
    tags: ['shared', 'meaning', 'rituals', 'معنى', 'مشترك'],
    contentAr: `[المعنى المشترك]
    المرجع: Gottman.
    اخلقوا طقوساً خاصة بكم (قهوة الصباح، نزهة الأسبوع). هذا يبني ثقافة العائلة.`,
    contentEn: `[Shared Meaning]
    Source: Gottman.
    Create rituals and shared goals. This is the glue of the relationship.`,
    source: "Gottman, J. (1999)."
  },
  {
    id: 'rel-008',
    category: 'relationships',
    tags: ['speaker', 'listener', 'prep', 'markman', 'استماع'],
    contentAr: `[تقنية المتحدث والمستمع]
    المرجع: Howard Markman (PREP).
    واحد يتحدث، والآخر يستمع فقط ويعيد ما سمعه للتأكد. لا مقاطعة ولا دفاع.`,
    contentEn: `[Speaker-Listener Technique]
    Source: Markman.
    One speaks, other listens and paraphrases ONLY. Safe communication.`,
    source: "Markman, H. (1994)."
  },
  {
    id: 'rel-009',
    category: 'relationships',
    tags: ['acceptance', 'influence', 'تقبل', 'تأثير'],
    contentAr: `[تقبل التأثير]
    المرجع: Gottman.
    الأزواج الناجحون (خاصة الرجال) يتقبلون آراء شريكاتهم ويشاركونهن القرار.`,
    contentEn: `[Accepting Influence]
    Source: Gottman.
    Successful partners share power and listen to their partner's perspective.`,
    source: "Gottman, J. (2002)."
  },
  {
    id: 'rel-010',
    category: 'relationships',
    tags: ['dear', 'man', 'dbt', 'request', 'طلب'],
    contentAr: `[مهارة DEAR MAN]
    المرجع: DBT (Linehan).
    لطلب شيء بفعالية: صف الواقع، عبر عن شعورك، اطلب بوضوح، عزز المكافأة.`,
    contentEn: `[DEAR MAN]
    Source: Linehan.
    Describe, Express, Assert, Reinforce. Effective asking.`,
    source: "Linehan, M. (1993)."
  },

  // =================================================================
  // 9. BARAEM (Parenting - SPACE, ABA, PCIT)
  // =================================================================
  {
    id: 'bar-001',
    category: 'baraem',
    tags: ['space', 'anxiety', 'lebowitz', 'yale', 'accommodation', 'قلق', 'طفل', 'والدين'],
    contentAr: `[بروتوكول SPACE (للآباء)]
    المرجع: Eli Lebowitz (Yale Child Study Center).
    لعلاج قلق الأطفال: لا تركز على الطفل، ركز على تغيير سلوكك أنت (وقف التسهيلات).
    بدلاً من تجنيب الطفل ما يخيفه (Accommodation)، أظهر له "الثقة" في قدرته على التحمل مع "الدعم العاطفي".`,
    contentEn: `[SPACE Treatment]
    Source: Eli Lebowitz (Yale).
    For Childhood Anxiety: Focus on reducing parental accommodation.
    Rx: Don't remove the trigger. Show "Supportive Confidence" in the child's ability to cope.`,
    source: "Lebowitz, E. R. (2019). SPACE."
  },
  {
    id: 'bar-002',
    category: 'baraem',
    tags: ['aba', 'reinforcement', 'positive', 'autism', 'تعزيز', 'سلوك'],
    contentAr: `[التعزيز الإيجابي (ABA)]
    المرجع: Cooper et al.
    امدح السلوك الجيد فوراً. التجاهل للسلوك السيء البسيط، والمكافأة للسلوك الجيد.`,
    contentEn: `[Positive Reinforcement (ABA)]
    Source: Cooper.
    Catch them being good. Immediate, specific praise builds new behaviors.`,
    source: "Cooper, J. O. (2007)."
  },
  {
    id: 'bar-003',
    category: 'baraem',
    tags: ['pcit', 'special', 'time', 'play', 'لعب', 'وقت'],
    contentAr: `[العلاج بالتفاعل الوالدي (PCIT)]
    المرجع: Sheila Eyberg.
    "الوقت الخاص": 5 دقائق يومياً، اتبع قيادة طفلك في اللعب. لا أوامر، لا أسئلة، لا نقد. فقط وصف ومدح.`,
    contentEn: `[PCIT - Special Time]
    Source: Eyberg.
    5 mins daily child-led play. PRIDE skills: Praise, Reflect, Imitate, Describe, Enthusiasm. No commands.`,
    source: "Eyberg, S. (1999)."
  },
  {
    id: 'bar-004',
    category: 'baraem',
    tags: ['visual', 'schedule', 'autism', 'teacch', 'جدول', 'بصري'],
    contentAr: `[الجداول البصرية]
    المرجع: TEACCH.
    الأطفال (خاصة التوحد) يفكرون بالصور. رتب الروتين بالصور لتقليل القلق والانهيارات.`,
    contentEn: `[Visual Schedules]
    Source: TEACCH.
    Use pictures to map the day. Visuals reduce anxiety and increase independence.`,
    source: "Mesibov, G. B. (2004)."
  },
  {
    id: 'bar-005',
    category: 'baraem',
    tags: ['pmt', 'kazdin', 'tantrum', 'ignore', 'غضب', 'تجاهل'],
    contentAr: `[إدارة السلوك (PMT)]
    المرجع: Alan Kazdin (Yale).
    لنوبات الغضب: "التجاهل النشط". لا تنظر للطفل ولا تكلمه أثناء النوبة (إلا لسلامته). عُد إليه فور هدوئه.`,
    contentEn: `[Parent Management Training (PMT)]
    Source: Kazdin.
    For Tantrums: "Active Ignoring". Withdraw attention completely during bad behavior, return it immediately when calm.`,
    source: "Kazdin, A. E. (2005)."
  },
  {
    id: 'bar-006',
    category: 'baraem',
    tags: ['emotion', 'coaching', 'gottman', 'validation', 'مشاعر'],
    contentAr: `[التوجيه العاطفي]
    المرجع: Gottman.
    سمِّ شعور الطفل ("أنت غاضب لأن اللعبة انكسرت"). الشعور مقبول، لكن السلوك السيء (الضرب) مرفوض.`,
    contentEn: `[Emotion Coaching]
    Source: Gottman.
    Label the emotion ("You are mad"). Validate the feeling, limit the behavior.`,
    source: "Gottman, J. (1997)."
  },
  {
    id: 'bar-007',
    category: 'baraem',
    tags: ['sensory', 'integration', 'ayres', 'regulation', 'حسي'],
    contentAr: `[التنظيم الحسي]
    المرجع: Jean Ayres.
    الطفل "المشاغب" قد يكون في الحقيقة "غير منظم حسياً". وفر أنشطة ضغط عميق أو حركة لتهدئة جهازه العصبي.`,
    contentEn: `[Sensory Integration]
    Source: Ayres.
    Behavior issues can be sensory issues. Use "heavy work" or deep pressure to regulate.`,
    source: "Ayres, A. J. (1972)."
  },
  {
    id: 'bar-008',
    category: 'baraem',
    tags: ['social', 'stories', 'gray', 'قصص', 'اجتماعية'],
    contentAr: `[القصص الاجتماعية]
    المرجع: Carol Gray.
    اشرح المواقف الاجتماعية بقصص قصيرة وبسيطة ومباشرة لتوضيح "ماذا نتوقع".`,
    contentEn: `[Social Stories]
    Source: Gray.
    Short stories to explain social cues and expectations explicitly.`,
    source: "Gray, C. (1991)."
  },
  {
    id: 'bar-009',
    category: 'baraem',
    tags: ['adhd', 'barkley', 'instructions', 'scaffolding', 'تشتت'],
    contentAr: `[تعليمات ADHD]
    المرجع: Russell Barkley.
    تواصل بصري + أمر واحد قصير + اطلب منه التكرار + مكافأة فورية. ذاكرة الطفل قصيرة، كن "سقالة" له.`,
    contentEn: `[ADHD Scaffolding]
    Source: Barkley.
    Eye contact + Short command + Repeat back + Immediate reward. Externalize executive functions.`,
    source: "Barkley, R. A. (2013)."
  },
  {
    id: 'bar-010',
    category: 'baraem',
    tags: ['zones', 'regulation', 'colors', 'kuypers', 'ألوان', 'تنظيم'],
    contentAr: `[مناطق التنظيم]
    المرجع: Leah Kuypers.
    علم الطفل الألوان لمشاعره: أزرق (تعبان)، أخضر (جاهز)، أصفر (محبط)، أحمر (منفجر). ساعده للعودة للأخضر.`,
    contentEn: `[Zones of Regulation]
    Source: Kuypers.
    Blue (Low), Green (Good), Yellow (Warning), Red (Stop). Visual tool for self-regulation.`,
    source: "Kuypers, L. (2011)."
  },

  // =================================================================
  // 10. GENERAL (Wellness, Third Wave)
  // =================================================================
  {
    id: 'gen-001',
    category: 'general',
    tags: ['self-compassion', 'neff', 'kindness', 'رحمة'],
    contentAr: `[الرحمة بالذات]
    المرجع: Kristin Neff (UT Austin).
    عامل نفسك كما تعامل أعز أصدقائك في وقت الأزمة. هذا ليس ضعفاً، بل مرونة نفسية مثبتة.`,
    contentEn: `[Self-Compassion]
    Source: Kristin Neff.
    Treat yourself with the same kindness you'd show a friend. It builds resilience, not laziness.`,
    source: "Neff, K. (2011)."
  },
  {
    id: 'gen-002',
    category: 'general',
    tags: ['growth', 'mindset', 'dweck', 'learning', 'عقلية'],
    contentAr: `[عقلية النمو]
    المرجع: Carol Dweck (Stanford).
    كلمة "بعد" (Yet). "أنا لا أعرف هذا... بعد". القدرات تتطور بالمحاولة وليست ثابتة.`,
    contentEn: `[Growth Mindset]
    Source: Dweck.
    The power of "Yet". Capabilities are built, not born.`,
    source: "Dweck, C. (2006)."
  },
  {
    id: 'gen-003',
    category: 'general',
    tags: ['boundaries', 'tawwab', 'relationships', 'حدود'],
    contentAr: `[رسم الحدود]
    المرجع: Nedra Tawwab.
    الحدود هي التعبير عن احتياجاتك بوضوح. "لا" جملة كاملة. الحدود تحمي العلاقات ولا تنهيها.`,
    contentEn: `[Setting Boundaries]
    Source: Tawwab.
    Boundaries are expectations and needs communicated clearly. They sustain relationships.`,
    source: "Tawwab, N. (2021)."
  },
  {
    id: 'gen-004',
    category: 'general',
    tags: ['polyvagal', 'porges', 'safety', 'nervous', 'عصب', 'حائر'],
    contentAr: `[النظرية البوليفيجال]
    المرجع: Stephen Porges.
    جهازك العصبي يحتاج "إشارات أمان" (تنفس، صوت دافئ، تواصل بصري) ليهدأ. العقل لا يهدأ إذا كان الجسد يشعر بالخطر.`,
    contentEn: `[Polyvagal Theory]
    Source: Porges.
    Neuroception of safety. Calm the body (vagus nerve) to calm the mind.`,
    source: "Porges, S. W. (2011)."
  },
  {
    id: 'gen-005',
    category: 'general',
    tags: ['rain', 'tarabrach', 'mindfulness', 'emotion', 'يقظة'],
    contentAr: `[تقنية RAIN]
    المرجع: Tara Brach.
    Recognize (اعترف)، Allow (اسمح)، Investigate (حقق برفق)، Nurture (ارعَ نفسك). معادلة للتعامل مع العواطف الصعبة.`,
    contentEn: `[RAIN Technique]
    Source: Tara Brach.
    Recognize, Allow, Investigate, Nurture. A mindfulness tool for difficult emotions.`,
    source: "Brach, T. (2019)."
  },
  {
    id: 'gen-006',
    category: 'general',
    tags: ['mct', 'metacognitive', 'wells', 'worry', 'تفكير'],
    contentAr: `[العلاج ما وراء المعرفي (MCT)]
    المرجع: Adrian Wells.
    مشكلتك ليست "الفكرة السلبية"، بل رد فعلك عليها (القلق بشأن القلق). اترك الأفكار وشأنها (Detached Mindfulness).`,
    contentEn: `[Metacognitive Therapy (MCT)]
    Source: Wells.
    The problem isn't the thought, it's your reaction to it (worrying about worrying). Use Detached Mindfulness.`,
    source: "Wells, A. (2009)."
  },
  {
    id: 'gen-007',
    category: 'general',
    tags: ['flow', 'csikszentmihalyi', 'focus', 'happiness', 'تدفق'],
    contentAr: `[حالة التدفق (Flow)]
    المرجع: Mihaly Csikszentmihalyi.
    السعادة هي الاندماج التام في نشاط يتحدى مهاراتك بشكل مناسب. ابحث عن نشاط يجعلك تنسى الوقت.`,
    contentEn: `[Flow State]
    Source: Csikszentmihalyi.
    Happiness is total immersion in a challenging activity.`,
    source: "Csikszentmihalyi, M. (1990)."
  },
  {
    id: 'gen-008',
    category: 'general',
    tags: ['digital', 'minimalism', 'newport', 'focus', 'تقنية'],
    contentAr: `[التقليلية الرقمية]
    المرجع: Cal Newport (Georgetown).
    استعد تركيزك. التشتت الرقمي يسبب قلقاً مزمناً. خصص أوقاتاً للعمل العميق (Deep Work) بلا هاتف.`,
    contentEn: `[Digital Minimalism]
    Source: Newport.
    Reclaim focus. Digital clutter causes anxiety. Practice Deep Work.`,
    source: "Newport, C. (2019)."
  },
  {
    id: 'gen-009',
    category: 'general',
    tags: ['nature', 'ecotherapy', 'kaplan', 'restoration', 'طبيعة'],
    contentAr: `[استعادة الانتباه بالطبيعة]
    المرجع: Kaplan (ART).
    قضاء 20 دقيقة في الطبيعة يعيد شحن طاقة الدماغ ويخفض التوتر.`,
    contentEn: `[Attention Restoration Theory]
    Source: Kaplan.
    Nature restores depleted attention resources. 20 mins outside lowers stress.`,
    source: "Kaplan, R. (1989)."
  },
  {
    id: 'gen-010',
    category: 'general',
    tags: ['tipp', 'dbt', 'crisis', 'skill', 'مهارة'],
    contentAr: `[مهارات TIPP]
    المرجع: DBT (Linehan).
    لتغيير كيمياء الجسم فوراً: حرارة (ماء بارد)، رياضة مكثفة، تنفس بطيء، استرخاء عضلي.`,
    contentEn: `[TIPP Skills]
    Source: Linehan.
    Temperature, Intense exercise, Paced breathing, Paired muscle relaxation. Bio-hack for distress.`,
    source: "Linehan, M. (2015)."
  }
];

// 3. SEMANTIC SEARCH ENGINE (Simulated)
const calculateRelevance = (query: string, doc: ClinicalDocument, language: Language): number => {
    // Normalize query
    const normalizedQuery = language === 'ar' ? normalizeArabic(query.toLowerCase()) : query.toLowerCase();
    
    // Tokenize query: Split by spaces and punctuation, filter out short words
    const tokens = normalizedQuery.split(/[\s,?.!]+/).filter(t => t.length > 2);
    
    let score = 0;
    
    // Tag Matching
    doc.tags.forEach(tag => {
        const normalizedTag = language === 'ar' ? normalizeArabic(tag) : tag.toLowerCase();
        if (tokens.some(t => t.includes(normalizedTag) || normalizedTag.includes(t))) score += 5;
    });

    // Content Matching
    const content = language === 'ar' ? doc.contentAr : doc.contentEn;
    const normalizedContent = language === 'ar' ? normalizeArabic(content) : content.toLowerCase();

    if (tokens.some(t => normalizedContent.includes(t))) score += 2;

    // Category Matching
    const cat = doc.category.toLowerCase();
    if (tokens.includes(cat) || normalizedQuery.includes(cat)) score += 3;

    return score;
};

export const ragService = {
  /**
   * Retrieves strictly relevant clinical context based on user input.
   */
  retrieveContext: (userInput: string, language: Language): string | null => {
    const scores = KNOWLEDGE_VECTOR_STORE.map(doc => ({
        doc,
        score: calculateRelevance(userInput, doc, language)
    }));

    // Lower threshold slightly to ensure general advice is caught if specific tags miss
    const topResults = scores
        .filter(item => item.score > 2) 
        .sort((a, b) => b.score - a.score)
        .slice(0, 2); // Take top 2 most relevant protocols

    if (topResults.length === 0) return null;

    const contextIntro = language === 'ar' 
      ? "⚠️ [تعليمات للمعالج]: استخدم البروتوكولات العلمية التالية في ردك، لكن اصغها بأسلوبك الإنساني (المصري) ولا تذكر المصدر بشكل أكاديمي جاف:" 
      : "⚠️ [THERAPIST INSTRUCTIONS]: Use these clinical protocols to guide your advice, but phrase them in your warm human persona (do not sound like a textbook):";

    const content = topResults.map(r => {
        const text = language === 'ar' ? r.doc.contentAr : r.doc.contentEn;
        return `PROTOCOL: ${r.doc.id} (${r.doc.source})\n${text}`;
    }).join('\n\n');

    return `${contextIntro}\n${content}`;
  }
};
