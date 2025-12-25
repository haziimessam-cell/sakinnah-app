
import React, { useState, useEffect, useRef } from 'react';
import { User, Message, Role, Category, Language } from '../types';
import { sendMessageStreamToGemini, initializeChat, getInitialAISalutation } from '../services/geminiService';
import { translations } from '../translations';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import { ArrowLeft, ArrowRight, ShieldCheck, Sparkles, Users, MessageSquare } from 'lucide-react';
import { triggerHaptic } from '../services/hapticService';

interface Props {
  user: User;
  category: Category;
  language: Language;
  onBack: () => void;
}

const JointChatInterface: React.FC<Props> = ({ user, category, language, onBack }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [stage, setStage] = useState(1);
  const [activeTurn, setActiveTurn] = useState<Role>(Role.USER); // Toggle between USER and PARTNER for input simulation

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      setIsStreaming(true);
      const baseInstruction = `JOINT SESSION SECTION: RELATIONSHIPS. 
      PARTICIPANTS: ${user.name} (User) AND ${user.partnerName} (Partner).
      RULE: Manage conversation naturally between BOTH. Ensure balance. No favoritism.
      PERSONA: None (Neutral Interpersonal Specialist).
      FOLLOW DECISION ENGINE STAGES: 1. Containment, 2. Exploration, 3. Practical Shift, 4. Closure.`;
      
      await initializeChat(`joint_${Date.now()}`, baseInstruction, [], language, user.username);
      
      const salutationContext = `Joint Session for ${user.name} and ${user.partnerName}. Stage 1.`;
      const greeting = await getInitialAISalutation(category.id, language, salutationContext);
      
      setMessages([{ id: Date.now().toString(), role: Role.MODEL, text: greeting, timestamp: new Date() }]);
      setIsStreaming(false);
    };
    init();
  }, [user.name, user.partnerName]);

  const handleSend = async () => {
    if (!inputText.trim() || isStreaming) return;
    
    const msgRole = activeTurn;
    const senderName = msgRole === Role.USER ? user.name : user.partnerName;
    
    const newMsg: Message = { 
        id: Date.now().toString(), 
        role: msgRole, 
        text: inputText, 
        timestamp: new Date(),
        senderName: senderName
    };
    
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setIsStreaming(true);
    triggerHaptic();

    try {
        const promptWithContext = `[SENDER: ${senderName}] [STAGE: ${stage}] User Message: ${inputText}`;
        const stream = sendMessageStreamToGemini(promptWithContext, language, user.username);
        let aiText = "";
        const aiId = Date.now().toString();
        setMessages(prev => [...prev, { id: aiId, role: Role.MODEL, text: "", timestamp: new Date() }]);
        
        for await (const chunk of stream) {
            aiText += chunk;
            setMessages(prev => prev.map(m => m.id === aiId ? { ...m, text: aiText } : m));
        }
        
        // Auto-switch turn for easier simulation/local interaction
        setActiveTurn(prev => prev === Role.USER ? Role.PARTNER : Role.USER);
        setStage(prev => Math.min(4, prev + 1));
    } catch (e) {
        console.error(e);
    } finally {
        setIsStreaming(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  return (
    <div className="h-full bg-white flex flex-col animate-m3-fade-in">
      <header className="px-6 py-4 flex items-center bg-white border-b border-m3-outline/5 z-20">
        <button onClick={onBack} className="p-3 text-rose-600 -ms-3 hover:bg-rose-50 rounded-full transition-all">
          {isRTL ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
        </button>
        <div className="flex-1 px-3">
            <h1 className="text-[17px] font-bold text-m3-onSurface">{isRTL ? 'جلسة مشتركة' : 'Joint Session'}</h1>
            <div className="flex items-center gap-1.5">
                <Users size={12} className="text-rose-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">
                    {user.name} & {user.partnerName}
                </span>
            </div>
        </div>
        <div className="text-rose-200">
          <ShieldCheck size={20} />
        </div>
      </header>

      {/* Turn Indicator */}
      <div className="px-6 py-2 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">
            {isRTL ? 'دور المتحدث:' : 'Speaker Turn:'}
          </span>
          <div className="flex gap-2">
              <button 
                onClick={() => setActiveTurn(Role.USER)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${activeTurn === Role.USER ? 'bg-rose-600 text-white' : 'bg-white text-rose-300 border border-rose-100'}`}
              >
                {user.name}
              </button>
              <button 
                onClick={() => setActiveTurn(Role.PARTNER)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${activeTurn === Role.PARTNER ? 'bg-rose-600 text-white' : 'bg-white text-rose-300 border border-rose-100'}`}
              >
                {user.partnerName}
              </button>
          </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
        {messages.map(m => (
          <div key={m.id} className="space-y-1">
            {m.role !== Role.MODEL && (
              <p className={`text-[10px] font-black text-rose-400 uppercase tracking-widest mx-4 ${m.role === Role.USER ? 'text-start' : 'text-end'}`}>
                {m.senderName}
              </p>
            )}
            <div className={`flex ${m.role === Role.PARTNER ? 'justify-end' : 'justify-start'} animate-m3-slide-up`}>
              <div className={`max-w-[85%] px-4 py-3 shadow-sm text-base leading-relaxed relative flex flex-col
                  ${m.role === Role.USER ? 'bg-m3-primaryContainer text-m3-onPrimaryContainer rounded-[20px] rounded-bl-[4px]' : 
                    m.role === Role.PARTNER ? 'bg-rose-500 text-white rounded-[20px] rounded-br-[4px]' : 
                    'bg-m3-secondaryContainer text-m3-onSecondaryContainer rounded-[20px] rounded-bl-[4px]'}`}>
                <div className="text-[15px]">{m.text}</div>
              </div>
            </div>
          </div>
        ))}
        {isStreaming && (
            <div className="flex items-center gap-1.5 px-2 py-1">
                <div className="w-1.5 h-1.5 rounded-full animate-bounce bg-m3-primary/30"></div>
                <div className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.2s] bg-m3-primary/30"></div>
            </div>
        )}
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

export default JointChatInterface;
