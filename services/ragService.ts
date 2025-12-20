
import { ClinicalDocument, Language } from '../types';

const KNOWLEDGE_VECTOR_STORE: ClinicalDocument[] = [
  {
    id: 'dep-001',
    category: 'depression',
    tags: ['cbt', 'activation', 'اكتئاب', 'حزن', 'خمول'],
    contentAr: `[التنشيط السلوكي - Behavioral Activation]
    المرجع: Martell et al. 
    الخمول في الاكتئاب يؤدي لزيادة الاكتئاب. الحل ليس في انتظار الرغبة، بل في الفعل الصغير (المشي 5 دقائق) لتوليد الطاقة.`,
    contentEn: `[Behavioral Activation] Source: Martell et al. Depression thrives on inactivity. Action creates motivation, not the other way around.`,
    source: "Martell, C. R., et al. (2010)."
  },
  {
    id: 'anx-001',
    category: 'anxiety',
    tags: ['mindfulness', 'gad', 'قلق', 'توتر', 'تفكير'],
    contentAr: `[اليقظة الذهنية للقلق] المرجع: Jon Kabat-Zinn. القلق هو العيش في المستقبل. اليقظة تعيد العقل للحاضر عبر مراقبة التنفس والحواس.`,
    contentEn: `[Mindfulness for Anxiety] Source: Kabat-Zinn. Anxiety lives in the future; mindfulness anchors the mind in the present.`,
    source: "Kabat-Zinn, J. (2013)."
  },
  {
    id: 'ocd-001',
    category: 'ocd',
    tags: ['erp', 'obsessions', 'وسواس', 'تكرار'],
    contentAr: `[التعرض ومنع الاستجابة - ERP] المرجع: Foa et al. مواجهة الفكرة الوسواسية بدون القيام بالفعل القهري يقلل القلق تدريجياً على المدى البعيد.`,
    contentEn: `[Exposure & Response Prevention] Source: Foa et al. Facing the obsession without the compulsion breaks the cycle of anxiety.`,
    source: "Foa, E. B., et al. (2012)."
  },
  {
    id: 'rel-001',
    category: 'relationships',
    tags: ['gottman', 'conflict', 'علاقات', 'زواج', 'خلاف'],
    contentAr: `[مختبر العلاقات - غوتمان] المرجع: John Gottman. مفتاح نجاح العلاقات هو "نسبة الإيجابية إلى السلبية" (5:1). في الخلافات، "الازدراء" هو أكبر منبئ للانفصال.`,
    contentEn: `[Gottman Method] The Magic Ratio (5:1). Contempt is the single greatest predictor of relationship failure.`,
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
    
    return relevantDocs
      .map(doc => language === 'ar' ? doc.contentAr : doc.contentEn)
      .join('\n\n---\n\n');
  }
};
