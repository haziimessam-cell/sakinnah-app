
import { ClinicalDocument, Language } from '../types';

const KNOWLEDGE_VECTOR_STORE: ClinicalDocument[] = [
  {
    id: 'dep-001',
    category: 'depression',
    tags: ['cbt', 'activation', 'اكتئاب', 'حزن', 'خمول'],
    contentAr: `[التنشيط السلوكي - Behavioral Activation] المرجع: Martell et al. 
    الخمول في الاكتئاب يؤدي لزيادة الاكتئاب. التدخل السريري: التركيز على "الفعل قبل الدافع". الجدولة التدريجية للأنشطة الممتعة والضرورية.`,
    contentEn: `[Behavioral Activation] Source: Martell et al. Action creates motivation. Clinical focus: Incremental scheduling of mastery and pleasure activities.`,
    source: "Martell, C. R., et al. (2010)."
  },
  {
    id: 'ocd-001',
    category: 'ocd',
    tags: ['erp', 'ocd', 'وسواس', 'قهر', 'طقوس'],
    contentAr: `[التعرض ومنع الاستجابة - ERP] المرجع: Foa et al. 
    جوهر علاج الوسواس هو تعريض المريض للفكرة المزعجة (التعرض) مع منعه من القيام بالطقس القهري (منع الاستجابة). الهدف هو حدوث "التعود" (Habituation) حتى يختفي القلق تلقائياً.`,
    contentEn: `[Exposure and Response Prevention - ERP] Source: Edna Foa et al. The core of OCD treatment is exposing the patient to the intrusive thought (Exposure) while preventing the ritualistic action (Response Prevention). The goal is "Habituation" so anxiety fades naturally.`,
    source: "Foa, E. B. (2010)."
  },
  {
    id: 'act-001',
    category: 'anxiety',
    tags: ['act', 'flexibility', 'قلق', 'مرونة', 'تقبل'],
    contentAr: `[علاج القبول والالتزام - ACT] المرجع: Hayes. 
    الهدف ليس التخلص من القلق، بل "المرونة النفسية". التقنيات: فك الاندماج المعرفي (Cognitive Defusion) لمشاهدة الأفكار كمجرد كلمات وليست حقائق.`,
    contentEn: `[Acceptance & Commitment Therapy - ACT] Source: Steven Hayes. Focus on Psychological Flexibility and Cognitive Defusion. Viewing thoughts as just language, not objective truths.`,
    source: "Hayes, S. C. (2011)."
  },
  {
    id: 'dbt-001',
    category: 'stress',
    tags: ['dbt', 'regulation', 'توتر', 'تنظيم_مشاعر'],
    contentAr: `[العلاج الجدلي السلوكي - DBT] المرجع: Linehan. 
    تحمل الضيق (Distress Tolerance). تقنية TIPP: تغيير درجة حرارة الجسم، التمرين المكثف، التنفس الإيقاعي، لإعادة ضبط الجهاز العصبي اللاإرادي.`,
    contentEn: `[Dialectical Behavior Therapy - DBT] Source: Linehan. Distress Tolerance. TIPP skill: Temperature, Intense exercise, Paced breathing to reset the autonomic nervous system.`,
    source: "Linehan, M. M. (2014)."
  },
  {
    id: 'rel-001',
    category: 'relationships',
    tags: ['gottman', 'conflict', 'علاقات', 'زواج', 'خلاف'],
    contentAr: `[مختبر العلاقات - غوتمان] المرجع: John Gottman. 
    الفرسان الأربعة للهلاك: النقد، الازدراء، الدفاعية، والمماطلة. التدخل: استبدال النقد بـ "البداية الناعمة" (Softened Start-up).`,
    contentEn: `[Gottman Method] The Four Horsemen: Criticism, Contempt, Defensiveness, and Stonewalling. Clinical intervention: Gentle Start-up.`,
    source: "Gottman, J. (1999)."
  }
];

export const ragService = {
  retrieveContext: (text: string, language: Language): string => {
    const lowerText = text.toLowerCase();
    const relevantDocs = KNOWLEDGE_VECTOR_STORE.filter(doc => 
      doc.tags.some(tag => lowerText.includes(tag.toLowerCase())) || 
      text.includes(doc.category)
    );
    
    if (relevantDocs.length === 0) return "";
    
    const intro = language === 'ar' ? "سياق سريري معتمد للاسترشاد به:" : "Clinical evidence-based context for guidance:";
    return `\n${intro}\n` + relevantDocs
      .map(doc => `[${doc.source}]: ${language === 'ar' ? doc.contentAr : doc.contentEn}`)
      .join('\n\n---\n\n');
  }
};
