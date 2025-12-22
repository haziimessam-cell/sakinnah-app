
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Message, Role, Category, Language, ViewStateName } from '../types';
import { sendMessageStreamToGemini, getInitialAISalutation, initializeChat } from '../services/geminiService';
import { translations } from '../translations';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import { ArrowLeft, ArrowRight, Clock, StopCircle, ClipboardCheck, History, ChevronRight, Activity } from 'lucide-react';

interface Props {
  user: User;
  category: Category;
  language: Language;
  onBack: () => void;
  onNavigate: (view: ViewStateName) => void;
}

const SESSION_DURATION = 15 * 60; // 15 minutes session

const ChatInterface: React.FC<Props> = ({ user, category, language, onBack, onNavigate }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION);
  const [sessionState, setSessionState] = useState<'active' | 'closing' | 'ended'>('active');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Proactive Session Start
  useEffect(() => {
    const initiateClinicalSession = async () => {
      setIsStreaming(true);
      
      const wingName = isRTL ? t.clinicalSession : category.id;
      await initializeChat(`session_${Date.now()}`, wingName, [], language);

      const greeting = await getInitialAISalutation(category.id, language, `The patient is ${user.name}, age ${user.age}. Clinic: ${category.id}.`);
      
      const aiMsg: Message = { 
        id: Date.now().toString(), 
        role: Role.MODEL, 
        text: greeting, 
        timestamp: new Date() 
      };
      setMessages([aiMsg]);
      setIsStreaming(false);
    };

    initiateClinicalSession();

    // Start Timer
    timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
            if (prev <= 0) {
                clearInterval(timerRef.current!);
                return 0;
            }
            return prev - 1;
        });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [category.id, language, user.name]);

  // Handle Closure Phase
  useEffect(() => {
    if (timeLeft === 300 && sessionState === 'active') { // 5 minutes left
        setSessionState('closing');
        handleClosingPhase();
    } else if (timeLeft === 0 && sessionState !== 'ended') {
        setSessionState('ended');
        handleFinalSummary();
    }
  }, [timeLeft]);

  const handleClosingPhase = async () => {
      const closingTrigger = isRTL 
        ? "[نظام: بقي 5 دقائق من الجلسة. أخبر المستخدم برفق أن الوقت يوشك على الانتهاء وابدأ في الربط بين النقاط.]"
        : "[SYSTEM: 5 minutes left. Gently inform the user and start connecting the dots.]";
      await handleAISend(closingTrigger);
  };

  const handleFinalSummary = async () => {
      const summaryTrigger = isRTL 
        ? "[نظام: انتهى وقت الجلسة تماماً. قدم التقرير الختامي الدافئ وحدد موعداً للمرة القادمة.]"
        : "[SYSTEM: Session time is over. Provide the final warm summary and suggest a follow-up.]";
      await handleAISend(summaryTrigger);
  };

  const handleAISend = async (text: string) => {
    setIsStreaming(true);
    try {
        const stream = sendMessageStreamToGemini(text, language);
        let aiFullText = "";
        const aiId = Date.now().toString();
        setMessages(prev => [...prev, { id: aiId, role: Role.MODEL, text: "", timestamp: new Date() }]);
        
        for await (const chunk of stream) {
            aiFullText += chunk;
            setMessages(prev => prev.map(m => m.id === aiId ? { ...m, text: aiFullText } : m));
        }
    } catch (e) { console.error(e); } finally { setIsStreaming(false); }
  };

  const handleUserSend = async () => {
    if (!inputText.trim() || sessionState === 'ended') return;
    const userMsg = { id: Date.now().toString(), role: Role.USER, text: inputText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    await handleAISend(inputText);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full bg-white flex flex-col pt-safe pb-safe animate-ios-reveal overflow-hidden">
      {/* Clinical Header */}
      <header className="px-6 py-6 border-b border-ios-azure/5 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 bg-ios-slate rounded-full flex items-center justify-center text-ios-azure active:scale-90 transition-all">
            {isRTL ? <ChevronRight size={20} /> : <ChevronRight size={20} className="rotate-180" />}
          </button>
          <div>
            <h1 className="text-[15px] font-bold text-ios-azureDeep">{t.clinicalSession}</h1>
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${sessionState === 'active' ? 'bg-ios-emerald animate-pulse' : 'bg-red-500'}`}></div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${sessionState === 'active' ? 'text-ios-emerald' : 'text-red-500'}`}>
                    {sessionState === 'ended' ? t.sessionEnded : 'LIVE SESSION'}
                </span>
            </div>
          </div>
        </div>

        {/* Clinical Timer Tag */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all duration-500 ${timeLeft < 300 ? 'bg-red-50 border-red-100 text-red-600' : 'bg-ios-azureLight border-ios-azure/10 text-ios-azure'}`}>
            <Clock size={16} />
            <span className="text-sm font-bold tabular-nums">{formatTime(timeLeft)}</span>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 bg-white">
        {messages.map(m => (
          <ChatMessage 
            key={m.id} 
            msg={m} 
            language={language} 
            isStreaming={false} 
            isSpeaking={false} 
            copiedId={null} 
            onSpeak={()=>{}} 
            onCopy={()=>{}} 
            onBookmark={()=>{}} 
          />
        ))}
        {isStreaming && (
            <div className="flex items-center gap-3 px-4 py-2 text-ios-azure/40 animate-pulse">
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest">{t.aiThinking}</span>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Final Action when session ends */}
      {sessionState === 'ended' && (
          <div className="px-6 py-6 bg-white border-t border-ios-azure/5 animate-ios-reveal">
              <button 
                onClick={() => onNavigate('BOOKING')}
                className="w-full py-5 bg-ios-azureDeep text-white rounded-2xl font-bold text-[16px] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                  <History size={20} />
                  {t.bookSession}
              </button>
          </div>
      )}

      {/* Input Area */}
      <div className={`p-6 bg-white border-t border-ios-azure/5 transition-opacity duration-500 ${sessionState === 'ended' ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
        <ChatInput 
          inputText={inputText} 
          setInputText={setInputText} 
          onSend={handleUserSend} 
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

export default ChatInterface;
