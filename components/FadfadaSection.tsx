
import React, { useState, useRef, useEffect } from 'react';
import { Language, User, Role, Message, OutputMode } from '../types';
import { translations } from '../translations';
import { sendMessageStreamToGemini, initializeChat, generateSpeech } from '../services/geminiService';
import { 
    ArrowRight, ArrowLeft, Send, ShieldCheck, Heart, 
    EyeOff, Lock, HeartHandshake, MessageSquare, Sparkles, CloudSun, ChevronRight, Headphones, Play, Pause, Volume2
} from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { triggerHaptic } from '../services/hapticService';

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
  
  // Output mode management
  const [outputMode, setOutputMode] = useState<OutputMode | null>(user.preferredOutput || null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const getVoiceForFadfada = () => {
    return user.gender === 'female' ? 'Charon' : 'Kore';
  };

  const stopAudio = () => {
    if (currentSourceRef.current) {
      try { currentSourceRef.current.stop(); } catch(e){}
      currentSourceRef.current = null;
    }
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const speakAIResponse = async (text: string) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    
    stopAudio();
    setIsSpeaking(true);
    
    const result = await generateSpeech(text, getVoiceForFadfada());
    if (result && result.audioBuffer && outputMode === 'audio') {
      const source = audioCtxRef.current.createBufferSource();
      source.buffer = result.audioBuffer;
      source.connect(audioCtxRef.current.destination);
      source.onended = () => setIsSpeaking(false);
      currentSourceRef.current = source;
      source.start(0);
    } else {
      setIsSpeaking(false);
    }
  };

  const startMode = async (selectedMode: FadfadaMode) => {
      setMode(selectedMode);
      setMessages([]);
      
      if (selectedMode !== 'hug') {
          setIsStreaming(true);
          const toneInstruction = user.gender === 'female' 
            ? "VOICE TONE: Male, firm, attentive, calm." 
            : "VOICE TONE: Female, soft, gentle, caring.";

          const sys = selectedMode === 'silent' 
            ? (isRTL ? `أنت مستمع صامت، ردودك محدودة جداً واحتوائية بكلمة أو كلمتين. ${toneInstruction}` : `Silent listener mode, minimal and containing responses of 1-2 words. ${toneInstruction}`)
            : (isRTL ? `أنت رفيق فضفضة متعاطف للغاية، نادِ المستخدم باسمه وشجعه على الحديث. ${toneInstruction}` : `Highly empathetic venting companion, call the user by name and encourage them. ${toneInstruction}`);
          
          await initializeChat("Fadfada", sys, undefined, language);
          
          const aiGreet = isRTL ? "أنا هنا لأسمعك، تفضل بالحديث." : "I am here to listen, please go ahead.";
          const aiMsg: Message = { id: Date.now().toString(), role: Role.MODEL, text: aiGreet, timestamp: new Date() };
          setMessages([aiMsg]);
          setIsStreaming(false);

          if (outputMode === 'audio') {
              await speakAIResponse(aiGreet);
          }
      }
  };

  const handleSend = async () => {
      if (!inputText.trim() || isStreaming) return;
      const userMsg: Message = { id: Date.now().toString(), role: Role.USER, text: inputText, timestamp: new Date() };
      setMessages(prev => [...prev, userMsg]);
      setInputText('');
      setIsStreaming(true);
      triggerHaptic();

      try {
          const stream = sendMessageStreamToGemini(userMsg.text, language);
          let aiText = '';
          const aiId = (Date.now() + 1).toString();
          setMessages(prev => [...prev, { id: aiId, role: Role.MODEL, text: '', timestamp: new Date() }]);
          
          for await (const chunk of stream) {
              aiText += chunk;
              setMessages(prev => prev.map(m => m.id === aiId ? { ...m, text: aiText } : m));
          }

          if (outputMode === 'audio') {
              await speakAIResponse(aiText);
          }
      } catch (e) { console.error(e); } finally { setIsStreaming(false); }
  };

  if (!mode) {
      return (
        <div className="h-full bg-[#FFFBF7] flex flex-col pt-safe pb-safe animate-fadeIn overflow-hidden relative">
            <header className="px-8 py-6 flex items-center justify-between border-b border-orange-100 bg-white/60 backdrop-blur-2xl z-20">
                <div className="flex items-center gap-5">
                    <button onClick={onBack} className="p-3 bg-orange-50 rounded-2xl text-orange-600 border border-orange-100 hover:bg-orange-100 transition-all">
                        {isRTL ? <ArrowRight size={22} /> : <ArrowLeft size={22} />}
                    </button>
                    <div>
                        <h1 className="text-lg font-black text-orange-950 tracking-tight uppercase">{t.FADFADA}</h1>
                    </div>
                </div>
                <CloudSun size={28} className="text-orange-300 animate-pulse" />
            </header>
            <main className="flex-1 overflow-y-auto no-scrollbar p-10 space-y-10 animate-slideUp">
                <div className="bg-gradient-to-br from-orange-400 to-rose-500 p-10 rounded-[3.5rem] text-white shadow-2xl shadow-rose-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-[2000ms]"><Sparkles size={120} /></div>
                    <h2 className="text-3xl font-black mb-3 italic tracking-tight">{t.FADFADA}</h2>
                    <p className="text-sm opacity-90 leading-relaxed font-medium">{t.FADFADA_DESC}</p>
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
            </main>
        </div>
      );
  }

  if (mode === 'hug') {
      return (
          <div className="h-full bg-rose-50 flex flex-col items-center justify-center p-10 text-center space-y-16 animate-fadeIn relative">
              <button onClick={() => setMode(null)} className="absolute top-10 left-10 p-3 bg-white rounded-full shadow-sm text-rose-500">
                  {isRTL ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
              </button>
              <div 
                  onPointerDown={() => { setIsHugging(true); if(navigator.vibrate) navigator.vibrate([10, 100, 10]); }}
                  onPointerUp={() => setIsHugging(false)}
                  className={`w-72 h-72 rounded-full flex items-center justify-center transition-all duration-[1500ms] cursor-pointer select-none border-8 ${isHugging ? 'scale-110 bg-rose-500 border-rose-200 shadow-[0_0_100px_rgba(244,63,94,0.6)] rotate-12' : 'bg-white border-rose-50 shadow-2xl shadow-rose-100'}`}
              >
                  <Heart size={120} className={`transition-all duration-[1000ms] ${isHugging ? 'text-white fill-white scale-125' : 'text-rose-300 animate-pulse'}`} />
              </div>
              <div className="space-y-6">
                  <h2 className="text-3xl font-black text-rose-900 tracking-tighter italic">{isHugging ? (isRTL ? 'أنا معك الآن...' : 'I am with you now...') : (isRTL ? 'اضغط مطولاً للسكينة' : 'Hold for Serenity')}</h2>
              </div>
          </div>
      );
  }

  if (!outputMode) {
    return (
      <div className="h-full bg-[#FFFBF7] flex flex-col items-center justify-center p-8 text-center animate-m3-fade-in">
        <Headphones size={64} className="text-orange-500 mb-6 animate-float" />
        <h2 className="text-2xl font-bold text-orange-900 mb-2">{t.outputModeTitle}</h2>
        <div className="grid grid-cols-1 gap-4 w-full max-w-sm mt-8">
          <button onClick={() => setOutputMode('text')} className="p-6 bg-white border border-orange-100 rounded-[2.5rem] shadow-sm flex items-center gap-6 active:scale-95 text-start">
            <div className="p-4 bg-orange-50 text-orange-500 rounded-2xl"><MessageSquare size={28} /></div>
            <div><h3 className="font-bold text-lg">{t.textMode}</h3><p className="text-xs text-gray-400">{t.textModeDesc}</p></div>
          </button>
          <button onClick={() => setOutputMode('audio')} className="p-6 bg-white border border-orange-100 rounded-[2.5rem] shadow-sm flex items-center gap-6 active:scale-95 text-start">
            <div className="p-4 bg-orange-100 text-orange-600 rounded-2xl"><Volume2 size={28} /></div>
            <div><h3 className="font-bold text-lg">{t.audioMode}</h3><p className="text-xs text-gray-400">{t.audioModeDesc}</p></div>
          </button>
        </div>
        <button onClick={() => setMode(null)} className="mt-12 text-orange-600 font-bold">{t.back}</button>
      </div>
    );
  }

  if (outputMode === 'audio') {
    return (
      <div className="h-full bg-[#FFFBF7] flex flex-col animate-m3-fade-in relative overflow-hidden">
        <header className="px-6 py-4 flex items-center justify-between z-20">
          <button onClick={() => { stopAudio(); setMode(null); }} className="p-3 text-orange-600 -ms-3 rounded-full">
            {isRTL ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
          </button>
          <div className="text-center flex-1">
             <h1 className="text-sm font-bold opacity-60 uppercase tracking-widest">{t.listeningToPersona.replace('{name}', 'سكينة')}</h1>
          </div>
          <button onClick={() => { stopAudio(); setOutputMode('text'); }} className="p-3 text-orange-600 bg-orange-50 rounded-2xl"><MessageSquare size={20} /></button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-8 space-y-16 relative z-10">
          <div className="relative">
              <div className={`absolute inset-[-60px] bg-orange-500/10 rounded-full blur-[80px] transition-all duration-1000 ${isSpeaking ? 'scale-150 opacity-100' : 'scale-100 opacity-20'}`}></div>
              <div className={`w-64 h-64 rounded-[4rem] bg-white border-8 border-white shadow-2xl flex items-center justify-center relative z-10 transition-all duration-700 ${isSpeaking ? 'scale-105' : ''}`}>
                  <div className="text-8xl animate-float">🧘‍♀️</div>
              </div>
          </div>
          <div className="flex items-center gap-8">
              <button 
                onClick={() => {
                  if (isPaused) { audioCtxRef.current?.resume(); setIsPaused(false); setIsSpeaking(true); }
                  else { audioCtxRef.current?.suspend(); setIsPaused(true); setIsSpeaking(false); }
                }}
                disabled={isStreaming}
                className="w-24 h-24 bg-orange-600 text-white rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-all shadow-orange-600/30"
              >
                  {isPaused ? <Play size={40} fill="currentColor" /> : <Pause size={40} fill="currentColor" />}
              </button>
          </div>
        </main>

        <footer className="p-10 z-20">
          <ChatInput 
            inputText={inputText} 
            setInputText={setInputText} 
            onSend={handleSend} 
            isListening={false} 
            onToggleMic={()=>{}} 
            isStreaming={isStreaming} 
            language={language} 
            t={t} 
            isRTL={isRTL} 
          />
        </footer>
      </div>
    );
  }

  return (
    <div className="h-full bg-white flex flex-col animate-m3-fade-in">
        <header className="px-6 py-4 flex items-center bg-white border-b border-m3-outline/5 z-20">
            <button onClick={() => setMode(null)} className="p-3 text-orange-600 -ms-3 hover:bg-orange-50 rounded-full transition-all">
                {isRTL ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
            </button>
            <div className="flex-1 px-3">
                <h1 className="text-[17px] font-bold text-m3-onSurface">{mode === 'silent' ? (isRTL ? 'مستمع صامت' : 'Silent Listener') : (isRTL ? 'تدفق شعوري' : 'Emotional Flow')}</h1>
            </div>
            <button onClick={() => setOutputMode('audio')} className="p-3 text-orange-600 hover:bg-orange-50 rounded-full transition-all">
                <Headphones size={20} />
            </button>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
            {messages.map(m => (
                <ChatMessage 
                    key={m.id} 
                    msg={m} 
                    language={language} 
                    isStreaming={isStreaming && m.role === Role.MODEL && m.text === ""} 
                    isSpeaking={false}
                    onSpeak={() => speakAIResponse(m.text)} 
                    onCopy={() => navigator.clipboard.writeText(m.text)} 
                    onBookmark={() => {}} 
                />
            ))}
            <div ref={messagesEndRef} />
        </div>

        <div className="p-6 bg-white border-t border-m3-outline/5">
            <ChatInput 
              inputText={inputText} 
              setInputText={setInputText} 
              onSend={handleSend} 
              isListening={false} 
              onToggleMic={()=>{}} 
              isStreaming={isStreaming} 
              language={language} 
              t={t} 
              isRTL={isRTL} 
            />
        </div>
    </div>
  );
};

export default FadfadaSection;
