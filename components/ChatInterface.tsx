
import React, { useState, useEffect, useRef } from 'react';
import { User, Message, Role, Category, Language, OutputMode } from '../types';
import { sendMessageStreamToGemini, initializeChat, getInitialAISalutation, generateSessionSummary, generateSpeech } from '../services/geminiService';
import { liveVoiceService } from '../services/liveVoiceService';
import { translations } from '../translations';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
// Add Phone to the imports from lucide-react
import { ArrowLeft, ArrowRight, ShieldCheck, Sparkles, Volume2, Mic, Play, Pause, LogOut, Loader2, MessageSquare, Headphones, X, VolumeX, MicOff, Phone } from 'lucide-react';
import { triggerHaptic, triggerSuccessHaptic } from '../services/hapticService';

interface Props {
  user: User;
  category: Category;
  language: Language;
  onBack: () => void;
  therapyMode?: 'GENERAL' | 'STORYTELLING' | 'DISTINCT_MINDS';
  onUpdateUser?: (updatedUser: User) => void;
}

const ChatInterface: React.FC<Props> = ({ user, category, language, onBack, therapyMode, onUpdateUser }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  
  const [outputMode, setOutputMode] = useState<OutputMode | null>(user.preferredOutput || null);
  const [sessionState, setSessionState] = useState<'idle' | 'listening' | 'speaking' | 'thinking'>('idle');
  const [userVolume, setUserVolume] = useState(0);
  const [transcript, setTranscript] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputMode === 'audio') {
        startVoiceSession();
    } else if (outputMode === 'text') {
        initTextSession();
    }
    return () => liveVoiceService.stop();
  }, [outputMode]);

  const getPersonaInstruction = () => {
    let personaContext = 'Specialist Sakinnah';
    if (category.id === 'DISTINCT_MINDS' || category.id === 'AUTISM' || category.id === 'ADHD') {
        personaContext = 'Mama May';
    } else if (category.id === 'STORYTELLING' || category.id === 'SLEEP') {
        personaContext = 'Grandmother';
    } else if (category.id === 'DREAM') {
        personaContext = 'Dream Analyst';
    } else if (category.id === 'CONFRONTATION') {
        personaContext = 'Confrontation Specialist';
    }

    let baseInstruction = `SECTION: ${category.id}. PERSONA: ${personaContext}. 
    USER_NAME: ${user.name}. GENDER: ${user.gender}. 
    STRICT_RULE: All guidance MUST follow references in system protocol. NEVER mention sources. 
    HUMAN_PERSONA: Speak like a human expert, not an AI.`;

    if (category.id === 'DREAM') {
        baseInstruction += `\nPROTOCOL: Interpret dreams using psychological, emotional, and symbolic analysis. NO superstition, NO spiritual claims. Interpretation must be calm, grounded, and non-alarming.`;
    }
    if (category.id === 'CONFRONTATION') {
        baseInstruction += `\nPROTOCOL: Lead the session actively. Challenge distorted thinking gently but clearly using logical reasoning and emotional validation. NO motivational clichés.`;
    }
    return baseInstruction;
  };

  const startVoiceSession = async () => {
    setSessionState('thinking');
    const instruction = getPersonaInstruction();
    
    await liveVoiceService.connect({
        systemInstruction: instruction,
        userGender: user.gender,
        onTranscript: (text) => setTranscript(text),
        onVolumeUpdate: (v) => setUserVolume(v),
        onStateChange: (state) => setSessionState(state),
        onError: (err) => {
            console.error("Voice fail:", err);
            setOutputMode('text');
        }
    });
  };

  const initTextSession = async () => {
    setIsStreaming(true);
    const instruction = getPersonaInstruction();
    await initializeChat(`session_${Date.now()}`, instruction, [], language, user.username);
    
    const salutationContext = `Initial Consultation for ${category.id}.`;
    const greeting = await getInitialAISalutation(category.id, language, salutationContext);
    const initialMsg = { id: Date.now().toString(), role: Role.MODEL, text: greeting, timestamp: new Date() };
    setMessages([initialMsg]);
    setIsStreaming(false);
  };

  const handleSend = async () => {
    if (!inputText.trim() || isStreaming) return;
    const userMsg = { id: Date.now().toString(), role: Role.USER, text: inputText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsStreaming(true);
    triggerHaptic();

    try {
        const stream = sendMessageStreamToGemini(userMsg.text, language, user.username);
        let aiText = "";
        const aiId = Date.now().toString();
        setMessages(prev => [...prev, { id: aiId, role: Role.MODEL, text: "", timestamp: new Date() }]);
        for await (const chunk of stream) {
            aiText += chunk;
            setMessages(prev => prev.map(m => m.id === aiId ? { ...m, text: aiText } : m));
        }
    } catch (e) { console.error(e); } finally { setIsStreaming(false); }
  };

  const handleFinishSession = async () => {
    if (isFinishing) return;
    setIsFinishing(true);
    liveVoiceService.stop();
    triggerHaptic();
    try {
        if (messages.length >= 2) {
            const summary = await generateSessionSummary(category.id, messages, language);
            if (summary) {
                const existing = JSON.parse(localStorage.getItem('sakinnah_clinical_records') || '[]');
                localStorage.setItem('sakinnah_clinical_records', JSON.stringify([summary, ...existing]));
                triggerSuccessHaptic();
            }
        }
        onBack();
    } catch (e) { setIsFinishing(false); }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  if (!outputMode) {
    return (
      <div className="h-full bg-m3-background flex flex-col items-center justify-center p-10 text-center animate-m3-fade-in">
        <div className="w-24 h-24 bg-m3-primaryContainer text-m3-primary rounded-m3-xl flex items-center justify-center mb-8 shadow-premium animate-float">
            <Headphones size={50} strokeWidth={2} />
        </div>
        <h2 className="text-2xl font-black text-m3-onSurface mb-4 tracking-tight">{t.outputModeTitle}</h2>
        <div className="grid grid-cols-1 gap-4 w-full max-w-sm mt-6">
          <button onClick={() => setOutputMode('text')} className="p-6 bg-white border border-m3-outline/10 rounded-m3-lg shadow-soft flex items-center gap-6 active:scale-[0.98] transition-all text-start group hover:border-m3-primary">
            <div className="w-14 h-14 bg-m3-primaryContainer text-m3-primary rounded-m3-md flex items-center justify-center group-hover:scale-105 transition-transform"><MessageSquare size={28} /></div>
            <div><h3 className="font-bold text-lg text-m3-onSurface">{t.textMode}</h3></div>
          </button>
          <button onClick={() => setOutputMode('audio')} className="p-6 bg-white border border-m3-outline/10 rounded-m3-lg shadow-soft flex items-center gap-6 active:scale-[0.98] transition-all text-start group hover:border-m3-primary">
            <div className="w-14 h-14 bg-m3-primaryContainer text-m3-primary rounded-m3-md flex items-center justify-center group-hover:scale-105 transition-transform"><Volume2 size={28} /></div>
            <div><h3 className="font-bold text-lg text-m3-onSurface">{t.audioMode}</h3></div>
          </button>
        </div>
        <button onClick={onBack} className="mt-12 text-m3-onSurfaceVariant/60 font-bold uppercase tracking-widest text-xs hover:text-m3-primary transition-colors">{t.back}</button>
      </div>
    );
  }

  // AUDIO MODE UI (Full Screen Emotive Overlay)
  if (outputMode === 'audio') {
    return (
      <div className="h-full bg-[#030508] flex flex-col items-center justify-between pt-safe pb-safe text-white animate-m3-fade-in overflow-hidden relative">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] rounded-full blur-[120px] transition-all duration-1000 ${sessionState === 'speaking' ? 'bg-m3-primary/30' : 'bg-m3-tertiary/20'}`}
                 style={{ transform: `translate(-50%, -50%) scale(${1 + userVolume * 2})` }}></div>
        </div>

        <header className="w-full px-8 py-6 flex justify-between items-center z-20">
            <button onClick={() => { liveVoiceService.stop(); setOutputMode(null); }} className="p-3 bg-white/5 border border-white/10 rounded-2xl active:scale-90">
                <X size={24} />
            </button>
            <div className="flex flex-col items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-m3-primary">{t[category.id]}</span>
                <p className="text-[14px] font-bold opacity-60">{sessionState === 'speaking' ? t.aiTurnPrompt : t.userTurnPrompt}</p>
            </div>
            <button onClick={handleFinishSession} className="p-3 bg-red-500/20 text-red-500 rounded-2xl active:scale-90">
                <LogOut size={24} />
            </button>
        </header>

        <main className="flex-1 w-full flex flex-col items-center justify-center relative px-10">
            <div className="relative">
                <div className={`absolute inset-[-40px] rounded-full blur-3xl opacity-30 transition-all duration-1000 ${sessionState === 'speaking' ? 'bg-m3-primary' : 'bg-m3-tertiary'}`}></div>
                <div className={`w-60 h-60 rounded-[4rem] flex flex-col items-center justify-center relative z-10 border-2 border-white/10 shadow-2xl transition-all duration-500 bg-white/5 backdrop-blur-xl
                    ${sessionState === 'speaking' ? 'scale-110' : 'scale-100'}`}>
                    <div className="text-8xl animate-float">🧘‍♀️</div>
                    {sessionState === 'listening' && (
                        <div className="absolute bottom-10 flex gap-1.5">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-1 bg-m3-tertiary rounded-full animate-pulse" 
                                     style={{ height: `${10 + Math.random() * 30}px`, animationDelay: `${i * 0.1}s` }}></div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-20 text-center space-y-6 max-w-sm">
                <h2 className="text-3xl font-light italic font-serif tracking-tight">
                    {sessionState === 'speaking' ? 'In presence of Sakinnah' : 'Listening to you...'}
                </h2>
                <div className="h-32 flex items-center justify-center">
                    <p className="text-white/40 text-lg italic font-medium leading-relaxed animate-m3-fade-in text-center px-4 line-clamp-3">
                        {transcript || "Speak freely, I am listening with care..."}
                    </p>
                </div>
            </div>
        </main>

        <footer className="w-full px-10 pb-16 flex flex-col items-center gap-10 z-20">
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] opacity-30">
                <div className="w-1.5 h-1.5 bg-m3-tertiary rounded-full animate-pulse"></div>
                <span>Strict Turn-Based Link Active</span>
            </div>
            <div className="flex items-center gap-6">
                <button onClick={() => { liveVoiceService.stop(); setOutputMode('text'); }} className="p-6 rounded-[2rem] bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all">
                    <MessageSquare size={24} />
                </button>
                <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-all border-4 border-black" onClick={handleFinishSession}>
                    <Phone size={32} className="rotate-[135deg]" />
                </div>
                <button className="p-6 rounded-[2rem] bg-white/5 border border-white/10 text-white/40 opacity-20 pointer-events-none">
                    <MicOff size={24} />
                </button>
            </div>
        </footer>
      </div>
    );
  }

  // TEXT MODE UI
  return (
    <div className="h-full bg-white flex flex-col animate-m3-fade-in relative overflow-hidden">
      <header className="px-6 py-4 flex items-center bg-white border-b border-m3-outline/10 z-20 shadow-sm">
        <button onClick={onBack} className="p-2 text-m3-primary -ms-2 hover:bg-m3-surfaceVariant rounded-m3-md">
          {isRTL ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
        </button>
        <div className="flex-1 px-4"><h1 className="text-[17px] font-bold text-m3-onSurface tracking-tight">{t[category.id] || category.id}</h1></div>
        <div className="flex items-center gap-2">
          <button onClick={() => setOutputMode('audio')} className="p-3 text-m3-primary hover:bg-m3-primaryContainer rounded-m3-md transition-all active:scale-90">
             <Volume2 size={22} />
          </button>
          <button onClick={handleFinishSession} disabled={isFinishing || messages.length < 2} className="p-3 text-m3-error hover:bg-red-50 rounded-m3-md transition-all active:scale-90 disabled:opacity-30">
            {isFinishing ? <Loader2 size={22} className="animate-spin" /> : <LogOut size={22} />}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 bg-m3-background/30">
        {messages.map(m => (
          <ChatMessage key={m.id} msg={m} language={language} isStreaming={isStreaming && m.role === Role.MODEL && m.text === ""} isSpeaking={false} onSpeak={() => {}} onCopy={() => navigator.clipboard.writeText(m.text)} onBookmark={() => {}} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-white border-t border-m3-outline/10 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <ChatInput inputText={inputText} setInputText={setInputText} onSend={handleSend} isListening={false} onToggleMic={()=>{}} isStreaming={isStreaming} language={language} t={t} isRTL={isRTL} />
      </div>
    </div>
  );
};

export default ChatInterface;
