
import { ClinicalDocument, Language } from '../types';

const KNOWLEDGE_VECTOR_STORE: ClinicalDocument[] = [
  // =================================================================
  // 11. GRIEF & LOSS (Dual Process Model, Worden's Tasks)
  // =================================================================
  {
    id: 'grf-001',
    category: 'grief',
    tags: ['death', 'loss', 'dead', 'miss', 'loved one', 'grief', 'فقد', 'موت', 'وفاة', 'حزن', 'خسارة'],
    contentAr: `[نموذج العمليات المزدوجة (Dual Process Model)]
    المرجع: Stroebe & Schut.
    الحزن ليس خطاً مستقيماً. هو "تأرجح" بين:
    1. التوجه نحو الفقد: السماح لنفسك بالبكاء والتذكر والشعور بالألم.
    2. التوجه نحو الاستعادة: القيام بمهام الحياة، تعلم مهارات جديدة، وصرف الانتباه.
    التوازن مطلوب. لا بأس بأن تأخذ "إجازة" من الحزن لتركز في حياتك، ولا بأس بالعودة إليه لاحقاً.`,
    contentEn: `[Dual Process Model of Coping with Bereavement]
    Source: Stroebe & Schut (1999).
    Grief is an oscillation between two orientations:
    1. Loss-Orientation: Feeling the pain, yearning, looking at photos.
    2. Restoration-Orientation: Attending to life changes, distractions, new roles.
    Antidote: It is healthy to oscillate. Taking a "break" from grief to manage life is not betrayal.`,
    source: "Stroebe, M., & Schut, H. (1999)."
  },
  {
    id: 'grf-002',
    category: 'grief',
    tags: ['tasks', 'worden', 'acceptance', 'شجن', 'تقبل'],
    contentAr: `[مهام الحزن الأربع]
    المرجع: William Worden.
    للتكيف مع الفقد يجب: 1. قبول حقيقة الخسارة. 2. عيش ألم الحزن. 3. التكيف مع عالم بدون المفقود. 4. إيجاد صلة دائمة مع المفقود مع بدء حياة جديدة.`,
    contentEn: `[Worden's Four Tasks of Mourning]
    Source: J. William Worden.
    1. Accept the reality of loss. 2. Process the pain of grief. 3. Adjust to a world without the deceased. 4. Find an enduring connection while embarking on a new life.`,
    source: "Worden, J. W. (2008)."
  }
];

export const ragService = {
  retrieveContext: (text: string, language: Language): string => {
    const lowerText = text.toLowerCase();
    const relevantDocs = KNOWLEDGE_VECTOR_STORE.filter(doc => 
      doc.tags.some(tag => lowerText.includes(tag.toLowerCase()))
    );
    
    if (relevantDocs.length === 0) return "";
    
    return relevantDocs
      .map(doc => language === 'ar' ? doc.contentAr : doc.contentEn)
      .join('\n\n---\n\n');
  }
};
