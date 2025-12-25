
import React, { useState, useEffect, useRef } from 'react';
import { User, Message, Role, Category, Language, OutputMode } from '../types';
import { sendMessageStreamToGemini, initializeChat, getInitialAISalutation, generateSessionSummary, generateSpeech } from '../services/geminiService';
import { translations } from '../translations';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import { ArrowLeft, ArrowRight, ShieldCheck, Sparkles, Volume2, Mic, Play, Pause, LogOut, Loader2, MessageSquare, Headphones } from 'lucide-react';
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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    if (outputMode) initSession();
  }, [outputMode]);

  const initSession = async () => {
    setIsStreaming(true);
    
    // Determine Persona Context based on category
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

    if (category.id === 'DISTINCT_MINDS' || category.id === 'AUTISM' || category.id === 'ADHD') {
        if (!user.childName) {
            baseInstruction += `\nFIRST_SESSION_PROTOCOL: This is your FIRST interaction with this user. You MUST start by vocally and warmly asking for the child's name, age, and condition (ASD/ADHD) before any evaluation or treatment. This is mandatory.`;
        } else {
            baseInstruction += `\nCHILD_CONTEXT: Name: ${user.childName}, Age: ${user.childAge}, Condition: ${user.childCondition}. Use this information to tailor your guidance strictly using the scientific references.`;
        }
    }
    
    await initializeChat(`session_${Date.now()}`, baseInstruction, [], language, user.username);
    
    const salutationContext = `Persona: ${personaContext}. Target: Build alliance and initiate ${category.id} protocol.`;
    const greeting = await getInitialAISalutation(category.id, language, salutationContext);
    const initialMsg = { id: Date.now().toString(), role: Role.MODEL, text: greeting, timestamp: new Date() };
    setMessages([initialMsg]);
    setIsStreaming(false);

    if (outputMode === 'audio') await speakAIResponse(greeting);
  };

  const getVoiceForPersona = () => {
    if (category.id === 'DISTINCT_MINDS' || category.id === 'AUTISM' || category.id === 'ADHD') return 'Kore'; 
    if (category.id === 'STORYTELLING' || category.id === 'SLEEP') return 'Puck'; 
    return user.gender === 'female' ? 'Charon' : 'Puck'; 
  };

  const stopAudio = () => {
    if (currentSourceRef.current) { try { currentSourceRef.current.stop(); } catch(e){} }
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const speakAIResponse = async (text: string) => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    stopAudio();
    setIsSpeaking(true);
    
    const result = await generateSpeech(text, getVoiceForPersona());
    if (result?.audioBuffer && outputMode === 'audio') {
      const source = audioCtxRef.current.createBufferSource();
      source.buffer = result.audioBuffer;
      source.connect(audioCtxRef.current.destination);
      source.onended = () => { setIsSpeaking(false); triggerHaptic(); };
      currentSourceRef.current = source;
      source.start(0);
    } else { setIsSpeaking(false); }
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
        if (outputMode === 'audio') await speakAIResponse(aiText);
    } catch (e) { console.error(e); } finally { setIsStreaming(false); }
  };

  const handleFinishSession = async () => {
    if (isFinishing || messages.length < 2) return;
    setIsFinishing(true);
    stopAudio();
    triggerHaptic();
    try {
        const summary = await generateSessionSummary(category.id, messages, language);
        if (summary) {
            const existing = JSON.parse(localStorage.getItem('sakinnah_clinical_records') || '[]');
            localStorage.setItem('sakinnah_clinical_records', JSON.stringify([summary, ...existing]));
            triggerSuccessHaptic();
            onBack();
        }
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

  return (
    <div className="h-full bg-white flex flex-col animate-m3-fade-in relative overflow-hidden">
      <header className="px-6 py-4 flex items-center bg-white border-b border-m3-outline/10 z-20 shadow-sm">
        <button onClick={() => { stopAudio(); onBack(); }} className="p-2 text-m3-primary -ms-2 hover:bg-m3-surfaceVariant rounded-m3-md">
          {isRTL ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
        </button>
        <div className="flex-1 px-4"><h1 className="text-[17px] font-bold text-m3-onSurface tracking-tight">{t[category.id] || category.id}</h1></div>
        <div className="flex items-center gap-2">
          <button onClick={handleFinishSession} disabled={isFinishing || messages.length < 2} className="p-3 text-m3-error hover:bg-red-50 rounded-m3-md transition-all active:scale-90 disabled:opacity-30">
            {isFinishing ? <Loader2 size={22} className="animate-spin" /> : <LogOut size={22} />}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 bg-m3-background/30">
        {messages.map(m => (
          <ChatMessage key={m.id} msg={m} language={language} isStreaming={isStreaming && m.role === Role.MODEL && m.text === ""} isSpeaking={isSpeaking && m.role === Role.MODEL} onSpeak={() => speakAIResponse(m.text)} onCopy={() => navigator.clipboard.writeText(m.text)} onBookmark={() => {}} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {outputMode === 'audio' && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-3xl z-10 flex flex-col items-center justify-center p-8 text-center animate-m3-fade-in pointer-events-none">
            <div className={`w-64 h-64 rounded-m3-xl bg-white shadow-premium flex items-center justify-center relative transition-all duration-700 ${isSpeaking ? 'scale-105' : 'scale-100'}`}>
                <div className="text-8xl animate-float">🧘‍♀️</div>
                {isSpeaking && (
                    <div className="absolute inset-0 flex items-center justify-center gap-2 px-12">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-1.5 bg-m3-primary rounded-full animate-pulse" 
                                 style={{ height: `${30 + Math.random() * 40}%`, animationDelay: `${i * 0.1}s` }}></div>
                        ))}
                    </div>
                )}
            </div>
            <div className="mt-16 space-y-3 pointer-events-auto">
                <h3 className="text-2xl font-black text-m3-primary tracking-tight">{isSpeaking ? t.aiTurnPrompt : t.userTurnPrompt}</h3>
                <p className="text-[14px] text-m3-onSurfaceVariant/60 font-bold uppercase tracking-widest">{isSpeaking ? t.listeningToPersona.replace('{name}', category.id === 'DISTINCT_MINDS' ? 'Mama May' : 'Sakinnah') : 'Listening...'}</p>
            </div>
        </div>
      )}

      <div className="p-6 bg-white border-t border-m3-outline/10 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <ChatInput inputText={inputText} setInputText={setInputText} onSend={handleSend} isListening={false} onToggleMic={()=>{}} isStreaming={isStreaming} language={language} t={t} isRTL={isRTL} />
      </div>
    </div>
  );
};

export default ChatInterface;
