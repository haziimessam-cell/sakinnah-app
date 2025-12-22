
import React, { useState, useRef, useEffect } from 'react';
import { Language, User, Role, Message } from '../types';
import { translations } from '../translations';
import { sendMessageStreamToGemini, initializeChat } from '../services/geminiService';
// Fix: Added missing ChevronRight import for the mode selection list
import { 
    ArrowRight, ArrowLeft, Send, ShieldCheck, Heart, 
    EyeOff, Lock, HeartHandshake, MessageSquare, Sparkles, CloudSun, ChevronRight
} from 'lucide-react';
import ChatMessage from './ChatMessage';

interface Props {
  onBack: () => void;
  language: Language;
  user: User;
}

type FadfadaMode = 'silent' | 'voice' | 'flow' | 'hug';

const FadfadaSection: React.FC<Props> = ({ onBack, language, user }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  
  const [mode, setMode] = useState<FadfadaMode | null>(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isHugging, setIsHugging] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const startMode = async (selectedMode: FadfadaMode) => {
      setMode(selectedMode);
      setMessages([]);
      
      if (selectedMode !== 'hug') {
          setIsStreaming(true);
          const sys = selectedMode === 'silent' 
            ? (isRTL ? "أنت مستمع صامت، ردودك محدودة جداً واحتوائية بكلمة أو كلمتين." : "Silent listener mode, minimal and containing responses of 1-2 words.")
            : (isRTL ? "أنت رفيق فضفضة متعاطف للغاية، نادِ المستخدم باسمه وشجعه على الحديث." : "Highly empathetic venting companion, call the user by name and encourage them.");
          await initializeChat("Fadfada", sys, undefined, language);
          
          const aiGreet = language === 'ar' ? t.aiGreetVent : t.aiGreetVent;
          const aiMsg: Message = { id: Date.now().toString(), role: Role.MODEL, text: aiGreet, timestamp: new Date() };
          setMessages([aiMsg]);
          setIsStreaming(false);
      }
  };

  const handleSend = async () => {
      if (!inputText.trim()) return;
      const userMsg: Message = { id: Date.now().toString(), role: Role.USER, text: inputText, timestamp: new Date() };
      setMessages(prev => [...prev, userMsg]);
      setInputText('');
      setIsStreaming(true);

      try {
          const stream = sendMessageStreamToGemini(userMsg.text, language);
          let aiText = '';
          const aiId = (Date.now() + 1).toString();
          setMessages(prev => [...prev, { id: aiId, role: Role.MODEL, text: '', timestamp: new Date() }]);
          
          for await (const chunk of stream) {
              aiText += chunk;
              setMessages(prev => prev.map(m => m.id === aiId ? { ...m, text: aiText } : m));
          }
      } catch (e) { console.error(e); } finally { setIsStreaming(false); }
  };

  return (
    <div className="h-full bg-[#FFFBF7] flex flex-col pt-safe pb-safe animate-fadeIn overflow-hidden relative">
        {/* Artistic Background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-rose-200/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-orange-200/20 rounded-full blur-[100px] pointer-events-none"></div>

        <header className="px-8 py-6 flex items-center justify-between border-b border-orange-100 bg-white/60 backdrop-blur-2xl z-20">
            <div className="flex items-center gap-5">
                <button onClick={() => mode ? setMode(null) : onBack()} className="p-3 bg-orange-50 rounded-2xl text-orange-600 border border-orange-100 hover:bg-orange-100 transition-all">
                    {isRTL ? <ArrowRight size={22} /> : <ArrowLeft size={22} />}
                </button>
                <div>
                    <h1 className="text-lg font-black text-orange-950 tracking-tight uppercase">{mode ? t[`${mode}Mode`] || t.ventingWing : t.ventingWing}</h1>
                    <p className="text-[10px] text-orange-400 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <Lock size={10} /> {isRTL ? 'مساحة سرية ومحمية' : 'PROTECTED PRIVATE SPACE'}
                    </p>
                </div>
            </div>
            {!mode && <CloudSun size={28} className="text-orange-300 animate-pulse" />}
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar relative z-10">
            {!mode ? (
                <div className="p-10 space-y-10 animate-slideUp">
                    <div className="bg-gradient-to-br from-orange-400 to-rose-500 p-10 rounded-[3.5rem] text-white shadow-2xl shadow-rose-500/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-[2000ms]"><Sparkles size={120} /></div>
                        <h2 className="text-3xl font-black mb-3 italic tracking-tight">{t.ventingWing}</h2>
                        <p className="text-sm opacity-90 leading-relaxed font-medium">{t.ventingDesc}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                        {[
                            { id: 'flow', title: isRTL ? 'تدفق شعوري' : 'Emotional Flow', icon: <MessageSquare size={28} />, desc: isRTL ? 'حوار تفاعلي للفضفضة العميقة' : 'Interactive deep venting' },
                            { id: 'silent', title: isRTL ? 'مستمع صامت' : 'Silent Listener', icon: <EyeOff size={28} />, desc: isRTL ? 'تفريغ دون أي مقاطعة' : 'Venting without interruption' },
                            { id: 'hug', title: isRTL ? 'احتواء رقمي' : 'Digital Containment', icon: <HeartHandshake size={28} />, desc: isRTL ? 'تواصل حسي باللمس والنبض' : 'Sensory touch & pulse connection' }
                        ].map((item) => (
                            <button 
                                key={item.id}
                                onClick={() => startMode(item.id as any)}
                                className="bg-white p-8 rounded-[3rem] border border-orange-50 shadow-sm flex items-center gap-8 active:scale-[0.98] transition-all text-start group hover:border-orange-300"
                            >
                                <div className="w-18 h-18 bg-orange-50 text-orange-500 rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">{item.icon}</div>
                                <div className="flex-1">
                                    <h3 className="font-black text-orange-900 text-lg mb-1">{item.title}</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.desc}</p>
                                </div>
                                <ChevronRight size={20} className="text-orange-200 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                            </button>
                        ))}
                    </div>
                </div>
            ) : mode === 'hug' ? (
                <div className="flex flex-col items-center justify-center h-full p-10 text-center space-y-16 animate-fadeIn">
                    <div 
                        onPointerDown={() => { setIsHugging(true); if(navigator.vibrate) navigator.vibrate([10, 100, 10]); }}
                        onPointerUp={() => setIsHugging(false)}
                        className={`w-72 h-72 rounded-full flex items-center justify-center transition-all duration-[1500ms] cursor-pointer select-none border-8 perspective-1000 ${isHugging ? 'scale-110 bg-rose-500 border-rose-200 shadow-[0_0_100px_rgba(244,63,94,0.6)] rotate-12' : 'bg-white border-rose-50 shadow-2xl shadow-rose-100'}`}
                    >
                        <Heart size={120} className={`transition-all duration-[1000ms] ${isHugging ? 'text-white fill-white scale-125' : 'text-rose-300 animate-pulse'}`} />
                    </div>
                    <div className="space-y-6">
                        <h2 className="text-3xl font-black text-rose-900 tracking-tighter italic">{isHugging ? (isRTL ? 'أنا معك الآن...' : 'I am with you now...') : (isRTL ? 'اضغط مطولاً للسكينة' : 'Hold for Serenity')}</h2>
                        <p className="text-gray-400 text-sm max-w-xs mx-auto font-medium leading-relaxed">
                            {isRTL ? 'ضع إصبعك على القلب، واشعر بمحاكاة النبض لتهدئة جهازك العصبي.' : 'Place your finger on the heart; feel the simulated pulse to calm your nervous system.'}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="p-8 space-y-10 pb-40">
                    {messages.map((m) => (
                        <ChatMessage key={m.id} msg={m} language={language} isStreaming={false} isSpeaking={false} copiedId={null} onSpeak={()=>{}} onCopy={()=>{}} onBookmark={()=>{}} />
                    ))}
                    {isStreaming && (
                        <div className="text-start px-10">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            )}
        </main>

        {mode && mode !== 'hug' && (
            <div className="p-8 bg-white/80 backdrop-blur-2xl border-t border-orange-100 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
                <div className="flex gap-4 items-end max-w-4xl mx-auto">
                    <textarea 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="flex-1 bg-orange-50/50 border border-orange-100 rounded-[2.2rem] p-6 text-base focus:ring-2 focus:ring-orange-200 outline-none h-20 resize-none transition-all"
                        placeholder={isRTL ? "أفرغ ما بقلبك، سأستمع لك..." : "Release your heart, I am listening..."}
                    />
                    <button onClick={handleSend} disabled={!inputText.trim() || isStreaming} className="w-20 h-20 bg-orange-600 text-white rounded-[1.8rem] shadow-2xl active:scale-90 transition-all disabled:opacity-50 shadow-orange-500/30 flex items-center justify-center">
                        <Send size={28} className={isRTL ? 'rotate-180' : ''} />
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default FadfadaSection;
