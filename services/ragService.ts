
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
    id: 'asd-001',
    category: 'sprouts',
    tags: ['autism', 'social_stories', 'توحد', 'تواصل', 'أطفال'],
    contentAr: `[قصص المواقف الاجتماعية] المرجع: Carol Gray. 
    استخدام الجمل الوصفية، المنظورية، والتوجيهية لمساعدة الطفل على فهم المواقف الغامضة وتقليل القلق الاجتماعي.`,
    contentEn: `[Social Stories] Source: Carol Gray. Using descriptive, perspective, and directive sentences to help children understand ambiguous situations and reduce social anxiety.`,
    source: "Gray, C. (2010)."
  },
  {
    id: 'asd-002',
    category: 'sprouts',
    tags: ['aba', 'reinforcement', 'سلوك', 'تعزيز'],
    contentAr: `[تحليل السلوك التطبيقي - ABA] المرجع: Skinner/Lovaas. 
    تقسيم المهارات المعقدة إلى خطوات صغيرة مع استخدام التعزيز الإيجابي الفوري لتطوير مهارات التواصل الاجتماعي والاستقلالية.`,
    contentEn: `[Applied Behavior Analysis - ABA] Breaking complex skills into small steps with immediate positive reinforcement to develop social communication and independence.`,
    source: "Cooper, J. O., et al. (2007)."
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
