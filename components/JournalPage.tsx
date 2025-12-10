
import React, { useState, useEffect } from 'react';
import { Language, JournalEntry, User } from '../types';
import { translations } from '../translations';
import { ArrowLeft, ArrowRight, PenTool, Calendar, Trash2, Save, Smile, Meh, Frown, Plus, X, Sparkles } from 'lucide-react';
import { syncService } from '../services/syncService';
import { generateContent } from '../services/geminiService';

interface Props {
  onBack: () => void;
  language: Language;
  user: User;
}

const JournalPage: React.FC<Props> = ({ onBack, language, user }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newEntryText, setNewEntryText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
      const savedJournal = localStorage.getItem('sakinnah_journal');
      if (savedJournal) {
          try {
              const parsed = JSON.parse(savedJournal);
              const formatted = parsed.map((e: any) => ({ ...e, date: new Date(e.date) }));
              setEntries(formatted);
          } catch(e) { console.error(e); }
      }
  }, []);

  const analyzeSentimentOffline = (text: string): 'positive' | 'neutral' | 'negative' => {
      const positiveWords = ['happy', 'good', 'great', 'excellent', 'love', 'wonderful', 'blessed', 'calm', 'peace', 'سعيد', 'جيد', 'ممتاز', 'حب', 'رائع', 'هدوء', 'سلام', 'الحمدلله', 'جميل'];
      const negativeWords = ['sad', 'bad', 'terrible', 'hate', 'angry', 'anxious', 'afraid', 'pain', 'hurt', 'حزين', 'سيء', 'فظيع', 'كره', 'غضب', 'قلق', 'خوف', 'ألم', 'وجع'];
      
      let score = 0;
      const lowerText = text.toLowerCase();
      
      positiveWords.forEach(w => { if(lowerText.includes(w)) score++; });
      negativeWords.forEach(w => { if(lowerText.includes(w)) score--; });
      
      if (score > 0) return 'positive';
      if (score < 0) return 'negative';
      return 'neutral';
  };

  const handleSave = async () => {
      if (!newEntryText.trim()) return;
      
      setAnalyzing(true);
      
      let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
      let tags: string[] = [];

      try {
          if (navigator.onLine) {
              const prompt = language === 'ar' 
                ? `قم بتحليل النص التالي لمذكرات يومية. استخرج المشاعر (positive/neutral/negative) وأهم 3 هاشتاجات تصف الحالة. رد بصيغة JSON فقط: {"sentiment": "...", "tags": ["..."]}. النص: "${newEntryText}"`
                : `Analyze this journal entry. Return JSON ONLY: {"sentiment": "positive" | "neutral" | "negative", "tags": ["tag1", "tag2"]}. Text: "${newEntryText}"`;
              
              const aiResult = await generateContent(prompt);
              if (aiResult) {
                  const cleaned = aiResult.replace(/```json/g, '').replace(/```/g, '').trim();
                  const parsed = JSON.parse(cleaned);
                  sentiment = parsed.sentiment?.toLowerCase() || 'neutral';
                  tags = parsed.tags || [];
              } else {
                  sentiment = analyzeSentimentOffline(newEntryText);
                  tags = ['#Offline'];
              }
          } else {
              sentiment = analyzeSentimentOffline(newEntryText);
              tags = ['#Offline'];
          }
      } catch (e) {
          console.error("Analysis failed", e);
          sentiment = analyzeSentimentOffline(newEntryText);
      }

      const newEntry: JournalEntry = {
          id: Date.now().toString(),
          date: new Date(),
          text: newEntryText,
          tags: tags.slice(0, 3), 
          sentiment
      };
      
      const updatedEntries = [newEntry, ...entries];
      setEntries(updatedEntries);
      localStorage.setItem('sakinnah_journal', JSON.stringify(updatedEntries));
      syncService.pushToCloud(user.username);
      
      setNewEntryText('');
      setIsCreating(false);
      setAnalyzing(false);
  };

  const handleDelete = (id: string) => {
      if (confirm(isRTL ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) {
          const updated = entries.filter(e => e.id !== id);
          setEntries(updated);
          localStorage.setItem('sakinnah_journal', JSON.stringify(updated));
          syncService.pushToCloud(user.username);
      }
  };

  const getSentimentIcon = (sentiment: string) => {
      switch(sentiment) {
          case 'positive': return <Smile className="text-green-500" size={20} />;
          case 'negative': return <Frown className="text-red-500" size={20} />;
          default: return <Meh className="text-gray-500" size={20} />;
      }
  };

  const getSentimentLabel = (sentiment: string) => {
      switch(sentiment) {
          case 'positive': return t.positive;
          case 'negative': return t.negative;
          default: return t.neutral;
      }
  };

  return (
    <div className="h-full bg-transparent flex flex-col pt-safe pb-safe animate-fadeIn overflow-hidden relative">
        <header className="bg-white/40 backdrop-blur-xl px-4 py-4 shadow-sm sticky top-0 z-20 flex items-center gap-3 border-b border-white/20">
            <button onClick={onBack} className="p-2 hover:bg-white/60 rounded-full transition-colors border border-transparent hover:border-white/40">
                {isRTL ? <ArrowRight size={24} className="text-gray-600" /> : <ArrowLeft size={24} className="text-gray-600" />}
            </button>
            <h1 className="text-xl font-bold text-gray-900">{t.myJournal}</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            
            {/* Create New Area */}
            {isCreating ? (
                <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-5 shadow-lg border border-white/50 animate-scaleIn">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-700">{t.newEntry}</h3>
                        <button onClick={() => setIsCreating(false)} className="p-1 bg-gray-100 rounded-full hover:bg-gray-200">
                            <X size={16} />
                        </button>
                    </div>
                    <textarea 
                        value={newEntryText}
                        onChange={(e) => setNewEntryText(e.target.value)}
                        placeholder={t.journalPlaceholder}
                        className="w-full h-40 bg-white/50 border border-white/60 rounded-2xl p-4 text-sm resize-none focus:ring-2 focus:ring-primary-200 outline-none transition-all placeholder-gray-400 mb-4"
                        autoFocus
                    />
                    <div className="flex justify-end">
                        <button 
                            onClick={handleSave}
                            disabled={analyzing || !newEntryText.trim()}
                            className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-primary-700 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {analyzing ? (
                                <>
                                    <Sparkles size={18} className="animate-spin" />
                                    <span>{language === 'ar' ? 'جاري التحليل...' : 'Analyzing...'}</span>
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    <span>{t.save}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={() => setIsCreating(true)}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 font-bold group"
                >
                    <Plus size={24} className="group-hover:rotate-90 transition-transform" />
                    <span>{t.newEntry}</span>
                </button>
            )}

            {/* List */}
            {entries.length > 0 ? (
                <div className="space-y-4 pb-20">
                    {entries.map((entry) => (
                        <div key={entry.id} className="bg-white/40 backdrop-blur-md p-5 rounded-2xl border border-white/40 shadow-sm hover:shadow-md transition-all group relative">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                    <Calendar size={12} />
                                    {new Date(entry.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                                </div>
                                <button 
                                    onClick={() => handleDelete(entry.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            
                            <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap font-medium">{entry.text}</p>
                            
                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center gap-2 bg-white/30 px-3 py-1.5 rounded-xl border border-white/30">
                                    {getSentimentIcon(entry.sentiment)}
                                    <span className={`text-xs font-bold ${entry.sentiment === 'positive' ? 'text-green-600' : entry.sentiment === 'negative' ? 'text-red-600' : 'text-gray-600'}`}>
                                        {getSentimentLabel(entry.sentiment)}
                                    </span>
                                </div>
                                
                                <div className="flex gap-1">
                                    {entry.tags?.map((tag, i) => (
                                        <span key={i} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-bold border border-blue-100">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <PenTool size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">{t.noEntries}</p>
                </div>
            )}
        </main>
    </div>
  );
};

export default JournalPage;
