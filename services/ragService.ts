
import { Language } from "../types";

// 1. DATA STRUCTURES
interface ClinicalDocument {
  id: string;
  category: string;
  tags: string[];
  contentAr: string;
  contentEn: string;
  source: string; // To add credibility (e.g., "DSM-5", "CBT Basics")
}

// 2. THE VECTOR STORE (Simulating Pinecone Index)
// In a real production app, this data sits in Pinecone/Weaviate and is fetched via embeddings.
const KNOWLEDGE_VECTOR_STORE: ClinicalDocument[] = [
  {
    id: 'cbt-001',
    category: 'CBT',
    tags: ['cognitive', 'distortions', 'negative', 'thoughts', 'thinking', 'تشوه', 'أفكار', 'سلبية', 'تفكير'],
    contentAr: `[بروتوكول العلاج المعرفي السلوكي: التشوهات المعرفية]
    التشوهات المعرفية هي طرق غير عقلانية في التفكير تزيد من سوء الحالة النفسية. أهمها:
    1. **التفكير الكارثي (Catastrophizing):** توقع أسوأ سيناريو ممكن (مثال: "قلبي يدق بسرعة، إذن سأموت"). العلاج: حساب الاحتمالات الواقعية.
    2. **الكل أو لا شيء (All-or-Nothing):** رؤية الأمور أبيض أو أسود. العلاج: البحث عن المنطقة الرمادية.
    3. **الشخصنة (Personalization):** لوم النفس على أحداث خارجة عن السيطرة.
    التقنية العلاجية: السجل الفكري (Thought Record) لتفنيد هذه الأفكار بالأدلة.`,
    contentEn: `[CBT PROTOCOL: COGNITIVE DISTORTIONS]
    Cognitive distortions are irrational thought patterns. Key types:
    1. **Catastrophizing:** Expecting the worst (e.g., "Heart racing = Heart attack"). Cure: Realistic probability assessment.
    2. **All-or-Nothing:** Seeing things in binary. Cure: Finding the grey area.
    3. **Personalization:** Blaming self for external events.
    Technique: Use a 'Thought Record' to challenge these with evidence.`,
    source: "Beck Institute for CBT"
  },
  {
    id: 'cbt-002',
    category: 'CBT',
    tags: ['behavioral', 'activation', 'depression', 'activity', 'schedule', 'nashat', 'e kteab', 'tahfiz', 'نشاط', 'اكتئاب', 'سلوك', 'جدول'],
    contentAr: `[التنشيط السلوكي: علاج الاكتئاب]
    1. **الحلقة المفرغة:** الاكتئاب يقلل النشاط -> قلة الإنجاز والمتعة -> زيادة الاكتئاب.
    2. **القاعدة:** لا تنتظر "الرغبة" في فعل الشيء. الفعل يأتي قبل الشعور (Action precedes Motivation).
    3. **التقنية:** جدولة أنشطة صغيرة جداً (مثل غسل كوب واحد، المشي 5 دقائق) لكسر حالة الجمود وزيادة إفراز الدوبامين تدريجياً.`,
    contentEn: `[BEHAVIORAL ACTIVATION: TREATING DEPRESSION]
    1. **The Vicious Cycle:** Depression reduces activity -> Less achievement/pleasure -> More depression.
    2. **Rule:** Do not wait for "motivation". Action precedes Motivation.
    3. **Technique:** Schedule micro-activities (wash one cup, walk 5 mins) to break inertia and trigger dopamine release.`,
    source: "Behavioral Activation for Depression - Martell et al."
  },
  {
    id: 'pan-001',
    category: 'Panic',
    tags: ['panic', 'attack', 'heart', 'dying', 'breath', 'hel', 'nefs', 'mot', 'نوبة', 'هلع', 'موت', 'قلب', 'نفس', 'خوف'],
    contentAr: `[بروتوكول الطوارئ: نوبات الهلع]
    1. **الفسيولوجيا:** نوبة الهلع هي "إنذار كاذب" من اللوزة الدماغية (Amygdala). الأعراض (خفقان، ضيق نفس) هي مجرد أدرينالين، وليست نوبة قلبية. لن تؤدي للموت أو الجنون.
    2. **التنفس الصندوقي (Box Breathing):** شهيق 4 ثوان، حبس 4 ثوان، زفير 4 ثوان، حبس 4 ثوان. هذا يرسل إشارة "أمان" للعصب الحائر.
    3. **تمرين 5-4-3-2-1:** سمِّ 5 أشياء تراها، 4 تلمسها، 3 تسمعها... لكسر حلقة التركيز الداخلي.`,
    contentEn: `[EMERGENCY PROTOCOL: PANIC ATTACKS]
    1. **Physiology:** A panic attack is a "false alarm" from the Amygdala. Symptoms (racing heart) are just adrenaline, NOT a heart attack. You will not die or go crazy.
    2. **Box Breathing:** Inhale 4s, Hold 4s, Exhale 4s, Hold 4s. This signals safety to the Vagus Nerve.
    3. **5-4-3-2-1 Technique:** Name 5 things you see, 4 you touch, etc., to shift focus externally.`,
    source: "Clinical Anxiety Treatment Manual"
  },
  {
    id: 'mindfulness-002',
    category: 'Mindfulness',
    tags: ['mindfulness', 'mbsr', 'present', 'awareness', 'judgement', 'yaqaza', 'wa3i', 'يقظة', 'وعي', 'حكم', 'لحظة'],
    contentAr: `[اليقظة الذهنية (MBSR): تقليل التوتر]
    1. **المراقبة بدون حكم:** لاحظ أفكارك ومشاعرك كأنها "غيوم تمر في السماء" دون الانجراف معها أو الحكم عليها بأنها "سيئة".
    2. **العودة للحواس:** عندما يزدحم العقل، عد فوراً للحواس (ملمس القدم على الأرض، صوت التكييف).
    3. **التعاطف مع الذات:** بدل نقد الذات ("أنا ضعيف")، قل: "أنا أمر بلحظة صعبة، وهذا إنساني".`,
    contentEn: `[MBSR: MINDFULNESS STRESS REDUCTION]
    1. **Non-judgmental Observation:** Observe thoughts/feelings like "clouds passing in the sky" without engaging or labeling them "bad".
    2. **Senses Anchor:** When mind races, return to senses (feet on floor, ambient sounds).
    3. **Self-Compassion:** Replace self-criticism ("I am weak") with ("I am having a hard moment, and that's human").`,
    source: "Full Catastrophe Living - Jon Kabat-Zinn"
  },
  {
    id: 'gottman-001',
    category: 'Relationships',
    tags: ['marriage', 'conflict', 'partner', 'fight', 'divorce', 'zowag', 'moshkila', 'زواج', 'خناق', 'شريك', 'طلاق', 'نقد', 'علاقات'],
    contentAr: `[منهج جوتمان للعلاقات: الفرسان الأربعة]
    أخطر سلوكيات تدمر العلاقة:
    1. **النقد (Criticism):** الهجوم على شخصية الشريك ("أنت أناني") بدلاً من السلوك ("أنا انزعجت لما تأخرت").
    2. **الازدراء (Contempt):** السخرية أو تحقير الشريك (أخطر مؤشر للطلاق).
    3. **الدفاعية (Defensiveness):** لعب دور الضحية وعدم تحمل المسؤولية.
    4. **المماطلة (Stonewalling):** الانسحاب والصمت.
    الحل: الشكوى بدون لوم، وبناء ثقافة التقدير.`,
    contentEn: `[GOTTMAN METHOD: THE FOUR HORSEMEN]
    Predictors of relationship failure:
    1. **Criticism:** Attacking character ("You are selfish") vs behavior ("I felt hurt when...").
    2. **Contempt:** Mockery or sarcasm (Best predictor of divorce).
    3. **Defensiveness:** Playing victim.
    4. **Stonewalling:** Withdrawing/Silence.
    Antidote: Gentle Start-up and building a culture of appreciation.`,
    source: "The Seven Principles for Making Marriage Work"
  },
  {
    id: 'insomnia-001',
    category: 'Sleep',
    tags: ['sleep', 'insomnia', 'awake', 'tired', 'bed', 'nom', 'araq', 'نوم', 'أرق', 'سهر', 'راحة'],
    contentAr: `[CBT-I: علاج الأرق]
    1. **التحكم في المحفزات:** السرير للنوم فقط. إذا لم تنم خلال 20 دقيقة، غادر الغرفة وافعل شيئاً مملاً حتى تشعر بالنعاس.
    2. **قيود النوم:** منع القيلولة نهاراً لزيادة "ضغط النوم" ليلاً.
    3. **تحدي الأفكار:** فكرة "إذا لم أنم الآن سأفشل غداً" هي فكرة مشوهة تزيد القلق وتطرد النوم.`,
    contentEn: `[CBT-I: INSOMNIA TREATMENT]
    1. **Stimulus Control:** Bed is for sleep only. If awake >20 mins, leave the room until sleepy.
    2. **Sleep Restriction:** No naps to build "sleep pressure".
    3. **Cognitive Challenge:** The thought "If I don't sleep now, tomorrow is ruined" creates anxiety that prevents sleep.`,
    source: "Stanford Sleep Medicine Protocol"
  },
  {
    id: 'adhd-001',
    category: 'Baraem',
    tags: ['adhd', 'focus', 'child', 'hyper', 'study', 'tashatot', 'tarkiz', 'طفل', 'تشتت', 'مذاكرة', 'حركة', 'انتباه'],
    contentAr: `[تعديل السلوك: ADHD]
    1. **المهام المجزأة:** عقل الطفل المشتت يرى المهمة الكبيرة كجبل. قسمها لخطوات صغيرة (Chunking).
    2. **نظام المكافأة الفورية:** طفل ADHD لديه نقص في الدوبامين، يحتاج لمكافأة فورية وصغيرة وليس مؤجلة.
    3. **المؤقت البصري:** الوقت مفهوم مجرد لديهم. استخدم ساعة رملية أو مؤقت ملون ليرى الوقت يمر.`,
    contentEn: `[BEHAVIORAL MODIFICATION: ADHD]
    1. **Chunking:** Break big tasks into micro-steps.
    2. **Immediate Rewards:** ADHD brains crave dopamine; rewards must be instant, not delayed.
    3. **Visual Timers:** Time is abstract. Use sand timers so they can 'see' time passing.`,
    source: "Russell Barkley's ADHD Handbook"
  }
];

// Helper: Normalize Arabic Text
const normalizeArabic = (text: string) => {
  return text
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[ًٌٍَُِّْ]/g, ''); // Remove diacritics
};

// 3. SEMANTIC SEARCH ENGINE (Simulated)
const calculateRelevance = (query: string, doc: ClinicalDocument, language: Language): number => {
    // Normalize query if Arabic
    const normalizedQuery = language === 'ar' ? normalizeArabic(query.toLowerCase()) : query.toLowerCase();
    
    const tokens = normalizedQuery.split(/[\s,?.!]+/).filter(t => t.length > 2);
    let score = 0;
    
    // Check tags (High weight)
    doc.tags.forEach(tag => {
        const normalizedTag = language === 'ar' ? normalizeArabic(tag) : tag.toLowerCase();
        if (tokens.some(t => t.includes(normalizedTag) || normalizedTag.includes(t))) score += 5;
    });

    // Check content (Medium weight)
    const content = language === 'ar' ? doc.contentAr : doc.contentEn;
    const normalizedContent = language === 'ar' ? normalizeArabic(content) : content.toLowerCase();

    if (tokens.some(t => normalizedContent.includes(t))) score += 2;

    return score;
};

export const ragService = {
  /**
   * Retrieves strictly relevant clinical context based on user input.
   * This simulates a Pinecone Vector Search call.
   */
  retrieveContext: (userInput: string, language: Language): string | null => {
    const scores = KNOWLEDGE_VECTOR_STORE.map(doc => ({
        doc,
        score: calculateRelevance(userInput, doc, language)
    }));

    // Filter relevant results (Threshold > 3) and Sort by score
    const topResults = scores
        .filter(item => item.score > 3)
        .sort((a, b) => b.score - a.score)
        .slice(0, 2); // Take top 2 docs

    if (topResults.length === 0) return null;

    const contextIntro = language === 'ar' 
      ? "⚠️ [نظام RAG الطبي]: استخدم المعلومات السريرية الموثقة التالية لدعم ردك (لا تذكر أنك قرأتها، بل استخدمها):" 
      : "⚠️ [MEDICAL RAG SYSTEM]: Use the following verified clinical data to support your response (integrate naturally):";

    const content = topResults.map(r => {
        const text = language === 'ar' ? r.doc.contentAr : r.doc.contentEn;
        return `SOURCE: ${r.doc.source}\n${text}`;
    }).join('\n\n');

    return `${contextIntro}\n${content}`;
  }
};
