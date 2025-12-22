
import React, { useState, useEffect, useRef } from 'react';
import { User, Message, Role, Category, Language, ViewStateName } from '../types';
import { sendMessageStreamToGemini, getInitialAISalutation } from '../services/geminiService';
import { translations } from '../translations';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import { ArrowLeft, ArrowRight, Activity, Info, PhoneCall, StopCircle } from 'lucide-react';

interface Props {
  user: User;
  category: Category;
  language: Language;
  onBack: () => void;
  onNavigate: (view: ViewStateName) => void;
}

const ChatInterface: React.FC<Props> = ({ user, category, language, onBack, onNavigate }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // التأثير المسؤول عن جعل الـ AI يبدأ الحوار
  useEffect(() => {
    const initiateAI = async () => {
      setIsStreaming(true);
      const greeting = await getInitialAISalutation(category.id, language, `The user is in the ${category.id} wing.`);
      const aiMsg: Message = { id: Date.now().toString(), role: Role.MODEL, text: greeting, timestamp: new Date() };
      setMessages([aiMsg]);
      setIsStreaming(false);
    };
    initiateAI();
  }, [category.id, language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const userMsg = { id: Date.now().toString(), role: Role.USER, text: inputText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsStreaming(true);

    try {
        const stream = sendMessageStreamToGemini(inputText, language);
        let aiFullText = "";
        const aiId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: aiId, role: Role.MODEL, text: "", timestamp: new Date() }]);
        
        for await (const chunk of stream) {
            aiFullText += chunk;
            setMessages(prev => prev.map(m => m.id === aiId ? { ...m, text: aiFullText } : m));
        }
    } catch (e) { console.error(e); } finally { setIsStreaming(false); }
  };

  return (
    <div className="h-full bg-white flex flex-col pt-safe pb-safe animate-fadeIn overflow-hidden">
      <header className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex items-center gap-5">
          <button onClick={onBack} className="p-3 bg-slate-50 rounded-2xl text-slate-400 active:scale-90 transition-all">
            {isRTL ? <ArrowRight size={22} /> : <ArrowLeft size={22} />}
          </button>
          <div>
            <h1 className="text-sm font-black text-slate-900 tracking-tight uppercase">{category.id === 'clinical' ? t.clinicalWing : category.id}</h1>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Live Session</span>
            </div>
          </div>
        </div>
        <button onClick={() => onBack()} className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all flex items-center gap-2">
            <StopCircle size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">{t.endSession}</span>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-8 bg-slate-50/20">
        {messages.map(m => (
          <ChatMessage key={m.id} msg={m} language={language} isStreaming={false} isSpeaking={false} copiedId={null} onSpeak={()=>{}} onCopy={()=>{}} onBookmark={()=>{}} />
        ))}
        {isStreaming && (
            <div className="flex items-center gap-3 py-4 animate-pulse px-6">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{t.aiThinking}</span>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-8 bg-white border-t border-slate-100">
        <ChatInput 
          inputText={inputText} setInputText={setInputText} 
          onSend={handleSend} isListening={false} onToggleMic={()=>{}} 
          isStreaming={isStreaming} language={language} t={t} isRTL={isRTL} 
        />
      </div>
    </div>
  );
};

export default ChatInterface;
