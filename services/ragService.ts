
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
  // 1. DEPRESSION (CBT, BA, ACT, MBCT)
  // =================================================================
  {
    id: 'dep-001',
    category: 'depression',
    tags: ['behavioral', 'activation', 'depression', 'action', 'motivation', 'نشاط', 'اكتئاب', 'حافز', 'كسل'],
    contentAr: `[التنشيط السلوكي (BA)]
    المرجع: Martell et al. (UW).
    1. الاكتئاب يخدع الدماغ ليظن أن "الراحة" هي الحل، لكنها تزيد الاكتئاب.
    2. القاعدة: "العمل يسبق الحافز". لا تنتظر الرغبة.
    3. التقنية: قم بمهمة صغيرة (5 دقائق) لتوليد الطاقة.`,
    contentEn: `[Behavioral Activation (BA)]
    Source: Martell et al. (2010).
    1. Depression traps you in avoidance.
    2. Rule: "Action precedes Motivation". Do not wait to feel like it.
    3. Technique: Do a micro-task (5 mins) to generate energy.`,
    source: "Martell, C. R. (2010). Behavioral Activation."
  },
  {
    id: 'dep-002',
    category: 'depression',
    tags: ['cbt', 'cognitive', 'triad', 'distortions', 'thoughts', 'beck', 'أفكار', 'تشوه', 'بيك'],
    contentAr: `[ثالوث بيك المعرفي]
    المرجع: Aaron Beck.
    الاكتئاب ينشأ من نظرة سلبية لـ (الذات، العالم، المستقبل).
    التدخل: استخدم الأسئلة السقراطية: "ما الدليل الحقيقي؟ هل هناك تفسير آخر؟"`,
    contentEn: `[Beck's Cognitive Triad]
    Source: Aaron Beck.
    Depression comes from negative views of (Self, World, Future).
    Intervention: Socratic Questioning: "What is the evidence? Is there an alternative view?"`,
    source: "Beck, A. T. (1979). Cognitive Therapy."
  },
  {
    id: 'dep-003',
    category: 'depression',
    tags: ['mbct', 'mindfulness', 'rumination', 'thoughts', 'يقظة', 'اجترار'],
    contentAr: `[مراقبة الأفكار (MBCT)]
    المرجع: Segal, Williams, Teasdale.
    راقب أفكارك كأنها "غيوم تمر في السماء". لا توقفها، ولا تركب معها، فقط لاحظها وعد للتنفس.`,
    contentEn: `[Thought Observation (MBCT)]
    Source: Segal et al.
    Observe thoughts like "clouds passing in the sky". Don't engage, just observe and return to breath.`,
    source: "Segal, Z. V. (2018). MBCT."
  },
  {
    id: 'dep-004',
    category: 'depression',
    tags: ['journaling', 'burns', 'mood', 'writing', 'كتابة', 'تدوين'],
    contentAr: `[العلاج بالكتابة]
    المرجع: David Burns (Stanford).
    الكتابة تخرج الشعور من المنطقة العاطفية للمنطقة المنطقية في الدماغ.`,
    contentEn: `[Mood Journaling]
    Source: David Burns.
    Writing moves emotion from the Amygdala to the Prefrontal Cortex (Logic).`,
    source: "Burns, D. D. (1980). Feeling Good."
  },
  {
    id: 'dep-005',
    category: 'depression',
    tags: ['ipt', 'interpersonal', 'role', 'social', 'علاقات', 'دور', 'اجتماعي'],
    contentAr: `[العلاج التفاعلي (IPT)]
    المرجع: Klerman & Weissman.
    الاكتئاب غالباً يرتبط بتغيرات الدور الاجتماعي (فقدان عمل، طلاق). ركز على بناء "شبكة دعم" جديدة.`,
    contentEn: `[Interpersonal Therapy (IPT)]
    Source: Klerman & Weissman.
    Depression links to role transitions. Focus on building a new "support network".`,
    source: "Weissman, M. M. (2000). IPT."
  },
  {
    id: 'dep-006',
    category: 'depression',
    tags: ['values', 'act', 'meaning', 'قيم', 'معنى'],
    contentAr: `[العمل القائم على القيم (ACT)]
    المرجع: Steven Hayes.
    بدلاً من "محاربة الحزن"، ركز على "ما يهمك". اسأل: "كيف يتصرف الشخص الذي أريد أن أكونه اليوم؟".`,
    contentEn: `[Values-Based Action (ACT)]
    Source: Steven Hayes.
    Instead of fighting sadness, focus on values. Ask: "How would the person I want to be act today?"`,
    source: "Hayes, S. C. (2011). ACT."
  },
  {
    id: 'dep-007',
    category: 'depression',
    tags: ['sleep', 'hygiene', 'depression', 'نوم', 'نظافة'],
    contentAr: `[نظافة النوم للاكتئاب]
    المرجع: National Sleep Foundation.
    اضطراب النوم يغذي الاكتئاب. ثبت موعد الاستيقاظ والتعرض لضوء الشمس صباحاً لضبط الساعة البيولوجية.`,
    contentEn: `[Sleep Hygiene for Depression]
    Source: National Sleep Foundation.
    Fix wake-up time and get morning sunlight to regulate circadian rhythm.`,
    source: "NSF Guidelines."
  },
  {
    id: 'dep-008',
    category: 'depression',
    tags: ['gratitude', 'positive', 'psychology', 'امتنان', 'شكر'],
    contentAr: `[تمرين الامتنان]
    المرجع: Martin Seligman (Positive Psychology).
    كتابة 3 أشياء جيدة يومياً يعيد تدريب الدماغ على ملاحظة الإيجابيات بدلاً من السلبيات فقط (Inattentional Blindness).`,
    contentEn: `[Three Good Things]
    Source: Martin Seligman.
    Writing 3 good things daily retrains the brain to scan for positives.`,
    source: "Seligman, M. (2011). Flourish."
  },
  {
    id: 'dep-009',
    category: 'depression',
    tags: ['restructuring', 'catch', 'check', 'change', 'تغيير', 'فكرة'],
    contentAr: `[إعادة الهيكلة: 3C]
    المرجع: CBT Standard.
    1. Catch (أمسك الفكرة).
    2. Check (تحقق من صحتها).
    3. Change (غيرها لواقعية).`,
    contentEn: `[The 3 Cs of CBT]
    Source: CBT Standard.
    1. Catch it. 2. Check it. 3. Change it to be more realistic.`,
    source: "Greenberger, D. (2015). Mind Over Mood."
  },
  {
    id: 'dep-010',
    category: 'depression',
    tags: ['compassion', 'self', 'kindness', 'رحمة', 'ذات'],
    contentAr: `[الرحمة بالذات]
    المرجع: Paul Gilbert (CFT).
    جلد الذات يزيد الاكتئاب. عامل نفسك كما تعامل طفلاً صغيراً يتألم.`,
    contentEn: `[Self-Compassion]
    Source: Paul Gilbert.
    Self-criticism fuels depression. Treat yourself like a hurting child.`,
    source: "Gilbert, P. (2009). The Compassionate Mind."
  },

  // =================================================================
  // 2. ANXIETY (Refined for Key CBT Techniques)
  // =================================================================
  {
    id: 'anx-001',
    category: 'anxiety',
    tags: ['unified', 'protocol', 'avoidance', 'confront', 'تجنب', 'مواجهة'],
    contentAr: `[البروتوكول الموحد: مواجهة التجنب]
    المرجع: David Barlow (Unified Protocol).
    القلق المزمن سببه "تجنب المشاعر". واجه الشعور غير المريح (ضيق، خوف) بدلاً من الهروب منه. الشعور موجة، والهروب سد يمنعها من المرور.`,
    contentEn: `[Unified Protocol: Confronting Avoidance]
    Source: Barlow et al. (2017).
    Chronic anxiety is fueled by "emotional avoidance". Face the discomfort instead of fleeing. Emotion is a wave; avoidance traps it.`,
    source: "Barlow, D. H. (2017). Unified Protocol for Transdiagnostic Treatment."
  },
  {
    id: 'anx-002',
    category: 'anxiety',
    tags: ['worry', 'scheduling', 'time', 'borkovec', 'وقت', 'قلق'],
    contentAr: `[جدولة القلق (Worry Time)]
    المرجع: Borkovec (CBT for GAD).
    حدد 30 دقيقة يومياً (مثلاً 5 مساءً) للقلق فقط. إذا جاءتك فكرة مقلقة نهاراً، قل: "ليس الآن، موعدنا الساعة 5".`,
    contentEn: `[Worry Scheduling]
    Source: Borkovec & Costello (1993).
    Assign a 30-min "Worry Time" daily. When a worry arises, defer it: "Not now, I'll worry about this at 5 PM."`,
    source: "Borkovec, T. D. (1993). CBT for GAD."
  },
  {
    id: 'anx-003',
    category: 'anxiety',
    tags: ['interoceptive', 'exposure', 'panic', 'sensation', 'تعرض', 'جسدي'],
    contentAr: `[التعرض الحسي (Interoceptive Exposure)]
    المرجع: Craske & Barlow.
    لعلاج الهلع: تعمد إحداث الأعراض (تنفس بسرعة لمدة دقيقة، در حول نفسك) لتثبت للمخ أن تسارع القلب أو الدوار "غير خطير" ولا يسبب الموت.`,
    contentEn: `[Interoceptive Exposure]
    Source: Craske & Barlow.
    For Panic: Intentionally induce symptoms (hyperventilate for 1 min, spin) to prove to the brain that racing heart/dizziness are safe and not fatal.`,
    source: "Craske, M. G. & Barlow, D. H. (2007)."
  },
  {
    id: 'anx-004',
    category: 'anxiety',
    tags: ['pmr', 'muscle', 'relaxation', 'jacobson', 'عضلات', 'استرخاء'],
    contentAr: `[الاسترخاء العضلي التدريجي (PMR)]
    المرجع: Edmund Jacobson.
    القلق يسبب شداً عضلياً لا إرادياً. شد عضلات (يد، كتف، وجه) بقوة 5 ثواني ثم ارخها فجأة لكسر حلقة التوتر الجسدي.`,
    contentEn: `[Progressive Muscle Relaxation (PMR)]
    Source: Jacobson (1938).
    Anxiety causes unconscious tension. Tense muscle groups for 5s then release suddenly to break the physical stress loop.`,
    source: "Jacobson, E. (1938)."
  },
  {
    id: 'anx-005',
    category: 'anxiety',
    tags: ['decatastrophizing', 'cognitive', 'whatif', 'كارثة', 'تضخيم'],
    contentAr: `[تفكيك الكوارث (Decatastrophizing)]
    المرجع: Beck Institute.
    عند التفكير بـ "ماذا لو؟"، أجب عن الأسئلة: 1. ما هو أسوأ احتمال؟ 2. ما هو أفضل احتمال؟ 3. ما هو الاحتمال الأكثر واقعية؟ 4. لو حدث الأسوأ، كيف سأتعامل معه؟`,
    contentEn: `[Decatastrophizing]
    Source: Judith Beck.
    When asking "What if?", answer: 1. What's the worst case? 2. Best case? 3. Most likely case? 4. If worst happens, how would I cope?`,
    source: "Beck, J. S. (2011). CBT Basics."
  },
  {
    id: 'anx-006',
    category: 'anxiety',
    tags: ['probability', 'estimation', 'risk', 'cbt', 'احتمال', 'خطر'],
    contentAr: `[تقدير الاحتمالات (Probability Estimation)]
    المرجع: CBT for Anxiety.
    القلق يخلط بين "الإمكانية" (Possible) و"الاحتمالية" (Probable). سقوط الطائرة "ممكن" لكنه "غير محتمل" (1 في 11 مليون). اسأل: "ما هي النسبة المئوية الواقعية لحدوث هذا؟"`,
    contentEn: `[Probability Estimation]
    Source: CBT Standard.
    Anxiety confuses "Possible" with "Probable". Ask: "Is this just possible, or actually likely?" Check the real statistical odds.`,
    source: "Clark, D. A., & Beck, A. T. (2010)."
  },
  {
    id: 'anx-007',
    category: 'anxiety',
    tags: ['worry', 'tree', 'decision', 'problem', 'solving', 'شجرة', 'قلق'],
    contentAr: `[شجرة القلق (The Worry Tree)]
    المرجع: Butler & Hope.
    لاحظ القلق -> هل يمكنني فعل شيء بشأنه الآن؟
    - نعم: افعله أو خطط له -> ثم اصرف انتباهك.
    - لا: اصرف انتباهك فوراً واتركه يذهب.`,
    contentEn: `[The Worry Tree]
    Source: Butler & Hope (1995).
    Notice worry -> Can I do something about it now?
    - YES: Do it or Plan it -> Let go.
    - NO: Let go and change focus immediately.`,
    source: "Butler, G., & Hope, T. (1995)."
  },
  {
    id: 'anx-008',
    category: 'anxiety',
    tags: ['applied', 'relaxation', 'ost', 'استرخاء', 'تطبيقي'],
    contentAr: `[الاسترخاء التطبيقي (Applied Relaxation)]
    المرجع: Lars-Göran Öst.
    تدرب على الاسترخاء السريع (في 20 ثانية) باستخدام كلمة سر (مثل "هادئ"). استخدم هذه المهارة فوراً عند ملاحظة أول علامات القلق في الواقع.`,
    contentEn: `[Applied Relaxation]
    Source: Lars-Göran Öst (1987).
    Train rapid relaxation (20-30s) using a cue word (e.g., "Calm"). Apply immediately when early anxiety signs appear in real life.`,
    source: "Öst, L. G. (1987)."
  },
  {
    id: 'anx-009',
    category: 'anxiety',
    tags: ['hierarchy', 'fear', 'ladder', 'exposure', 'سلم', 'خوف'],
    contentAr: `[سلم الخوف (Exposure Hierarchy)]
    المرجع: Exposure Therapy.
    رتب مخاوفك من 0 إلى 100. لا تبدأ بالأصعب. ابدأ بموقف يسبب قلقاً متوسطاً (40%) وابق فيه حتى ينخفض القلق للنصف، ثم اصعد درجة.`,
    contentEn: `[Exposure Hierarchy]
    Source: CBT Standard.
    Rank fears 0-100. Start with a medium fear (40%). Stay in the situation until anxiety drops by half (Habituation), then move up.`,
    source: "Abramowitz, J. S. (2011)."
  },
  {
    id: 'anx-010',
    category: 'anxiety',
    tags: ['uncertainty', 'tolerance', 'dugas', 'مجهول', 'تحمل'],
    contentAr: `[بناء تحمل المجهول (IUC)]
    المرجع: Dugas & Robichaud.
    القلق هو "حساسية ضد الغموض". تدرب على مواقف صغيرة غير مضمونة (أرسل إيميل بدون مراجعته 10 مرات، اطلب طعاماً جديداً) لتقوية عضلة تحمل المجهول.`,
    contentEn: `[Intolerance of Uncertainty (IUC)]
    Source: Dugas & Robichaud (2007).
    Anxiety is an allergy to uncertainty. Practice small uncertain acts (send email without re-reading, order new food) to build tolerance.`,
    source: "Dugas, M. J. (2007)."
  },

  // =================================================================
  // 3. OCD (ERP, I-CBT)
  // =================================================================
  {
    id: 'ocd-001',
    category: 'ocd',
    tags: ['erp', 'exposure', 'ritual', 'وسواس', 'منع', 'استجابة'],
    contentAr: `[التعرض ومنع الاستجابة (ERP)]
    المرجع: Edna Foa (UPenn).
    واجه الفكرة الوسواسية (التعرض) وامتنع عن فعل الطقس (منع الاستجابة). القلق سينخفض تدريجياً (التعود).`,
    contentEn: `[Exposure & Response Prevention (ERP)]
    Source: Edna Foa.
    Face the obsession, prevent the ritual. Anxiety will naturally drop (Habituation).`,
    source: "Foa, E. B. (2012)."
  },
  {
    id: 'ocd-002',
    category: 'ocd',
    tags: ['icbt', 'inference', 'senses', 'شك', 'حواس'],
    contentAr: `[I-CBT: الثقة بالحواس]
    المرجع: O'Connor.
    الوسواس "قصة"، والواقع "حواس". صدق عينك (الباب مغلق) ولا تصدق القصة في رأسك.`,
    contentEn: `[I-CBT: Trust Senses]
    Source: O'Connor.
    Obsession is a story; Reality is senses. Trust your eyes, not the brain's story.`,
    source: "O'Connor, K. (2005)."
  },
  {
    id: 'ocd-003',
    category: 'ocd',
    tags: ['loop', 'tape', 'imaginal', 'شريط', 'تخيل'],
    contentAr: `[شريط التسجيل (التعرض الخيالي)]
    المرجع: Mayo Clinic.
    سجل بصوتك السيناريو المرعب الذي تخاف منه، واستمع له تكراراً حتى يصيبك الملل منه ويفقد قوته.`,
    contentEn: `[Loop Tape (Imaginal Exposure)]
    Source: Mayo Clinic.
    Record your worst fear scenario. Listen on repeat until it becomes boring.`,
    source: "Mayo Clinic."
  },
  {
    id: 'ocd-004',
    category: 'ocd',
    tags: ['delay', 'tactics', 'تأجيل', 'طقس'],
    contentAr: `[تكتيك التأجيل]
    المرجع: OCD UK.
    إذا جاءك إلحاح للغسيل، قل: "سأغسل يدي، ولكن بعد 15 دقيقة". التأجيل يضعف الرابط العصبي.`,
    contentEn: `[Delaying Tactics]
    Source: OCD UK.
    If urged to wash, say: "I will, but in 15 mins." Delaying weakens the neural link.`,
    source: "OCD UK."
  },
  {
    id: 'ocd-005',
    category: 'ocd',
    tags: ['maybe', 'script', 'acceptance', 'ربما'],
    contentAr: `[سكربت "ربما"]
    المرجع: Jonathan Grayson.
    رد على الوسواس: "ربما نسيت الغاز فعلاً، وربما يحترق البيت. أنا أقبل المخاطرة لأعيش حياتي".`,
    contentEn: `[Maybe Script]
    Source: Jonathan Grayson.
    Reply: "Maybe I did leave the gas on. Maybe the house burns. I accept the risk to live my life."`,
    source: "Grayson, J. (2014)."
  },
  {
    id: 'ocd-006',
    category: 'ocd',
    tags: ['externalize', 'monster', 'وحش', 'تجسيد'],
    contentAr: `[تجسيد الوحش]
    المرجع: Jeffrey Schwartz (Brain Lock).
    سمِ الوسواس اسماً مضحكاً (مثلاً "ببغاء مزعج"). قل له: "أنت مجرد ببغاء، لن أستمع لك".`,
    contentEn: `[Externalizing the Monster]
    Source: Jeffrey Schwartz.
    Name the OCD (e.g., "Annoying Parrot"). Say: "It's just the parrot talking."`,
    source: "Schwartz, J. (1996)."
  },
  {
    id: 'ocd-007',
    category: 'ocd',
    tags: ['act', 'values', 'rituals', 'قيم', 'طقوس'],
    contentAr: `[القيم أهم من الطقوس (ACT)]
    المرجع: Russ Harris.
    هل تريد قضاء وقتك في "الترتيب" أم مع "عائلتك"؟ اختر التصرف بناءً على قيمك وليس خوفك.`,
    contentEn: `[Values over Rituals (ACT)]
    Source: Russ Harris.
    Do you want to spend time "checking" or with "family"? Act on values, not fear.`,
    source: "Harris, R. (2009)."
  },
  {
    id: 'ocd-008',
    category: 'ocd',
    tags: ['family', 'accommodation', 'طمأنة', 'أهل'],
    contentAr: `[وقف الطمأنة العائلية]
    المرجع: SPACE Treatment (Yale).
    لا تطلب من أهلك الطمأنة ("هل يدي نظيفة؟"). الطمأنة وقود للوسواس.`,
    contentEn: `[Stopping Family Reassurance]
    Source: Yale SPACE.
    Do not ask family "Is it clean?". Reassurance is fuel for OCD.`,
    source: "Lebowitz, E. R. (2020)."
  },
  {
    id: 'ocd-009',
    category: 'ocd',
    tags: ['relapse', 'prevention', 'backdoor', 'انتكاسة'],
    contentAr: `[منع الانتكاسة (Spike)]
    المرجع: IOCDF.
    الوسواس ماكر. إذا اختفى القلق، قد يوسوس لك: "لماذا لست قلقاً؟ هذا دليل إهمال!". تجاهل هذا أيضاً.`,
    contentEn: `[Relapse Prevention]
    Source: IOCDF.
    OCD is tricky. If anxiety fades, it says: "Why aren't you worried? That's negligence!" Ignore that too.`,
    source: "IOCDF."
  },
  {
    id: 'ocd-010',
    category: 'ocd',
    tags: ['flooding', 'intense', 'غمر', 'مكثف'],
    contentAr: `[الغمر (Flooding)]
    المرجع: Behavioral Therapy.
    (للحالات المتقدمة) تعريض النفس لأقوى مخاوفك دفعة واحدة حتى ينهار القلق من الإرهاق.`,
    contentEn: `[Flooding]
    Source: Behavioral Therapy.
    Exposing self to worst fear at once until anxiety collapses from exhaustion.`,
    source: "APA."
  },

  // =================================================================
  // 4. PTSD (Trauma)
  // =================================================================
  {
    id: 'ptsd-001',
    category: 'ptsd',
    tags: ['cpt', 'blame', 'stuck', 'لوم', 'صدمة'],
    contentAr: `[علاج المعالجة المعرفية (CPT)]
    المرجع: Patricia Resick.
    ركز على "نقاط اللوم". هل كنت تملك معلومات المستقبل وقتها؟ لا تلم نفسك على ما لم تكن تعلمه.`,
    contentEn: `[Cognitive Processing Therapy]
    Source: Patricia Resick.
    Focus on "Stuck Points". Did you have future knowledge? Don't blame past self.`,
    source: "Resick, P. A. (2016)."
  },
  {
    id: 'ptsd-002',
    category: 'ptsd',
    tags: ['flashback', 'grounding', 'herman', 'فلاش', 'ذكريات'],
    contentAr: `[إدارة الفلاش باك]
    المرجع: Judith Herman.
    الذاكرة تشعرك أنها "الآن". ذكر نفسك: "أنا في [السنة الحالية]، أنا آمن، هذا شريط فيديو قديم".`,
    contentEn: `[Flashback Management]
    Source: Judith Herman.
    Remind self: "I am in [Current Year]. I am safe. This is just an old movie."`,
    source: "Herman, J. L. (1992)."
  },
  {
    id: 'ptsd-003',
    category: 'ptsd',
    tags: ['narrative', 'exposure', 'story', 'رواية', 'قصة'],
    contentAr: `[العلاج بالسرد (NET)]
    المرجع: Schauer et al.
    اكتب قصة الصدمة بتفاصيلها. تحويل "الرعب الحسي" إلى "كلمات مرتبة" يجعله ذكرى قابلة للأرشفة.`,
    contentEn: `[Narrative Exposure Therapy]
    Source: Schauer et al.
    Write the trauma story. Turning "sensory horror" into "ordered words" archives the memory.`,
    source: "Schauer, M. (2011)."
  },
  {
    id: 'ptsd-004',
    category: 'ptsd',
    tags: ['nightmare', 'rescripting', 'irt', 'كوابيس', 'نهاية'],
    contentAr: `[إعادة كتابة الكوابيس (IRT)]
    المرجع: Krakow (AASM).
    اكتب الكابوس في الصباح، لكن غيّر النهاية لتكون "نهاية منتصرة" أو "آمنة". تخيل النهاية الجديدة قبل النوم.`,
    contentEn: `[Image Rehearsal Therapy (IRT)]
    Source: Krakow.
    Write the nightmare but change the ending to be "triumphant". Visualize new ending before sleep.`,
    source: "Krakow, B. (2001)."
  },
  {
    id: 'ptsd-005',
    category: 'ptsd',
    tags: ['triggers', 'identification', 'مثيرات', 'محفز'],
    contentAr: `[تحديد المحفزات (Triggers)]
    المرجع: VA PTSD Center.
    افصل بين "المحفز" و"الخطر". صوت الألعاب النارية يشبه الانفجار، لكنه "آمن". التمييز يقلل الفزع.`,
    contentEn: `[Trigger Identification]
    Source: VA PTSD Center.
    Distinguish Trigger vs Danger. Fireworks sound like bombs but are "safe".`,
    source: "VA.gov."
  },
  {
    id: 'ptsd-006',
    category: 'ptsd',
    tags: ['window', 'tolerance', 'siegel', 'نافذة', 'تحمل'],
    contentAr: `[نافذة التحمل]
    المرجع: Dan Siegel.
    الصدمة تخرجك من النافذة (إما هياج أو جمود). استخدم التنفس للعودة للمنطقة الوسطى (التحمل).`,
    contentEn: `[Window of Tolerance]
    Source: Dan Siegel.
    Trauma pushes you out (Hyper or Hypo arousal). Use breath to return to the window.`,
    source: "Siegel, D. (1999)."
  },
  {
    id: 'ptsd-007',
    category: 'ptsd',
    tags: ['senses', 'soothing', 'حواس', 'هدوء'],
    contentAr: `[التهدئة الذاتية بالحواس]
    المرجع: DBT.
    استخدم "بطانية ثقيلة"، "رائحة لافندر"، "مشروب ساخن". الحواس الجسدية تخبر اللوزة الدماغية أنك آمن.`,
    contentEn: `[Self-Soothing with Senses]
    Source: DBT.
    Use weighted blanket, lavender, hot tea. Physical senses tell Amygdala you are safe.`,
    source: "Linehan, M. (1993)."
  },
  {
    id: 'ptsd-008',
    category: 'ptsd',
    tags: ['reclaiming', 'life', 'activities', 'حياة', 'استعادة'],
    contentAr: `[استعادة الحياة]
    المرجع: Behavioral Activation.
    الصدمة تسرق هواياتك. ابدأ بممارسة نشاط واحد كنت تحبه قبل الصدمة، حتى لو بدون متعة في البداية.`,
    contentEn: `[Reclaiming Life]
    Source: Behavioral Activation.
    Start one hobby you loved before trauma, even if without joy initially.`,
    source: "Martell, C. (2010)."
  },
  {
    id: 'ptsd-009',
    category: 'ptsd',
    tags: ['anger', 'management', 'rage', 'غضب', 'تحكم'],
    contentAr: `[إدارة غضب الصدمة]
    المرجع: Dyer.
    الغضب هو "حارس" للألم. بدلاً من الانفجار، قل: "أنا أشعر بالتهديد الآن". خذ وقت مستقطع (Time-out).`,
    contentEn: `[Trauma Anger Management]
    Source: Dyer.
    Anger guards pain. Instead of exploding, say "I feel threatened". Take a Time-out.`,
    source: "Dyer, K. (2000)."
  },
  {
    id: 'ptsd-010',
    category: 'ptsd',
    tags: ['emdr', 'bilateral', 'stimulation', 'عيون', 'حركة'],
    contentAr: `[EMDR (المحاكاة الذاتية)]
    المرجع: Francine Shapiro.
    (تقنية بسيطة): "عناق الفراشة". شبك يديك على صدرك وربت ببطء (يمين-يسار) أثناء التفكير في أمر مزعج لتهدئته.`,
    contentEn: `[Butterfly Hug (EMDR-based)]
    Source: Shapiro.
    Cross hands on chest, tap slow (left-right) to calm processing of distress.`,
    source: "Jarero, I. (2008)."
  },

  // =================================================================
  // 5. RELATIONSHIPS (Gottman, EFT)
  // =================================================================
  {
    id: 'rel-001',
    category: 'relationships',
    tags: ['soft', 'startup', 'gottman', 'بداية', 'لين'],
    contentAr: `[البدء اللين]
    المرجع: Gottman.
    ابدأ الشكوى بـ "أنا أشعر... وأحتاج..." بدلاً من "أنت دائماً تفعل كذا".`,
    contentEn: `[Soft Startup]
    Source: Gottman.
    Start complaints with "I feel... I need..." instead of "You always...".`,
    source: "Gottman, J. (1999)."
  },
  {
    id: 'rel-002',
    category: 'relationships',
    tags: ['eft', 'attachment', 'johnson', 'عاطفة', 'ارتباط'],
    contentAr: `[EFT: الخوف من الهجر]
    المرجع: Sue Johnson.
    الغضب غالباً غطاء للخوف. صارح شريكك: "أنا خائف أن نبتعد عن بعضنا" بدلاً من الصراخ.`,
    contentEn: `[EFT: Fear of Abandonment]
    Source: Sue Johnson.
    Anger masks fear. Say: "I'm scared we are drifting apart" instead of yelling.`,
    source: "Johnson, S. (2008)."
  },
  {
    id: 'rel-003',
    category: 'relationships',
    tags: ['love', 'maps', 'details', 'خرائط', 'حب'],
    contentAr: `[خرائط الحب]
    المرجع: Gottman.
    تعرف على تفاصيل يوم شريكك. "مين مضايقك في الشغل؟". الاهتمام بالتفاصيل يبني الصداقة.`,
    contentEn: `[Love Maps]
    Source: Gottman.
    Know the details of partner's day. "Who is stressing you at work?". Details build friendship.`,
    source: "Gottman, J. (1999)."
  },
  {
    id: 'rel-004',
    category: 'relationships',
    tags: ['horsemen', 'antidotes', 'four', 'فرسان', 'نقد'],
    contentAr: `[الفرسان الأربعة وعلاجهم]
    المرجع: Gottman.
    1. النقد -> (علاجه) شكوى محددة.
    2. الاحتقار -> (علاجه) الامتنان والتقدير.
    3. الدفاعية -> (علاجه) تحمل المسؤولية.
    4. المماطلة -> (علاجه) التهدئة الذاتية.`,
    contentEn: `[The Four Horsemen]
    Source: Gottman.
    1. Criticism -> Specific Complaint.
    2. Contempt -> Appreciation.
    3. Defensiveness -> Responsibility.
    4. Stonewalling -> Self-Soothing.`,
    source: "Gottman, J. (1994)."
  },
  {
    id: 'rel-005',
    category: 'relationships',
    tags: ['turning', 'towards', 'bids', 'انتباه', 'استجابة'],
    contentAr: `[الالتفات للشريك]
    المرجع: Gottman.
    عندما يقول شريكك "انظر لهذا العصفور"، هو يطلب تواصلاً. تجاهلك له يقتل العلاقة. استجب باهتمام.`,
    contentEn: `[Turning Towards Bids]
    Source: Gottman.
    When partner says "Look at that bird", they ask for connection. Respond with interest.`,
    source: "Gottman, J. (2001)."
  },
  {
    id: 'rel-006',
    category: 'relationships',
    tags: ['shared', 'meaning', 'goals', 'معنى', 'مشترك'],
    contentAr: `[المعنى المشترك]
    المرجع: Gottman.
    ابنوا طقوساً خاصة بكم (قهوة الصباح، نزهة الجمعة). الطقوس تخلق هوية للعائلة.`,
    contentEn: `[Shared Meaning]
    Source: Gottman.
    Build rituals (Morning coffee, Friday walk). Rituals create family identity.`,
    source: "Gottman, J. (1999)."
  },
  {
    id: 'rel-007',
    category: 'relationships',
    tags: ['timeout', 'flooding', 'break', 'وقت', 'مستقطع'],
    contentAr: `[الوقت المستقطع]
    المرجع: Gottman.
    إذا تجاوزت نبضات القلب 100، يتوقف العقل عن العمل. خذ استراحة 20 دقيقة (بدون تفكير في المشكلة) ثم عد للنقاش.`,
    contentEn: `[Time-Out Rule]
    Source: Gottman.
    If HR > 100, brain stops. Take 20 min break (distract self) then return.`,
    source: "Gottman, J. (1994)."
  },
  {
    id: 'rel-008',
    category: 'relationships',
    tags: ['validation', 'empathy', 'scripts', 'تصديق', 'مشاعر'],
    contentAr: `[التصديق العاطفي]
    المرجع: DBT/EFT.
    حتى لو اختلف الرأي، صدق الشعور: "أنا فاهم ليه إنت زعلان، معاك حق تحس بكده".`,
    contentEn: `[Validation]
    Source: DBT.
    Validate emotion even if disagreeing with facts: "I understand why you feel hurt."`,
    source: "Linehan, M. (1993)."
  },
  {
    id: 'rel-009',
    category: 'relationships',
    tags: ['ratio', 'positive', 'negative', 'نسبة', 'إيجابي'],
    contentAr: `[نسبة 5:1 السحرية]
    المرجع: Gottman.
    في العلاقات الناجحة، مقابل كل تفاعل سلبي واحد، يوجد 5 تفاعلات إيجابية (مزحة، لمسة، ابتسامة).`,
    contentEn: `[The 5:1 Ratio]
    Source: Gottman.
    Healthy relationships have 5 positive interactions for every 1 negative one.`,
    source: "Gottman, J. (1994)."
  },
  {
    id: 'rel-010',
    category: 'relationships',
    tags: ['dreams', 'conflict', 'أحلام', 'نزاع'],
    contentAr: `[أحلام داخل النزاع]
    المرجع: Gottman.
    وراء كل مشكلة متكررة (Gridlock) حلم غير محقق. اسأل: "ما هو الحلم الذي يمثله هذا الموقف لك؟".`,
    contentEn: `[Dreams Within Conflict]
    Source: Gottman.
    Behind gridlock is an unfulfilled dream. Ask: "What dream does this represent for you?"`,
    source: "Gottman, J. (1999)."
  },

  // =================================================================
  // 6. BARAEM (Parenting - ABA, ADHD)
  // =================================================================
  {
    id: 'bar-001',
    category: 'baraem',
    tags: ['aba', 'reinforcement', 'praise', 'تعزيز', 'مدح'],
    contentAr: `[التعزيز الإيجابي]
    المرجع: Cooper (ABA).
    "اصطد طفلك وهو جيد". امدح السلوك الجيد فوراً وبحماس ليتكرر.`,
    contentEn: `[Positive Reinforcement]
    Source: ABA.
    "Catch them being good". Praise good behavior immediately to increase it.`,
    source: "Cooper, J. (2007)."
  },
  {
    id: 'bar-002',
    category: 'baraem',
    tags: ['adhd', 'instructions', 'focus', 'أوامر', 'تركيز'],
    contentAr: `[قاعدة الأوامر لـ ADHD]
    المرجع: Barkley.
    تواصل بصري + لمسة كتف + أمر واحد قصير. لا تعطي سلسلة أوامر.`,
    contentEn: `[ADHD Instructions]
    Source: Barkley.
    Eye contact + Shoulder touch + One short command. No chains.`,
    source: "Barkley, R. (2013)."
  },
  {
    id: 'bar-003',
    category: 'baraem',
    tags: ['tantrum', 'ignoring', 'غضب', 'تجاهل'],
    contentAr: `[التجاهل الاستراتيجي]
    المرجع: Alan Kazdin.
    لنوبات الغضب (للفت الانتباه): تجاهل تماماً (أدر وجهك). بمجرد الهدوء، امنح انتباهاً كثيفاً.`,
    contentEn: `[Strategic Ignoring]
    Source: Kazdin.
    For attention tantrums: Ignore completely. Once calm, give massive attention.`,
    source: "Kazdin, A. (2008)."
  },
  {
    id: 'bar-004',
    category: 'baraem',
    tags: ['visual', 'schedule', 'autism', 'بصري', 'جدول'],
    contentAr: `[الجداول البصرية]
    المرجع: TEACCH.
    طفل التوحد يفكر بالصور. استخدم صوراً لترتيب اليوم (فطار -> مدرسة -> لعب). هذا يقلل القلق.`,
    contentEn: `[Visual Schedules]
    Source: TEACCH.
    Autism thinks in pictures. Use images for daily routine to reduce anxiety.`,
    source: "Mesibov, G. (2004)."
  },
  {
    id: 'bar-005',
    category: 'baraem',
    tags: ['sensory', 'diet', 'regulation', 'حسي', 'تنظيم'],
    contentAr: `[الحمية الحسية]
    المرجع: Winnie Dunn.
    إذا كان الطفل كثير الحركة، أعطه أنشطة "ثقيلة" (دفع كرسي، حمل كتب) لتهدئة جهازه العصبي.`,
    contentEn: `[Sensory Diet]
    Source: Dunn.
    For hyper kids, use "heavy work" (pushing chairs, carrying books) to regulate.`,
    source: "Dunn, W. (2007)."
  },
  {
    id: 'bar-006',
    category: 'baraem',
    tags: ['social', 'stories', 'gray', 'قصص', 'اجتماعية'],
    contentAr: `[القصص الاجتماعية]
    المرجع: Carol Gray.
    اشرح المواقف الاجتماعية بقصة قصيرة: "عندما أذهب للجدة، أقول السلام عليكم، هذا يجعل الجدة سعيدة".`,
    contentEn: `[Social Stories]
    Source: Carol Gray.
    Explain social rules via stories: "When I see Grandma, I say Hi. Grandma feels happy."`,
    source: "Gray, C. (2010)."
  },
  {
    id: 'bar-007',
    category: 'baraem',
    tags: ['premack', 'first', 'then', 'أولاً', 'ثم'],
    contentAr: `[مبدأ بريماك (أولاً - ثم)]
    المرجع: Premack.
    "أولاً الواجب، ثم الآيباد". اجعل المحفز بعد المهمة الصعبة مباشرة.`,
    contentEn: `[Premack Principle (First-Then)]
    Source: Premack.
    "First Homework, Then iPad". High-probability behavior reinforces low-probability one.`,
    source: "Premack, D. (1959)."
  },
  {
    id: 'bar-008',
    category: 'baraem',
    tags: ['choices', 'control', 'autonomy', 'خيارات', 'تحكم'],
    contentAr: `[الخيارات المحدودة]
    المرجع: Love & Logic.
    بدلاً من الأمر، أعط خيارين مقبولين لك: "تلبس الحذاء الأحمر ولا الأزرق؟". هذا يعطيه شعوراً بالسيطرة.`,
    contentEn: `[Limited Choices]
    Source: Love & Logic.
    "Red shoes or Blue shoes?". Gives child control while complying.`,
    source: "Fay, J. (1995)."
  },
  {
    id: 'bar-009',
    category: 'baraem',
    tags: ['timein', 'connection', 'وقت', 'تواصل'],
    contentAr: `[وقت التواصل (Time-In)]
    المرجع: Daniel Siegel.
    بدلاً من العقاب بالعزل (Time-out)، اجلس معه لتهدئته (Time-in) ثم ناقش السلوك.`,
    contentEn: `[Time-In]
    Source: Siegel.
    Instead of isolating (Time-out), sit with child to co-regulate (Time-in) then discuss.`,
    source: "Siegel, D. (2011)."
  },
  {
    id: 'bar-010',
    category: 'baraem',
    tags: ['emotion', 'coaching', 'feelings', 'مشاعر', 'توجيه'],
    contentAr: `[التوجيه العاطفي]
    المرجع: Gottman.
    سمِ مشاعر الطفل: "شكلك زعلان عشان اللعبة ضاعت". تسمية الشعور تهدئ الدماغ.`,
    contentEn: `[Emotion Coaching]
    Source: Gottman.
    Name the feeling: "You look sad because the toy is lost." Naming tames it.`,
    source: "Gottman, J. (1997)."
  },

  // =================================================================
  // 7. SLEEP (CBT-I)
  // =================================================================
  {
    id: 'slp-001',
    category: 'sleep',
    tags: ['stimulus', 'control', '20min', 'قاعدة', 'سرير'],
    contentAr: `[قاعدة الـ 20 دقيقة]
    المرجع: Spielman (CBT-I).
    إذا لم تنم خلال 20 دقيقة، غادر السرير. لا تبرمج مخك أن السرير مكان للقلق.`,
    contentEn: `[20-Minute Rule]
    Source: Spielman.
    If not asleep in 20 mins, leave bed. Don't wire brain that Bed = Worry.`,
    source: "Spielman, A. (1987)."
  },
  {
    id: 'slp-002',
    category: 'sleep',
    tags: ['brain', 'dump', 'worry', 'تفريغ', 'أفكار'],
    contentAr: `[تفريغ الدماغ]
    المرجع: Carney.
    اكتب مهام الغد والمخاوف على ورقة قبل النوم لطمأنة العقل أنها "محفوظة".`,
    contentEn: `[Brain Dump]
    Source: Carney.
    Write tasks/worries on paper before bed to tell brain they are "safe".`,
    source: "Carney, C. (2012)."
  },
  {
    id: 'slp-003',
    category: 'sleep',
    tags: ['restriction', 'window', 'efficiency', 'تقييد', 'نوم'],
    contentAr: `[علاج تقييد النوم (SRT)]
    المرجع: Spielman.
    قلل ساعات وجودك في السرير لتطابق ساعات نومك الفعلية. هذا يزيد "ضغط النوم" ويجعل النوم أعمق.`,
    contentEn: `[Sleep Restriction Therapy]
    Source: Spielman.
    Limit time in bed to actual sleep time. Increases "sleep drive" and efficiency.`,
    source: "Spielman, A. (1987)."
  },
  {
    id: 'slp-004',
    category: 'sleep',
    tags: ['paradoxical', 'intention', 'awake', 'نية', 'عكسية'],
    contentAr: `[النية العكسية]
    المرجع: Espie.
    حاول أن تبقى "مستيقظاً" بدلاً من محاولة النوم. التخلي عن جهد النوم يزيل القلق فيحدث النوم.`,
    contentEn: `[Paradoxical Intention]
    Source: Espie.
    Try to stay "awake". Giving up the effort to sleep removes anxiety, allowing sleep.`,
    source: "Espie, C. (2006)."
  },
  {
    id: 'slp-005',
    category: 'sleep',
    tags: ['light', 'circadian', 'sun', 'ضوء', 'شمس'],
    contentAr: `[التعرض للضوء]
    المرجع: Circadian Biology.
    التعرض لضوء الشمس فور الاستيقاظ هو أهم إشارة لضبط الساعة البيولوجية للنوم ليلاً.`,
    contentEn: `[Light Exposure]
    Source: Circadian Bio.
    Morning sunlight is the strongest cue to set biological clock for night sleep.`,
    source: "Walker, M. (2017)."
  },
  {
    id: 'slp-006',
    category: 'sleep',
    tags: ['caffeine', 'half-life', 'coffee', 'كافيين', 'قهوة'],
    contentAr: `[قاعدة الكافيين]
    المرجع: Matthew Walker.
    الكافيين يبقى 8 ساعات في الدم. توقف عن القهوة بعد الساعة 2 ظهراً لضمان جودة النوم العميق.`,
    contentEn: `[Caffeine Cutoff]
    Source: Walker.
    Caffeine has 8h half-life. Stop coffee after 2 PM to protect deep sleep.`,
    source: "Walker, M. (2017)."
  },
  {
    id: 'slp-007',
    category: 'sleep',
    tags: ['buffer', 'zone', 'wind-down', 'منطقة', 'عازلة'],
    contentAr: `[المنطقة العازلة]
    المرجع: CBT-I.
    خصص ساعة قبل النوم بدون شاشات أو عمل. نشاط هادئ فقط (قراءة، استرخاء) لتهيئة المخ.`,
    contentEn: `[Buffer Zone]
    Source: CBT-I.
    1 hour before bed: No screens/work. Only calm activities to prep brain.`,
    source: "Perlis, M. (2005)."
  },
  {
    id: 'slp-008',
    category: 'sleep',
    tags: ['conditioning', 'association', 'bed', 'ربط', 'شرطي'],
    contentAr: `[السرير للنوم فقط]
    المرجع: Stimulus Control.
    لا تأكل أو تعمل أو تشاهد التلفاز في السرير. السرير = نوم فقط.`,
    contentEn: `[Bed is for Sleep]
    Source: Stimulus Control.
    No eating/working in bed. Bed = Sleep only.`,
    source: "Bootzin, R. (1972)."
  },
  {
    id: 'slp-009',
    category: 'sleep',
    tags: ['478', 'breathing', 'relax', 'تنفس', 'نوم'],
    contentAr: `[تنفس 4-7-8]
    المرجع: Andrew Weil.
    شهيق 4 ثواني، حبس 7، زفير 8. مهدئ طبيعي للجهاز العصبي قبل النوم.`,
    contentEn: `[4-7-8 Breathing]
    Source: Weil.
    Inhale 4, Hold 7, Exhale 8. Natural tranquilizer for nervous system.`,
    source: "Weil, A."
  },
  {
    id: 'slp-010',
    category: 'sleep',
    tags: ['shuffling', 'cognitive', 'random', 'تشتيت', 'عشوائي'],
    contentAr: `[الخلط المعرفي (Cognitive Shuffling)]
    المرجع: Beaudoin.
    تخيل صوراً عشوائية لا رابط بينها (بقرة، صاروخ، تفاحة). هذا يقلد مرحلة بداية الحلم ويخدع المخ للنوم.`,
    contentEn: `[Cognitive Shuffling]
    Source: Beaudoin.
    Visualize random objects (Cow, Rocket, Apple). Mimics dream onset, tricking brain into sleep.`,
    source: "Beaudoin, L. (2013)."
  },

  // =================================================================
  // 8. SOCIAL PHOBIA (CBT - Updated for Clark & Wells, Heimberg)
  // =================================================================
  {
    id: 'soc-001',
    category: 'social_phobia',
    tags: ['external', 'focus', 'attention', 'clark', 'انتباه', 'خارج'],
    contentAr: `[التدريب على الانتباه (ATT)]
    المرجع: Clark & Wells (CBT for Social Anxiety).
    القلق الاجتماعي يجعلك تركز على نفسك (Self-focused attention). العلاج: انقل انتباهك عمداً للخارج (راقب ألوان الملابس، استمع للأصوات).`,
    contentEn: `[Attention Training Technique]
    Source: Clark & Wells (1995).
    Social anxiety causes intense self-focus. Cure: Shift attention EXTERNALLY (observe colors, listen to sounds) to break the loop.`,
    source: "Clark, D. M. & Wells, A. (1995)."
  },
  {
    id: 'soc-002',
    category: 'social_phobia',
    tags: ['exposure', 'ladder', 'social', 'heimberg', 'مواجهة', 'سلم'],
    contentAr: `[سلم التعرض الاجتماعي]
    المرجع: Richard Heimberg (CBT Group).
    صمم تدرجاً للمخاوف: 1. اسأل عن الوقت (سهل). 2. امدح زميلاً (متوسط). 3. تحدث في اجتماع (صعب). كرر كل خطوة حتى يزول القلق.`,
    contentEn: `[Social Exposure Hierarchy]
    Source: Heimberg (2002).
    Design a fear ladder: 1. Ask for time (Low). 2. Compliment peer (Medium). 3. Speak in meeting (High). Repeat until habituated.`,
    source: "Heimberg, R. G. (2002)."
  },
  {
    id: 'soc-003',
    category: 'social_phobia',
    tags: ['safety', 'behaviors', 'drop', 'أمان', 'سلوك'],
    contentAr: `[إسقاط سلوكيات الأمان]
    المرجع: Wells (Metacognitive Therapy).
    توقف عن (مسك الهاتف، تجنب النظر، التحدث بسرعة) لإخفاء القلق. هذه السلوكيات تخبر عقلك أن "هناك خطر" وتمنع التعافي.`,
    contentEn: `[Dropping Safety Behaviors]
    Source: Wells (1997).
    Stop behaviors used to hide anxiety (clutching phone, avoiding eye contact). These signals tell the brain "Danger exists" and prevent learning.`,
    source: "Wells, A. (1997)."
  },
  {
    id: 'soc-004',
    category: 'social_phobia',
    tags: ['video', 'feedback', 'reality', 'فيديو', 'واقع'],
    contentAr: `[التغذية الراجعة بالفيديو]
    المرجع: David Clark (Oxford).
    مرضى الرهاب يتخيلون أنهم يبدون "مرتبكين جداً". مشاهدة فيديو لنفسك أثناء الحديث يثبت أنك تبدو طبيعياً أكثر بكثير مما تشعر به.`,
    contentEn: `[Video Feedback]
    Source: David Clark.
    Patients imagine they look "terribly anxious". Watching a video of yourself proves you look far more normal than you feel (corrects distorted self-image).`,
    source: "Clark, D. M. (1995)."
  },
  {
    id: 'soc-005',
    category: 'social_phobia',
    tags: ['social', 'self', 'image', 'distorted', 'صورة', 'ذات'],
    contentAr: `[تحدي صورة "الذات الاجتماعية"]
    المرجع: Clark & Wells.
    أنت ترى نفسك في عقلك بصورة مشوهة (متعرق، غبي). هذه "هلوسة قلق" وليست واقعاً. تخلَّ عن هذه الصورة وركز على وجه محدثك.`,
    contentEn: `[Challenging the "Social Self" Image]
    Source: Clark & Wells.
    You see a distorted image of yourself in your mind (sweaty, foolish). This is an anxiety hallucination. Abandon this image and focus on the other person.`,
    source: "Clark, D. M. (1995)."
  },
  {
    id: 'soc-006',
    category: 'social_phobia',
    tags: ['assertiveness', 'no', 'boundaries', 'توكيد', 'لا'],
    contentAr: `[التدريب التوكيدي]
    المرجع: Alberti & Emmons.
    الرهاب يجعلك سلبياً. تدرب على حقوقك: حقك أن تقول "لا"، وحقك أن تغير رأيك، وحقك أن ترتكب أخطاء دون اعتذار مبالغ فيه.`,
    contentEn: `[Assertiveness Training]
    Source: Alberti & Emmons.
    Social anxiety breeds passivity. Practice your rights: Right to say "No", right to change mind, right to make mistakes.`,
    source: "Alberti, R. (2008)."
  },
  {
    id: 'soc-007',
    category: 'social_phobia',
    tags: ['post-event', 'rumination', 'processing', 'تحليل', 'ماضي'],
    contentAr: `[وقف الاجترار (Post-Event Processing)]
    المرجع: Brozovich & Heimberg.
    توقف عن "تشريح" الموقف بعد انتهائه (لماذا قلت كذا؟ هل لاحظوا؟). قل لنفسك: "انتهى الموقف. التفكير الزائد لن يغير الماضي".`,
    contentEn: `[Stop Post-Event Processing]
    Source: Brozovich & Heimberg.
    Stop dissecting the interaction afterwards ("Why did I say that?"). Rule: "It's done. Ruminating won't change the past."`,
    source: "Brozovich, F. (2010)."
  },
  {
    id: 'soc-008',
    category: 'social_phobia',
    tags: ['mind', 'reading', 'cognitive', 'distortion', 'أفكار', 'قراءة'],
    contentAr: `[تحدي قراءة الأفكار]
    المرجع: CBT Standard.
    أنت تظن أنك تعرف ما يفكرون به ("يظنون أنني ممل"). هذا خطأ معرفي. اسأل: "هل لدي دليل ملموس؟ أم هو مجرد تخمين مني؟".`,
    contentEn: `[Challenging Mind Reading]
    Source: CBT Standard.
    You think you know their thoughts ("They think I'm boring"). This is a distortion. Ask: "Do I have proof? Or is this just my fear projecting?"`,
    source: "Burns, D. D. (1980)."
  },
  {
    id: 'soc-009',
    category: 'social_phobia',
    tags: ['experiments', 'behavioral', 'testing', 'تجارب', 'اختبار'],
    contentAr: `[التجارب السلوكية]
    المرجع: Bennett-Levy.
    اختبر مخاوفك: تعمد إسقاط مفاتيحك أو التلعثم في كلمة. راقب رد فعل الناس. ستجد أن 99% لا يهتمون ولا يسخرون.`,
    contentEn: `[Behavioral Experiments]
    Source: Bennett-Levy.
    Test your fears: Deliberately drop keys or stutter. Observe reactions. You will find 99% of people do not care or judge.`,
    source: "Bennett-Levy, J. (2004)."
  },
  {
    id: 'soc-010',
    category: 'social_phobia',
    tags: ['restructuring', 'evaluation', 'judgement', 'تقييم', 'حكم'],
    contentAr: `[إعادة الهيكلة المعرفية للتقييم]
    المرجع: Rapee & Heimberg.
    الخوف هو "المبالغة في تكلفة الخطأ الاجتماعي". حتى لو ارتبكت، ما هي الكارثة؟ هل سيطردك الجميع؟ الواقع أكثر تسامحاً.`,
    contentEn: `[Cognitive Restructuring of Evaluation]
    Source: Rapee & Heimberg.
    Fear comes from overestimating the "cost" of social error. Even if you are awkward, so what? Will you be exiled? Reality is forgiving.`,
    source: "Rapee, R. M. (1997)."
  },

  // =================================================================
  // 9. BIPOLAR (IPSRT, FFT)
  // =================================================================
  {
    id: 'bip-001',
    category: 'bipolar',
    tags: ['ipsrt', 'rhythm', 'routine', 'frank', 'إيقاع', 'روتين'],
    contentAr: `[ضبط الإيقاع الاجتماعي (IPSRT)]
    المرجع: Ellen Frank.
    استيقظ ونم في نفس الدقيقة يومياً. استقرار الروتين = استقرار المزاج لثنائي القطب.`,
    contentEn: `[Social Rhythm Therapy]
    Source: Frank.
    Wake/Sleep at exact same time. Routine stability = Mood stability.`,
    source: "Frank, E. (2005)."
  },
  {
    id: 'bip-002',
    category: 'bipolar',
    tags: ['prodromal', 'signs', 'warning', 'إنذار', 'مبكر'],
    contentAr: `[علامات الإنذار المبكر]
    المرجع: Miklowitz.
    تعرف على علاماتك الخاصة (قلة نوم، كثرة كلام) قبل حدوث النوبة. التدخل المبكر يمنع الانتكاسة.`,
    contentEn: `[Prodromal Signs]
    Source: Miklowitz.
    Identify early signs (less sleep, talking fast). Early action prevents relapse.`,
    source: "Miklowitz, D. (2010)."
  },
  {
    id: 'bip-003',
    category: 'bipolar',
    tags: ['family', 'focused', 'fft', 'عائلة', 'دعم'],
    contentAr: `[العلاج العائلي (FFT)]
    المرجع: Miklowitz.
    العائلة شريك في العلاج. قلل "التعبير الانفعالي العالي" (النقد والصراخ) في المنزل لتقليل النوبات.`,
    contentEn: `[Family Focused Therapy]
    Source: Miklowitz.
    Reduce "High Expressed Emotion" (criticsm/shouting) at home to lower relapses.`,
    source: "Miklowitz, D. (2008)."
  },
  {
    id: 'bip-004',
    category: 'bipolar',
    tags: ['medication', 'adherence', 'dawa', 'دواء', 'التزام'],
    contentAr: `[الالتزام الدوائي]
    المرجع: APA Guidelines.
    الدواء ليس "علامة ضعف" بل هو "أنسولين" المزاج. لا تتوقف فجأة عند الشعور بالتحسن.`,
    contentEn: `[Medication Adherence]
    Source: APA.
    Meds are not weakness; they are mood insulin. Do not stop abruptly when feeling good.`,
    source: "APA (2002)."
  },
  {
    id: 'bip-005',
    category: 'bipolar',
    tags: ['dark', 'therapy', 'stimulus', 'ظلام', 'هوس'],
    contentAr: `[العلاج بالظلام]
    المرجع: Phelps.
    عند بداية الهوس (Mania)، قلل المحفزات. اجلس في غرفة مظلمة وهادئة لتقليل الدوبامين.`,
    contentEn: `[Dark Therapy]
    Source: Phelps.
    At mania onset, reduce stimuli. Dark, quiet room to lower dopamine/arousal.`,
    source: "Phelps, J. (2006)."
  },
  {
    id: 'bip-006',
    category: 'bipolar',
    tags: ['charting', 'mood', 'tracking', 'تتبع', 'مزاج'],
    contentAr: `[رسم المزاج]
    المرجع: NIMH.
    سجل مزاجك ونومك يومياً. الرسوم البيانية تكشف الأنماط الموسمية والمحفزات الخفية.`,
    contentEn: `[Mood Charting]
    Source: NIMH.
    Track mood/sleep daily. Charts reveal seasonal patterns and triggers.`,
    source: "NIMH."
  },
  {
    id: 'bip-007',
    category: 'bipolar',
    tags: ['stress', 'vulnerability', 'model', 'ضغط', 'هشاشة'],
    contentAr: `[نموذج الضغط والهشاشة]
    المرجع: Zubin.
    أنت تملك حساسية بيولوجية. الضغط النفسي القوي يشعل الفتيل. إدارة الضغط = إدارة المرض.`,
    contentEn: `[Stress-Vulnerability Model]
    Source: Zubin.
    Bio-susceptibility + Stress = Episode. Managing stress manages the illness.`,
    source: "Zubin, J. (1977)."
  },
  {
    id: 'bip-008',
    category: 'bipolar',
    tags: ['financial', 'guardrails', 'money', 'mania', 'مال', 'حماية'],
    contentAr: `[حواجز الحماية المالية]
    المرجع: Depression Bipolar Alliance.
    أثناء الهوس، يكثر الإنفاق. ضع قيوداً مسبقة (بطاقة بحد منخفض، تسليم المال لشخص ثقة).`,
    contentEn: `[Financial Guardrails]
    Source: DBSA.
    Mania spends money. Set limits (low limit card, trusted person) in advance.`,
    source: "DBSA."
  },
  {
    id: 'bip-009',
    category: 'bipolar',
    tags: ['safety', 'plan', 'suicide', 'أمان', 'خطة'],
    contentAr: `[خطة الأمان]
    المرجع: Stanley-Brown.
    اكتب خطة واضحة لحالات الاكتئاب الشديد: (من أتصل به؟ أين أذهب؟ ماذا أفعل؟).`,
    contentEn: `[Safety Plan]
    Source: Stanley-Brown.
    Write a plan for severe lows: (Who to call? Where to go? What to do?).`,
    source: "Stanley, B. (2012)."
  },
  {
    id: 'bip-010',
    category: 'bipolar',
    tags: ['routine', 'anchors', 'ثوابت', 'روتين'],
    contentAr: `[مراسي الروتين]
    المرجع: IPSRT.
    ثبت مواعيد: الأكل، الدواء، والرياضة. هذه "مراسي" تمنع انحراف المزاج.`,
    contentEn: `[Routine Anchors]
    Source: IPSRT.
    Fix times for: Food, Meds, Exercise. These anchors prevent mood drift.`,
    source: "Frank, E. (2005)."
  },

  // =================================================================
  // 10. GENERAL / SELF-CARE (Wellness, DBT, Positive Psych, MCT, Polyvagal)
  // =================================================================
  {
    id: 'gen-001',
    category: 'general',
    tags: ['self-compassion', 'neff', 'رحمة', 'ذات'],
    contentAr: `[التعاطف مع الذات]
    المرجع: Kristin Neff.
    "لو صديقي أخطأ، ماذا سأقول له؟". قل هذا لنفسك. النقد يفرز الكورتيزول، الرحمة تفرز الأوكسيتوسين.`,
    contentEn: `[Self-Compassion]
    Source: Neff.
    "What would I tell a friend?". Say that to self. Criticism = Cortisol, Kindness = Oxytocin.`,
    source: "Neff, K. (2011)."
  },
  {
    id: 'gen-002',
    category: 'general',
    tags: ['boundaries', 'setting', 'limits', 'حدود', 'لا'],
    contentAr: `[رسم الحدود]
    المرجع: Nedra Tawwab.
    الحدود ليست قسوة، بل حماية للعلاقة. "لا أستطيع فعل هذا اليوم" جملة كاملة ومحترمة.`,
    contentEn: `[Setting Boundaries]
    Source: Tawwab.
    Boundaries protect relationships. "I cannot do this today" is a complete sentence.`,
    source: "Tawwab, N. (2021)."
  },
  {
    id: 'gen-003',
    category: 'general',
    tags: ['growth', 'mindset', 'dweck', 'نمو', 'عقلية'],
    contentAr: `[عقلية النمو]
    المرجع: Carol Dweck.
    استبدل "أنا فاشل" بـ "أنا أتعلم". الفشل ليس هوية، بل معلومة للتحسين.`,
    contentEn: `[Growth Mindset]
    Source: Dweck.
    Replace "I failed" with "I learned". Failure is data, not identity.`,
    source: "Dweck, C. (2006)."
  },
  {
    id: 'gen-004',
    category: 'general',
    tags: ['rain', 'mindfulness', 'tarabrach', 'تقبل', 'تحقيق'],
    contentAr: `[تقنية RAIN]
    المرجع: Tara Brach.
    Recognize (لاحظ)، Allow (اسمح)، Investigate (حقق برفق)، Nurture (ارعَ نفسك).`,
    contentEn: `[RAIN Technique]
    Source: Tara Brach.
    Recognize, Allow, Investigate, Nurture.`,
    source: "Brach, T. (2019)."
  },
  {
    id: 'gen-005',
    category: 'general',
    tags: ['urge', 'surfing', 'addiction', 'رغبة', 'موجة'],
    contentAr: `[ركوب موجة الرغبة]
    المرجع: Marlatt.
    الرغبة (أكل، عادة سيئة) مثل الموجة. تعلو وتصل قمة ثم تنكسر. لا تحاربها، اركبها حتى تتلاشى (20 دقيقة).`,
    contentEn: `[Urge Surfing]
    Source: Marlatt.
    Craving is a wave. It peaks then breaks. Don't fight, surf it until it fades (20 mins).`,
    source: "Marlatt, G. (1985)."
  },
  {
    id: 'gen-006',
    category: 'general',
    tags: ['digital', 'detox', 'wellbeing', 'تقنية', 'سموم'],
    contentAr: `[العافية الرقمية]
    المرجع: Cal Newport.
    التشتت الرقمي يسبب "قلق الخلفية". خصص أوقاتاً "بدون هاتف" لاستعادة تركيزك وهدوئك.`,
    contentEn: `[Digital Minimalism]
    Source: Newport.
    Digital distraction causes background anxiety. Schedule "phone-free" blocks.`,
    source: "Newport, C. (2019)."
  },
  {
    id: 'gen-007',
    category: 'general',
    tags: ['ecotherapy', 'nature', 'green', 'طبيعة', 'أخضر'],
    contentAr: `[العلاج بالطبيعة]
    المرجع: Kaplan (ART).
    النظر للأشجار والسماء يعيد شحن "الانتباه التلقائي". 20 دقيقة في الطبيعة تخفض الكورتيزول.`,
    contentEn: `[Ecotherapy]
    Source: Kaplan.
    Nature restores attention. 20 mins in green space drops cortisol.`,
    source: "Kaplan, R. (1989)."
  },
  {
    id: 'gen-008',
    category: 'general',
    tags: ['altruism', 'helping', 'giving', 'عطاء', 'مساعدة'],
    contentAr: `[قوة العطاء]
    المرجع: Positive Psych.
    مساعدة الآخرين هي أسرع طريقة لتحسين المزاج (Helper's High).`,
    contentEn: `[Helper's High]
    Source: Positive Psych.
    Helping others is the fastest mood booster.`,
    source: "Post, S. (2007)."
  },
  {
    id: 'gen-009',
    category: 'general',
    tags: ['flow', 'state', 'csikszentmihalyi', 'تدفق', 'انغماس'],
    contentAr: `[حالة التدفق (Flow)]
    المرجع: Csikszentmihalyi.
    السعادة تكمن في الانغماس التام في نشاط تحبه يتحدى مهاراتك (رسم، برمجة، رياضة).`,
    contentEn: `[Flow State]
    Source: Csikszentmihalyi.
    Happiness is total immersion in a challenging activity you love.`,
    source: "Csikszentmihalyi, M. (1990)."
  },
  {
    id: 'gen-010',
    category: 'general',
    tags: ['radical', 'acceptance', 'dbt', 'تقبل', 'جذري'],
    contentAr: `[التقبل الجذري]
    المرجع: Marsha Linehan (DBT).
    "الألم + عدم القبول = المعاناة". قبول الواقع كما هو (حتى لو مؤلم) هو أول خطوة للتغيير.`,
    contentEn: `[Radical Acceptance]
    Source: Linehan.
    "Pain + Non-Acceptance = Suffering". Accepting reality is the first step to change.`,
    source: "Linehan, M. (1993)."
  },
  {
    id: 'gen-011',
    category: 'general',
    tags: ['metacognitive', 'detached', 'mindfulness', 'wells', 'thoughts', 'انفصال', 'ميتا'],
    contentAr: `[اليقظة المنفصلة (Metacognitive Therapy)]
    المرجع: Adrian Wells.
    لا تشتبك مع الأفكار السلبية ولا تحاول تغييرها. تعامل معها كـ "ضوضاء في الخلفية" أو "إيميل سبام". اتركها وحدها وستتلاشى.`,
    contentEn: `[Detached Mindfulness (MCT)]
    Source: Adrian Wells.
    Do not engage with or try to change negative thoughts. Treat them as "background noise" or "spam email". Leave them alone and they will fade.`,
    source: "Wells, A. (2009)."
  },
  {
    id: 'gen-012',
    category: 'general',
    tags: ['polyvagal', 'vagus', 'safety', 'porges', 'nervous', 'عصب', 'حائر'],
    contentAr: `[النظرية البوليفيجال (Polyvagal Theory)]
    المرجع: Stephen Porges.
    جهازك العصبي يبحث عن "إشارات الأمان". التنفس العميق، التواصل البصري الدافئ، والهمهمة (Humming) تنشط العصب الحائر وتهدئ الجسم فوراً.`,
    contentEn: `[Polyvagal Theory]
    Source: Stephen Porges.
    Your nervous system scans for "safety cues". Deep breathing, warm eye contact, and humming stimulate the Vagus Nerve to calm the body instantly.`,
    source: "Porges, S. W. (2011)."
  },
  {
    id: 'gen-013',
    category: 'general',
    tags: ['dbt', 'tipp', 'distress', 'tolerance', 'cold', 'تحمل', 'ضيق'],
    contentAr: `[مهارات TIPP (DBT)]
    المرجع: Marsha Linehan.
    عند الانفعال الشديد، استخدم تبريد الجسم (ماء بارد على الوجه)، أو الجري السريع لمدة دقيقة، لعمل "إعادة ضبط" بيولوجية للدماغ.`,
    contentEn: `[TIPP Skills (DBT)]
    Source: Marsha Linehan.
    For extreme distress: Temperature (cold water on face), Intense exercise (sprint 1 min). This forces a biological "reset" of the brain.`,
    source: "Linehan, M. (2015)."
  },
  {
    id: 'gen-014',
    category: 'general',
    tags: ['mbct', 'breathing', 'space', 'reset', 'مساحة', 'تنفس'],
    contentAr: `[مساحة التنفس (3 دقائق)]
    المرجع: MBCT Protocol.
    1. الدقيقة الأولى: لاحظ مشاعرك الحالية.
    2. الدقيقة الثانية: ركز انتباهك بالكامل على التنفس.
    3. الدقيقة الثالثة: وسع انتباهك ليشمل جسمك بالكامل.`,
    contentEn: `[The 3-Minute Breathing Space]
    Source: MBCT.
    1. Awareness (How am I doing?). 2. Gathering (Focus on breath). 3. Expanding (Sense whole body).`,
    source: "Williams, M. (2002)."
  },
  {
    id: 'gen-015',
    category: 'general',
    tags: ['defusion', 'act', 'leaves', 'stream', 'انفصال', 'أفكار'],
    contentAr: `[الانفصال المعرفي (Cognitive Defusion)]
    المرجع: Steven Hayes (ACT).
    بدلاً من القول "أنا فاشل"، قل "أنا ألاحظ أن لدي فكرة تقول أنني فاشل". هذا يخلق مسافة بينك وبين الفكرة.`,
    contentEn: `[Cognitive Defusion]
    Source: Hayes.
    Instead of "I am a failure", say "I notice I am having the thought that I am a failure". This creates distance from the thought.`,
    source: "Hayes, S. C. (1999)."
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
