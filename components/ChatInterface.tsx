
import React, { useState, useEffect, useRef } from 'react';
import { User, Message, Role, Category, Language, CognitiveNode } from '../types';
import { sendMessageWithScientificLogic } from '../services/geminiService';
import { memoryService } from '../services/memoryService';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import { ArrowLeft, ArrowRight, Brain, Search, Info, ExternalLink, Microscope } from 'lucide-react';
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
    setGroundingSources([]);

    try {
      const relevantContext = await memoryService.retrieveRelevantMemories(userMsg.text, user.username);
      
      // استخدام المنطق العلمي والبحث الجغرافي/المعلوماتي
      const result = await sendMessageWithScientificLogic(userMsg.text, relevantContext, language);
      
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: Role.MODEL, 
        text: result.text || "", 
        timestamp: new Date() 
      };
      
      setMessages(prev => [...prev, aiMsg]);
      setGroundingSources(result.sources || []);
      
      memoryService.extractAndSaveMemory(userMsg.text + " " + aiMsg.text, user.username);

    } catch (e) {
        console.error(e);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="h-full flex flex-col animate-fadeIn relative bg-slate-50">
      <header className="px-4 py-4 bg-white border-b border-slate-100 flex justify-between items-center z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 bg-slate-50 rounded-xl text-slate-600">
            {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
          </button>
          <div>
            <h1 className="text-slate-800 font-black text-sm">{t[`cat_${category.id}_title`]}</h1>
            <p className="text-[9px] text-primary-600 font-bold flex items-center gap-1">
                <Microscope size={10} /> {isRTL ? 'منطق إكلينيكي مفعل' : 'Clinical Logic Active'}
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
            <div className="bg-primary-50 border border-primary-100 p-4 rounded-2xl animate-slideUp">
                <h4 className="text-[10px] font-black text-primary-700 uppercase mb-3 flex items-center gap-1 tracking-widest">
                    <Search size={12} /> {isRTL ? 'المراجع والأدلة العلمية' : 'SCIENTIFIC EVIDENCE'}
                </h4>
                <div className="flex flex-wrap gap-2">
                    {groundingSources.map((source, idx) => (
                        <a key={idx} href={source.web?.uri} target="_blank" className="text-[9px] bg-white px-3 py-1.5 rounded-lg border border-primary-200 text-primary-600 font-black flex items-center gap-1 hover:bg-primary-100 transition-all shadow-sm uppercase tracking-tighter">
                            <ExternalLink size={10} /> {source.web?.title || 'Study Ref'}
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
