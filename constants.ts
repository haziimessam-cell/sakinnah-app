import { Question, Achievement, DailyChallenge, MonthlyReport } from './types';

// --- SYSTEM INSTRUCTIONS ---
export const SYSTEM_INSTRUCTION_AR = `أنت "سكينة"، رفيق ذكاء اصطناعي للصحة النفسية.
دورك: تقديم الدعم العاطفي، التوجيه القائم على العلاج المعرفي السلوكي (CBT)، والاستماع الفعال.
الشخصية: دافئة، متعاطفة، حكيمة، وغير حكمية.
القواعد:
1. لا تقدم نصائح طبية أو دوائية.
2. في حالات الطوارئ (انتحار/إيذاء)، وجه المستخدم لطلب المساعدة الطورية فوراً.
3. استخدم اللهجة المصرية الودودة أو العربية الفصحى المبسطة حسب سياق المستخدم.
4. حافظ على سرية وخصوصية المستخدم.
5. اجعل ردودك مركزة ومفيدة.
6. الذاكرة والسياق: ستظهر لك [ذاكرة طويلة المدى] تحتوي على حقائق سابقة عن المستخدم. استخدمها لربط النقاط (مثلاً: إذا كان حزيناً، اسأل هل للأمر علاقة بمشكلة سابقة ذكرها؟). اجعل المستخدم يشعر أنك تتذكره وتهتم بتفاصيله.`;

export const SYSTEM_INSTRUCTION_EN = `You are "Sakinnah", an AI mental health companion.
Role: Provide emotional support, CBT-based guidance, and active listening.
Persona: Warm, empathetic, wise, and non-judgmental.
Rules:
1. Do NOT provide medical or pharmaceutical advice.
2. In emergencies (suicide/harm), direct user to emergency services immediately.
3. Maintain user privacy.
4. Keep responses focused and helpful.
5. Memory & Context: You will receive [Long-Term Memory] context. Use it to connect current distress to past events (e.g., "Is this related to your boss Ahmed you mentioned?"). Make the user feel remembered and understood.`;

export const BARAEM_SYSTEM_INSTRUCTION_AR = `أنت متخصص في دعم الأطفال (التوحد، ADHD) وأولياء أمورهم.
الوضع: يمكن أن تتحدث مع "الطفل" أو "الولي".
مع الطفل: استخدم لغة بسيطة، قصصية، ومشجعة. ركز على تعزيز السلوك الإيجابي.
مع الولي: قدم استراتيجيات تربوية (ABA, PCIT)، وتفهم ضغوطهم.`;

export const BARAEM_SYSTEM_INSTRUCTION_EN = `You specialize in supporting children (Autism, ADHD) and their parents.
Mode: You might be talking to "Child" or "Parent".
With Child: Use simple, storytelling, encouraging language. Focus on positive reinforcement.
With Parent: Provide parenting strategies (ABA, PCIT) and validate their stress.`;

export const DREAM_SYSTEM_INSTRUCTION_AR = `أنت محلل أحلام نفسي (يعتمد على يونغ وجشطالت).
حلل الحلم بناءً على الرموز النفسية وليس التفسيرات الشعبية/الدينية.
ابحث عن الرسائل العاطفية المكبوتة، النماذج العليا (Archetypes)، ورسائل العقل الباطن.
الهيكل المطلوب في الرد:
1. رموز الأعماق: شرح الرموز.
2. الرسالة الشعورية: ماذا يحاول العقل الباطن قوله.
3. دمج الرسالة: نصيحة عملية.`;

export const DREAM_SYSTEM_INSTRUCTION_EN = `You are a psychological dream analyst (Jungian & Gestalt).
Analyze dreams based on psychological symbols, not folklore.
Look for repressed emotions, archetypes, and subconscious messages.
Output Structure:
1. Symbol Decoding.
2. Emotional Core.
3. Integration & Advice.`;

export const MEMORY_EXTRACTION_PROMPT = `Analyze the user's text and extract permanent or semi-permanent facts to store in long-term memory (Vector DB).
Return ONLY a JSON array: [{"content": "Fact string", "tags": ["tag1", "tag2"], "importance": 1-5}].
Focus on:
1. Names of key people (e.g., "Boss is Ahmed", "Partner is Sarah").
2. Recurring problems, phobias, or stressors (e.g., "Hates public speaking", "Chronic back pain").
3. Major life events or jobs.
Ignore: Temporary feelings (e.g., "I am hungry", "I am tired") unless they indicate a pattern.`;

// --- FADFADA PROMPTS ---
export const FADFADA_SILENT_PROMPT_AR = `أنت "المستمع الصامت". دورك هو الاستماع فقط.
لا تقاطع، لا تقدم نصائح، لا تحلل.
فقط استخدم عبارات قصيرة جداً (إيماءات) لتشعر المستخدم بوجودك: "أنا سامعك"، "كمل"، "أنا معاك".
الهدف: التنفيس العاطفي الكامل للمستخدم.`;

export const FADFADA_SILENT_PROMPT_EN = `You are the "Silent Listener". Your role is only to listen.
Do not interrupt, advice, or analyze.
Use very short phrases (back-channeling) only: "I'm listening", "Go on", "I'm with you".
Goal: Emotional catharsis.`;

export const FADFADA_FLOW_PROMPT_AR = `أنت صديق مقرب.
تحدث بعفوية، بدون هياكل علاجية أو رسميات.
استخدم لغة عامية ودودة. الهدف هو الدردشة الطبيعية والدعم الودي.`;

export const FADFADA_FLOW_PROMPT_EN = `You are a close friend.
Talk spontaneously, without therapeutic structures or formalities.
Goal: Natural chat and friendly support.`;

// --- STORYTELLING ---
export const GRANDMA_STORY_PROMPT_AR = `أنت "الجدة سكينة" (تيتا).
احكِ قصة ما قبل النوم بصوت دافئ وحنون.
استخدمي عناصر: [HERO], [SETTING], [THEME], [OBJECT].
القصة يجب أن تكون مهدئة، بطيئة الإيقاع، وتساعد على الاسترخاء والنوم.
مدة القراءة التقريبية: 20 دقيقة (نص طويل جداً ومفصل).`;

export const GRANDMA_STORY_PROMPT_EN = `You are "Grandma Sakinnah".
Tell a bedtime story with a warm, soothing voice.
Use elements: [HERO], [SETTING], [THEME], [OBJECT].
The story must be calming, slow-paced, inducing sleep.
Target reading time: 20 mins (Very long, detailed text).`;

export const SLEEP_STORY_PROMPT_AR = GRANDMA_STORY_PROMPT_AR; 

export const STORY_ELEMENTS_AR = {
    heroes: ['أرنب صغير شجاع', 'قطرة مطر مغامرة', 'بومة حكيمة', 'طفل يطير في الأحلام'],
    settings: ['غابة سحرية مضيئة', 'فوق السحاب', 'مكتبة قديمة دافئة', 'شاطئ هادئ تحت النجوم'],
    themes: ['البحث عن الهدوء', 'قوة الصداقة', 'اكتشاف الذات', 'جمال الطبيعة'],
    objects: ['مصباح سحري', 'ريشة ذهبية', 'كتاب عتيق', 'مرآة الزمن']
};

export const STORY_ELEMENTS_EN = {
    heroes: ['A brave little bunny', 'An adventurous raindrop', 'A wise owl', 'A child flying in dreams'],
    settings: ['Magical glowing forest', 'Above the clouds', 'Cozy old library', 'Quiet beach under stars'],
    themes: ['Finding peace', 'Power of friendship', 'Self-discovery', 'Beauty of nature'],
    objects: ['Magic lamp', 'Golden feather', 'Ancient book', 'Time mirror']
};

// --- DATA LISTS ---

export const SLEEP_MUSIC_TRACKS = [
    { id: '1', titleAr: 'مطر خفيف', titleEn: 'Light Rain', duration: '40:00' },
    { id: '2', titleAr: 'أمواج البحر', titleEn: 'Ocean Waves', duration: '40:00' },
    { id: '3', titleAr: 'غابة ليلية', titleEn: 'Night Forest', duration: '40:00' },
    { id: '4', titleAr: 'بيانو هادئ', titleEn: 'Calm Piano', duration: '40:00' },
    { id: '5', titleAr: 'ضوضاء بيضاء', titleEn: 'White Noise', duration: '40:00' }
];

export const DAILY_CHALLENGES: DailyChallenge[] = [
    { id: '1', titleAr: 'تنفس بعمق لمدة 3 دقائق', titleEn: 'Breathe deeply for 3 mins', icon: 'Wind', color: 'bg-blue-100 text-blue-600' },
    { id: '2', titleAr: 'اكتب 3 أشياء تمتن لها', titleEn: 'Write 3 things you are grateful for', icon: 'PenTool', color: 'bg-yellow-100 text-yellow-600' },
    { id: '3', titleAr: 'امشِ لمدة 15 دقيقة', titleEn: 'Walk for 15 mins', icon: 'Footprints', color: 'bg-green-100 text-green-600' },
    { id: '4', titleAr: 'اشرب كوب ماء بوعي كامل', titleEn: 'Drink water with full mindfulness', icon: 'GlassWater', color: 'bg-cyan-100 text-cyan-600' },
    { id: '5', titleAr: 'ابتسم لشخص غريب', titleEn: 'Smile at a stranger', icon: 'Smile', color: 'bg-pink-100 text-pink-600' },
    { id: '6', titleAr: 'امتنع عن السوشيال ميديا لساعة', titleEn: 'No social media for 1 hour', icon: 'Ban', color: 'bg-red-100 text-red-600' },
    { id: '7', titleAr: 'تحدث مع صديق قديم', titleEn: 'Call an old friend', icon: 'Phone', color: 'bg-purple-100 text-purple-600' }
];

export const ASSESSMENT_QUESTIONS: Question[] = [
    {
        id: '1',
        textAr: 'خلال الأسبوعين الماضيين، كم مرة شعرت بقلة الاهتمام أو المتعة في القيام بالأشياء؟',
        textEn: 'Over the last 2 weeks, how often have you been bothered by having little interest or pleasure in doing things?',
        optionsAr: ['أبداً', 'عدة أيام', 'أكثر من نصف الأيام', 'تقريباً كل يوم'],
        optionsEn: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
        id: '2',
        textAr: 'كم مرة شعرت بالحزن، الاكتئاب، أو اليأس؟',
        textEn: 'How often have you been bothered by feeling down, depressed, or hopeless?',
        optionsAr: ['أبداً', 'عدة أيام', 'أكثر من نصف الأيام', 'تقريباً كل يوم'],
        optionsEn: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
        id: '3',
        textAr: 'كم مرة واجهت صعوبة في النوم أو البقاء نائماً، أو النوم أكثر من اللازم؟',
        textEn: 'Trouble falling or staying asleep, or sleeping too much?',
        optionsAr: ['أبداً', 'عدة أيام', 'أكثر من نصف الأيام', 'تقريباً كل يوم'],
        optionsEn: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
        id: '4',
        textAr: 'كم مرة شعرت بالتعب أو قلة الطاقة؟',
        textEn: 'Feeling tired or having little energy?',
        optionsAr: ['أبداً', 'عدة أيام', 'أكثر من نصف الأيام', 'تقريباً كل يوم'],
        optionsEn: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
        id: '5',
        textAr: 'كم مرة عانيت من ضعف الشهية أو الإفراط في الأكل؟',
        textEn: 'Poor appetite or overeating?',
        optionsAr: ['أبداً', 'عدة أيام', 'أكثر من نصف الأيام', 'تقريباً كل يوم'],
        optionsEn: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
        id: '6',
        textAr: 'كم مرة شعرت بالسوء تجاه نفسك (أنك فاشل أو خذلت نفسك)؟',
        textEn: 'Feeling bad about yourself - or that you are a failure or have let yourself down?',
        optionsAr: ['أبداً', 'عدة أيام', 'أكثر من نصف الأيام', 'تقريباً كل يوم'],
        optionsEn: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
        id: '7',
        textAr: 'صعوبة في التركيز على الأشياء (مثل القراءة أو التلفاز)؟',
        textEn: 'Trouble concentrating on things, such as reading the newspaper or watching television?',
        optionsAr: ['أبداً', 'عدة أيام', 'أكثر من نصف الأيام', 'تقريباً كل يوم'],
        optionsEn: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
        id: '8',
        textAr: 'التحرك ببطء شديد أو النشاط المفرط وعدم الاستقرار؟',
        textEn: 'Moving or speaking so slowly that other people could have noticed? Or the opposite?',
        optionsAr: ['أبداً', 'عدة أيام', 'أكثر من نصف الأيام', 'تقريباً كل يوم'],
        optionsEn: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
        id: '9',
        textAr: 'أفكار بأنك ستكون أفضل حالاً لو مت أو إيذاء نفسك؟',
        textEn: 'Thoughts that you would be better off dead, or of hurting yourself?',
        optionsAr: ['أبداً', 'عدة أيام', 'أكثر من نصف الأيام', 'تقريباً كل يوم'],
        optionsEn: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
        id: '10',
        textAr: 'كيف أثرت هذه المشاكل على عملك أو علاقاتك؟',
        textEn: 'How difficult have these problems made it for you to do your work, take care of things at home, or get along with people?',
        optionsAr: ['لم تؤثر', 'قليلاً', 'صعبة جداً', 'صعبة للغاية'],
        optionsEn: ['Not difficult at all', 'Somewhat difficult', 'Very difficult', 'Extremely difficult']
    }
];

export const ACHIEVEMENTS: Achievement[] = [
    { id: '1', titleAr: 'البداية الشجاعة', titleEn: 'Brave Start', descriptionAr: 'أكملت أول جلسة', descriptionEn: 'Completed first session', icon: 'Flag', unlocked: true },
    { id: '2', titleAr: 'الاستمرار', titleEn: 'Consistency', descriptionAr: '3 جلسات متتالية', descriptionEn: '3 sessions in a row', icon: 'Calendar', unlocked: false },
    { id: '3', titleAr: 'بستاني الروح', titleEn: 'Soul Gardener', descriptionAr: 'وصلت للمستوى 2 في الحديقة', descriptionEn: 'Reached Garden Lvl 2', icon: 'Sprout', unlocked: false },
    { id: '4', titleAr: 'سيد التأمل', titleEn: 'Zen Master', descriptionAr: 'أكملت 5 تمارين تنفس', descriptionEn: 'Completed 5 breathing exercises', icon: 'Wind', unlocked: false },
    { id: '5', titleAr: 'متتبع الأحلام', titleEn: 'Dream Tracker', descriptionAr: 'حللت 3 أحلام', descriptionEn: 'Analyzed 3 dreams', icon: 'Moon', unlocked: false },
    { id: '6', titleAr: 'كاتب يوميات', titleEn: 'Journalist', descriptionAr: 'كتبت 5 تدوينات', descriptionEn: 'Wrote 5 journal entries', icon: 'BookOpen', unlocked: false },
    { id: '7', titleAr: 'الفضفضة', titleEn: 'Venting', descriptionAr: 'استخدمت الفضفضة لأول مرة', descriptionEn: 'Used Fadfada for the first time', icon: 'MessageCircle', unlocked: false },
    { id: '8', titleAr: 'بطل سكينة', titleEn: 'Sakinnah Hero', descriptionAr: 'أكملت 20 جلسة', descriptionEn: 'Completed 20 sessions', icon: 'Trophy', unlocked: false }
];

export const MOCK_REPORTS: MonthlyReport[] = [
    {
        id: '1',
        monthAr: 'أكتوبر 2023',
        monthEn: 'October 2023',
        childName: 'Ahmed',
        diagnosisAr: 'طيف التوحد - المستوى 1',
        diagnosisEn: 'ASD - Level 1',
        progressScore: 75,
        behavioralImprovementsAr: ['تحسن التواصل البصري', 'انخفاض نوبات الغضب'],
        behavioralImprovementsEn: ['Better eye contact', 'Reduced meltdowns'],
        academicRecommendationsAr: ['جداول بصرية', 'فترات راحة حسية'],
        academicRecommendationsEn: ['Visual schedules', 'Sensory breaks'],
        socialSkillsStatusAr: 'في تحسن',
        socialSkillsStatusEn: 'Improving',
        clinicalNotes: 'Ahmed is responding well to positive reinforcement.'
    }
];

// --- SESSION CLOSING PHRASES ---
export const SESSION_CLOSING_PHRASES_AR = [
    "لقد كنت شجاعاً اليوم بمشاركتك. خذ وقتاً للراحة الآن، فقلبك يستحق السكينة.",
    "انتهت جلستنا، لكن خطواتك نحو التعافي مستمرة. تذكر أن كل خطوة صغيرة تُحدث فرقاً.",
    "اترك ما يثقل كاهلك هنا. أنا أحمل عنك هذا العبء قليلاً لترتاح. دمت بخير.",
    "أشكرك على ثقتك بي. تنفس بعمق، وكن فخوراً بنفسك كما أنا فخورة بك.",
    "هنا نتوقف اليوم لنعطي روحك فرصة للهدوء. أنت لست وحدك في هذه الرحلة.",
    "مر الوقت سريعاً بحديثك الصادق. أتمنى لك ليلة هادئة ونوماً مطمئناً.",
    "كلماتك وصلت لقلبي. سنكمل رحلتنا سوياً في المرة القادمة. في حفظ الله.",
    "تذكر أنك أقوى مما تظن. خذ قسطاً من الراحة، وأراك قريباً.",
    "التعافي رحلة وليس سباقاً. لقد قمت بعمل رائع اليوم.",
    "أستودعك الله الذي لا تضيع ودائعه. اطمئن، أنا بانتظارك دائماً.",
    "لأنك تستحق الأفضل، خصص بعض الوقت لنفسك بعد جلستنا. أنت في أمان هنا.",
    "حديثنا اليوم كان مهماً وعميقاً. اسمح لهذه المشاعر أن تهدأ بسلام.",
    "كل يوم هو صفحة جديدة، وجلستنا اليوم كانت سطراً مضيئاً فيها. إلى اللقاء.",
    "سكينة موجودة دائماً لأجلك. لا تتردد في العودة متى احتجت لذلك.",
    "أنت تقوم بعمل عظيم في رعاية نفسك. استمر في هذا العطاء لروحك."
];

export const SESSION_CLOSING_PHRASES_EN = [
    "You were very brave today. Take some time to rest; your heart deserves peace.",
    "Our session ends here, but your healing journey continues. Remember, small steps matter.",
    "Leave your heavy thoughts here with me. Rest your mind now. Stay safe.",
    "Thank you for trusting me. Breathe deeply, and be proud of yourself as I am of you.",
    "We pause here to let your soul settle. You are never alone in this journey.",
    "Time flew by listening to your honest words. Wishing you a calm and restful night.",
    "Your words resonated deeply. We will continue this path together next time.",
    "Remember, you are stronger than you think. Take a break, and see you soon.",
    "Healing is a journey, not a race. You did wonderful work today.",
    "I leave you in peace and safety. Rest assured, I am always here waiting for you.",
    "Because you deserve the best, take some time for yourself after our session. You are safe here.",
    "Our conversation today was meaningful. Allow these feelings to settle peacefully.",
    "Every day is a fresh page, and today's session was a bright line on it. Until next time.",
    "Sakinnah is always here for you. Don't hesitate to return whenever you need.",
    "You are doing a great job taking care of yourself. Keep nurturing your soul."
];