
import React, { useState, useEffect, useRef } from 'react';
import { User, Message, Role, Category, Language, CognitiveNode } from '../types';
import { sendMessageWithGrounding, sendMessageStreamWithTools } from '../services/geminiService';
import { memoryService } from '../services/memoryService';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import { ArrowLeft, ArrowRight, Brain, Search, Info, ExternalLink } from 'lucide-react';
import { translations } from '../translations';

interface Props {
  user: User;
  category: Category;
  language: Language;
  onBack: () => void;
  onOpenCanvas: (nodes: CognitiveNode[]) => void;
  onTriggerAppTool: (toolName: string) => void;
  onUpdateTheme: (sentiment: string) => void;
}

const ChatInterface: React.FC<Props> = ({ user, category, language, onBack, onOpenCanvas, onTriggerAppTool, onUpdateTheme }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [groundingSources, setGroundingSources] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg = { id: Date.now().toString(), role: Role.USER, text: inputText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsStreaming(true);

    try {
      // 1. استرجاع الذاكرة النفسية ذات الصلة
      const relevantContext = await memoryService.retrieveRelevantMemories(userMsg.text, user.username);
      
      // 2. إرسال المحادثة مع تفعيل البحث والذاكرة
      const result = await sendMessageWithGrounding(userMsg.text, relevantContext, language);
      
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: Role.MODEL, 
        text: result.text || "", 
        timestamp: new Date() 
      };
      
      setMessages(prev => [...prev, aiMsg]);
      setGroundingSources(result.sources || []);
      
      // 3. حفظ الذاكرة الجديدة بشكل صامت
      memoryService.extractAndSaveMemory(userMsg.text + " " + aiMsg.text, user.username);

    } catch (e) {
        console.error(e);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="h-full flex flex-col animate-fadeIn relative bg-slate-50">
      <header className="px-4 py-4 bg-white border-b border-slate-100 flex justify-between items-center z-20">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 bg-slate-50 rounded-xl text-slate-600">
            {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
          </button>
          <div>
            <h1 className="text-slate-800 font-black text-sm">{t[`cat_${category.id}_title`]}</h1>
            <p className="text-[9px] text-emerald-500 font-bold flex items-center gap-1">
                <Search size={10} /> {isRTL ? 'متصل بالمراجع العلمية' : 'Live Scientific Search'}
            </p>
          </div>
        </div>
        <button onClick={() => onOpenCanvas([])} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
          <Brain size={20} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map(m => (
          <ChatMessage key={m.id} msg={m} language={language} isStreaming={false} isSpeaking={false} copiedId={null} onSpeak={()=>{}} onCopy={()=>{}} onBookmark={()=>{}} />
        ))}
        
        {groundingSources.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl animate-slideUp">
                <h4 className="text-[10px] font-black text-emerald-700 uppercase mb-2 flex items-center gap-1">
                    <Info size={12} /> {isRTL ? 'المصادر العلمية المستند إليها' : 'Scientific Sources'}
                </h4>
                <div className="flex flex-wrap gap-2">
                    {groundingSources.map((source, idx) => (
                        <a key={idx} href={source.web?.uri} target="_blank" className="text-[10px] bg-white px-3 py-1 rounded-lg border border-emerald-200 text-emerald-600 font-bold flex items-center gap-1 hover:bg-emerald-100 transition-all">
                            <ExternalLink size={10} /> {source.web?.title || 'Source'}
                        </a>
                    ))}
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput 
        inputText={inputText} 
        setInputText={setInputText} 
        onSend={handleSendMessage} 
        isListening={false} 
        onToggleMic={()=>{}} 
        isStreaming={isStreaming} 
        language={language} 
        t={t} 
        isRTL={isRTL} 
      />
    </div>
  );
};

export default ChatInterface;
